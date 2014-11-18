define(function(require) {
    var math = require("meier/math/Math");
    
    function Term(name, attribute, min, max, shape) {
        this.name      = name;
        this.attribute = attribute.split('.');
        this.min       = min;
        this.max       = max;
        this.shape     = shape;
        
        this.eval = function(context) {
            
            // Unfold the callable chain, e.g., "position.x" works as expected.
            var val = this.attribute.reduce(function(context, method) {
                
                // Directly callable
                if(typeof method == 'function') {
                    return method();
                }
                
                // Assume it's a method pertaining to a context
                if( ! (method in context)) {
                    throw new Error("Fuzzy logic error: attribute '" + method + "' does not exist.");
                }
                
                var tmp = context[method];
                
                // Call anything callable
                if(typeof tmp == "function") {
                    tmp = tmp.bind(context);
                    tmp = tmp();
                }
                
                return tmp;
                
            }, context);
            
            // Avoid a divide-by-zero
            var denominator = val - this.min;            
            if(denominator == 0) {
                return shape(0);
            }
            
            // Normalize
            var normalized = denominator / (this.max - this.min);
            
            // Clamp range.
            if(normalized < 0) {
                normalized = 0;
            } else if(normalized > 1) {
                normalized = 1;
            }
            
            // Apply membership function
            return shape(normalized);
        }
    }
    
    function Fuzzy() {
        this._rules     = [];
        this._callbacks = [];
        this._infix     = [];
        this._terms     = {};
    }
    
    Fuzzy.prototype.define = function(attribute, min, max, terms) {
        for(var k in terms) {
            if(terms.hasOwnProperty(k)) {
                this._terms[k] = new Term(k, attribute, min, max, terms[k]);
            }
        }
        
        return this;
    };
    
    Fuzzy.prototype.rule = function(rule, callback) {
        this._rules.push(rule);
        this._callbacks.push(callback);
        
        var stack  = [];
        var output = [];
        
        //console.log(rule);
        
        // Process a token event. Follows the Shunting-yard algorithm
        // to convert infix to postfix
        function process(token) {    
            if(token != 'or' && token != 'and' && token != '(' && token != ')') {
                output.push(token);
                
            } else if(token == '(' || stack.length == 0 || stack.last() == '(') {
                stack.push(token);
                
            } else if(token == 'or' || token == 'and') {
                stack.push(token);
            
            } else if(token == ')') {
                while(stack.length > 0) {
                    token = stack.pop();
                
                    if(token == ')') {
                        break;
                    }
                
                    if(token != '(') {
                        output.push(token);
                    }
                }                    
            } else {
                output.push(token);
            }
            
            ////console.log("Symbol: " + token);
            ////console.log("Stack : " + stack.join());
            ////console.log("Output: " + output.join());
            ////console.log("");
        }
        
        // TODO: rework this parser. One token should not emit multiple events.
        for(var i = 0, s = 0, token; i < rule.length; ++i) {
            
            if(rule[i] == " " || rule[i] == "(" || rule[i] == ")" ||  i == rule.length-1) {
                token = rule.substring(s, i + 1).trim(" ").trim(")").trim("(");
                            
                if(rule[i] == "(") {
                    process("(");
                }
                
                if(token != '') {
                    process(token);
                }
                
                if(rule[i] == ")") {
                    process(")")
                }
            
                s = i + 1;
            }
        }

        // Push the remainder onto the output stack
        while(stack.length > 0) {
            var token = stack.pop();
            if(token != ')' && token != '(') {
                output.push(token);
            }
        }
        
        this._infix.push(output);

        return this;
    };
    
    /// Retrieve the current value of the linguistic terms.
    Fuzzy.prototype.terms = function(context) {
        var terms = {};
        
        // Compute the value of linguistic terms,
        for(var k in this._terms) {
            if(this._terms.hasOwnProperty(k)) {
                terms[k] = this._terms[k].eval(context);
                
                //console.log("Reasoning about: " + k + " = " + terms[k] + " (" + this._terms[k].shape.name + ")");    
            }
        }
        
        return terms;
    };
    
    /// Evaluate all rules and execute the highest scoring.
    Fuzzy.prototype.reason = function(context) {
        
        // Compute linguistic terms.
        var terms = this.terms(context);
        
        // Execute each logical rule
        var scores = this._infix.map(function(infix, i) {
            var output = infix.clone();
            
            //console.log("Reasoning about: " + this._rules[i]);
            
            var operands = [];
        
            while(output.length > 0) {
                var token = output.shift();
            
                if(token == 'or' || token == 'and') {
                    var a = operands.pop();
                    var b = operands.pop();
                    var c = null;
                    
                    if( isNaN(a) && isNaN(terms[a])) {
                        throw new Error("Unknown term '" + a + "'.");
                        break;
                    }
                    
                    if( isNaN(b) && isNaN(terms[b])) {
                        throw new Error("Unknown term '" + b + "'.");
                        break;
                    }
                
                    // Use lookup if the variable is not a number.
                    a = isNaN(a) ? terms[a] : a;
                    b = isNaN(b) ? terms[b] : b;
                
                    // Execute
                    if(token == 'or') {
                        c = Math.max(a, b);
                    } else {
                        c = Math.min(a, b);
                    }
                
                    // Push back into stack for next iteration.
                    operands.push(c);
                } else {
                    operands.push(token);
                }
            }
            
            return operands.last();
            
        }.bind(this));
        
        //console.log("scores: " + scores.join(", "));
        
        var max = math.ArgMax(scores);
        
        this._callbacks[max](scores[max]);
        
        return this;
    };
    
    Fuzzy.Triangle = Fuzzy.prototype.triangle = function(left, center, right) {
        // Triangle is a special case of trapezoid. Note the repeated center.
        return Fuzzy.Trapezoid(left, center, center, right);
    };
    
    Fuzzy.Crisp = Fuzzy.prototype.crisp = function(fixedValue) {
        return function FuzzyCrisp(value) {
            return fixedValue;
        };
    };
    
    Fuzzy.Trapezoid = Fuzzy.prototype.trapezoid = function(left, first, second, right) {
        return function FuzzyTrapezoid(value) {
            
            if(value < left || value > right) {
                return 0;
            }
            
            if(value >= first && value <= second) {
                return 1.0;
            }
            
            if(value >= left && value < first) {
                return (value - left) / (first - left);
            }
            
            return (1.0 - value - (1.0 - right)) / (right - second)
        };
    };
    
    return Fuzzy;
});
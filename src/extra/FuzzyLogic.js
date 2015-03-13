define(function(require) {
    var math = require("meier/math/Math");
    
    function Term(name, attribute, min, max, shape) {
        this.name      = name;
        this.attribute = attribute.split('.');
        this.min       = min;
        this.max       = max;

		this.shape = shape;
		
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
            return normalized;//shape(normalized);
        }
    }
    
    /// Internal struct to store a fuzzy logic rule.
    function Rule(controller, rule, callback, name) {
        this.controller  = controller;
        this.rule        = rule
        this.callback    = callback;
        this.name        = name;
        this._infix      = null;
        
        // Cached copy of the recent most score
        this.recentScore = 0;
        
        // TODO: these functions might be useful
        // this.isEnabled = true;
        // this.disable = function() { this.isEnabled = false; return this; }
        // this.enable  = function() { this.isEnabled = true;  return this; }
        // this.destroy = function() { this.controller._rules.remove(this); }
    }
    
    function Fuzzy() {
        this._rules     = [];
        this._terms     = {};
		
		this._grouped   = [];
    }
    
    /// Define a linguistic term
    Fuzzy.prototype.define = function(attribute, min, max, terms) {
		
		var group = [];
		
        for(var k in terms) {
            if(terms.hasOwnProperty(k)) {
				var term = new Term(k, attribute, min, max, terms[k])
				
				group.push(term);
                this._terms[k] = term;
            }
        }
        
		// Store them as a group together, used for debug drawing.
		this._grouped.push(group);
		
        return this;
    };
    
    /// Create a new fuzzy logic rule.
    Fuzzy.prototype.rule = function(rule, callback, name) {
        
        var r = new Rule(this, rule, callback, name || "no-name");
        
        var stack  = [];
        var output = [];
        
        //console.log(rule);
        
        // Process a token event. Follows the Shunting-yard algorithm
        // to convert infix to postfix
        function process(token) {    
			
			
            if(token != 'or' && token != 'and' && token != '(' && token != ')' && token != 'not') {
                output.push(token);
                
            } else if(token == '(' || stack.length == 0 || stack.last() == '(') {
                stack.push(token);
                
            } else if(token == 'or' || token == 'and' || token == 'not') {
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
                
        r._infix = output;

        this._rules.push(r);

        return r;
    };
    
    /// Retrieve the current value of the linguistic terms.
    Fuzzy.prototype.terms = function(context) {
        var terms = {};
        
        // Compute the value of linguistic terms,
        for(var k in this._terms) {
            if(this._terms.hasOwnProperty(k)) {
                terms[k] = this._terms[k].shape(this._terms[k].eval(context));
                
                //console.log("Reasoning about: " + k + " = " + terms[k] + " (" + this._terms[k].shape.name + ")");    
            }
        }
        
        return terms;
    };
    
    /// Retrieve the rules as stored internally.
    Fuzzy.prototype.rules = function() {
        return this._rules;
    };
    
    /// Evaluate all rules and execute the highest scoring.
    Fuzzy.prototype.reason = function(context) {
        
        // Compute linguistic terms.
        var terms = this.terms(context);
        		
        // Execute each logical rule
        var scores = this._rules.map(function(rule, i) {
            var output = rule._infix.clone();
            
            //console.log("Reasoning about: " + rule.rule);
            //console.log("infix: " + rule._infix.join());
            
            var operands = [];
        
            while(output.length > 0) {
                var token = output.shift();
            
				if(token == 'not') {
					var a = operands.pop();
					var c = 1 - (isNaN(a) ? terms[a] : a);
					
					operands.push(c);
			
                } else if(token == 'or' || token == 'and') {
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
            
			var last = operands.last();
			
			// Just incase the rule only has one variable.
			if(isNaN(last)) {
				return terms[last];
			} 
			
			return last;
            
        }.bind(this));
        
        var max = math.ArgMax(scores);
        		
		if(max != -1) {
			this._rules[max].callback(scores[max]);
		}
		
        return this;
    };
    
	Fuzzy.prototype.draw = function(renderer, context) {
		
		var h = 80;  var hh = h /2;
		var w = 200; var hw = w/ 2;
		
		// Padding
		var ho = 30;
		var wo = 30;
		
		var x = -0.5 * renderer.width + hw + wo;
		var y = -0.5 * renderer.height + hh + ho;
				
		var font = "10px monospace";
		
		var colors = ["red", "green", "blue", "orange", "purple"];
		
		this._grouped.forEach(function(group, groupid) {
			var min   = group.first().min;
			var max   = group.first().max;
			var range = max - min;
			var title = group.first().attribute;
			var value = group.first().eval(context);

			renderer.begin();
			renderer.rectangle(x, y, w + wo, h + ho);
			renderer.fill("white");
			renderer.stroke("black");
			
			// Y labels
			renderer.text("0", x - hw - 2, y - hh, "black", "right", "bottom", font);
			renderer.text("1", x - hw - 2, y + hh, "black", "right", "top", font);
			
			// X labels
			renderer.text(min, x - hw + 0, y - hh - 2, "black", "left", "top", font);
			renderer.text(max, x + hw - 1, y - hh - 2, "black", "right", "top", font);

			renderer.text(title, x, y + hh + 1, "black", "center", "bottom", font);
			
			group.forEach(function(term, i) {
				renderer.begin();
				renderer.line(
					x + term.shape.left * w - hw,
					y - hh,
					x + term.shape.first * w - hw,
					y + hh
				);
				
				renderer.line(
					x + term.shape.first * w - hw,
					y + hh,
					x + term.shape.second * w - hw,
					y + hh
				);
				
				renderer.line(
					x + term.shape.second * w - hw,
					y + hh,
					x + term.shape.right * w - hw,
					y - hh
				);
				renderer.stroke(colors[i % colors.length]);
			});			
			
			renderer.begin();
			group.forEach(function(term) {
				renderer.circle(x + value * w - hw, y + term.shape(value) * h - hh, 3);
			});
			renderer.fill("red");
			
			group.forEach(function(term, i) {
				var color = colors[i % colors.length];
				renderer.text(term.name + " " + term.shape(value).toFixed(2), x, y + (i-1) * 15, color, "center", "middle", font);
			});
			
			renderer.begin();
			renderer.line( // left to right
				x - hw, y - hh,
				x + hw, y - hh
			);
			renderer.line( // top to bottom
				x - hw, y + hh,
				x - hw, y - hh
			);
			renderer.stroke("black");
			
			// Value from context:
			var pos   = Math.round((value - 0.5) * (w));
			
			renderer.begin();
			renderer.line(
				x + pos, 
				y - hh, 
				x + pos, 
				y + hh
			);
			renderer.stroke("red", 1);
			
			y += h + ho + ho*0.5;
		});
		
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
        var f = function(value) {
            
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
		
		f.left   = left;
		f.first  = first;
		f.second = second;
		f.right  = right;
		
		return f;
    };
    
    return Fuzzy;
});
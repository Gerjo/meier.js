/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    
    var Vector = require("meier/math/Vec")(2);
    var Random = require("meier/math/Random");
    var Round  = require("meier/math/Math").Round;
    var Lerp   = require("meier/math/Lerp").Vector;
    
    function Nnet(layers, seed, weights) {
        if(! layers instanceof Array) {
            throw new Error("Not an array");
        }
        
        if(layers.length < 2) {
            throw new Error("Need at least 2 layers.");
        }
        
        if(! isNaN(seed)) {
            Random.Seed(seed);
        } else {
            Random.Seed(seed = Random.Integer());
        }
        
        this.seed    = seed;
        this.bias    = 1;
        this.layers  = []; // Sorted per layer.
        this.neurons = []; // Large collect for all.
        
        
        var count = 0;
        for(var i = 1; i < layers.length; ++i) {
            // Nodes in current layer, times previous layer. Added one for bias unit.
            count += layers[i] * (layers[i-1] + 1);
        }
        
        console.log(count)
        
        
        if(! ( weights instanceof Array)) {
            weights = Random.RangeArray(count, -5, 5);
        }
        
        // Create new layers filled with neurons
        layers.forEach(function(count, layer) {
            this.layers.push([]);
            
            for(var j = 0; j < count; ++j) {
                var activation = LogisticCurve;
                
                // Output layer is linear
                if(layer == layers.length - 1) {
                    console.log("ident");
                    activation = Identity;
                }
                
                var neuron = new Neuron(activation);
            
                this.layers.last().push(neuron);
                this.neurons.push(neuron);
            }
            
            if(layer < layers.length - 1) {
                var bias = new Neuron(BiasActivation);
                bias.isBias = true; // Flag for debug rendering.
                this.layers.last().push(bias);
                this.neurons.push(bias);
            }
        }.bind(this));
        
        // Link neurons from different layers together
        this.layers.forEach(function(units, layer) {
            
            units.forEach(function(current) {
                
                if(layer > 0) {
                    this.layers[layer - 1].forEach(function(previous) {
                        
                        if(current.isBias === true) {
                            return;
                        }
                        
                        var synapse = new Synapse(previous, current);
                        
                        synapse.w = weights.shift();
                        
                        current.previous.push(synapse);
                        previous.next.push(synapse);
                    });
                }
                
            }.bind(this));
            
        }.bind(this));
        
        
        // Lookup table for errors.
        this.errors   = {};
        this.expected = {};
    }
    
    Nnet.prototype.train = function(inputValues, expectedValues) {
        
        if(!(inputValues instanceof Array && expectedValues instanceof Array)) {
            throw new Error("Either input values or expected values is not an array.");
        }
        
        if(inputValues.length != expectedValues.length) {
            throw new Error("Input length does not match expected output.")
        }
        
        var learningRate = 0.01;
        var reps = 10;
        
        //inputValues = inputValues.slice(inputValues.length - 1);
        //expectedValues = expectedValues.slice(expectedValues.length - 1);
        
        
        // Use shuffled input.
        var indices = Array.Range(0, inputValues.length).shuffle();
        
        for(var k = 0; k < indices.length; ++k) {
            var i = indices[k];

            var input    = inputValues[i];
            var expected = expectedValues[i];
            var output   = this.classify(input);
            
            var hash     = input.join();
            
            if( ! this.errors[hash]) {
                this.errors[hash] = [];
            }
            
            //console.log("derp");
            
            for(var rep = 0; rep < reps; ++rep) {
                
                // Compute errors (back propegation)
                for(var layer = this.layers.length - 1; layer >= 0; --layer) {
                    // For each neuron in said layer                
                    this.layers[layer].forEach(function(neuron, j) {
                    
                        // Special case for output units. Directly compare with
                        // the expected outcome.
                        if(layer == this.layers.length - 1) {
                            // y - t
                            neuron.error = output[j] - expected[j];
                            
                            // Record output error
                            this.errors[hash].push(neuron.error); 
                        } else {
                            
                            // z * (1 - z) * sigma(w, delta)
                            
                            if(neuron.isBias) {
                                neuron.error = 99;
                                return;
                            }
                            
                            //console.log("Sum:");
                            neuron.error = neuron.next.reduce(function(p, synapse) {
                                //console.log("   " + synapse.next.error.toFixed(2) + " * " + synapse.w.toFixed(2));
                                // Sum of weighted errors
                                return p + synapse.next.error * synapse.w
                            }, 0);
                            
                            //console.log("   * " + neuron.x.toFixed(2) + " * (1 - " + neuron.x.toFixed(2) + ")");
                            
                            neuron.error = neuron.x * (1 - neuron.x) * neuron.error;
                            
                        }
                    }.bind(this));      
                }
            
                // Adjust weights
                for(var layer = 0; layer < this.layers.length; ++layer) {
                    this.layers[layer].forEach(function(neuron, j) {
                        neuron.next.forEach(function(synapse) {
                            synapse.change = learningRate * neuron.x * synapse.next.error;
                            synapse.w -= synapse.change;
                        });
                    });
                }
            
                console.log("[" + input.join() + "] generated: " + Round(output, 3) + ", expected: " + expected);
            }
            //break;
        }
        
    };
    
    Nnet.prototype.classify = function(input) {
        
        var l = this.layers[0].length - 1; // Remove the bias unit.
        
        if(input instanceof Array) {
            if(input.length === l) {
                
                for(var i = 0; i < l; ++i) {
                    this.layers[0][i].x = input[i];
                }
                
                
                // Bring the input (x) to the next layer, each time.
                for(var i = 1; i < this.layers.length; ++i) {
                    this.layers[i].forEach(function(neuron) {
                        // Restart accumulator
                        neuron.x = 0;
                        
                        neuron.previous.forEach(function(synapse) {
                            neuron.x += synapse.previous.x * synapse.w;
                        });
                        
                        neuron.activate();
                    });
                }
                
                
            } else {
                throw new Error("Nnet: Invalid amount of input. Given:" + input.length + "/" + this.layers[0].length);
            }
        } else {
            throw new Error("Nnet: Input is not an array.");
        }
        
        
        // Collect the x values of the last layer
        var output = [];
        
        this.layers.last().forEach(function(neuron) {
            output.push(neuron.x);
        });
        
        return output;
    };
    
    /// For debug and educative purposes
    Nnet.prototype.draw = function(renderer, x, y, w, h) {
        
        var ypos = 200;
        for(var k in this.errors) {
            
            while(this.errors[k].length > 100) {
                this.errors[k].shift();
            }
            
            renderer.text("class: [" + k + "]", -435, ypos + 50, "black", "left");
            renderer.text("error: " + this.errors[k].last().toFixed(2), -435, ypos + 35, "black", "left");
            
            if(this.errors.hasOwnProperty(k)) {
                renderer.begin();
                
                for(var i = 0; i < this.errors[k].length; ++i) {
                    var xpos = -435;
                    renderer.line(i + xpos, ypos, i + xpos, this.errors[k][i] * 4 + ypos);
                }
                
                renderer.stroke("black", 1);
                
                //console.log("derp");
            }
            
            ypos -= 100;
        }
        
        // Find layer with the most units:
        var largest = this.layers.reduce(function(p, c) {
            return c.length > p ? c.length : p;
        }, 0);
        
        var radius = 15; // Desired radius of each neuron.
        var spacing = new Vector(40, 40);
        
        var offset = new Vector(
                (this.layers.length-1) * spacing.x * -0.5 + x,
                (largest+1) * spacing.y * -0.5 + y
        );
        
        // First calculate all positions
        this.layers.forEach(function(layer, i) {
            var x = i * spacing.x + offset.x;
            var y = (largest - layer.length) * (spacing.y / 2) + offset.y;
            
            for(var j = 0; j < layer.length; ++j) {
                y += spacing.y;
                
                layer[j].position.x = x;
                layer[j].position.y = y;
            }
        });
        
        // Draw all neurons and synapses
        
        renderer.begin();
        this.neurons.forEach(function(neuron) {
            
            if(neuron.isBias === true) {
                renderer.circle(neuron.position.x, neuron.position.y, radius-1);
                renderer.circle(neuron.position.x, neuron.position.y, radius-2);
            }

            renderer.circle(neuron.position.x, neuron.position.y, radius);
            renderer.text(neuron.x.toFixed(2), neuron.position.x, neuron.position.y, "black", "center", "middle");
            renderer.text(neuron.error.toFixed(2), neuron.position.x, neuron.position.y-10, "red", "center", "middle", "9px monospace");
           
            neuron.next.forEach(function(synapse) {
                var dir  = synapse.next.position.clone().subtract(synapse.previous.position).trim(radius);
                var from = synapse.previous.position.clone().add(dir);
                var to   = synapse.next.position.clone().subtract(dir);
                
                var middle = Lerp(from, to, 0.2);
                
                renderer.text(Round(synapse.w, 2), middle.x, middle.y, "black", "center", "middle", "9px monospace");
                renderer.text(Round(synapse.change, 2), middle.x, middle.y - 10, "green", "center", "middle", "9px monospace");
                
                renderer.line(from, to);
            });
        });

        renderer.fill("rgba(0, 0, 0, 0.2)");
        renderer.stroke("rgba(0, 0, 0, 0.2)", 2);
        
    };
    
    
    function Neuron(activation) {
        
        if(typeof activation != "function") {
            throw new Error("No activation function given!");
        }
        
        this.previous    = [];
        this.next        = [];
        this.x           = 1;
        this.error       = 0; // error at this neuron.
        this._activation = activation;
        this.isBias      = false;
        
        // For debug rendering purposes.
        this.position = new Vector(0, 0);
    }
    
    Neuron.prototype.activate = function() {
        this.x = this._activation(this.x);
    };

    function Synapse(previous, next, weight) {
        this.w        = isNaN(weight) ? 1 : weight;
        this.next     = next;
        this.previous = previous;
        this.change   = 0;
    }
    
    /// Identity function f(x) = x
    function Identity(x) {
        return x;
    }
    
    /// Sigmoid activation function. (0, 1)
    function LogisticCurve(a) {
        return 1 / (1 + Math.exp(-a));
        var exp = 1 + Math.exp(-a);
        
        if(isNaN(exp)) {
            debugger;
            throw new Error("nan 1: " + a);
        }
        
        if(exp < 0.00000001) {
            return 0.00000001;
        }

        if(exp >= 1) {
            return 0.999999999999;
        }
        
        var r = 1 / exp;
        
        if(isNaN(r)) {
            throw new Error("nananananana");
        }
        
        return r;
    }
    
    /// Sigmoid activation function. (-1, 1)
    function ArcTangent(a) {
        return 2 / Math.PI * atan(Math.PI/2 * a);
    }
    
    // Bias neuron don't care.
    function BiasActivation(a) {
        return 0;
    }
    
    return Nnet;
});
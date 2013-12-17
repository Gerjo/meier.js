define(function(require) {
    var Game      = require("meier/engine/Game");
    var Input     = require("meier/engine/Input");
    var Key       = require("meier/engine/Key");
    var Vector    = require("meier/math/Vec")(2);
    var Nnet      = require("meier/math/Nnet");

    var Selector = require("./Selector");

    // Struct to link a given class to a location. Basically
    // maps neuralnetwork input to output.
    function Class(position, factors, klass) {
        
        // Visual position for debug renderering
        this.position = position;   
        
        // Neural network training factors
        this.factors  = factors;    
        
        // Reference to the class containing an id and color
        this.class    = klass;      
    }

    NeuralApp.prototype = new Game();
    function NeuralApp(container) {
        Game.call(this, container);
        this.setFps(30);
        this.setAutoClear(false);
        
        // Debug log alignment:
        this.log.top().right();
        
        var w = 400;
        var h = 50;
        this.add(this.selector = new Selector(-this.hw + w * 0.5 + 10, this.hh - h * 0.5 - 10, w, h));
        
        
        var lowPriority = -99;
        this.input.subscribe(Input.LEFT_DOWN, this.onLeftDown.bind(this), lowPriority);
        
        this.input.subscribe(Input.KEY_DOWN, this.onKeyDown.bind(this));
        
        
        this.trainingClasses = [];
        
        
        this.restart();
        
    }
    
    NeuralApp.prototype.onKeyDown = function(input, key) {
        if(key == Key.SPACE) {
            this.train();
        } else if(key == Key.LEFT_ENTER) {
            this.restart();
        }
    };
    
    NeuralApp.prototype.train = function() {
        
        var input  = []; // Directly feed to input layer.
        var output = []; // Expected outputs for the output layer.
        
        this.trainingClasses.forEach(function(klass) {
            
            input.push(klass.factors);
            
            var out = [];
            
            for(var i = 0; i < this.selector.numOfClasses(); ++i) {
                out[i] = (i == klass.class.id) ? 1 : 0;
            }
            
            // Expect the class' id as output
            output.push(out);
        }.bind(this));
        
        
        this.nnet.train(input, output);
    };
    
    NeuralApp.prototype.restart = function() {
        
        this.nnet = new Nnet([
            2,   // Size of input layer 
            10,  // Size of hidden layer
            20,  // Size of hidden layer
            24,  // Size of hidden layer
            this.selector.numOfClasses()    // Size of output layer
        ]);
        
        this.log.log("Nnet seed", this.nnet.seed);
    };
    
    NeuralApp.prototype.onLeftDown = function(input) {
        
        var addNew = true;
        
        for(var i = this.trainingClasses.length - 1; i >= 0; --i) {
            var klass = this.trainingClasses[i];
            
            if(klass.position.distanceSQ(input) < 20) {
                this.trainingClasses.splice(i, 1);
                addNew = false;
            }
        }
        
        if(addNew) {
        
            // Factors used to train the network
            var factors = [
                (input.x + this.hw) / this.width,
                (input.y + this.hh) / this.height
            ];
        
            this.trainingClasses.push(
                new Class(input.clone(), factors, this.selector.active)
            );
        }
    };
    
    NeuralApp.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);

    };
    
    NeuralApp.prototype.draw = function(renderer) {
        
        renderer.clear();
        
        var samplePoints = 31;
        
        var xStep =  this.width / samplePoints;
        var yStep = this.height / samplePoints * (this.width / this.height);
        
        for(var x = -this.hw; x <= this.hw; x += xStep) {
            for(var y = -this.hh; y <= this.hh; y += yStep) {
                renderer.begin();
                
                renderer.rectangle(x, y, xStep, yStep);
                
                var factors = [
                    (x + this.hw) / this.width, 
                    (y + this.hh) / this.height
                ];
                
                var klass = this.nnet.classify(factors);
                
                var bestIndex = -1;
                var bestScore = -Infinity;
                
                for(var i = 0; i < klass.length; ++i) {
                    if(klass[i] > bestScore) {
                        
                        bestIndex = i;
                        
                        bestScore = klass[i];
                    }
                }
                
                renderer.fill(this.selector.idToColor(bestIndex));
            }
        }
        
        Game.prototype.draw.call(this, renderer);
        
        // Draw the trianing data
        this.trainingClasses.forEach(function(klass) {
            renderer.begin();
            renderer.rectangle(klass.position, 10, 10);
            renderer.stroke("black");
            renderer.fill(klass.class.stroke);
        });
        
        this.nnet.draw(renderer, 0, 0, this.width, this.height);
    };
    
    return NeuralApp;
});
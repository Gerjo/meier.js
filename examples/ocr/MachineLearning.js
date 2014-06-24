define(function(require) {
    var Game      = require("meier/engine/Game");
    var Input     = require("meier/engine/Input");
    var Vector    = require("meier/math/Vec")(2);
    var Sketch    = require("meier/prefab/Sketch");
    var KNN       = require("meier/math/Knn");
    var Nnet      = require("meier/math/Nnet");
    var Round     = require("meier/math/Math").Round;
    var Key       = require("meier/engine/Key");
    var Train     = require("./TrainingData");

    MachineLearning.prototype = new Game();
    function MachineLearning(container) {
        Game.call(this, container);
        this.setFps(30);
        
        // Debug log alignment:
        this.logger.top().right();
        
        this.numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        
        
        this.add(this.sketch = new Sketch(0, 0, 300, 300));
        
        this.input.subscribe(Input.KEY_DOWN, this.onKeyDown.bind(this));
               
        this.useStorage = false;
        this.isLearning = false;
        
        var data;
        if(this.useStorage) {
            data = localStorage.getItem("learndata");
        } else {
            data = Train;
        }
        
        if(typeof data === "string") {
            this.data = JSON.parse(data);
            console.log("Loaded " + this.data.length + " training records.");
        } else if(data instanceof Array) {
            this.data = data;
        } else {
            console.log("Starting new storage.");
            this.data = [];
        }
        
        this.current = this.numbers.random();
        this.previous = this.current;
        
        this.lastGuess = null;
    }
    
    MachineLearning.prototype.onKeyDown = function(input, key) {
        this.renew();
    };
    
    MachineLearning.prototype.renew = function() {
        
        // Retrieve current state
        var stats   = this.sketch.fingerprint();
        
        // Testing
        this.lastGuess = KNN(this.data, stats, true);
        
        if(this.isLearning) {
            // Add correct class, then add to training set.
            stats.class = this.current;
            
            this.data.push(stats);
        }
        
        if(this.useStorage) {
            // Storing
            localStorage.setItem("learndata", JSON.stringify(this.data));
        }
        
        // Restart
        this.sketch.clear();
        this.previous = this.current;
        this.current  = this.numbers.random();
    };

    
    MachineLearning.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);

    };
    
    MachineLearning.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        //this.nnet.draw(renderer, 0, 0, 300, 300);
        
        if(this.isLearning) {
            renderer.text("Draw digit: " + this.current, 0, 210, "black", "center", "middle", "bold 40px monospace ");
        } else {
            renderer.text("Draw some digit", 0, 210, "black", "center", "middle", "bold 40px monospace ");
        }
        
        renderer.text("Press any key when drawn to guess the digit.", 0, 180, "black", "center", "middle");
        
        if(this.lastGuess) {
            
            var color;
            
            if( ! this.isLearning) {
                color = "green";
            } else {
                color = this.lastGuess.classes[0].class == this.previous ? "green" : "red"
            }
            
            // This number actually makes little sense. But it's fun to look at >.<
            var certainty = Round(100 / (this.lastGuess.distance * 19), 2);
            
            var text = "";
            if(this.lastGuess.classes.length > 1) {
                
                text  = this.lastGuess.classes.reduce(function(p, c) { return p + ", " + c.class }, "").trim(", ");
                text  = "KNN (k=1) it's a tie between " + text + "; with  " + certainty + "% certainty.";
                color = "orange";
                
            } else {
                text = "KNN (k=1) thought that was a " + this.lastGuess.classes[0].class + ", with  " + certainty + "% certainty.";
            }
            
            renderer.text(text, 0, -180, color, "center", "middle");
            
        }
        
        renderer.text("The algorithms are trained with " + this.data.length + " hand-drawn digits by me personally.", 0, -200, "black", "center", "middle");
        
    };
    
    return MachineLearning;
});
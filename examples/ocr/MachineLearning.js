define(function(require) {
    var Game      = require("meier/engine/Game");
    var Input     = require("meier/engine/Input");
    var Vector    = require("meier/math/Vec")(2);
    var V         = require("meier/math/Vec");
    var V19       = V(19);
    
    var M         = require("meier/math/Mat");
    var GJE       = require("meier/math/Math").GaussJordanElimination;
    var RowEchelonForm = require("meier/math/Math").RowEchelonForm;
    var Sketch    = require("meier/prefab/Sketch");
    var KNN       = require("meier/math/Knn");
    var Nnet      = require("meier/math/Nnet");
    var Round     = require("meier/math/Math").Round;
    var Key       = require("meier/engine/Key");
    var LDA       = require("meier/math/DiscriminantAnalysis").Linear;
    var QDA       = require("meier/math/DiscriminantAnalysis").Quadratic;
    
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
        
        this.current   = this.numbers.random();
        this.previous  = this.current;
        
        this.lastGuess = null;
        
        
        this.tasks = [];
        this.task  = null;
        /*for(var j = 0; j < 10; ++j) {
            this.tasks.push({
                title: "Task " + j,
                fn: function() {
                    for(var i = 0; i < 10000000; ++i) {
                    
                    }
                }
            });
        }*/
        
        var M66 = M(6, 6);
            
        var input = new M66([
            0, 11,  1, 0,  5, -6,
            1,  0,  3,  4,  5,  6,
            1, -2,  3,  1,  1, -6,
            1,  2, -3,  9,  5, -6,
            1, -2,  9,  4,  1,  1,
            1, -2, 32,  9,  5,  6
        ]); 
        
        var output = M66.CreateIdentity();
        console.log("in: \n" + input.wolfram());

        console.log("minor:\n" + input.minors().pretty());        
        console.log("adjugate:\n" + input.adjugate().pretty());        
        console.log("determinant: " + input.determinant());
        console.log("inverse:\n" + input.inverse().pretty());
        console.log("I * M:\n" + input.product(input.inverse()).pretty(10));
        
        
        this.trainModels(Train);
        
    }
    
    MachineLearning.prototype.trainModels = function(train) {
        
        var perClass = [];
        
        train = train.clone();
        
        var max = this.max = {};
        var min = this.min = {};
        
        train.forEach(function(row) {
            for(var k in row) {
                max[k] = Math.max(max[k] || 0, row[k]);
                min[k] = Math.min(min[k] || 0, row[k]);
            }
        });
        
        var scale = this.scale = {};
        for(var k in max) {
            scale[k] = 1 / (max[k] - min[k]);
        }
        
        //console.log(max);
        //console.log(min);
        //console.log(scale);
        
        // Sort per class
        train.forEach(function(entry) {
            var label = entry.class;
            
            if( ! perClass[label]) {
                delete entry.class;
                perClass[label] = [];
            }
            
            
            var vector = new V19();
            
            var c = 0;
            for(var k in entry) {
                vector.set(c++, (entry[k] - min[k]) * scale[k]);
            }
            
            perClass[label].push(vector);
        });
        
        var models = this.models = [];
        
        
        var max = 2;
        for(var a = 0; a < max; ++a) {
            models[a] = [];
            
            for(var b = a + 1; b < max; ++b) {
                var classifier = LDA(perClass[a], perClass[b]);
                
                
                models[a][b] = classifier;
                
            }
        }
    };
    
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
        
        //var M19_1 = M(19, 1);
        
        
        var vector = new V19();
                
        var i = 0;
        for(var k in stats) {
            vector.set(i++, (stats[k] - this.min[k]) * this.scale[k]);
        }
        
        console.log("v:",  vector.wolfram());
        
        var votes = new Array(10);
        
        for(var i = 0; i < this.models.length; ++i) {
            votes[i] = 0;
            
            for(var j = 0; j < this.models[i].length; ++j) {
                
                var classifier = this.models[i][j];
                
                if(classifier) {
                
                    var clss = this.models[i][j](vector);
                
                    if(clss < 0) {
                        votes[i]++;
                    } else if(clss > 0) {
                        votes[j]++;
                    } else {
                        votes[i]++;
                        votes[j]++;
                        // ... ehhh
                    }
                
                    console.log(i + " or " + j + " = " + clss);
                }
            }
        }
        
        console.log(votes.join(", "));
        
    };

    
    MachineLearning.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);

    };
    
    MachineLearning.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        if(this.task || ! this.tasks.empty()) {
            
            if(this.task) {
                this.task.fn();
            }
            
            if( ! this.tasks.empty()) {
                this.task = this.tasks.pop();
            } else {
                this.task = null;
            }
            
            if(this.task) {
                renderer.text(this.task.title, 0, 210, "black", "center", "middle", "bold 40px monospace ");
                return;
            }
        }
                
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
define(function(require){
    var Game   = require("meier/engine/Game");
    var Color  = require("meier/engine/Colors");
    var Random = require("meier/math/Random");
    var Grid   = require("meier/prefab/Grid");
    var dat    = require("meier/contrib/datgui");
    var Vector = require("meier/math/Vec")(2);
    var LDA    = require("meier/math/DiscriminantAnalysis").Linear;
    var QDA    = require("meier/math/DiscriminantAnalysis").Quadratic;
    var KNN    = require("meier/math/Knn");
    
    ClassificationApp.prototype = new Game();
    
    function ClassificationApp(container) {        
        Game.call(this, container);

        // Change log alignment
        this.logger.right().bottom();
        
        // We'll clear the canvas ourselves
        this.setAutoClear(false);

        
        this.setLowFps(5);
        this.setLowFps(1);
        
        // Function that shall be used
        this.classifier = null;
        
        // Cache for coordinates
        this._byOption    = {};
        this._coordinates = [];
        
        // Classification colors
        this.colors = [
            "red",
            "blue"    
        ];
        
        // Fill color has some transparancy
        this.fill = this.colors.map(function(c) {
            return Color.Alpha(c, 0.3);
        });
        
        // Interactive grid
        this.add(this.grid = new Grid(0,0,this.width,this.height));
        this.grid.setEditable(true);
        this.grid.addOption("A", this.colors[0]);
        this.grid.addOption("B", this.colors[1]);
        this.grid.onChange = this.onChange.bind(this);
        
        this.gui = new dat.GUI();
        this.gui.width = 300;
        
        this.classifierName = "lda";
    	this.gui.add(this, 'classifierName', ["lda", "qda", "knn (k=1)"]).
                name("Specify Classifier").
                onChange(this.onChange.bind(this));
        
        this.sampleResolution = 30;
        this.gui.add(this, "sampleResolution", 1, 60).name("Sample density").onChange(this.onChange.bind(this));
        
        
        // Mersenne Twister seeding
        var s = 2342;//Random(0, 10000);
        this.log("Random seed", s);
        Random.Seed(s);
        
        var margin = 100;
        for(var i = 0; i < 8; ++i) {
            this.grid.addCoordinate(new Vector(
                Random(-this.hw + margin, this.hw - margin),
                Random(-this.hh + margin, this.hh - margin)
            ));
            
            if(i == 3) {
                this.grid.selectOption("B");
            }
            
        }
      
    }
    
    ClassificationApp.prototype.onChange = function(coordinates, byOption) {
        
        // Update the cache
        if(byOption) {
            this._byOption    = byOption;
            this._coordinates = coordinates;
            
        // Use the cached versions
        } else {
            byOption    = this._byOption;
            coordinates = this._coordinates;
        }

        if(coordinates.length === 0) {
            return;
        }

        switch(this.classifierName) {
        case "mnom":
            // TODO: read chapters in book.
            break;
        case "lda":
            this.classifier = LDA(byOption.A || [], byOption.B || []);
            break;
        case "qda":
            this.classifier = QDA(byOption.A || [], byOption.B || []);
            break;
        case "knn (k=1)":
            
            var train = [];
            
            // At this time KNN wants objects, not vectors.
            for(var k in byOption) {
                if(byOption.hasOwnProperty(k)) {
                    train.merge(byOption[k].map(function(c) {
                        return {x: c.x, y: c.y, option: k};
                    }));
                }
            }
                           
            this.classifier = function(vector) {
                // Turn the vector into an object:
                var ClassificationApp = { x: vector.x, y: vector.y };
                
                var res = KNN(train, ClassificationApp).classes[0];
                
                return res.option.toUpperCase() == "A" ? -1 : 1;
            };
            
            break;
        default:
            console.log("not available: " + this.classifierName);
        }
        
        // Schedule a redraw        
        this.redraw();      
    };
    
    ClassificationApp.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    ClassificationApp.prototype.draw = function(renderer) {
        renderer.clear();
        
        // Only draw if there is a classifier and their are coordinates
        if(this.classifier !== null && this._coordinates.length > 0) {
            var samplePoints = 30;
        
            var xStep =  this.width / this.sampleResolution;
            var yStep = this.height / this.sampleResolution * (this.width / this.height);
            var xStepH = xStep * 0.5; 
            var yStepH = yStep * 0.5;
            
            var c = new Vector(0, 0);
        
            for(c.x = -this.hw; c.x <= this.hw; c.x += xStep) {
                for(c.y = -this.hh; c.y <= this.hh; c.y += yStep) {
                    renderer.begin();
                
                    renderer.rectangle(c.x, c.y + yStepH, xStep, yStep);
               
                    var klass = this.classifier(c);
                
                    // It's a tie
                    if(klass == 0) {
                        renderer.fill("rgba(0, 0, 0, 0.2)");
                    } else {
                        renderer.fill(this.fill[(klass > 0) ? 1:0]);
                    }
                }
            }
        }
        
        Game.prototype.draw.call(this, renderer);
    }
    
    return ClassificationApp;
});
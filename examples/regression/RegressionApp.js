define(function(require) {
    var Game         = require("meier/engine/Game");
    var Input        = require("meier/engine/Input");
    var Grid         = require("meier/prefab/Grid");
    var Vector       = require("meier/math/Vec")(2);
    var Random       = require("meier/math/Random");
    var Disk         = require("meier/math/Disk");
    var Round        = require("meier/math/Math").Round;
    var M            = require("meier/math/Mat");
    var Noise        = require("meier/extra/Noise");
    var dat          = require("meier/contrib/datgui");
    var LeastSquares = require("meier/math/Polynomial").LeastSquares;
    var LeastSquareCircle  = require("meier/math/Math").LeastSquaresCircle
    var MovingLeastSquares = require("meier/math/Polynomial").MovingLeastSquares;

    
    RegressionApp.prototype = new Game();
    function RegressionApp(container) {
        Game.call(this, container);
        
        this.logger.right().bottom();
        
        
        // Will eventually hold the polynomial function of x:
        this.function = null;
        
        // Cache of the coordinates from which the polynomial
        // is derrived.
        this.coordinates = [];
        
        // Initial degree:
        this.polynomialDegree = 7;
        
        // Matrix with polynomial coefficients:
        this.coefficients = null;
        
        // Least squares circle
        this.disk = new Disk();
        
        // Moving least squares properties
        this.mls = null;
        this.mlsSigma = 12;
        this.showMls = true;
        this.showMlsBasis = false;
        
        this.showPolynomial = true;
        this.showCircle = false;
        
        this.grid = new Grid(0, 0, this.width, this.height);
        this.grid.setRealLabels(true);
        this.grid.setEditable(true);
        this.grid.onChange = this.recompute.bind(this);
        this.add(this.grid);
        
        
        
        this.gui = new dat.GUI();
        this.gui.width = 350;
        
        var folder = this.gui.addFolder("Least Squares");
        folder.add(this, "polynomialDegree", 0, 50).name("Polynomial Degree").step(1).onChange(this.recompute.bind(this));
        folder.add(this, "showPolynomial").name("Show fitted Polynomial");
        folder.add(this, "showCircle").name("Show fitted Circle");
        
        folder = this.gui.addFolder("Moving Least Squares");
        folder.add(this, "mlsSigma", 0, 50).step(0.01).name("MLS Sigma").onChange(this.recompute.bind(this));
        folder.add(this, "showMls").name("Show MLS");
        folder.add(this, "showMlsBasis").name("Show Gaussian Basis");
        
        folder = this.gui.addFolder("Randomness");
        folder.add(this, "randomArc").name("Add Arc");
        folder.add(this, "randomWave").name("Add Wave");
        folder.add(this.grid, "clear").name("Clear");
        

        this.randomWave();
    }
   
    RegressionApp.prototype.randomArc = function() {
        this.grid.addCoordinates(Noise.LargeArc(this.width, this.height));            
    };
    
    RegressionApp.prototype.randomWave = function() {
        this.grid.addCoordinates(Noise.Wave(this.width, this.height));            
    };
    
   
    RegressionApp.prototype.recompute = function(coordinates) {
        //console.log(coordinates);
        
        if(coordinates instanceof Array) {
            // Create a cached copy:
            this.coordinates = coordinates;
            
        } else {
            // No coordinates given, use the cache:
            coordinates = this.coordinates;
        }
                    
        // Parse the integer bit from a number:
        var degree = parseInt(this.polynomialDegree, 10);
        
        if(degree >= coordinates.length) {
            degree = coordinates.length-1;
        }
                
        // Update the GUI to show the actual used degree:
        //this.polynomialDegree = degree;
        
        // Find the coefficients (this call does all the magic)
        this.coefficients  = LeastSquares(degree + 1, coordinates);
        
        // Create polynomial function of x:
        this.function = function(x) {
            var r = 0;
        
            this.coefficients.eachRow(0, function(val, i) {                
                r += val * Math.pow(x, i);
            });
        
            return r;
        }.bind(this);
        
        this.disk = LeastSquareCircle(coordinates);
        
        this.mls = MovingLeastSquares(coordinates, this.mlsSigma * 0.1);
    };
    
    RegressionApp.prototype.polynomialName = function(count) {
        // Kindly taken from wikipedia:
        return ["constant", "linear", "quadratic", 
                "cubic", "quartic", "quintic", "sextic", 
                "septic", "octic", "nonic", "decic"][count];
    };
    
    RegressionApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        
        if(this.showMlsBasis && this.mls) {
            this.mls.basis.forEach(function(basis) {
                var r = this.mls.xRange * 0.5;
                
                renderer.begin();
            
                var a = null;
                for(var t = -r, o = t; t <= r; o = t, t += 1) {
                    var c = basis(t) * 5000;
                
                    if(a !== null) {
                        renderer.line(o, a, t, c);
                    }
                
                    a = c;
                }
            
                renderer.stroke("darkgrey", 1);
            }.bind(this));
        }
        
        if(this.showPolynomial && this.coefficients) {
            this.plot(renderer, this.function, "red", 2);
        }
        
        if(this.showMls && this.mls) {
            this.plot(renderer, this.mls.f, "blue", "2");
        }
        
        if(this.showCircle) {
            renderer.begin();
            renderer.circle(this.disk);
            renderer.fill("rgba(0, 0, 0, 0.3)");
            renderer.stroke("rgba(0, 0, 0, 0.7)");
        }
    };
    
    RegressionApp.prototype.plot = function(renderer, f, color, width) {
        var step = (this.grid.max.x - this.grid.min.x) / 300;
        
        var previous = new Vector(
            this.grid.min.x,
            f(this.grid.min.x)
        );
        
        renderer.begin();
        for(var x = this.grid.min.x + step, y; x < this.grid.max.x; x += step) {
            y = f(x);
            
            renderer.line(previous.x, previous.y, x, y);
            
            previous.x = x;
            previous.y = y;
        }
        renderer.stroke(color, width);
    };  
    
    return RegressionApp;
});

define(function(require) {
    var Game         = require("meier/engine/Game");
    var Input        = require("meier/engine/Input");
    var Grid         = require("meier/prefab/Grid");
    var Vector       = require("meier/math/Vec")(2);
    var Random       = require("meier/math/Random");
    var Round        = require("meier/math/Math").Round;
    var M            = require("meier/math/Mat");
    var dat          = require("meier/contrib/datgui");
    var LeastSquares = require("meier/math/Polynomial").LeastSquares;
    

    
    RegressionApp.prototype = new Game();
    function RegressionApp(container) {
        Game.call(this, container);
        
        this.log.right().bottom();
        
        // Will eventually hold the polynomial function of x:
        this.function = null;
        
        // Cache of the coordinates from which the polynomial
        // is derrived.
        this.coordinates = [];
        
        // Initial degree:
        this.polynomialDegree = 4;
        
        // Matrix with polynomial coefficients:
        this.coefficients = null;
        
        this.gui = new dat.GUI();
        this.gui.add(this, "polynomialDegree", 0, 50).step(1).onChange(this.recompute.bind(this));
        
        
        
        this.grid = new Grid(0, 0, this.width, this.height);
        this.grid.setRealLabels(true);
        this.grid.setEditable(true);
        this.grid.onChange = this.recompute.bind(this);
        this.add(this.grid);
        
        
        
        // Generate a data set:
        var w = this.width - 100, hw = w * 0.5;
        
        Random.Seed(1);
        
        for(var x = -hw; x <= hw; x += Random.Range(20, 50)) {
            var t = (x + hw) / w * Math.PI;
            
            var v = new Vector(x, Math.sin(t) * 100);
            v.y += Random.Range(-20, 20);
            this.grid.onLeftDown(v);            
        }
    }
   
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
        
        if(degree > coordinates.length) {
            degree = coordinates.length;
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
        
  
        
    };
    
    RegressionApp.prototype.polynomialName = function(count) {
        // Kindly taken from wikipedia:
        return ["constant", "linear", "quadratic", 
                "cubic", "quartic", "quintic", "sextic", 
                "septic", "octic", "nonic", "decic"][count];
    };
    
    RegressionApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        var name = this.polynomialName(this.polynomialDegree);
        
        if(name) {
            name = " - " + name;
        } else {
            name = "";
        }
        
        renderer.text("Polynomial degree: " + this.polynomialDegree + name, -this.hw + 10, this.hh - 10, "black", "left");
        
        renderer.text("Coefficients:", -this.hw + 10, this.hh - 30, "black", "left");
        
        if(this.coefficients) {
            this.coefficients.eachRow(0, function(val, i) {
                
                // Pretty alignment:
                var prefix = val > 0 ? " " : "";
                
                renderer.text("  " + prefix + val.toFixed(10), -this.hw + 10, this.hh - 50 - i * 20, "black", "left");
            }.bind(this));
        }


        this.plot(renderer, this.function, "red", 2);

    };
    
    RegressionApp.prototype.plot = function(renderer, f, color, width) {
        var step = (this.grid.max.x - this.grid.min.x) / 200;
        
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
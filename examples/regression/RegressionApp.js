define(function(require) {
    var Game         = require("meier/engine/Game");
    var Input        = require("meier/engine/Input");
    var Grid         = require("meier/prefab/Grid");
    var Vector       = require("meier/math/Vec")(2);
    var Random       = require("meier/math/Random");
    var M            = require("meier/math/Mat");
    var dat          = require("meier/contrib/datgui");
    var LeastSquares = require("meier/math/Polynomial").LeastSquares;
    

    RegressionApp.prototype = new Game();
    function RegressionApp(container) {
        Game.call(this, container);
        
        this.log.right().bottom();
        
        // Will eventually hold the polynomial functions of x:
        this.functions = [];
        
        // Cache of the coordinates from which the polynomial
        // is derrived.
        this.coordinates = [];
        
        // Initial degree:
        this.polynomialDegree = 1;
        
        this.gui = new dat.GUI();
        this.gui.add(this, "polynomialDegree", 1, 50).step(1).onChange(this.recompute.bind(this));
        
        
        
        this.grid = new Grid(0, 0, this.width, this.height);
        this.grid.setRealLabels(true);
        this.grid.setEditable(true);
        this.grid.onChange = this.recompute.bind(this);
        this.add(this.grid);
        
        
        
        // Generate a data set:
        var w = this.width - 100, hw = w * 0.5;
        
        Random.Seed(1);
        
        for(var x = -hw; x <= hw; x += Random.Range(20, 65)) {
            var t = (x + hw) / w * Math.PI;
            
            var v = new Vector(x, Math.sin(t) * 100);
            v.y += Random.Range(-50, 50);
            this.grid.onLeftDown(v);            
        }
    }
   
    RegressionApp.prototype.recompute = function(coordinates) {
            
        if(coordinates instanceof Array) {
            // Create a cached copy:
            this.coordinates = coordinates;
            
        } else {
            // No coordinates given, use the cache:
            coordinates = this.coordinates;
        }
      
        // Reset existing (previous) functions:
        this.functions.clear();
                
        // Keep the previous function:
        //while(this.functions.length > 1) {
        //    this.functions.pop();
        //}
                    
        // Parse the integer bit from a number:
        var degree = parseInt(this.polynomialDegree, 10);
        
        if(degree > coordinates.length) {
            degree = coordinates.length;
        }
        
        //degree += 1;
        
        // Update the GUI to show the actual used degree:
        this.polynomialDegree = degree;
        
        // Find the coefficients (this call does all the magic)
        var coefficients = LeastSquares(degree, coordinates);
        
        
        // Create polynomial function of x:
        this.functions.unshift(function(x) {
            var r = 0;
        
            coefficients.eachRow(0, function(val, i) {                
                r += val * Math.pow(x, i);
            });
        
            return r;
        }.bind(this));
        
  
        
    };
    
    RegressionApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        
        renderer.text("Polynomial degree: " + this.polynomialDegree, -this.hw + 10, this.hh - 10, "black", "left")


        this.functions.forEach(function(fn, i) {
            var color = "rgba(0, 0, 0, 1)";
            var width = 1;
            
            if(i === 0) {
                color = "red";
                width = 2;
            }
            
            this.plot(renderer, fn, color, width);
        }.bind(this));

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
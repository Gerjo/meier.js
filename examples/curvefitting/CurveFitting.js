define(function(require) {
    var Game       = require("meier/engine/Game");
    var Input      = require("meier/engine/Input");
    var Grid       = require("meier/prefab/Grid");
    var Vector     = require("meier/math/Vec")(2);
    var V          = require("meier/math/Vec");
    var Pixel      = require("meier/prefab/Pixel");
    var Input      = require("meier/engine/Input");
    var Round      = require("meier/math/Math").Round;
    var Polynomial = require("meier/math/Polynomial");
    var Factorial  = require("meier/math/Math").Factorial;
    var dat        = require("meier/contrib/datgui");
    
    // Dynamic matrix builder:
    var M   = require("meier/math/Mat");
    
    var GJE = require("meier/math/Math").GaussJordanElimination
    
    /// Calculate the derivative of a polynomial. This is quite trivial
    /// just moving a few values around and multiplying them.
    ///
    function Derivative(v) {
        
        // Work on a copy
        var derivative = v.clone();
        
        for(var i = 0; i < derivative.numrows - 1; ++i) {
            
            // Look at the next slot.
            var v = derivative.at(i + 1, 0) * (i + 1);
            
            // Set the current slot.
            derivative.set(i, 0, v);
        }
       
        // The highest degree becomes "0", i.e., is dropped. 
        derivative.set(derivative.numrows - 1, 0, 0);
        
        // Generate some javascript code to evaluate the polynomial.
        var fn = "return ";
        for(var i = 0; i < derivative.numrows; ++i) {
            fn += derivative.at(i, 0) + " * Math.pow(x, " + i + ") + ";
        }
        fn = fn.trim(" + ") + " * 10;";
    
        // Return a function and seperate coefficients.
        return {
            "f": new Function("x", fn),
            "c": derivative
        };
    }
    
    CurveFitting.prototype = new Game();
    function CurveFitting(container) {
        Game.call(this, container);
        
        this.logger.hide();
        
        this.grid = new Grid(0, 0, this.width, this.height);
        this.grid.setRealLabels(true);
        this.grid.setEditable(true);
        
        this.add(this.grid);
        
        this.gauss = null;
        this.lagrange = null;
        this.derivativefn = null;
        
        this.grid.onChange = this.recompute.bind(this);
        
        this.taylorOrder = 2;
        
        // Some initial coordinates:
        this.grid.addCoordinates([
            new Vector(-310, -70), 
            new Vector(-260, -50), 
            new Vector(-50, -60), 
            new Vector(-130, -80), 
            new Vector(10, 50), 
            new Vector(100, 60), 
            new Vector(200, -50),
            new Vector(360, -85),
            new Vector(300, 85)
            
        ]);
     
        // Indicate interactivity with a pointy-finger.
        this.input.cursor(Input.Cursor.FINGER);   
        
        this.gui = new dat.GUI();
        this.gui.width = 300;   
        this.gui.add(this, "taylorOrder", 0, 20).step(1).name("Taylor Series Order");
        this.gui.add(this.grid, "clear").name("Clear Canvas");
    }
    
    
    CurveFitting.prototype.recompute = function(coordinates) {
        
        
        if(coordinates.length >= 2) {
            // Solve for a lagrange polynomial.
            this.lagrange = Polynomial.Lagrange(coordinates);
            
            // Solve using gaussian elimination.
            this.gauss    = Polynomial.PolynomialPath(coordinates);
            
            // Render the derivative (disabled)
            //this.derivativefn = Derivative(this.gauss.c).f;
            
            var text  = "";
            
            for(var i = 0, d; i < this.gauss.c.numrows; ++i) {
                d = i; //degree - i - 1;
                text += this.gauss.c.at(i, 0) + "x^" + d + " + ";
            }
        
            // Log the generated polynomial
            console.log(text.trim(" + "));
        
        } else {
            this.lagrange = null;
            this.gauss = null;
            this.lsq = null;
            this.text = "";
        }
    };
    
    CurveFitting.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        var font = "bold 15px monospace";
        
        var o = 30;
        renderer.text("The following polynomials are shown:", -this.hw + 10, this.hh + 10 - o, "black", "left", "middle", font);
        renderer.text(" Lagrange polynomial", -this.hw + 10, this.hh - 10 - o, "blue", "left", "middle", font);
        renderer.text(" Fitted polynomial (Gauss-Jordan)", -this.hw + 10, this.hh - 30 - o, "red", "left", "middle", font);
        renderer.text(" Taylor series of fitted polynomial at mouse.x", -this.hw + 10, this.hh - 50 - o, "green", "left", "middle", font);
        
        
        var errorfn = function(x) {
            return (this.lagrange(x) - this.gauss.f(x));
        }.bind(this);
        
        
        if(this.lagrange !== null) {
            this.plot(renderer, this.lagrange, "blue", 4);
            this.plot(renderer, this.gauss.f, "red", 2);
            //this.plot(renderer, errorfn, "green", 2);
            
            //this.plot(renderer, this.derivativefn, "purple", 2);
        
            // Point at which we compute the taylor expansion
            var circle = new Vector(
                this.input.x,
                this.gauss.f(this.input.x)
            );
            
            //
            // let n be non negative and n < desired_degree
            // a = some constant
            // x = free variable
            //
            //  f_n(a)
            // -------- * (x - a)^n
            //   n!
            //
            
            // Desired order. We add one as the for loop starts at "zero".
            var degree = this.taylorOrder + 1;
            
            // Whatever gaussian elimination yielded.
            var derivative = this.gauss;
            
            // The individual taylor terms
            var taylor = [];
            
            // Build the taylor series terms.
            for(var n = 0; n < degree; ++n) {
                
                // Nested function (due to javascript lexical scoping)
                var f = (function(n, d) {
                    return function(a, x) {
                        return (d.f(a) / Factorial(n)) * Math.pow(x - a, n);
                    };
                }(n, derivative));
                
                // We can't quite "collect terms" so keep them in an array.
                taylor.push(f);
                
                // Create a new derivative, the next iteration (if any) will use this.
                derivative = Derivative(derivative.c);
            }
            
            // Create a continues function.
            var Taylor = function(a, x) {
                
                // Evaluate the nth term, and accumulate.
                return taylor.reduce(function(sum, f) {
                    return sum + f(a, x);
                }, 0);
                
            };
            
            // Create a taylor function centered about "circle.x", which happens
            // to be the mouse location.
            var Taylor2 = function(x) {
                return Taylor(circle.x, x);
            };
            
            // Plot the function, varies x accoring to the screen dimensions.
            this.plot(renderer, Taylor2, "green", 2);
            
            // Start a new drawing effort.
            renderer.begin();
            
            // Draw a line to give a clue about what's going on.
            renderer.line(circle.x, this.hh, circle.x, -this.hh);
            
            // Draw the intercept.
            renderer.circle(circle.x, circle.y, 5);
            
            // Fill with some colors.
            renderer.fill("green");
            renderer.stroke("black");
        }
    };
    
    
    /// Plot a continues function of x. Quantize that stuff!
    CurveFitting.prototype.plot = function(renderer, f, color, width) {
        
        // Line quality (more steps = smooth, but expensive)
        var step = (this.grid.max.x - this.grid.min.x) / 250;
        
        // Starting position
        var previous = new Vector(
            this.grid.min.x,
            f(this.grid.min.x)
        );
        
        renderer.begin();
        for(var x = this.grid.min.x, y; x < this.grid.max.x; x = Math.min(this.grid.max.x, x + step)) {
            y = f(x + step);
            
            renderer.line(previous.x, previous.y, x + step, y);
            
            previous.x = x + step;
            previous.y = y;
        }
        renderer.stroke(color, width);
    };  
    
    return CurveFitting;
});
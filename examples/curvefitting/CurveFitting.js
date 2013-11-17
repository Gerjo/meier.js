define(function(require) {
    var Game       = require("meier/engine/Game");
    var Input      = require("meier/engine/Input");
    var Grid       = require("meier/prefab/Grid");
    var Vector     = require("meier/math/Vec")(2);
    var Pixel      = require("meier/prefab/Pixel");
    var Input      = require("meier/engine/Input");
    var Sign       = require("meier/math/Math").Sign;
    var Round      = require("meier/math/Math").Round;
    var Polynomial = require("meier/math/Polynomial");
    
    // Dynamic matrix builder:
    var M   = require("meier/math/Mat");
    
    var GJE = require("meier/math/Math").GaussJordanElimination
    
    var M33 = require("meier/math/Mat")(3, 3);
    var M44 = require("meier/math/Mat")(4, 4);
    var M66 = require("meier/math/Mat")(6, 6);
    var M61 = require("meier/math/Mat")(6, 1);
    

    
    CurveFitting.prototype = new Game();
    function CurveFitting(container) {
        Game.call(this, container);
        
        this.grid = new Grid(0, 0, this.width, this.height);
        this.grid.setRealLabels(true);
        this.grid.setEditable(true);
        
        this.add(this.grid);
                
        this.gauss = null;
        this.lagrange = null;
        
        this.grid.onChange = this.recompute.bind(this);
        
        
        // Fake touches for some initial coordinates:
        this.grid.onLeftDown(new Vector(-260, -50));
        this.grid.onLeftDown(new Vector(-100, 50));
        this.grid.onLeftDown(new Vector(100, 60));
        this.grid.onLeftDown(new Vector(200, -50));
        
        
        this.input.cursor(Input.Cursor.FINGER);
              
        this.text = "";
    }
    
    CurveFitting.prototype.findgauss = function(coordinates) {
        //console.clear();
        
        var degree = coordinates.length;
        
        // Matrices:
        var m = new (M(degree, degree))();
        var v = new (M(degree, 1))();
        
        for(var row = 0, p; row < degree; ++row) {
            p = coordinates[row];
            
            // Known locations:
            v.set(row, 0, p.y);
            
            // Fill the augmented matrix:
            for(var col = 0; col < degree; ++col) {
                m.set(row, col, Math.pow(p.x, col));
            }
            
        }
        
        var r = GJE(m, v);
        
        var poly = "";
        var pretty = "";
        
        for(var i = 0, d; i < degree; ++i) {
            d = i; //degree - i - 1;
            poly += r.at(i, 0) + "x^" + d + " + ";
            pretty += Round(r.at(i, 0), 5) + "x^" + d + " + ";
        }
        
        
        this.text = pretty = pretty.trim(" + ");
        poly = poly.trim(" + ");
        
        // We're solving again (to test the system):
        this.gauss = Polynomial.PolynomialPath(coordinates);
        
        console.log(poly);
    };
    
    
    CurveFitting.prototype.recompute = function(coordinates) {
        
        
        if(coordinates.length >= 2) {
            this.lagrange = Polynomial.Lagrange(coordinates);
            this.findgauss(coordinates);
            
        } else {
            this.lagrange = null;
            this.gauss = null;
            this.lsq = null;
            this.text = "";
        }
    };
    
    CurveFitting.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        renderer.text("Lagrange polynomial", -this.hw + 10, this.hh - 10, "blue", "left")
        renderer.text("By solving equation (Gauss-Jordan)", -this.hw + 10, this.hh - 30, "red", "left")
        renderer.text("Difference between them", -this.hw + 10, this.hh - 50, "green", "left")
        
        renderer.text("Polynomial found:", -this.hw + 10, -50, "black", "left")
        renderer.text(this.text, -this.hw + 10, -70, "black", "left", "center", "11px monospace")
        
        
        var errorfn = function(x) {
            return (this.lagrange(x) - this.gauss(x));
        }.bind(this);
        
        
        if(this.lagrange !== null) {
            this.plot(renderer, this.lagrange, "blue", 4);
            this.plot(renderer, this.gauss, "red", 2);
            this.plot(renderer, errorfn, "green", 2);
        }
    };
    
    CurveFitting.prototype.plot = function(renderer, f, color, width) {
        var step = (this.grid.max.x - this.grid.min.x) / 100;
        
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
    
    return CurveFitting;
});
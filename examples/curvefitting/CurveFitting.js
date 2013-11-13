define(function(require) {
    var Game       = require("meier/engine/Game");
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
        
        var grid = new Grid(0, 0, this.width, this.height);
        grid.reallabels = true;
        
        this.add(grid);
        
        this.input.subscribe(Input.LEFT_DOWN, this.onLeftDown.bind(this));
        
        this.gauss = null;
        this.lagrange = null;
        this.minx = Infinity;
        this.maxx = -Infinity;
        
        
        // Fake touches for some initial coordinates:
        this.onLeftDown(new Vector(-260, -50));
        this.onLeftDown(new Vector(-100, 50));
        this.onLeftDown(new Vector(100, 60));
        this.onLeftDown(new Vector(200, -50));
        
        /*var m66 = new M66([
            0, 2, 4, 5, 3, 4,
            4, 0, 1, 3, 2, 5,
            2, 3, 0, 1, 9, 2,
            1, 2, 4, 0, 3, 7,
            6, 2, 3, 5, 0, 7,
            3, 5, 5, 1, 3, 0,
        ]);
        
        var m33 = new M33([
            2, 2, 4,
            4, 5, 1,
            2, 3, 3
        ]);
        
        GJE(
            m66,
            new M61([1,1,1,1,1,1])
        );*/
            
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
        
        
        //console.log(m.pretty());
        //console.log(v.pretty());
        
        var r = GJE(m, v);
        
        
        var poly = "";
        var fn = "return ";
        var pretty = "";
        
        for(var i = 0, d; i < degree; ++i) {
            d = i; //degree - i - 1;
            poly += r.at(i, 0) + "x^" + d + " + ";
            pretty += Round(r.at(i, 0), 5) + "x^" + d + " + ";
            fn += r.at(i, 0) + " * Math.pow(x, " + d + ") + ";
        }
        
        
        pretty = pretty.trim(" + ");
        poly = poly.trim(" + ");
        fn = fn.trim(" + ") + ";";
        
        this.gauss = new Function("x", fn);
        this.text = pretty;
        
        console.log(poly);
        //console.log(fn);
        
        //console.log(r.pretty());
    };
    
    
    CurveFitting.prototype.onLeftDown = function(input) {
        
        
        var coordinates = [];
        
        
        var entities = this._entities.filter(function(entity) {
            if(entity instanceof Pixel) {
                if(entity.position.distance(this.input) < entity.width * 2) {
                    entity.delete();
                    return false;
                }
                
                this.minx = Math.min(this.minx, entity.position.x);
                this.maxx = Math.max(this.maxx, entity.position.x);
                
                coordinates.push(entity.position);
            }
            
            return true;
        }.bind(this));
        
        
        if(entities.length != this._entities.length) {
            this._entities = entities;
        } else {
            var pixel = new Pixel(input.x, input.y);
            pixel.width = 4;
            this.add(pixel);
            
            this.minx = Math.min(this.minx, pixel.position.x);
            this.maxx = Math.max(this.maxx, pixel.position.x);
            
            coordinates.push(pixel.position);
        }
        
        if(coordinates.length >= 2) {
            this.lagrange = Polynomial.Lagrange(coordinates);
            this.findgauss(coordinates);
        } else {
            this.lagrange = null;
            this.gauss = null;
            this.text = "";
        }
        
        this._entities.sort(function(a, b) {
            return a.position.x - b.position.x;
        });
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
            this.plot(renderer, this.lagrange, "blue", 4)
            this.plot(renderer, this.gauss, "red", 2)
            this.plot(renderer, errorfn, "green", 2)
        }
    };
    
    CurveFitting.prototype.plot = function(renderer, f, color, width) {
        var step = (this.maxx - this.minx) / 100;
        
        var previous = new Vector(
            this.minx,
            f(this.minx)
        );
        
        renderer.begin();
        for(var x = this.minx + step, y; x < this.maxx; x += step) {
            y = f(x);
            
            renderer.line(previous.x, previous.y, x, y);
            
            previous.x = x;
            previous.y = y;
        }
        renderer.stroke(color, width);
    };  
    
    return CurveFitting;
});
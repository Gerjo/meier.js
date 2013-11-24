define(function(require) {
    var Game      = require("meier/engine/Game");
    var Input     = require("meier/engine/Input");
    var Random    = require("meier/math/Random");
    var Grid      = require("meier/prefab/Grid");
    var Pixel     = require("meier/prefab/Pixel");
    var Vector    = require("meier/math/Vec")(2);
    var Curve     = require("meier/math/Polynomial").PolynomialPath;
    var Bernstein = require("meier/math/Polynomial").BernsteinBasis;
    var factorial = require("meier/math/Math").Factorial;
        
    BezierApp.prototype = new Game();
    function BezierApp(container) {
        Game.call(this, container);
        this.setFps(15);
        
        this.log.right();
        
        this.add(this.grid = new Grid(0, 0, this.width, this.height));
        this.grid.setEditable(true);
        
        this.grid.onChange = this.recompute.bind(this);
        
        this.bernstein = [];
        this.bezier    = [];
        this.sorted    = [];
        this.degree    = 0;
        
        // Fake some clicks for some initial coordinates:
        this.grid.onLeftDown(new Vector(-100, 50));
        this.grid.onLeftDown(new Vector(0, 150));
        this.grid.onLeftDown(new Vector(100, 50));
        
        this.input.cursor(Input.Cursor.FINGER);
    }

    BezierApp.prototype.recompute = function(coordinates) {

        // Reset internals:
        this.bernstein   = [];
        this.bezier      = [];
        this.sorted      = [];
        this.degree      = 0;
        
        var steps        = 100;
        var stepsize     = 1 / steps;
        
        var sorted = coordinates.clone().sort(function(a, b) {
            return a.x - b.x;
        });
        
        this.degree = coordinates.length;
        
        // Calculate bernstein curve:
        for(var d = 0; d < this.degree; ++d) {
            this.bernstein.push([]);
            
            for(var t = 0; t <= 1 + stepsize; t += stepsize) {
                var y = Bernstein(this.degree - 1, d, t);
 
                this.bernstein.last().push(new Vector(t * this.width - this.hw, y * this.height - this.hh));
            }
        }
        
        // Use more steps for the curves:
        steps    = 150;
        stepsize = 1 / steps;
        
        for(var t = 0; t <= 1 + stepsize; t += stepsize) {
            var p1 = new Vector(0, 0);
            var p2 = new Vector(0, 0);
            
            for(var i = 0; i < this.degree; ++i) {
                var basis = Bernstein(this.degree - 1, i, t);
        
                p1.x += coordinates[i].x * basis;
                p1.y += coordinates[i].y * basis;
                
                // Computationally we pretty much get the second curve
                // for free!
                p2.x += sorted[i].x * basis;
                p2.y += sorted[i].y * basis;
            }
            
            this.bezier.push(p1);
            this.sorted.push(p2);
        }
        
    };
    
    BezierApp.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
    };
    
    BezierApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        renderer.text("Bezier curve unsorted.", -this.hw + 10, this.hh - 10, "rgba(255, 0, 0, 0.7)", "left", "top");
        //renderer.text("Bezier curve sorted on x coordinates.", -this.hw + 10, this.hh - 30, "rgba(0, 0, 255, 0.7)", "left", "top");
        renderer.text("Bernstein polynomials.", -this.hw + 10, this.hh - 50, "rgba(0, 0, 0, 0.7)", "left", "top");
        
        // There are multiple bernstein polynomials:
        this.bernstein.forEach(function(path) {
            renderer.begin();
            path.eachPair(function(a, b) {
                renderer.line(a, b);
            }, false);
            renderer.stroke("rgba(0, 0, 0, 0.5)", 2);
        }.bind(this));
        
        
        renderer.begin();
        this.bezier.eachPair(function(a, b) {
            renderer.line(a, b);
        }, false);
        renderer.stroke("rgba(255, 0, 0, 0.7)", 2);
        
        /*renderer.begin();
        this.sorted.eachPair(function(a, b) {
            renderer.line(a, b);
        }, false);
        renderer.stroke("rgba(0, 0, 255, 0.7)", 2);
        */
        renderer.text("Bezier Degree: " + this.degree, -this.hw + 10, -this.hh + 10, "black", "left", "bottom");
    };
    
    
    
    return BezierApp;
});
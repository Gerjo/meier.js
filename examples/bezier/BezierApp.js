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
        
        this.add(new Grid(0, 0, this.width, this.height));
        
        this.bernstein = [];
        this.bezier    = [];
        this.sorted    = [];
        this.degree    = 0;
        
    
        this.add(new Pixel(-100, 50));
        this.add(new Pixel(100, 50));
        this.add(new Pixel(0, -50));
        
        this.recompute();
        
        this.input.subscribe(Input.LEFT_DOWN, this.onLeftDown.bind(this));
        
        this.input.cursor(Input.Cursor.FINGER);
    }
    
    BezierApp.prototype.onLeftDown = function(input) {
        
        var entities = this._entities.filter(function (entity) {
            if(entity instanceof Pixel) {
                if(entity.position.distance(input) < entity.width * 2) {
                    entity.delete();
                    return false;
                }
            }
            return true;
        });
        
        // Something got deleted:
        if(entities.length != this._entities.length) {
            this._entities = entities;
        
        // Nothing deleted, let's add one:
        } else {
            this.add(new Pixel(input.x, input.y));
        }
        
        // Regenerate convex hull:
        this.recompute();
        
    };
    
    BezierApp.prototype.recompute = function() {
        
        // Reset internals:
        this.bernstein   = [];
        this.bezier      = [];
        this.sorted      = [];
        this.degree      = 0;
        
        var coordinates  = [];
        var steps        = 100;
        var stepsize     = 1 / steps;
        
        this._entities.forEach(function(e) {
            if(e instanceof Pixel) {
                coordinates.push(e.position);
            }
        }.bind(this));
        
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
        renderer.text("Bezier curve sorted on x coordinates.", -this.hw + 10, this.hh - 30, "rgba(0, 0, 255, 0.7)", "left", "top");
        renderer.text("Bernstein polynomials.", -this.hw + 10, this.hh - 50, "rgba(0, 0, 0, 0.7)", "left", "top");
        
        
        this.bernstein.forEach(function(path) {
            renderer.begin();
            for(var i = 1; i < path.length; ++i) {
                renderer.line(path[i - 1], path[i]);
            }
            renderer.stroke("rgba(0, 0, 0, 0.3)");
        }.bind(this));
        
        renderer.begin();
        this.bezier.eachPair(function(a, b) {
            renderer.line(a, b);
        }, false);
        renderer.stroke("rgba(255, 0, 0, 0.7)", 2);
        
        renderer.begin();
        this.sorted.eachPair(function(a, b) {
            renderer.line(a, b);
        }, false);
        renderer.stroke("rgba(0, 0, 255, 0.7)", 2);
        
        renderer.text("Bezier Degree: " + this.degree, -this.hw + 10, -this.hh + 10, "black", "left", "bottom");
    };
    
    
    
    return BezierApp;
});
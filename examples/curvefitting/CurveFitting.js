define(function(require) {
    var Game       = require("meier/engine/Game");
    var Grid       = require("meier/prefab/Grid");
    var Vector     = require("meier/math/Vec")(2);
    var Pixel      = require("meier/prefab/Pixel");
    var Input      = require("meier/engine/Input");
    var Sign       = require("meier/math/Math").Sign;
    var Polynomial = require("meier/math/Polynomial");
    
    CurveFitting.prototype = new Game();
    function CurveFitting(container) {
        Game.call(this, container);
        
        this.add(new Grid(0, 0, this.width, this.height));
        
        this.input.subscribe(Input.LEFT_DOWN, this.onLeftDown.bind(this));
        
        
        this.lagrange = null;
        this.minx = Infinity;
        this.maxx = -Infinity;
        
        
        // Fake touches for some initial coordinates:
        this.onLeftDown(new Vector(-260, -50));
        this.onLeftDown(new Vector(-100, 50));
        this.onLeftDown(new Vector(100, 60));
        this.onLeftDown(new Vector(200, -50));
        
        Polynomial.BernsteinBasis(1,1,1);
    }
    
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
        
        this.lagrange = Polynomial.Lagrange(coordinates);
        
        this._entities.sort(function(a, b) {
            return a.position.x - b.position.x;
        });
    };
    
    CurveFitting.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        renderer.text("Lagrange polynomial", -this.hw + 10, this.hh - 10, "blue", "left")
        
        if(this.lagrange !== null) {
            var step = (this.maxx - this.minx) / 100;
            
            
            var previous = new Vector(
                this.minx,
                this.lagrange(this.minx)
            );
            
            renderer.begin();
            for(var x = this.minx + step, y; x < this.maxx; x += step) {
                y = this.lagrange(x);
                
                renderer.line(previous.x, previous.y, x, y);
                
                previous.x = x;
                previous.y = y;
            }
            renderer.stroke("blue", 2);
        }
    };
    
    return CurveFitting;
});
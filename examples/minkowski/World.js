define(function(require) {
    var Entity    = require("meier/engine/Entity");
    var Grid      = require("meier/prefab/Grid");
    var Vector    = require("meier/math/Vec")(2);
    var GiftWrap  = require("meier/math/Hull").GiftWrap;
    var Input     = require("meier/engine/Input");
    var Sign      = require("meier/math/Math").Sign;
    
    World.prototype = new Entity();
    function World(x, y, w, h) {
        Entity.call(this, x, y, w, h);
        
        this.add(new Grid(0, 0, this.width, this.height));
        
        this.title = "The world";
        
        
        this.polygon = [];
        this.polygon[0] = null;
        this.polygon[1] = null;
        
        this.color = "rgba(0, 255, 0, 1)";
        this.shade = "rgba(0, 255, 0, 0.3)";
        
        this.translate = [];
        this.translate[0] = new Vector( 100, 100);
        this.translate[1] = new Vector(-100, 100);
        
        
        this._containsMouse = false;
        this._mousedown     = false;
        
        this.enableEvent(Input.LEFT_DOWN, Input.LEFT_UP, Input.MOUSE_MOVE);
        
        // Mouse down in hull:
        this.track  = -1;
        this.offset = new Vector(0, 0);
    }
    
    World.prototype._mouseInHull = function(polygon, translate) {
        
        // Bring mouse to polygon space:
        var location = this.toLocal(this.input).subtract(translate);
        
        
        // Using half-space intersection:
        return polygon.eachPair(function(a, b) {
            var dir  = b.clone().subtract(a);
            
            return dir.cross(location.clone().subtract(a)) < 0;
        });
    };
    
    World.prototype.onMouseMove = function(input) {
        this._containsMouse = this.containsPoint(input);
    };
    
    World.prototype.onLeftDown = function(input) {
        this._mousedown = true;
        
        var local = this.toLocal(this.input);
        
        this.polygon.every(function(p, i) {
            if(this._mouseInHull(p.hull, this.translate[i])) {
                this.offset = local.clone().subtract(this.translate[i]);
                this.track  = i;
                return false
            }
            
            return true;
        }.bind(this));
    };
    
    World.prototype.update = function(dt) {
        if(this.track != -1) {
            var local = this.toLocal(this.input);
            this.translate[this.track] = local.subtract(this.offset);
        }
        
        // Logic for hover action:
        var inhull = this.polygon.some(function(p, i) {
            return this._mouseInHull(p.hull, this.translate[i]);
        }.bind(this));
        
        if(inhull) {
            this.input.cursor(Input.Cursor.MOVE);
        }
    };
    
    World.prototype.onLeftUp = function(input) {
        this.track      = -1;
        this._mousedown = false;
    };
    
    World.prototype.draw = function(renderer) {
        Entity.prototype.draw.call(this, renderer);
        
        var hh = this.height * 0.5;
        var hw = this.width * 0.5;
        
        renderer.text(this.title, -hw + 8, hh, "black", "left");
        
        // Border around grid:
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.stroke("rgba(0,0,0,0.2)");
        
        if(this.polygon[0] && this.polygon[1]) {
            
            // Draw polygon A as-is:
            this.polygon.forEach(function(p, i) {
                renderer.save();
                renderer.translate(this.translate[i].x, this.translate[i].y);
                renderer.begin();
                renderer.polygon(p.hull);
                renderer.stroke(p.color);
                renderer.fill(p.shade);
                renderer.restore();
            }.bind(this));
            
            
            var sum = [];
            
            // This bit does a minkoski sum:
            this.polygon[0].hull.forEach(function(p) {
                
                // Perhaps some filtering? We don't need every coordinate.
                var sub = this.polygon[1].hull.map(function(q) {
                    var r = new Vector(
                            q.x - p.x - this.translate[0].x + this.translate[1].x, 
                            q.y - p.y - this.translate[0].y + this.translate[1].y);
                                                
                    return r;
                }.bind(this));
                
                // Show sub "polygons":
                renderer.begin();
                renderer.polygon(sub);
                renderer.stroke("rgba(0,0,0,0.2)");
                
                sum.merge(sub);
            }.bind(this));
            
            
            renderer.begin();
            this.translate.forEach(function(t) {
                renderer.line(t.x - 10, t.y, t.x + 10, t.y);
                renderer.line(t.x, t.y - 10, t.x, t.y + 10);
            });
            renderer.stroke("rgba(0,0,0,0.4)");
            
            // Find the convex hull:
            var hull = GiftWrap(sum);
            
            // Draw convex hull of minkowski sum:
            renderer.begin();
            renderer.polygon(hull);
            renderer.stroke(this.color);
            renderer.fill(this.shade);
            
        } else {
            renderer.text("ERROR: no polygons linked.", 0, 0, "red");
        }
    };
    
    return World;
    
});
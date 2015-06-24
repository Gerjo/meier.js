define(function(require){
    var Entity   = require("meier/engine/Entity");
    var Grid     = require("meier/prefab/Grid");
    var Input    = require("meier/engine/Input");
    var Pixel    = require("meier/prefab/Pixel");
    var GiftWrap = require("meier/math/Hull").GiftWrap;
    
    Editor.prototype = new Entity();
    function Editor(x, y, w, h) {
        Entity.call(this, x, y, w, h);
                
        this.add(new Grid(0, 0, this.width, this.height));
        
        this.title = "Unknown";
        this.color = "red";
        this.shade = "rgba(255, 0, 0, 0.3)";
        
        this._containsMouse = false;
        
        this.enableEvent(Input.LEFT_DOWN, Input.MOUSE_MOVE);
        
        this.hull = [];
    }
    
    Editor.prototype.updateHull = function() {
        this.hull.clear();
        
        this._entities.forEach(function (entity) {
            if(entity instanceof Pixel) {
                this.hull.push(entity.position.clone());
            }
        }.bind(this));
        
        this.hull = GiftWrap(this.hull);
    };
    
    Editor.prototype.add = function(entity) {
        Entity.prototype.add.call(this, entity);
        
        // Set a custom width:
        if(entity instanceof Pixel) {
            entity.width = 4;
            
            this.updateHull();
        }
    };
    
    Editor.prototype.onMouseMove = function(input) {
        var contains = this.containsPoint(input);
        
        if(contains != this._containsMouse) {
            this._containsMouse = contains;
        }
        
    };
    
    Editor.prototype.update = function(dt) {
        if(this.containsPoint(this.input)) {
            this.input.cursor(Input.Cursor.FINGER);
        }
    };
    
    Editor.prototype.onLeftDown = function(input) {
        if(this._containsMouse) {
            var local = this.toLocal(input);
            
            var entities = this._entities.filter(function (entity) {
                if(entity instanceof Pixel) {
                    if(entity.position.distance(local) < entity.width * 2) {
                        entity.destroy();
                        return false;
                    }
                }
                return true;
            });
            
            // Something got destroyed:
            if(entities.length != this._entities.length) {
                this._entities = entities;
            
            // Nothing destroyed, let's add one:
            } else {
                this.add(new Pixel(local.x, local.y));
            }
            
            // Regenerate convex hull:
            this.updateHull();
        }
    };
    
    Editor.prototype.draw = function(renderer) {
        Entity.prototype.draw.call(this, renderer);
        
        var hh = this.height * 0.5;
        var hw = this.width * 0.5;
        
        renderer.text(this.title, -hw + 8, hh, "black", "left");
        
        // Border around grid:
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.stroke("rgba(0,0,0,0.2)");
        
        // The hull:
        renderer.begin();
        renderer.polygon(this.hull);
        renderer.stroke(this.color);
        renderer.fill(this.shade);
    };
    
    return Editor;
    
});
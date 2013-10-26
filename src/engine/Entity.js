define(function(require) {
    var Vector       = require("meier/math/Vector");
    var Input        = require("meier/engine/Input");
    var Intersection = require("meier/math/Intersection");
    
    // Short-hand access: less typing.
    var PointInObb = Intersection.Test.PointInObb;
    
    function Entity(x, y, w, h) {
        // Transformation properties:
        this.position  = new Vector(x || 0, y || 0);
        this.rotation  = 0;
        this.scale     = 1;
        this.opacity   = 0.5;
        
        // A bounding box for click actions:
        this.width     = w || 30;
        this.height    = h || 30;
        
        // Flag to signify that entity must be removed.
        this._delete   = false;
        
        
        // Per default, not added to the game just yet.
        this.game      = null;
        
        // Actor might not be added. Queue any requested
        // event subscriptions until we can register them.
        this._eventRegisterQueue = [];
        
        // Identifier for events, required if we ever
        // want to disable events.
        this._eventHandlers = [];
        
        // A concrete shape, when left to "0" just the obb is used.
        this.shape = null; // TODO: implement this.
    }
    
    Entity.prototype.delete = function() {
        this._delete = true;
    };
    
    // Event handlers, override them when "enableEvent" is called.
    Entity.prototype.onLeftClick    = function(input) { console.log("Unoverridden event: onLeftClick");  return true; }
    Entity.prototype.onLeftDown     = function(input) { console.log("Unoverridden event: onLeftDown");   return true; }
    Entity.prototype.onLeftUp       = function(input) { console.log("Unoverridden event: onLeftUp");     return true; }
    Entity.prototype.onMouseMove    = function(input) { console.log("Unoverridden event: onMouseMove");  return true; }
    Entity.prototype.onRightDown    = function(input) { console.log("Unoverridden event: onRightDown");  return true; }
    Entity.prototype.onRightUp      = function(input) { console.log("Unoverridden event: onRightUp");    return true; }
    Entity.prototype.onRightClick   = function(input) { console.log("Unoverridden event: onRightClick"); return true; }
    Entity.prototype.onDoubleTap    = function(input) { console.log("Unoverridden event: onDoubleTap");  return true; }
    Entity.prototype.onKeyDown      = function(input, key) { console.log("Unoverridden event: onKeyDown");    return true; }
    Entity.prototype.onKeyUp        = function(input, key) { console.log("Unoverridden event: onKeyUp");      return true; }
    
    Entity.prototype.enableEvent = function(event) {        
        for(var i = 0; i < arguments.length; ++i) {            
            if(arguments[i] < Input.Events.COUNT) {
                this._eventRegisterQueue.push(arguments[i]);
            } else {
                throw new Error("Unknown event ID #", arguments[i]);
            }
        }
        
        if(this.game) {
            this._registerEvents();
        }
    };
    
    Entity.prototype.disableEvent = function(event) {
        if(event < Input.Events.COUNT) {
            if(this._eventHandlers[event]) {
                this.game.input.unsubscribe(
                    this._eventHandlers[event]
                );
                                
                delete this._eventHandlers[event];
            } else {
                console.log("Cannot disable event id: #", event, "it was never enabled to begin with.");
            }
        } else {
            throw new Error("Unknown event ID #", event);
        }
    };
    
    Entity.prototype.containsPoint = function(point) {
        return PointInObb(point, this.position, this.width * this.scale, this.height * this.scale, this.rotation);
    };
    
    Entity.prototype._registerEvents = function() {
        
        // A short-hand for "this". Reduces the number of "bind" calls.
        var entity = this;
        
        this._eventRegisterQueue.forEach(function(event) {
            
            var handle = null;
            
            var ContainsHelper = function(callback) {
                return function(input) {
                    
                    // Only trigger event when mouse is contained in entity:
                    if(entity.containsPoint(input)) {
                        return callback.apply(entity, arguments);
                    }
                    
                    // Let someone else capture this event:
                    return true;
                };
            };
            
            switch(event) {
            case Input.LEFT_CLICK:
                handle = this.game.input.subscribe(event, ContainsHelper(this.onLeftClick));
                break;
            case Input.LEFT_DOWN:
                handle = this.game.input.subscribe(event, ContainsHelper(this.onLeftDown));
                break;
            case Input.LEFT_UP:
                handle = this.game.input.subscribe(event, this.onLeftUp.bind(this));
                break;
            case Input.MOUSE_MOVE:
                handle = this.game.input.subscribe(event, this.onMouseMove);
                break;
            case Input.RIGHT_DOWN:
                handle = this.game.input.subscribe(event, ContainsHelper(this.onRightDown));
                break;
            case Input.RIGHT_UP:
                handle = this.game.input.subscribe(event, this.onRightUp.bind(this));
                break;
            case Input.RIGHT_CLICK:
                handle = this.game.input.subscribe(event, ContainsHelper(this.onRightClick));
                break;
            case Input.KEY_DOWN:
                handle = this.game.input.subscribe(event, this.onKeyDown.bind(this));
                break;
            case Input.KEY_UP:
                handle = this.game.input.subscribe(event, this.onKeyUp.bind(this));
                break;
            case Input.DOUBLE_TAP:
                handle = this.game.input.subscribe(event, ContainsHelper(this.onDoubleTap));
                break;
            }
            
            if(handle != null) {                
                this._eventHandlers[event] = handle;
            } else {
                throw new Error("Unknown event id added: #" + event);
            }
           
            return false;
        }.bind(this));
        
        this._eventRegisterQueue.clear();
    };
    
    Entity.prototype._onDelete = function(game) {
                
        // Remove all event listeners:
        this._eventHandlers.forEach(function(handle) {
            this.game.input.unsubscribe(handle);
            return false;
        }.bind(this));
        
        this._eventHandlers.clear();
        
        // User delete:
        this.onDelete(game);
    };
    
    Entity.prototype._onAdd = function(game) {
        this.game = game;
        this.input = game.input;
        
        this._registerEvents();
        
        this.onAdd(game);
    };
    
    Entity.prototype.onAdd = function(game) {
        // Overwrite method.
    };
    
    Entity.prototype.onDelete = function() {
        // Overwrite method.
    };

    Entity.prototype.update = function(dt) {
        // Overwrite method.
    };
    
    Entity.prototype.toWorld = function(local) {
        // TODO: implement correctly.
        return local.clone().add(this.position);
    }; 
    
    Entity.prototype.toLocal = function(world) {
        
        var dx = world.x - this.position.x;
        var dy = world.y - this.position.y;
        
        var sin = Math.sin(this.rotation);
        var cos = Math.cos(this.rotation);
        
        return new Vector(
            cos * dx - sin * dy, 
            sin * dx + cos * dy
        );
    };
    
    Entity.prototype._draw = function(renderer) {
        
        // Is there a draw function defined?
        if(this.draw) {
            // Store the current canvas transform.
            renderer.save();
            
            renderer.alpha(this.opacity);
            
            // Transform the lot to match this entity.
            renderer.translate(this.position.x, this.position.y);
            renderer.scale(this.scale);
            renderer.rotate(this.rotation);
            
            // Actual draw stuff:
            this.draw(renderer);
            
            renderer.alpha(1);
            
            // Restore to the old transform.
            renderer.restore();
        }
    }
    
    
    return Entity;
});
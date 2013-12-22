/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/


define(function(require) {
    var Input        = require("meier/engine/Input");
    var Intersection = require("meier/math/Intersection");
    var Rectangle    = require("meier/math/Rectangle");
    var Matrix       = require("meier/math/Mat")(3, 3);
    var Vector       = require("meier/math/Vec")(2);
    
    // Short-hand access: less typing.
    var PointInObb   = Intersection.Test.PointInObb;
    
    var UniqueEntityCounter = 0;
    
    Object.defineProperties(Entity.prototype, {
        "hw": { get: function () { return this.width * 0.5; }, set: function (v) { this.width = v * 2; } },
        "hh": { get: function () { return this.height * 0.5; }, set: function (v) { this.height = v * 2; } },
    });
    
    function Entity(x, y, w, h) {
        // Transformation properties:
        this.position  = new Vector(x || 0, y || 0);
        this.rotation  = 0;
        this.scale     = 1;
        this.opacity   = 1;
        this.visible   = true;
        this.type      = 0;
        
        // A bounding box for click actions:
        this.width     = w || 30;
        this.height    = h || 30;
        
        // A unique hash for each entity:
        this.hash = ++UniqueEntityCounter;
        
        // Flag to signify that entity must be removed.
        this._delete   = false;
        
        // Per default, not added to the game just yet.
        this.game      = null;
        
        // Available once nested (iff).
        this.parent    = null;
        
        // Actor might not be added. Queue any requested
        // event subscriptions until we can register them.
        this._eventRegisterQueue = [];
        
        // Identifier for events, required if we ever
        // want to disable events.
        this._eventHandlers = [];
        
        // A concrete shape, when left to "0" just the obb is used.
        this.shape = null; // TODO: implement this.
        
        this._entities = [];
    }
    
    Entity.prototype.add = function(entity) {
        if(entity instanceof Entity) {
            this._entities.push(entity);
            entity.parent = this;
            
            // Only call when a parent is available. Else it'll be 
            // called later on.
            if(this.game) {
                entity._onAdd(this);
            }
        } else {
            throw new Error("Game::add is only meant for entities.");
        }
        
        return entity;
    };
    
    Entity.prototype.destroy = function() {
        this._delete = true;
    };
    
    /// Retrieve a rectangle bounding volume
    Entity.prototype.rectangle = function() {
        var hw = this.width * 0.5;
        var hh = this.height * 0.5;
        return new Rectangle(this.position.x - hw, this.position.y - hh, this.position.x + hw, this.position.y + hh);
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
    Entity.prototype.onKeyDown      = function(input, key) { console.log("Unoverridden event: onKeyDown"); return true; }
    Entity.prototype.onKeyUp        = function(input, key) { console.log("Unoverridden event: onKeyUp");   return true; }
    
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
    
    Entity.prototype.contains = function(point) {
        return this.containsPoint(point);
    };
    
    Entity.prototype.containsPoint = function(point) {
        // TODO: recurse.
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
                handle = this.game.input.subscribe(event, this.onMouseMove.bind(this));
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
    
        // Delete children:
        this._entities.forEach(function(child) {
            child._onDelete();
        });
    
        // Remove all event listeners:
        this._eventHandlers.forEach(function(handle) {
            this.game.input.unsubscribe(handle);
            return false;
        }.bind(this));
        
        // A thorough clean.
        this._entities.clear();
        this._eventHandlers.clear();
        
        // User defined delete:
        this.onDelete(game);
    };
    
    Entity.prototype._onAdd = function(game) {
        this.game  = game;
        this.input = game.input;
        
        this._registerEvents();
        
        // User defined onAdd function:
        this.onAdd(game);
        
        // Inform the sub entities:
        this._entities.forEach(function(child) {
            child._onAdd(game);
        });
        
    };
    
    Entity.prototype.onAdd = function(game) {
        // Overwrite method.
    };
    
    Entity.prototype.onDelete = function() {
        // Overwrite method.
    };

    Entity.prototype.update = function(dt) {
        
        for(var i = 0; i < this._entities.length; i++) {
            
            if(this._entities[i]._delete !== true) {
                this._entities[i].update(dt);
            }
            
            // Remove the entity:
            if(this._entities[i]._delete === true) {
                this._entities[i]._onDelete(this);
                this._entities.splice(i--, 1);
            }
        }
    };
    
    Entity.prototype.draw = function(renderer) {
        this._entities.forEach(function(child) {
            if(child.visible === true) {
                child._draw(renderer);
            }
        });        
        
        // Overwrite method.
    };
    

    /// 1   0  -t.x     cos  -sin  0  v.x
    /// 0   1  -t.y  .  sin   cos  1  v.y
    /// 0   0     1     0     0    1    1
    Entity.prototype.toWorld = function(local) {
        var t = this.movingToFixed();
        
        var e = this.parent;
        
        while(e) {
            t = e.movingToFixed().product(t);
            e = e.parent;
        }
        
        return t.transform(local);
    }; 
    
    /// Create a matrix that transforms local coordinates
    /// to world coordinates.
    Entity.prototype.movingToFixed = function() {
        var r = Matrix.CreateXoY(this.rotation);
        var t = Matrix.CreateTranslation(this.position);
        
        return t.product(r);
    };
    
    /// Create a matrix that transforms local coordinates
    /// to world coordinates.
    Entity.prototype.fixedToMoving = function() {
        var r = Matrix.CreateXoY(-this.rotation);
        var t = Matrix.CreateTranslation(new Vector(-this.position.x, -this.position.y));
        
        return r.product(t);
    };
    
    ///  cos   sin  0     1   0  -t.x     v.x
    /// -sin   cos  1  .  0   1  -t.y  .  v.y
    ///   0     0   0     0   0     1     v.x
    Entity.prototype.toLocal = function(world) {
        var t = this.fixedToMoving();
        
        var e = this.parent;
        
        //console.log(t.pretty());
        
        while(e) {
            t = t.product(e.fixedToMoving());
            e = e.parent;
        }
        
        return t.transform(world);
    };
    
    Entity.prototype._draw = function(renderer) {
        // Store the current canvas transform.
        renderer.save();
        
        renderer.alpha(this.opacity);
                
        // Transform the lot to match this entity.
        renderer.translate(this.position._[0], this.position._[1]);
        renderer.scale(this.scale);
        renderer.rotate(this.rotation);
        
        // Actual draw stuff:
        this.draw(renderer);
        
        renderer.alpha(1);
        
        // Restore to the old transform.
        renderer.restore();
    };
    
    
    Entity.prototype.top = function() {
        return this.position.y + (this.height * 0.5 * this.scale);
    };
    
    Entity.prototype.bottom = function() {
        return this.position.y - (this.height * 0.5 * this.scale);
    };
    
    Entity.prototype.left = function() {
        return this.position.x - (this.width * 0.5 * this.scale);
    };
    
    Entity.prototype.right = function() {
        return this.position.x + (this.width * 0.5 * this.scale);
    };
    
    Entity.NaiveIntersection = function(entity, b) {
        var ehw = entity.width  * 0.5;
        var ehh = entity.height * 0.5;        
        
        var bhw = b.width  * 0.5;
        var bhh = b.height * 0.5;
    
        return (
            ((b.position.x - bhw < entity.position.x - ehw && b.position.x + bhw > entity.position.x - ehw)
            ||
            (b.position.x - bhw < entity.position.x + ehw && b.position.x + bhw > entity.position.x + ehw))
            &&
            ((b.position.y - bhh < entity.position.y - ehh && b.position.y + bhh > entity.position.y - ehh)
            ||
            (b.position.y - bhh < entity.position.y + ehh && b.position.y + bhh > entity.position.y + ehh))
        ) || (
            ((entity.position.x - ehw < b.position.x - bhw && entity.position.x + ehw > b.position.x - bhw)
            ||
            (entity.position.x - ehw < b.position.x + bhw && entity.position.x + ehw > b.position.x + bhw))
            &&
            ((entity.position.y - ehh < b.position.y - bhh && entity.position.y + ehh > b.position.y - bhh)
            ||
            (entity.position.y - ehh < b.position.y + bhh && entity.position.y + ehh > b.position.y + bhh))
        );
    };
    
    
    return Entity;
});
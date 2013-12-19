/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Entity = require("meier/engine/Entity");
    var Vector = require("meier/math/Vec")(2);
    var Input  = require("meier/engine/Input");
    var Pixel  = require("meier/prefab/Pixel");
    
    Frame.prototype = new Entity();
    function Frame(x, y, w, h) {
        Entity.call(this, x, y, w || 180, h || 180);
        
        this.spacing    = 30;
        
        this.gridcolor  = "rgba(0,0,0,0.1)";
        this.axiscolor  = "rgba(0,0,0,0.3)";
        this.backdrop   = "rgba(0,0,0,0.1)";
        this.shownum    = true;
        this.labelcolor = "black";
        this.labelfont  = "10px monospace";
        
        this._showRealLabels = false;
        this._isEditable     = false;
        this._showPoints     = true;
        
        // Extremes of added coordinates:
        this.min   = new Vector(Infinity, Infinity);    
        this.max   = new Vector(-Infinity, -Infinity);  
    }
    
    Frame.prototype.onChange = function(coordinates) {
        console.log("Unoverridden onChange method in grid.");
    };
    
    Frame.prototype.showPoints = function(doShow) {
        this._showPoints = doShow;
        return this;
    };
    
    
    Frame.prototype.add = function(entity) {
        if(entity instanceof Pixel) {
            this.min.x = Math.min(this.min.x, entity.position.x);
            this.min.y = Math.min(this.min.y, entity.position.y);

            this.max.x = Math.max(this.max.x, entity.position.x);
            this.max.y = Math.max(this.max.x, entity.position.x);
            
        // It's probably a vector of sorts:
        } else if( ! isNaN(entity.x)) {
            return this.add(new Pixel(entity.x, entity.y));
        }
        
        return Entity.prototype.add.call(this, entity);
    };
    
    Frame.prototype.onLeftDown = function(input) {
        var local = this.toLocal(input);
        
        var coordinates = [];

        // Reset the extremes:
        this.min   = new Vector(Infinity, Infinity);    
        this.max   = new Vector(-Infinity, -Infinity);  
        
        // Find an entity in range, and destroy it.
        var entities = this._entities.filter(function(entity) {
            if(entity instanceof Pixel) {
                if(entity.position.distance(local) < entity.width * 2) {
                    entity.destroy();
                    return false;
                }
                
                // Update the new extremes:
                this.min.x = Math.min(this.min.x, entity.position.x);
                this.max.x = Math.max(this.max.x, entity.position.x);
                this.min.y = Math.min(this.min.y, entity.position.y);
                this.max.y = Math.max(this.max.y, entity.position.y);
                
                coordinates.push(entity.position);
            }
            
            return true;
        }.bind(this));
        
        // Something was removed.
        if(entities.length != this._entities.length) {
            this._entities = entities;
            
        // Nothing was removed, let's add a pixel:
        } else {
            var pixel = new Pixel(input.x, input.y);
            pixel.width = 4;

            this.add(pixel);

            coordinates.push(pixel.position);
        }
        
        // Trigger event.
        this.onChange(coordinates);
    };
    
    Frame.prototype.setRealLabels = function(showRealLabels) {
        this._showRealLabels = showRealLabels;
    };
    
    Frame.prototype.setEditable = function(isEditable) {
        this._isEditable = isEditable;
                
        if(isEditable) {
            this.enableEvent(Input.LEFT_DOWN);
        } else {
            this.disableEvent(Input.LEFT_DOWN);
        }
    };
    
    Frame.prototype.draw = function(r) {
        
        if(this._showPoints) {
            Entity.prototype.draw.call(this, r);
        }
        
        var wsteps = this.width  / this.spacing;
        var hsteps = this.height / this.spacing;
        
        var w = (wsteps * 0.5 * this.spacing);
        var h = (hsteps * 0.5 * this.spacing);
                
        // Backdrop:
        r.begin();
        r.rectangle(0, 0, this.width, this.height);
        r.fill(this.backdrop);
        
        // Grid:
        [1, -1].forEach(function(j) {
            
            for(var i = 0; i <= hsteps * 0.5; ++i) {
                var x = i * this.spacing * j;
                var label = this._showRealLabels ? i * j * this.spacing : i * j;
                
                r.begin();
                r.line(-w, x, w, x);
                
                if(this.shownum && i != 0) {
                    r.text(label, -2, x, this.labelcolor, "right", "middle", this.labelfont);
                }
                
                if(i == 0) {
                    r.stroke(this.axiscolor);
                } else {
                    r.stroke(this.gridcolor);
                }
            }
        }.bind(this));
        
        // Grid:
        [1, -1].forEach(function(j) {
            
            for(var i = 0; i <= wsteps * 0.5; ++i) {
                var x = i * this.spacing * j;
                var label = this._showRealLabels ? i * j * this.spacing : i * j;
                
                r.begin();
                r.line(x, -h, x, h);
                
                if(this.shownum && i != 0) {
                    r.text(label, x, 0, this.labelcolor, "center", "top", this.labelfont);
                }
                
                if(i == 0) {
                    r.stroke(this.axiscolor);
                } else {
                    r.stroke(this.gridcolor);
                }
            }
        }.bind(this));        
    };
        
    return Frame;
    
});
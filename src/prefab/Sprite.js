/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require){
    var Entity  = require("meier/engine/Entity");
    var Texture = require("meier/engine/Texture");
    var Lerp    = require("meier/math/Lerp").Lerp;
    
    Sprite.prototype = new Entity();
    function Sprite(x, y, w, h, image) {
        
        if(typeof x == "string") {
            image = x;
            x = 0;
        } else if(typeof w == "string") {
            image = w;
            w = 0;
        } else if(typeof image == "string") {
            
        } else {
            throw new Error("Unknown arguments provided to constructor. " + 
                            "Try (x, y, w, h, image)");
        }
        
        Entity.call(this, x || 0, y || 0, w || 10, h || 10);
        
        this._texture = new Texture(image);
        
        // User provided texture size. No need to load.
        if(w && h) {
            this._isLoaded = true;
            
        // Retrieve width/height from texture:
        } else {
            this._isLoaded = false;
        }
                
        // Fading amount:
        this._opacityModifier = 0;
        
        this._slideModifier = 0;
        
        // Repeated fading?
        this._glow            = false;
        
        // Clipping values
        
        this._clipping = [0, 0, 0, 0];
        
        this._slide  = [0, 0, 0, 0];
        this._offset = [0, 0, 0, 0];
        
    }
    
    Sprite.prototype.setUrl = function(url) {
        this._texture = new Texture(url);
        return this;
    };
    
    Sprite.prototype.clone = function() {
        var clone = new Sprite(
            this.position.x,
            this.position.y,
            this.width,
            this.height,
            this._texture._url
        );
        
        clone._opacityModifier = this._opacityModifier;
        clone._slideModifier   = this._slideModifier;
        clone._glow            = this._glow;
        clone._clipping        = this._clipping.clone();
        clone._slide           = this._slide.clone();
        clone._offset          = this._offset.clone();
        
        // clone more? recursive decent?
        
        return clone;
    };
    
    /// Move up / down with respect to top
    Sprite.prototype.slideTop = function(amount) {
        this._slide[0] = -amount; // NB: flipping sign to make user input make sense.
        
        return this;
    };
    
    /// Determine if sliding animation is playing.
    Sprite.prototype.isSliding = function() {    
        return ! this._slide.every(function(val) {
            return val == 0;
        });
    };
    
    Sprite.prototype.add = function(entity) {
        throw new Error("Sprites are not designed as a composite. Use entity instead.");
    };
    
    Sprite.prototype.fade = function(amount) {
        this._opacityModifier = amount;
        this._glow = false;
        
        return this;
    };
    
    Sprite.prototype.clip = function(top, right, bottom, left) {
        this._slide[0] = isNaN(top)    ? 0 : top;
        this._slide[1] = isNaN(right)  ? 0 : right;
        this._slide[2] = isNaN(bottom) ? 0 : bottom;
        this._slide[3] = isNaN(left)   ? 0 : left;
        
        return this;
    };
    
    Sprite.prototype.glow = function(amount) {
        
        if(amount == 0) {
            this._glow = false;
        } else {
            this._glow = true;
        }
        
        this._opacityModifier = amount;
        
        return this;
    };
    
    Sprite.prototype.update = function(dt) {
        
        // Texture just loaded, make the sprite aware.
        if(this._texture.isLoaded() && !this._isLoaded) {
            this.width     = this._texture.width;
            this.height    = this._texture.height;
            this._isLoaded = true;
        }
        
        // Handle opacity animation
        if(this._opacityModifier != 0) {
            this.opacity += this._opacityModifier * dt;
        
            if(this.opacity > 1 && this._opacityModifier > 0) {
                this.opacity = 1;
                
                if(this._glow === true) {
                    this._opacityModifier = -this._opacityModifier;
                } else {
                    this._opacityModifier = 0;   
                }
                
            } else if(this.opacity < 0 && this._opacityModifier < 0) {
                this.opacity          = 0;
                
                if(this._glow === true) {
                    this._opacityModifier = -this._opacityModifier;  
                    
                } else {
                    this._opacityModifier = 0;
                }
            }
        }
        
        // Handle cropping animations.
        if(this._isLoaded) {
            for(var i = 0, speed; i < 4; ++i) {
                speed = this._slide[i];
            
                if(speed != 0) {
                    this._clipping[i] += speed * dt;
                
                    // This _probably_ cannot be generalized due to hardcoded height.
                    
                    if(this._slide[i] < 0 && this._clipping[i] < 0) {
                        this._clipping[i] = 0;
                        this._slide[i]    = 0;
                    
                    } else if(this._slide[i] > 0 && this._clipping[i] > this.height) {
                        this._clipping[i] = this.height;
                        this._slide[i]    = 0;
                    }
                
                }
            }
        }
    };
    
    Sprite.prototype.draw = function(renderer) {
        // Only draw when visible. Some browsers apparently attempt to render
        // at "0" opacity - which is silly.
        if(this.opacity > 0) {
            renderer.texture(
                this._texture, 
                0, 
                (this._slide[0] == 0) ? 0 : this._clipping[0], // Move along the y axis
                
                this.width, 
                this.height, 
                
                // Clipping values
                this._clipping[0], this._clipping[1], this._clipping[2], this._clipping[3]
            );
        }
    };
    
    return Sprite;
});
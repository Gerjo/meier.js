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
        
        // Repeated fading?
        this._glow            = false;
    }
    
    Sprite.prototype.add = function(entity) {
        throw new Error("Sprites are not designed as a composite. Use entity instead.");
    };
    
    Sprite.prototype.fade = function(amount) {
        this._opacityModifier = amount;
        this._glow = false;
    };
    
    Sprite.prototype.glow = function(amount) {
        
        if(amount == 0) {
            this._glow = false;
        } else {
            this._glow = true;
        }
        
        this._opacityModifier = amount;
    };
    
    Sprite.prototype.update = function(dt) {
        
        if(this._opacityModifier != 0) {
            this.opacity += this._opacityModifier * dt;
        
            if(this.opacity > 1 && this._opacityModifier > 0) {
                if(this._glow === true) {
                    this.opacity          = 1;
                    this._opacityModifier = -this._opacityModifier;
                    
                } else {
                    this.opacity          = 1;
                    this._opacityModifier = 0;   
                }
            } else if(this.opacity < 0 && this._opacityModifier < 0) {
                if(this._glow === true) {
                    this.opacity          = 0;
                    this._opacityModifier = -this._opacityModifier;  
                    
                } else {
                    this.opacity          = 0;
                    this._opacityModifier = 0;
                }
            }
        }
        
        if(this._texture.isLoaded && !this._isLoaded) {
            this.width     = this._texture.width;
            this.height    = this._texture.height;
            this._isLoaded = true;
        }
    };
    
    Sprite.prototype.draw = function(renderer) {
        // Only draw when visible. Some browsers apparently attempt to render
        // at "0" opacity - which is silly.
        if(this.opacity > 0) {
            renderer.texture(this._texture, 0, 0, this.width, this.height);
        }
    };
    
    return Sprite;
});
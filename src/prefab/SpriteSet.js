
define(function(require) {

    var Entity  = require("meier/engine/Entity");
    var Texture = require("meier/engine/Texture");
    var Random  = require("meier/math/Random");

    SpriteSet.prototype = new Entity();
    function SpriteSet(arg_x, arg_y, arg_w, arg_h, image1, image2, image3 /* etc */) {
                
        this._textures = [];
        this._isloaded = false;
        
        var x = 0, y = 0, w = 0, h = 0;
        
        if( ! isNaN(arg_x) &&  ! isNaN(arg_y) ) {
            if( isNaN(arg_w) &&  isNaN(arg_h)) {
                // Only a position is specified:
                x = arg_x;
                y = arg_y;
                
            } else {
                // Specified width and height. No need
                // to derrive these from a texture.
                this._isloaded = true;
                x = arg_x;
                y = arg_y;
                w = arg_w;
                h = arg_h;
            }
        }
        
        // Assume all string parameters are image sources.
        var sources = [];
        for(var i = 0, texture; i < arguments.length; ++i) {
            if(typeof arguments[i] == "string") {
                texture = new Texture(arguments[i]);
                
                // Ad-hoc create a a few properties:
                texture._spriteSetVisible      = false;
                texture._spriteSetFadeModifier = 1;
                texture._spriteSetOpacity      = 1;
                
                this._textures.push(texture);
            }
        }    
        
        if(this._textures.length > 0) {
            // Show the first image per default.
            this._textures[0]._spriteSetVisible = true;
        }    
        
        Entity.call(this, x, y, w, h);
        
        this._dt = 1/30; // A better estimate than "0".
    }
    
    SpriteSet.prototype.showOnly = function() {
        if(this._textures.length > 0) {
            this.show(Random.IntegerInRange(0, this._textures.length - 1));
        }
    };
    
    SpriteSet.prototype.add = function(entity) {
        throw new Error("SpriteSet are not designed as a composite. Use entity instead.");
    };
    
    SpriteSet.prototype.update = function(dt) {
        this._dt = dt;
        if( ! this._isloaded) {
            if(this._textures[0] && this._textures[0].isLoaded) {
                // Inherit size from first texture:
                this.width  = this._textures[0].width;
                this.height = this._textures[0].height;
                this._isloaded = true;
            }
        }
    };
    
    SpriteSet.prototype.showOnly = function(index) {
        
        if(index >= this._textures.length || index < 0) {
            throw new Error("SpriteSet - showOnly index out-of-bounds. Requested index: " + index);
        }
        
        for(var i = this._textures.length - 1; i >= 0; --i) {
            this._textures[i]._spriteSetVisible = false;
        }
        
        this._textures[index]._spriteSetVisible = true;
    };
    
    SpriteSet.prototype.fadeOnly = function(index, modifier) {
        modifier = isNaN(modifier) ? 0.1 : modifier;
        
        if(index >= this._textures.length || index < 0) {
            throw new Error("SpriteSet - fadeOnly index out-of-bounds. Requested index: " + index);
        }
        
        for(var i = this._textures.length - 1; i >= 0; --i) {
            
            // Negate the modifier:
            this._textures[i]._spriteSetFadeModifier = -modifier;
        }
        
        this._textures[index]._spriteSetFadeModifier = modifier;
        this._textures[index]._spriteSetVisible = true; // Just in case it's hidden.
    };
    
    SpriteSet.prototype.show = function(index) {
        
        if(index >= this._textures.length || index < 0) {
            throw new Error("SpriteSet - show index out-of-bounds. Requested index: " + index);
        }
        
        this._textures[index]._spriteSetVisible = true;
    };
    
    SpriteSet.prototype.fade = function(index, modifier) {
        modifier = isNaN(modifier) ? 0.1 : modifier;
        
        if(index >= this._textures.length || index < 0) {
            throw new Error("SpriteSet - fade index out-of-bounds. Requested index: " + index);
        }
        
        this._textures[index]._spriteSetVisible = true; // In case it's hidden.
        this._textures[index]._spriteSetFadeModifier = modifier;
    };
    
    SpriteSet.prototype.draw = function(renderer) {  
        if(this.opacity > 0) {            
            for(var i = 0, texture; i < this._textures.length; ++i) {
                texture = this._textures[i];
                
                if(texture._spriteSetFadeModifier != 0) {
                    texture._spriteSetOpacity += texture._spriteSetFadeModifier * this._dt;
                    
                    if(texture._spriteSetOpacity > 1) {
                        texture._spriteSetOpacity      = 1;
                        texture._spriteSetFadeModifier = 0;
                    } else if(texture._spriteSetOpacity < 0) {
                        texture._spriteSetOpacity      = 0;
                        texture._spriteSetFadeModifier = 0;
                    }
                }
                
                if(texture._spriteSetVisible === true) {
                    renderer.opacity(texture._spriteSetOpacity);
                    renderer.texture(texture, 0, 0, this.width, this.height);
                }
            }
        }
    };

    return SpriteSet;
});
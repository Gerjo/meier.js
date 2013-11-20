
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
                
                // Ad-hoc create a property:
                texture._spriteSetVisible = false;
                
                this._textures.push(texture);
            }
        }    
        
        if(this._textures.length > 0) {
            // Show the first image per default.
            this._textures[0]._spriteSetVisible = true;
        }    
        
        Entity.call(this, x, y, w, h);
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
        if( ! this._isloaded) {
            if(this._textures[0] && this._textures[0].isLoaded) {
                // Inherit size from first texture:
                this.width  = this._textures[0].width;
                this.height = this._textures[0].height;
                this._isloaded = true;
            }
        }
    };
    
    SpriteSet.prototype.fade = function(index, modifier) {
        
    };
    
    SpriteSet.prototype.showOnly = function(index) {
        
        if(index > this._textures.length) {
            throw new Error("SpriteSet - show index out-of-bounds. Requested index: " + index);
        }
        
        for(var i = this._textures.length - 1; i >= 0; --i) {
            this._textures[i]._spriteSetVisible = false;
        }
        
        this._textures[index]._spriteSetVisible = true;
    };
    
    SpriteSet.prototype.show = function(index) {
        
        if(index > this._textures.length) {
            throw new Error("SpriteSet - show index out-of-bounds. Requested index: " + index);
        }
        
        this._textures[index]._spriteSetVisible = true;
    };
    
    SpriteSet.prototype.draw = function(renderer) {  
        if(this.opacity > 0) {            
            for(var i = 0; i < this._textures.length; ++i) {
                if(this._textures[i]._spriteSetVisible === true) {
                    renderer.texture(this._textures[i], 0, 0, this.width, this.height);
                }
            }
        }
    };

    return SpriteSet;
});
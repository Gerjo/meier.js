define(function(require) {
    var Texture = require("meier/engine/Texture");

    var canvas    = document.createElement("canvas");
    var context   = canvas.getContext('2d');
    canvas.width  = 0;
    canvas.height = 0;
    
    
    RawTexture.prototype = new Texture(null);
    function RawTexture(url, callback) {
        Texture.call(this, null, null);
        
        this._raw = null;
        this._rawCallback = callback;
        
        if(typeof url == "string") {
            this._getRawByUrl(url);
        }
        
    }
    
    /// Create a copy of this canvas.
    ///
    RawTexture.prototype.clone = function() {
        
        // TODO: can we handle this more gracefully?
        if( ! this._isLoaded) {
            throw new Error("RawTexture::clone() Cannot clone a non-loaded RawTexture.");
        }
        
        var data = context.createImageData(this._raw.width, this._raw.height);
        
        // Copy all the bytes
        // todo: perhaps we can use data.data.set(this._raw.data)
        for(var i = 0; i < data.data.length; ++i) {
            data.data[i] = this._raw.data[i];
        }
        
        var texture = new Texture(null);
        texture.hw = this.hw;
        texture.hh = this.hh;
        texture.height = this.height;
        texture.width  = this.width;
        texture._raw = data;
        texture._isLoaded = true;
        
        return texture;
    };
    
    
    /// Private method to load the raw data
    Texture.prototype._getRawByUrl = function(url) {
        var texture = new Texture(url, function(texture) {
            
            // Use the helper canvas
            canvas.width  = texture._image.width;
            canvas.height = texture._image.height;
    
            // Draw (and thus decode into RGBA)
            context.drawImage(texture._image, 0, 0);
        
            // Retrieve the binary data
            var data = context.getImageData(0, 0, canvas.height, canvas.width);
                
            // Update internals
            this._raw      = data;
            this.width     = data.width;
            this.height    = data.height;
            this.hw        = data.width * 0.5;
            this.hh        = data.height * 0.5;
            this._isLoaded = true;
           
            // User specified callback.
            if(typeof this._rawCallback == "function") {
                this._rawCallback(texture);
            }
        }.bind(this));
    };
    
    
    return RawTexture;
});
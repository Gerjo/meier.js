/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    
    /// A renderable texture of sorts. Images are internally pooled by the 
    /// webbrowser; you are free to create as many new instances  
    /// as required.
    ///
    /// @param {src} URL of the image.
    /// @param {callback} Optional callback to call once image has been loaded.
    function Texture(url, callback) {
        this._isLoaded     = false;
        this.width        = 0;
        this.height       = 0;
        this.hw           = 0; // Half width
        this.hh           = 0; // Half height
        
        this._url   = null;
        this._image = null;
        this._onloadCallback = callback || null;
        
        if(typeof url == "string") {
            this._initializeBySrc(url);
        }
    }
    
    Texture.prototype.clone = function() {
        return new Texture(this._url);
    };
    
    /// Private method to construct this object.
    Texture.prototype._initializeBySrc = function(url) {
        this._url          = url;
        this._image        = document.createElement('img');
        this._image.src    = url;
        
        // Once loaded, update internal state of this texture:
        this._image.onload = function() {
            // These are just the original dimensions, you may
            // render them with any size as desired.
            this.width    = this._image.width;
            this.height   = this._image.height;
            this.hw       = this._image.width * 0.5;
            this.hh       = this._image.height * 0.5;
        
            this._isLoaded = true; 
            
            if(typeof this._onloadCallback === "function") {
                this._onloadCallback(this);
            }
                     
        }.bind(this);
    };
    
    /// Determine whether or not this image has been loaded. Once
    /// textures are loaded they can be drawn and the size related
    /// properties become available. Unloaded textures can still be
    /// drawn, though they are simply 0x0 empty pictures.
    ///
    /// @return A boolean indicating the loaded state.
    Texture.prototype.isLoaded = function() {
        return this._isLoaded;
    };
  
    return Texture;
});
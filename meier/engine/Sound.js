/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    
    Sound.volume = function(volume) {
        Sound._volume = volume;
        
        //.volume=0
    };
    
    function Sound(src) {
        this._src     = src;
        
        this.isLoaded = false;
        this.duration = 0;
        
        this._sound = new Audio(src);
        this._sound.autoplay = false;
        this._sound.controls = false;
        
        this._sound.addEventListener('ended', function() {
            // Load again for chrome:            
            this._sound.load();
            
            // Play again:
            this._sound.play();
            
            return false;
        }.bind(this));        
        
        this._sound.addEventListener('loadeddata', function() {
            this.duration = this._sound.duration;
            this.isLoaded = true;
                        
            return false;
        }.bind(this));
        
        // Preload:
        this._sound.load();
    }
    
    Sound.prototype.pause = function() {
        this._sound.pause();
    };
    
    // Play once, and forget about it.
    Sound.prototype.play = function() {
        var audio = new Audio(this._src);
        
        // Chrome requires a "reload":
        audio.load();
        audio.play();
    };
    
    Sound.prototype.loop = function() {
        this._loop = false;
        
        // Chrome requires a "reload":
        this._sound.load();
        this._sound.play();
    };
    
    Sound.prototype.stop = function() {
        this._sound.pause();
    };
    
    return Sound;
});
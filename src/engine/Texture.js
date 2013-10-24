define(function(require) {
    
    function Texture(src) {
        this.src        = src;
        this.image      = document.createElement('img');
        this.image.src  = src;
        this.isLoaded   = false;
        this.width      = 0;
        this.height     = 0;
        this.hw         = 0; // Half
        this.hh         = 0; // Half
    
        // Once loaded, update internal state of this texture:
        this.image.onload = function() {
            // These are just the original dimensions, you may
            // render them with any size as desired.
            this.width    = this.image.width;
            this.height   = this.image.height;
            this.hw       = this.image.width * 0.5;
            this.hh       = this.image.height * 0.5;
        
            this.isLoaded = true;
        
            console.log("Texture [" + this.width + "x" + this.height + "] [" + this.src + "] loaded!");
        }.bind(this);
    }
    
    return Texture;
});
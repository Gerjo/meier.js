var Resources = (function() {
    
    // Publicaly exposed interface
    return {
        // TODO: object pool, though JS already does that internally.
        
        Load: function (url) {
            var f = url.toLowerCase();
            
            // Must be a texture of sorts:
            if(f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg")) {
                return new Texture(url);
            }
            
            if(f.endsWith(".mp3") || f.endsWith(".wav")) {
                console.log("Sounds are not supported yet. Returning dummy object.");
                
                return new Sound(url);
            }
            
            throw new Error("Trying to load unknown resource: " + url);
        },
        
        // Why reference count a garbage collected language...
        Release: function(resource) {
            console.log("Doesn't quite work. May never actually work.");
        }
    };
}());


function Sound(src) {
    this.src = src;
}

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

define(function(require) {
    
    // Semantical helper:
    function Size(w, h) {
        this.w = w;
        this.h = h;
    }

    Size.prototype.clone = function() {
        return new Size(this.w, this.h);
    };

    Size.prototype.half = function() {
        this.w *= 0.5;
        this.h *= 0.5;
        return this;
    };

    return Size;  
});
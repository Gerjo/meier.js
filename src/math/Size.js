/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    
    console.log("Warning: using now deprecated class Size. "
    + "Replace with inline w/h variables.");
    
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
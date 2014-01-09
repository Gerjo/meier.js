/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Entity = require("meier/engine/Entity");
    
    Pixel.prototype = new Entity();
    function Pixel(x, y, fill, stroke) {
        Entity.call(this, x || 0, y || 0, 2, 2);
        
        this.fill   = fill || "black";
        this.stroke = stroke || null;
    }
    
    Pixel.prototype.draw = function(renderer) {
        renderer.begin();
        renderer.circle(0, 0, this.width);    
        renderer.fill(this.fill); 
        
        if(this.stroke) {  
            renderer.stroke(this.stroke);   
        }
    };
    
    return Pixel;
});
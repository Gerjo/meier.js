/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Entity = require("meier/engine/Entity");
    
    TextBubble.prototype = new Entity();
    function TextBubble(x, y, text) {
        Entity.call(this, x || 0, y || 0, 2, 2);
        
        this.text = text;
    }
    
    TextBubble.prototype.update = function(dt) {
        this.opacity -= dt * 0.5;
        
        this.position.y += dt * 5;
        
        if(this.opacity < 0) {
            this.destroy();
        }
    };
    
    TextBubble.prototype.draw = function(renderer) {
        renderer.text(this.text, 0, 0);
    };
    
    return TextBubble;
});
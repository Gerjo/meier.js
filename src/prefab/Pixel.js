define(function(require) {
    var Entity = require("meier/engine/Entity");
    
    Pixel.prototype = new Entity();
    function Pixel(x, y, color) {
        Entity.call(this, x || 0, y || 0);
        
        this.color = color || "black";
    }
    
    Pixel.prototype.draw = function(renderer) {
        renderer.begin();
        renderer.circle(0, 0, 2);    
        renderer.stroke(this.color);   
    };
    
    return Pixel;
});
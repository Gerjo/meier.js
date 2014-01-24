define(function(require){
    var Game       = require("meier/engine/Game");
    var Texture    = require("meier/engine/Texture");
    var RawTexture = require("meier/engine/RawTexture");
    
    Filters.prototype = new Game();
    
    function Filters(container) {        
        Game.call(this, container);

        this.texture = new RawTexture("./lenna.png", function(texture) {
            // done...
            console.log("RawTexture loaded.");
        });
     
    }
    
    Filters.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    Filters.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        renderer.texture(this.texture);
    }
    
    return Filters;
});
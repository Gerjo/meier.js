define(function(require){
    var Game = require("meier/engine/Game");
    
    Test.prototype = new Game();
    
    function Test(container) {        
        Game.call(this, container);

    }
    
    Test.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    Test.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
    }
    
    return Test;
});
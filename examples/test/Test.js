define(function(require){
    //var Game = require("meier/engine/Game");

    //var Renderer  = require("meier/engine/Renderer");
    var Logger    = require("meier/engine/Logger");
    
    //Test.prototype = new Game();
    //Test.prototype.constructor = Test;
    function Test(container) {        
        //Game.call(this, container);
        
        //new Game();
        
        
        alert("done! " + (typeof Logger));
        
        //new Logger();
        
    }
    
    Test.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    Test.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
    }
    
    return Test;
});
define(function(require){
    var Game = require("meier/engine/Game");
    
    App.prototype = new Game();
    
    function App(container) {        
        Game.call(this, container);

    }
    
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    App.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
    }
    
    return App;
});
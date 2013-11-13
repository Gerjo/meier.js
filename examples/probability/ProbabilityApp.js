define(function(require) {
    var Game      = require("meier/engine/Game");
    var Random    = require("meier/math/Random");
    var Vector    = require("meier/math/Vec")(2);
    var dat       = require("meier/contrib/datgui");
    var Canvas    = require("./Canvas");    
        
    ProbabilityApp.prototype = new Game();
    function ProbabilityApp(container) {
        Game.call(this, container);
        this.setFps(60);
        
        
        this.add(new Canvas(0, 0, 300, 300, this._renderer.context));
        
        
    }
    
    ProbabilityApp.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
    };
    
    ProbabilityApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        
    };
    
    
    
    return ProbabilityApp;
});
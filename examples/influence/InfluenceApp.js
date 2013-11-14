define(function(require) {
    var Game         = require("meier/engine/Game");
    var InfluenceMap = require("./InfluenceMap");
    
    InfluenceApp.prototype = new Game();
    function InfluenceApp(container) {
        Game.call(this, container);
        this.setFps(60);
        
        this.map = new InfluenceMap();
        
        this.add(this.map);
    }
    
    InfluenceApp.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
    };
    
    InfluenceApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
      
    };
    
    
    
    return InfluenceApp;
});
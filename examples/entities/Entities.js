define(function(require) {
    var Game   = require("meier/engine/Game");
    var Demoid = require("./Demoid");
    
    Entities.prototype = new Game();
    function Entities(container) {
        Game.call(this, container);
        
        this.setFps(30);
        
        this.add(
            new Demoid(-100, -15)
        );
        
    }
    
    return Entities;
});
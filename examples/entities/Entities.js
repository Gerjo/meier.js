define(function(require) {
    var Game   = require("meier/engine/Game");
    var Input  = require("meier/engine/Input");
    var Key    = require("meier/engine/Key");
    
    var Demoid = require("./Demoid");
    
    Entities.prototype = new Game();
    
    function Entities(container) {
        Game.call(this, container);
        
        this.setFps(30);
        
        this.add(
            new Demoid(-100, -15)
        );
        
        this.input.subscribe(Input.KEY_DOWN, function(input, key) {
            //console.log(key + "");
        });
    }
    
    Entities.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
    };
    
    
    return Entities;
});
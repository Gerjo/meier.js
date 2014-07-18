define(function(require){
    var Game    = require("meier/engine/Game");
    var Random  = require("meier/math/Random");
    var Input   = require("meier/engine/Input");
    var Key     = require("meier/engine/Key");
    
    var Map     = require("./Map");
    var Vehicle = require("./Vehicle");
    
    Burnout.prototype = new Game();
    
    function Burnout(container) {        
        Game.call(this, container);
        this.setHighFps(30);
        this.setLowFps(1);

        this.add(this.map = new Map());
        
        this.vehicles = [];
        
        this.vehicles.push(new Vehicle(100, 100));
        
        Random.Seed(10);
        
        for(var i = 0; i < 10; ++i) {
            //this.vehicles.push(new Vehicle(Random(-this.hw, this.hw), Random(-this.hh, this.hh)));
        }
        
        this.vehicles.forEach(this.add.bind(this));

        this.input.subscribe(Input.KEY_DOWN, this.onKeyDown.bind(this));
    }

    Burnout.prototype.onKeyDown = function(input, key) {

        if(key == Key.SPACE) {
            this.vehicles.push(new Vehicle(input.x, input.y));
            this.add(this.vehicles.last());
            return false;
        }

        return false;
    };
    
    Burnout.prototype.getVehiclesInRange = function(vehicle) {
        return this.vehicles;
    };

    Burnout.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    Burnout.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
    };
    
    return Burnout;
});
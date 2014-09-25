define(function(require){
    var Game    = require("meier/engine/Game");
    var Random  = require("meier/math/Random");
    var Input   = require("meier/engine/Input");
    var Key     = require("meier/engine/Key");
    
    var Map     = require("./Map");
    var Vehicle = require("./Vehicle");
    
    var dat     = require("meier/contrib/datgui");
    
    
    Burnout.prototype = new Game();
    
    function Burnout(container) {        
        Game.call(this, container);
        this.setHighFps(30);
        this.setLowFps(1);
        this.logger.showInternals(false);
        this.setAutoClear(false);

        // Pull GUI default settings from a test vehicle.
        var dummy = new Vehicle();
        this.maxSteerAngle = dummy.maxSteerAngle;
        this.lookAhead     = dummy.lookAhead;
        this.viewRange     = dummy.viewRange;
        this.speed         = dummy.speed;
        
        
        this.gui = new dat.GUI();
        this.gui.add(this, "maxSteerAngle", 0, 0.5).step(0.001).name("Max Steering");
        this.gui.add(this, "lookAhead", 0, 100).name("Lookahead");
        this.gui.add(this, "viewRange", 0, 50).name("Viewrange");
        this.gui.add(this, "speed", 0, 300).name("Speed");

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
        renderer.clearSolid("#3e6c01");
        Game.prototype.draw.call(this, renderer);
        
    };
    
    return Burnout;
});
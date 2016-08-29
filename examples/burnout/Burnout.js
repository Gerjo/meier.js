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
        this.setHighFps(60);
        this.setLowFps(1);
        this.logger.showInternals(false);
        this.setAutoClear(false);

        this.mouseDown = false;
        
        // Pull GUI default settings from a test vehicle.
        var dummy = new Vehicle();
        this.maxSteerAngle = dummy.maxSteerAngle;
        this.lookAhead     = dummy.lookAhead;
        this.viewRange     = dummy.viewRange;
        this.speed         = 1;
        this.showDebug     = false;
        
        this.gui = new dat.GUI();
        this.gui.add(this, "maxSteerAngle", 0, 0.5).step(0.001).name("Max steering");
        this.gui.add(this, "lookAhead", 0, 100).name("Lookahead");
        this.gui.add(this, "viewRange", 0, 70).name("Viewrange");
        this.gui.add(this, "speed", 0, 3).step(0.1).name("Speed");
        this.gui.add(this, "showDebug").name("Show debug");
        this.gui.add(this, "removeAllVehicles").name("Remove all");

        this.add(this.map = new Map());
        
        this.vehicles = [];
        
        this.vehicles.push(new Vehicle(100, 100));
        
        Random.Seed(10);
        
        for(var i = 0; i < 5; ++i) {
            this.vehicles.push(new Vehicle(Random(-this.hw, this.hw), Random(-this.hh, this.hh)));
        }
        
        this.vehicles.forEach(this.add.bind(this));

        this.input.subscribe(Input.KEY_DOWN, this.onKeyDown.bind(this));
        
        this.input.subscribe(Input.LEFT_DOWN, this.onMouseDown.bind(this));
    }
    
    Burnout.prototype.removeAllVehicles = function() {
        this.vehicles.forEach(function(vehicle) {
            vehicle.destroy();
        });
    };
    
    Burnout.prototype.onMouseDown = function(input) {
        this.mouseDown = true;
        
        this.vehicles.push(new Vehicle(input.x, input.y));
        this.add(this.vehicles.last());
        
        return false;
    };
    
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
        
        renderer.text("Left click to add more vehicles", 0, -this.hh + 5, "white", "center", "bottom", "13px monospace")
    };
    
    return Burnout;
});
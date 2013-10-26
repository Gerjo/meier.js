define(function(require){
    var Game        = require("meier/engine/Game");
    var Vector      = require("meier/math/Vector");
    var Random      = require("meier/math/Random");
    var Pistoller   = require("./Pistoller");
    var Zombie      = require("./Zombie");
    
    Gun.prototype = new Game();

    function Gun(container) 
    {
    	//inherit everything that game is.
    	Game.call(this, container);
	    this.setFps(60);
        
    	this.pistoller = new Pistoller(this);
        this.add(this.pistoller);
        
        this.zombies = [];
        
        this.addZombie(new Vector(-this.width * 0.6, 100), this.pistoller);
        this.addZombie(new Vector(-this.width * 0.68, 200), this.pistoller);
        this.addZombie(new Vector(-this.width * 0.5, 0), this.pistoller);
        this.addZombie(new Vector(-this.width * 0.7, -100), this.pistoller);
        this.addZombie(new Vector(-this.width * 0.9, -200), this.pistoller);
    }
    
    Gun.prototype.addZombie = function(position, targetEntity)
    {
        var zombie = new Zombie(position, targetEntity);
        this.zombies.push(zombie);
        this.add(zombie);
    }
    
    return Gun;
});
define(function(require){
    var Game   = require("meier/engine/Game");
    var Gunner = require("./Gunner");
    
    Gun.prototype = new Game();

    function Gun(container) 
    {
    	//inherit everything that game is.
    	Game.call(this, container);
	
    	this.gunner = new Gunner(this);
    	this.setFps(60);
	
    	this.projectiles = [];
    }

    Gun.prototype.update = function(dt) 
    {
    	this.gunner.update(dt);
	
    	//filter is een foreach waarin hij alles verwijderd dat niet aan het filter voldoet.
    	this.projectiles = this.projectiles.filter(function(projectile) {
    		projectile.update(dt);
    		return projectile.isAlive();
    	}); 
    };


    Gun.prototype.draw = function(r) 
    {
        r.clearSolid('gray');
	
    	this.gunner.draw(r);
	
    	this.projectiles.forEach(function(projectile) {
    		projectile.draw(r);
    	}); 
    };
    
    return Gun;
});
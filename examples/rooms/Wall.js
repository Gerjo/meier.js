define(function(require) {
    var Entity    = require("meier/engine/Entity");
    var Sprite    = require("meier/prefab/Sprite");

    
    
    Wall.prototype = new Entity();
    
    function Wall(x, y, width, height) 
    {
        Entity.call(this, x, y, width, height);
    }
    
    Wall.prototype.onAdd = function(game)
    {
        
    }
	
	Wall.prototype.update = function(dt)
    {
		// Entity.prototype.update.call(this, dt);        
	}
    
	Wall.prototype.draw = function(renderer) 
    {		
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.fill("rgba(0, 0, 0, 0.8)");
	}
    
    return Wall;
});
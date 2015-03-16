define(function(require) {
    var Entity     = require("meier/engine/Entity");
    var Sprite     = require("meier/prefab/Sprite");
	var Vec2       = require("meier/math/Vec")(2);
	var Input      = require("meier/engine/Input");
	var Key        = require("meier/engine/Key");
	var Action     = require("./Action");

	Player.prototype = new Entity();
	function Player() {
		Entity.call(this, 0, 0);
		
		this.add(new Sprite(0, 0, 16, 16, "images/tux.png"));
		
		this.enableEvent(Input.KEY_DOWN);
	}
	
	Player.prototype.onKeyDown = function(input, key) {
		this.position.x += ((key == Key.RIGHT) - (key == Key.LEFT)) * 10;
		this.position.y += ((key == Key.UP) - (key == Key.DOWN)) * 10;
		
		this.game.iterate();
	};
	
	Player.prototype.update = function(dt) {

	};
	
	/// Emmit actions based on encountered actor.
	Player.prototype.getAction = function(reactions) {
		var reaction = reactions.last();
		var response = Action.Nothing;
		
		switch(reaction.type) {
			case Action.Enemy.type:
				response = Action.Violence;
				break;
			case Action.Nothing.type:
				response = Action.Nothing;
				break;
		}
		
		return response.clone(this.position.x, this.position.y);
	};
	
	Player.prototype.draw = function(renderer) {
		Entity.prototype.draw.call(this, renderer);
		
		var world = this.game.world;
		
		if( ! world.buckets.empty()) {
			
			var quantized = new Vec2(
				parseInt((this.position.x + this.game.width  * 0.5) / world.bucketsize.x),
				parseInt((this.position.y + this.game.height * 0.5) / world.bucketsize.y)
			);
		
			var bucket = world.buckets[quantized.y][quantized.x];		
			var local  = this.toLocal(bucket.position);
		
			renderer.begin();
		
			renderer.rectangle(
				local.x,
				local.y,
				world.bucketsize.x,
				world.bucketsize.y
			);
		
			renderer.stroke("red");
		}
	};
		
	return Player;	
});
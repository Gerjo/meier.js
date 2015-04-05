define(function(require) {
    var Entity     = require("meier/engine/Entity");
    var Sprite     = require("meier/prefab/Sprite");
	var Vec2       = require("meier/math/Vec")(2);
	var Input      = require("meier/engine/Input");
	var Key        = require("meier/engine/Key");
	var Action     = require("./Action");
	var Compass    = require("./Compass");

	Player.prototype = new Entity();
	function Player() {
		Entity.call(this, 8, 107);
		
		this.add(new Sprite(0, 0, 16, 16, "images/tux.png"));
		
		this.enableEvent(Input.KEY_DOWN);
		
		this.walkHistory = [];
		
		
		this.moveto = new Vec2(0, 0);
	}
	
	// 0 = lost
	// 1 = not lost
	Player.prototype.walkentropy = function() {
		
		// Never walked, assume not lost.
		if(this.walkHistory.empty()) {
			return 1;
		}
		
		var dict = {};
		
		// Zerofill
		dict[Compass.North] = 0;
		dict[Compass.South] = 0;
		dict[Compass.West] = 0;
		dict[Compass.East] = 0;
		dict[Compass.NorthEast] = 0;
		dict[Compass.SouthWest] = 0;
		dict[Compass.NorthWest] = 0;
		dict[Compass.SouthEast] = 0;
		
		// Increment counters
		this.walkHistory.forEach(function(compass) {
			dict[compass]++;
		});
		
		// Compute some sort of "I am lost entropy"
		
		var score = 0;
		
		score += Math.abs(dict[Compass.North] - dict[Compass.South]);
		score += Math.abs(dict[Compass.West] - dict[Compass.East]);
		score += Math.abs(dict[Compass.NorthEast] - dict[Compass.SouthWest]);
		score += Math.abs(dict[Compass.NorthWest] - dict[Compass.SouthEast]);
				
		// Normalize (0..1]
		return score / this.walkHistory.length;
	};

	Player.prototype.onKeyDown = function(input, key) {
				
		// Schedule a movement
		this.moveto = this.position.clone();
		this.moveto.x += ((key == Key.RIGHT) - (key == Key.LEFT)) * this.game.world.bucketsize.x;
		this.moveto.y += ((key == Key.UP) - (key == Key.DOWN)) * this.game.world.bucketsize.y;
		
		// Run simulation
		this.game.iterate();
	};
	
	Player.prototype.update = function(dt) {
		
	};
	
	Player.prototype.getTile = function() {
		var quantized = new Vec2(
			parseInt((this.position.x + this.game.width  * 0.5)  / this.game.world.bucketsize.x),
			parseInt((this.position.y) / this.game.world.bucketsize.y)
		);
	
		return this.game.world.buckets[quantized.y][quantized.x];	
	};
	
	/// Emmit actions based on encountered actor.
	Player.prototype.getAction = function(reactions) {
		var reaction = reactions.last();
		var response = Action.Nothing;
		
		switch(reaction.type) {
			case Action.Enemy.type:
				response = Action.Violence;
				break;
			
			case Action.Person.type:
				// Ask for directions?
				response = Action.FriendlyTalk;
				break;
				
			case Action.Nothing.type:
				
				if(this.moveto.magnitude() > 0) {
					response = Action.Walk;
					
					var previous  = this.getTile();
					this.position = this.moveto;
					this.moveto   = new Vec2(0, 0);
		
					var current = this.getTile();
		
					this.walkHistory.push(Compass(previous.position, current.position));
		
					while(this.walkHistory.length > 10) {
						this.walkHistory.shift();
					}
					
					
				} else {
					response = Action.Nothing;
				}
				break;
		}
		
		console.log("yielding: " + response.text);
		
		return response.clone(this.position.x, this.position.y);
	};
	
	Player.prototype.draw = function(renderer) {
		Entity.prototype.draw.call(this, renderer);
		
		var world = this.game.world;
		
		if( ! world.buckets.empty()) {
			
			var bucket = this.getTile();
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
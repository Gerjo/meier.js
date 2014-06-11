define(function(require) {
	var Color  = require("meier/engine/Colors");
	var Input  = require("meier/engine/Input");
	var Key    = require("meier/engine/Key");
	var Random = require("meier/math/Random");

	var Moveable = require("./Moveable");

	Ghost.prototype = new Moveable();

	function Ghost(tile, world) {
		Moveable.call(this, tile, world);

		this.color = Color.Green;
	}

	Ghost.prototype.atDestination = function(tile) {
		this.random(tile);
	};

	Ghost.prototype.random = function(tile) {
		var directions = ["rightOf", "leftOf", "aboveOf", "belowOf"].shuffle();

		while( ! directions.empty()) {
			var fn = directions.pop();

			var candidate = this.world[fn](tile);

			if(candidate && ! candidate.wall) {
				this.target = candidate;
				break;
			}
		}
	};

	Ghost.prototype.atIntermediate = function(tile) {
		var n = Random(0, 100);
		if(n > 50) {
			this.random(tile);

			console.log("randomize");
		}

		
	};


	Ghost.prototype.draw = function(renderer) {
		renderer.begin();
		renderer.circle(0, 0, this.width);
		renderer.fill(this.color);
	};

	return Ghost;
});
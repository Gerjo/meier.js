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
		console.log("atDestination(" + tile.id + ")");
		
		this.random(tile);


	};

	Ghost.prototype.random = function(tile) {
		var directions = ["rightOf", "leftOf", "aboveOf", "belowOf"].shuffle();

		while( ! directions.empty()) {
			var fn = directions.pop();

			var candidate = this.world[fn](tile);

			if(candidate && ! candidate.wall) {

				console.log(fn, "from: " + tile.id + ", to: " + candidate.id);

				this.target = candidate;

				break;
			}
		}
	};

	Ghost.prototype.atIntermediate = function(tile) {

		console.log("atIntermediate(" + tile.id + ")");

		var n = Random(0, 100);
		if(n > 0) {

			var count = 0;

			count += this.world.isWalkable(this.world.aboveOf(tile));
			count += this.world.isWalkable(this.world.rightOf(tile));
			count += this.world.isWalkable(this.world.leftOf(tile));
			count += this.world.isWalkable(this.world.belowOf(tile));

			if(count > 2) {
				this.random(tile);
			}
		}

		
	};


	Ghost.prototype.draw = function(renderer) {
		renderer.begin();
		renderer.circle(0, 0, this.width);
		renderer.fill(this.color);

		if(this.target) {
			renderer.text(this.target.id, 0, 0);
		}

	};

	return Ghost;
});
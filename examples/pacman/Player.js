define(function(require) {
	var Color  = require("meier/engine/Colors");
	var Input  = require("meier/engine/Input");
	var Key    = require("meier/engine/Key");

	var Moveable = require("./Moveable");

	Player.prototype = new Moveable();

	function Player(tile, world) {
		Moveable.call(this, tile, world);

		//this.speed = 100;

		this.enableEvent(Input.KEY_DOWN);
	}

	Player.prototype.onKeyDown = function(input, key) {

		var current = this.world.atPosition(this.position);

		var target = null;

		if(key == Key.A || key == Key.LEFT) {
			target = this.world.leftOf(current);
		}

		if(key == Key.D || key == Key.RIGHT) {
			target = this.world.rightOf(current);
		}

		if(key == Key.W || key == Key.UP) {
			target = this.world.aboveOf(current);
		}

		if(key == Key.S || key == Key.DOWN) {
			target = this.world.belowOf(current);
		}

		if( target && ! target.wall) {
			this.target = target;
		}
	};

	Player.prototype.atDestination = function(tile) {
		this.handlePickup(tile);
	};

	Player.prototype.atIntermediate = function(tile) {
		this.handlePickup(tile);
	};

	Player.prototype.handlePickup = function(tile) {
		if(tile.pellet) {
			tile.pellet = false;
		}

		if(tile.power) {
			tile.power = false;
		}
	};
	
	Player.prototype.draw = function(renderer) {
		renderer.begin();
		renderer.circle(0, 0, this.width);
		renderer.fill(Color.Purple);
	};

	return Player;
});
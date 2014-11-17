define(function(require) {
	var Entity = require("meier/engine/Entity");
	var V2     = require("meier/math/Vec")(2);

	Moveable.prototype = new Entity();

	function Moveable(tile, world) {
		Entity.call(this, 0, 0, 10, 10);

		this.target = tile;
		this.world  = world;

		this.speed  = 80;

		this.velocity = new V2(0, 0);
	}

    Moveable.prototype.getTile = function() {
        return this.world.atPosition(this.position);
    };

	Moveable.prototype.update = function(dt) {

		if(this.target) {

			var direction = this.target.position.direction(this.position);

			if(! direction.isNull()) {

				var velocity = this.velocity = direction.clone().trim(this.speed * dt);

				// Compute next tile if we're overshooting
				if(velocity.length() >= direction.length()) {
					var next = null;

					if(Math.abs(velocity.x) > Math.abs(velocity.y)) {
						if(velocity.x > 0) {
							next = this.world.rightOf(this.target);
						} else {
							next = this.world.leftOf(this.target);
						}
					} else {
						if(velocity.y > 0) {
							next = this.world.aboveOf(this.target);
						} else {
							next = this.world.belowOf(this.target);
						}
					}

					var oldTarget = this.target;

					// Found next tile, set as target.
					if(next && ! next.wall) {
						this.position.add(velocity);

						

						// Set next target.
						this.target = next;

						// User defined event.
						this.atIntermediate(oldTarget);

					// No next tile. Halt.
					} else {
						this.position = this.target.position.clone();
						this.target = null;

						this.atDestination(oldTarget);

					}
				} else {
					this.position.add(velocity);
				}
			}
		}
	};

	return Moveable;
});
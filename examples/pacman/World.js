define(function(require) {
	var Entity = require("meier/engine/Entity");
    var Color  = require("meier/engine/Colors");
	var Level  = require("./Map");
	var V2     = require("meier/math/Vec")(2);


	/// Structure to hold tile related properties.
	World.Tile = function(type, index, position) {
		
		// Default to wall.
		type = type || 0;

		this.wall     = type == 0;
		this.pellet   = type == 1;
		this.empty    = type == 2;
		this.spawn    = type == 3; // Ghost spawn
		this.power    = type == 4;
		this.start    = type == 5; // Player starting tile

		this.index    = index    || new V2(0, 0); // Array index
		this.position = position || new V2(0, 0); // World index
	};

	World.prototype = new Entity();
	function World() {
		Entity.call(this, 0, 0, 400, 400);

		this.spawns = [];   // Reference to ghost spawn locations
		this.tiles  = [];   // Two dimensional grid.
		this.size   = 16;   // Tile width and height measured in pixels.
		this.start  = null; // Player starting tile
		this.wall   = new World.Tile(); // Used instead of "null"
	}

	World.prototype.onAdd = function(game) {
		this.width  = game.width;
		this.height = game.height;
	}

	World.prototype.load = function(level) {

		if( ! this.game) {
			throw new Error("Add world to game before loading a level.");
		}

		this.tiles.clear();
		this.spawns.clear();

		var size = this.size;
		var hh   = level.length * size * 0.5;

		level.forEach(function(row, y) {
			this.tiles[y] = [];

			var hw = row.length * size * 0.5;

			row.forEach(function(type, x) {
				var py = (y * size - hh) * -1; // Flip to match meier.js coordiate system.
				var px = x * size - hw;
				var tile = this.tiles[y][x] = new World.Tile(type, new V2(y, x), new V2(px, py));


				if(tile.spawn) {
					this.spawns.push(tile);
				} else if(tile.start) {
					this.start = tile;
				}

			}.bind(this));
		}.bind(this));
	};

	World.prototype.draw = function(renderer) {
		Entity.prototype.draw.call(this, renderer);

		var size = this.size;
		

		renderer.begin();
		renderer.circle(0, 0, 5, 5);
		renderer.stroke("black");

		this.tiles.forEach(function(row, y) {

			row.forEach(function(tile, x) {

				var px = tile.position.x;
				var py = tile.position.y


				if(tile.wall) {
					renderer.begin();
					renderer.rectangle(px, py, size, size);
					renderer.stroke(Color.Black);
				}

				if(tile.pellet) {
					renderer.begin();
					renderer.circle(px, py, size * 0.1);
					renderer.fill(Color.Red);	
				}

				if(tile.power) {
					renderer.begin();
					renderer.circle(px, py, size * 0.3);
					renderer.fill(Color.Yellow);	
				}
			});
		});
	};

	World.prototype.atPosition = function(p, renderer) {
		var hs = this.size * 0.5;


		var hw = this.tiles.length * this.size * 0.5;
		var hh = this.tiles[0].length * this.size * 0.5;

		var x = Math.round((p.x - hs + hw) / this.size);
		var y = Math.round(((p.y - hs) * -1 + hh) / this.size);
		var t = this.atIndex(y + 1, x - 1);

		return t;
	}

	World.prototype.atIndex = function(x, y) {
		if(x.x) {
			y = x.y;
			x = x.x;
		}

		return (this.tiles[x] && this.tiles[x][y]) || null;
	};

	World.prototype.leftOf = function(tile) {
		var index = tile.index;

		var neighbour = this.atIndex(index.x, index.y - 1);

		return neighbour || this.wall;
	};

	World.prototype.rightOf = function(tile) {
		var index = tile.index;

		var neighbour = this.atIndex(index.x, index.y + 1);

		return neighbour || this.wall;
	};

	World.prototype.aboveOf = function(tile) {
		var index = tile.index;

		var neighbour = this.atIndex(index.x - 1, index.y);

		return neighbour || this.wall;
	};

	World.prototype.belowOf = function(tile) {
		var index = tile.index;

		var neighbour = this.atIndex(index.x + 1, index.y);

		return neighbour || this.wall;
	};

	return World;

});
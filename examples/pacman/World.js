define(function(require) {
	var Entity = require("meier/engine/Entity");
    var Color  = require("meier/engine/Colors");
	var Level  = require("./Map");
	var V2     = require("meier/math/Vec")(2);
	var Heap   = require("meier/collections/Heap");

	var nextTileId = 0;

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

		this.id = ++nextTileId;
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
	};

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

	World.prototype.isWalkable = function(tile) {
		return tile && ! tile.wall;
	};

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

	World.prototype.path = function(start, end, renderer) {
		var world = this;

		var lookup  = [];
		var current = null;

		var open = new Heap(function(a, b) {
			return lookup[a.id].f - lookup[b.id].f;
		});

		function H(a, b) {
			return a.position.distance(b.position);
		}

		function Neighbours(tile) {
			return ["rightOf", "leftOf", "aboveOf", "belowOf"].filterMap(function(fn) {
				var t = world[fn](tile);

				if(world.isWalkable(t)) {
					return t;
				}

				return undefined;
			});
		}
    
        open.push(start);
        lookup[start.id] = {};
        lookup[start.id].h = H(start, end);
        lookup[start.id].g = 0; // Step score.
        lookup[start.id].f = lookup[start.id].h + lookup[start.id].g; // Sort score.
        lookup[start.id].p = null; // terminate!
        lookup[start.id].o = true;

        for(var t = 3000; t > 0 && ! open.empty(); --t) {
            current = open.pop();
            lookup[current.id].o = false;
        
            if(current.id == end.id) {
                break;
            }
        
            var neighbours = Neighbours(current);
           
            for(i = 0; i < neighbours.length; ++i) {
                neighbour = neighbours[i];
            
                tentative = {};
                tentative.h = H(neighbour, end);
            
                // TODO: a nicer step score? manhatten doesn't take 
                // diagonal into account.
                tentative.g = lookup[current.id].g + H(current, neighbour);
            
                tentative.f = tentative.g + tentative.h * 1.1;
                tentative.p = current;
            
            	renderer.begin();
                renderer.rectangle(current.position, 10, 10);
                renderer.fill("yellow");
            
                if( ! lookup[neighbour.id] ) {
                    tentative.o = true;
                    lookup[neighbour.id] = tentative;
                
                    open.push(neighbour);
                } else {
                    if(lookup[neighbour.id].f > tentative.f) {
                        lookup[neighbour.id] = tentative;
                    
                        // Additional test. This entry might've been popped before.
                        if(tentative.o === true) { 
                            open.updateItem(neighbour);
                        }
                    }
                }
            }
        }

        if(current == end) {
            var route = [];
            var iterator = current;
        
            // Linkedlist unrolling:
            while(iterator) {
                route.push(iterator); 
                

                renderer.begin();
                renderer.rectangle(iterator.position, 6, 6);
                renderer.fill("red");

                iterator = lookup[iterator.id].p;
            }
        
            // New start:
            route.pop();
            route.push(start);
        
            route = route.reverse();
        
            // new end:
            route.pop();
            route.push(end);
        
            //console.log("found. splendid");
        
            return route;    
        }

	};

	return World;

});
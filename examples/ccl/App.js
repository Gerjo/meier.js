define(function(require){
    var Game = require("meier/engine/Game");
    var Vec2 = require("meier/math/Vec")(2);
    var Random = require("meier/math/Random");
    var Colors = require("meier/engine/Colors");
	var Benchmark = require("meier/extra/Benchmark");
	var Enum = require("meier/engine/Enum");
	var Texture = require("meier/engine/Texture");
	
    App.prototype = new Game();
    
	function Node(i, value) {
		this.value = value;
		this.class = value % 2;
		this.group = -1;
		this.index = i;
	}
	
	
    function App(container) {        
        Game.call(this, container);
		
		Random.Seed(5);

		this.tiles = [];
		
		for(var i = 0; i < 16; ++i) {
			this.tiles[i] = new Texture("tiles/" + i + ".png");
		}
	
		var grid = [];
		var size = new Vec2(5, 5);
	
		var classes = [
			0, 0, 0, 0, 0, 
			0, 1, 1, 1, 0,
			0, 1, 1, 1, 0,
			0, 1, 1, 1, 0,
			0, 0, 0, 0, 0 
		];
	
		for(var x = 0, i = 0; x < size.x; ++x) {
			var column = [];
		
			for(var y = 0; y < size.y; ++y, ++i) {
			
				var klass = classes[i];//Random(0, 100);
			
				column[y] = new Node(i, klass);
			}
		
			grid.push(column);
		}
		
		var res =  CCL(grid);
		
		this.grid = res.grid;
		
		this.mesh = Squares(this.grid);
	
		this.colors = Colors.Random(10);
		
    }
	
	function Squares(grid) {
		
		var Cardinal = Enum(
			["North", 1 << 0],
			["East",  1 << 1],
			["South", 1 << 2],
			["West",  1 << 3]
		);
		
		function Get(src, x, y) {
			
			if(x >= 0 && y >= 0) {
				if(x < src.length) {
					if(y < src.length) {
						return src[x][y];
					}
				}
			}
			
			return null;
		}
		
		var mesh = [];
		
		for(var x = 0, i = 0; x < grid.length + 1; ++x) {
			
			mesh.push([]);
			
			for(var y = 0; y < grid[0].length + 1; ++y, ++i) {
				
				var neighbours = [
					Get(grid, x-1, y-1),	// 1
					Get(grid, x, y-1),		// 2
					Get(grid, x, y),		// 4
					Get(grid, x-1, y+0),	// 8
				];

				var active = 0;
				var sum = neighbours.reduce(function(p, c, j) {
					if(c) {
						++active;
						return p + c.group;
					}
					
					return p;
				}, 0);
				
				var avg = sum / active;
				
				// Edge bias. Doesn't work with multi class.
				var group = Math.round(avg);
				
				// Edge tie breaker bias. Doesn't work with multi class.
				if(avg == 0.5) {
					group = Math.floor(avg);
				}
				
				// TODO: rank-based average with lookup table for multi class
				
				mesh.last().push({
					bit: 0,
					group: group,
					avg: avg,
					sum: sum,
					x: y,
					y: y,
					n: neighbours
				});
			}
		}
		
		for(var x = 0; x < mesh.length; ++x) {
			for(var y = 0; y < mesh[x].length; ++y) {
				var node = mesh[x][y];
				
				
				var bit = node.n.reduce(function(p, c, j) {
				//	var bit = neighbours.reduce(function(p, c, j) {
					var m = c && c.group != node.group;
					
					if(m) {
						return p | (1 << j);
					}
					
					return p;
				}, 0);
				
				node.bit = bit;
			}
		}
		
		return mesh;
		
		/*for(var x = 0, i = 0; x < grid.length; ++x) {
			
			for(var y = 0; y < grid[x].length; ++y, ++i) {
				var bit = 0;
				
				if(Same(x-1, y+1, grid[x][y])) {
					bit |= 1 << 3;
				}
				
				if(Same(x+1, y+1, grid[x][y])) {
					bit |= 1 << 2;
				}
				
				if(Same(x+1, y-1, grid[x][y])) {
					bit |= 1 << 1;
				}
				
				if(Same(x-1, y-1, grid[x][y])) {
					bit |= 1 << 0;
				}
				
				grid[x][y].bit = bit;
			}
		}*/
		
	}
    
	function CCL(grid) {
		
		var copy = [];
		
		var lastGroup = -1;
		
		// Disjointed set.
		var set = [];
		
		
		function Join(a, b) {
			if( ! (a.group in set)) {
				set[a.group] = [];
			} 
			
			set[a.group][b.group] = b.group;
		}
		
		for(var x = 0, i = 0; x < grid.length; ++x) {
			
			for(var y = 0; y < grid[x].length; ++y, ++i) {
				var node = grid[x][y];
				
				var west = grid[x - 1] ? grid[x - 1][y] : null;
				var north = grid[x][y - 1] || null;
				
				// Do both pixels to the North and West of the current pixel have the same value as the current pixel but not the same label? 
				if(west && north && node.class == west.class && west.class == north.class) {
					if(north.group != west.group) {
						Join(north, west);						
						Join(west, north);						
					}
										
					// We know that the North and West pixels belong to the same region and must be merged. Assign the current pixel the minimum of the North and West labels, and record their equivalence 
					node.group = Math.min(north.group, west.group);
					
					continue;
				}
				
				// Initial group.
				if( ! west && ! north) {
					node.group = ++lastGroup;
					continue;
				}
				
				// Does the pixel to the left (West) have the same value as the current pixel? 
				if(west && node.class == west.class) {
					// We are in the same region. Assign the same label to the current pixel
					node.group = west.group;
					continue;
				}
				
				// Does the pixel to the left (West) have a different value and the one to the North the same value as the current pixel? 
				if(( ! west || west.class != node.class) && north && north.class == node.class) {
					// Assign the label of the North pixel to the current pixel
					node.group = north.group;
					continue;
				}
		
				// Do the pixel's North and West neighbors have different pixel values than current pixel?
				if(( ! west || west.class != node.class) && ( !north || north.class != node.class)) {
					node.group = ++lastGroup;
					
					continue;
				} 
				
				//console.log("reached error state.");
			}			
		}
		
		//console.log("First pass found " + (lastGroup+1) + " group(s).");
		
		
		for(var k in set) {
			var me = set[k];
		
			for(var l in me) {
				if(me.hasOwnProperty(l)) {
			
					if(l in set) {
						set[l].forEach(function(blaat) {
							me[blaat] = blaat;
						});
					}
				}
			}
		}
		
		/*set.forEach(function(arr, i) {
			
			var str = arr.reduce(function(p, c) {
				return p + ", " + c;
			}, "");
			
			console.log(i + ") " + str.trim(", "));
		});*/
		
		function FindLowest(key) {
			
			for(var k in set[key]) {
				if(set[key].hasOwnProperty(k)) {
					if(k != key) {
						return FindLowest(k);
					}
					
					return k;
				}
			}
			
			return key;
		}
		
		
		var index = -1;
		var map = {};
		
		var lookup = [];
		
		for(var x = 0, i = 0; x < grid.length - 0; ++x) {
			for(var y = 0; y < grid[x].length - 0; ++y, ++i) {
				var key = grid[x][y].group;
				
				if(set[key]) {
					grid[x][y].group = FindLowest(key);
				}
				
				if(! (grid[x][y].group in map)) {
					
					map[grid[x][y].group] = ++index;
					
					lookup[index] = [];
				}
				
				grid[x][y].group = map[grid[x][y].group];
				
				lookup[grid[x][y].group].push(grid[x][y]);
				
			}
		}
		
		return {
			grid: grid,
			groups: lookup,
		};
		
	}
	
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    App.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
		var s = 54;
		var hs = s;//s * 0.5;
		
		for(var y = 0; y < this.grid[0].length; ++y) {
			for(var x = 0; x < this.grid.length; ++x) {
				var node = this.grid[x][y];
				
				var pos = new Vec2(
					x * s - this.grid.length * s * 0.5,
					this.grid[x].length * s - y * s - this.grid[x].length * s * 0.5
				);
				
				var tile = this.tiles[node.bit];
				
				
				renderer.begin();
				renderer.rect(pos, s, s);
				renderer.fill(this.colors[node.class]);
				renderer.stroke("black", 1);
				//renderer.texture(tile, pos, s/2, s/2);
				
				//renderer.styled("<10px><black><middle><center>" + node.bit.toString(2).padLeft('0', 4), pos.x, pos.y);
			}
		}
		
		for(var y = 0; y < this.mesh[0].length; ++y) {
			for(var x = 0; x < this.mesh.length; ++x) {
				var pos = new Vec2(
					(x-1) * s - this.mesh.length * s * 0.5 + hs,
					this.mesh[x].length * s - (y-1) * s - this.mesh[x].length * s * 0.5 - hs
				);
				
				var tile = this.tiles[this.mesh[x][y].bit];
				
				
				renderer.texture(tile, pos, s/2, s/2);
				renderer.styled("<10px><black><middle><center>" + this.mesh[x][y].bit.toString(2).padLeft('0', 4), pos.x, pos.y);
				renderer.styled("<10px><black><middle><center>" + x + "," + y, pos.x, pos.y - 13);
				// renderer.styled("<10px><black><middle><center>" + this.mesh[x][y].group, pos.x, pos.y);
				
			}
		}
    };
    
    return App;
});
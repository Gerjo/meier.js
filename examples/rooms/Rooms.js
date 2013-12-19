define(function(require) {
    var Game    = require("meier/engine/Game");
    var Input   = require("meier/engine/Input");
    var Texture = require("meier/engine/Texture");
    var Random  = require("meier/math/Random");
    var Grid    = require("meier/prefab/Grid");
    var Pixel   = require("meier/prefab/Pixel");
    var Vector  = require("meier/math/Vec")(2);
    var dat     = require("meier/contrib/datgui");
    var Wall    = require("./Wall");
	
   
    var Config = {
        doorSize:       50,
        wallThickness:  5,
        minRoomSize:    250,
        seed:           5000
    };
	
	function RoomNode(x, y, w, h, world) {
		this.x = x;
		this.y = y;
		this.width  = w;
		this.height = h;
		
		this.subNodeOne = 0;
		this.subNodeTwo = 0;
		
		// door size
		var dr = Config.doorSize;
		var wl = Config.wallThickness;
		
		// door movement
		var drm = Random.FloatInRange(0.0, 1.0) > 0.5 ?  dr * 0.5 : -dr * 0.5 ;
		
		// If longer and width is big enough
		if(w > h && w > Config.minRoomSize) {
			var split = Random.FloatInRange(w * 0.20, w * 0.80);
			//var split = w * 0.5;	 // test
			var rest = w - split;
			var lx = x - (w * 0.5) + (rest * 0.5);
			var rx = x + (w * 0.5) - (split * 0.5);
			this.subNodeTwo = new RoomNode(lx, y, rest, h, world);
			this.subNodeOne = new RoomNode(rx, y, split, h, world);
            
            
            // Add to a wall to separate
            if(Random.Boolean()) {
			    world.add(new Wall( lx + (rest * 0.5), y + drm, wl, h - dr + wl ));
            } else if(h > dr * 3) {		
			    world.add(new Wall( lx + (rest * 0.5), y, wl, h - dr * 2 + wl ));
            } else {	
			    world.add(new Wall( lx + (rest * 0.5), y + drm, wl, h - dr + wl ));
            }
            
			 						
		} else if(h > Config.minRoomSize) {
			var split = Random.FloatInRange(h * 0.20, h * 0.80);
			//var split = h * 0.5; // test
			var rest = h - split;
			var uy = y - (h * 0.5) + (rest * 0.5);
			var dy = y + (h * 0.5) - (split * 0.5);
			this.subNodeTwo = new RoomNode(x, uy, w, rest, world);
			this.subNodeOne = new RoomNode(x, dy, w, split, world);
			
			// Add to a wall to separate
            if(Random.Boolean()) {
			    world.add(new Wall(x + drm, uy + (rest * 0.5), w - dr, wl));
            } else if(w > dr * 3) {		
			    world.add(new Wall(x, uy + (rest * 0.5), w - dr * 2, wl));
            } else {	
			    world.add(new Wall(x + drm, uy + (rest * 0.5), w - dr, wl));
            }
            
		} else {		
			//debugger;	
			// End of the recursion, this is now a room
			var area = w * h;
			var ratio = w / h;
			if(ratio < 1)
				ratio = h / w;
			//
			if(area < 200 * 200 && !world.toiletExists) {
                //Toilet
                this.texture = new Texture( "./images/house" + world.houseStyle + "toilet.png" );
                
                //fill toilet?
                
                world.toiletExists = true;
			} else { 
				if(ratio < 2) {
                    //big room
                    this.texture = new Texture( "./images/house" + world.houseStyle + "carpet" + Random.IntegerInRange(1, 3) + ".png" );
                    
                    if(typeof(world.biggestRoom) == 'undefined') {
                        world.biggestRoom2 = this;
                        world.biggestRoom = this;
                    } else if(area > world.biggestRoom.width * world.biggestRoom.height) {
                        world.biggestRoom2 = world.biggestRoom;
                        world.biggestRoom = this;
                    }
                } else {
                    //hallway
                    this.texture = new Texture( "./images/house" + world.houseStyle + "hallway.png" );
                }
			}
				
		}		
	}	
	
	RoomNode.prototype.draw = function(renderer) {
		if(	this.subNodeOne == 0 && this.subNodeTwo == 0 ) {
			renderer.begin();
			renderer.rectangle(this.x, this.y, this.width, this.height);
	        renderer.fill(this.texture);
		} else {
			this.subNodeOne.draw(renderer);
			this.subNodeTwo.draw(renderer);
		}
	}
	
	RoomNode.prototype.getRooms = function(rooms) {
		if(	this.subNodeOne == 0 && this.subNodeTwo == 0 ) {
			rooms.push(this);
		} else {
			this.subNodeOne.getRooms(rooms);
			this.subNodeTwo.getRooms(rooms);
		}		
	}
	

    Rooms.prototype = new Game();
    function Rooms(container) {
        Game.call(this, container);
        this.setFps(30);
        this.setAutoClear(false);
        this.log.top().left();
        
        this.gui = new dat.GUI();

        this.gui.add(Config, "seed",            0, 100000).onChange(this.rebuild.bind(this));
        this.gui.add(Config, "doorSize",        3, 50).onChange(this.rebuild.bind(this));
        this.gui.add(Config, "wallThickness",   1,  20).onChange(this.rebuild.bind(this));
        this.gui.add(Config, "minRoomSize",     20,  500).onChange(this.rebuild.bind(this));
 
        
        this.houseWidth  = this.width - 30;
        this.houseHeight = this.height - 30;

        this.rebuild();
    }
    
    Rooms.prototype.rebuild = function() {
        this.houseStyle     = 1;
        this.toiletExists   = false;
        this.kitchenExists  = false;
        this.hallwayExists  = false;
        
        this._entities.forEach(function(entity) {
            entity.destroy();
        });
        
        Random.Seed(Config.seed);
        
		this.rootRoom = new RoomNode(0, 0, this.houseWidth, this.houseHeight, this);
		
		var rooms = new Array();
		this.rootRoom.getRooms(rooms);	
        
        
        var wallSplit = Random.FloatInRange(0.1, 0.9);
        
		this.add(new Wall( 
            this.houseWidth * 0.5,
            (this.houseHeight * (1 - wallSplit)) * 0.5 + (Config.doorSize * 0.25), 
            Config.wallThickness, 
            wallSplit * this.houseHeight - (Config.doorSize * 0.5) + Config.wallThickness )
        );
            
		this.add(new Wall( 
            this.houseWidth * 0.5,
            -(this.houseHeight * wallSplit) * 0.5 - (Config.doorSize * 0.25), 
            Config.wallThickness, 
            (1 - wallSplit) * this.houseHeight - (Config.doorSize * 0.5) + Config.wallThickness )
        );
        
        wallSplit = Random.FloatInRange(0.1, 0.9);
        
		//left
		this.add(new Wall( 
            -this.houseWidth * 0.5,
            (this.houseHeight * (1 - wallSplit)) * 0.5 + (Config.doorSize * 0.25), 
            Config.wallThickness, 
            wallSplit * this.houseHeight - (Config.doorSize * 0.5) + Config.wallThickness )
        );
            
		this.add(new Wall( 
            -this.houseWidth * 0.5,
            -(this.houseHeight * wallSplit) * 0.5 - (Config.doorSize * 0.25), 
            Config.wallThickness, 
            (1 - wallSplit) * this.houseHeight - (Config.doorSize * 0.5) + Config.wallThickness )
        );
        
        wallSplit = Random.FloatInRange(0.1, 0.9);
        
		this.add(new Wall( 
            (this.houseWidth * (1 - wallSplit)) * 0.5 + (Config.doorSize * 0.25), 
            this.houseHeight * 0.5,
            wallSplit * this.houseWidth - (Config.doorSize * 0.5) + Config.wallThickness, 
            Config.wallThickness )
        );
            
		this.add(new Wall( 
            -(this.houseWidth * wallSplit) * 0.5 - (Config.doorSize * 0.25), 
            this.houseHeight * 0.5,
            (1 - wallSplit) * this.houseWidth - (Config.doorSize * 0.5) + Config.wallThickness, 
            Config.wallThickness )
        );
        
        //bottom
        wallSplit = Random.FloatInRange(0.1, 0.9);
        
		this.add(new Wall( 
            (this.houseWidth * (1 - wallSplit)) * 0.5 + (Config.doorSize * 0.25), 
            -this.houseHeight * 0.5,
            wallSplit * this.houseWidth - (Config.doorSize * 0.5) + Config.wallThickness, 
            Config.wallThickness )
        );
            
		this.add(new Wall( 
            -(this.houseWidth * wallSplit) * 0.5 - (Config.doorSize * 0.25), 
            -this.houseHeight * 0.5,
            (1 - wallSplit) * this.houseWidth - (Config.doorSize * 0.5) + Config.wallThickness, 
            Config.wallThickness )
        );  
    };
    
    Rooms.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
    };
    
    Rooms.prototype.draw = function(renderer) {
        renderer.clear();
        
        renderer.opacity(0.8);
		this.rootRoom.draw(renderer);
        renderer.opacity(1);
        
        Game.prototype.draw.call(this, renderer);
    };
    
    return Rooms;
});
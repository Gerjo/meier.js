define(function(require){
    var Game   = require("meier/engine/Game");
    var Input  = require("meier/engine/Input");
    var dat    = require("meier/contrib/datgui");
    var Sprite = require("meier/prefab/Sprite");
	var World  = require("./World");
	var Action = require("./Action");
	var Timer  = require("meier/extra/Timer");
	var Logic  = require("./Logic");
	var Player = require("./Player");
	
    Evermoar.prototype = new Game();
	
    function Evermoar(container) {        
        Game.call(this, container);
		this.logger.hideInternals();
		
		
		this.add(new Sprite(0, 0, this.width, this.height, "images/background.png"))
		this.add(this.world = new World(this.width, this.height));
		this.add(this.logic = new Logic());
		this.add(this.player = new Player());

		
		var dict = {};
		Action.All.forEach(function(action) {
			dict[action] = action;
		});
		
		this.activeAction = Action.All.first().toString();
		
		this.showIndices = false;
		
	    this.gui = new dat.GUI();
		this.gui.width = 400;
	    this.gui.add(this, "activeAction", dict).name("Actions");
		this.gui.add(this, "removeActions").name("Remove all actions");
		this.gui.add(this, "removeActors").name("Remove all actors");
		this.gui.add(this.logic, "showText").name("Show text baloons");
		
		
		this.lastPlayerAction = Action.Nothing;
		this.lastLevelAction  = Action.Enemy;
		this.tick             = new Timer(200);

		this.actions = [];
		this.actors  = [];
		
		this.input.subscribe(Input.LEFT_DOWN, this.onLeftDown.bind(this));
		this.load();
    }
	
	Evermoar.prototype.removeActions = function() {
		if(this.actions.length > 0 && confirm("Remove all actions from the map?")) {
			this.actions.clear();
			
			this.save();
		}
	};
	
	Evermoar.prototype.removeActors = function() {
		if(this.actors.length > 0 && confirm("Remove all actors from the map?")) {
			this.actors.clear();
			
			this.save();
		}
	};
    
	Evermoar.prototype.evolve = function() {
		// genius code
	};
	
	Evermoar.prototype.handleAction = function(action) {		
		this.actions.push(action);
		
		// Blackbox AI
		this.logic.handleAction(action, this.actors);
	};
	
	Evermoar.prototype.onLeftDown = function(input) {
		
		if(this.type == "remove") {
			var radius = 15;
			this.actions = this.actions.filter(function(item) {
				return ! (Math.hypot(item.x - input.x, item.y - input.y) < 10);
			});
			
			this.actors = this.actors.filter(function(item) {
				return ! (Math.hypot(item.x - input.x, item.y - input.y) < 10);
			});
			
		} else {
			var instance = Action.Lookup(this.activeAction).clone(input.x, input.y);
			
			if(instance.category == "action") {
				this.handleAction(instance);
				
			} else {
				this.actors.push(instance);
			}
		}
		
		
		this.save();
	};

	Evermoar.prototype.save = function() {
		var out = {
			"actions": this.actions.map(function(item) { return item.toObject(); }),
			"actors":  this.actors.map(function(item) { return item.toObject(); }),
			"width":   this.width,
			"height":  this.height,
		};
		
		localStorage.setItem("map", JSON.stringify(out));
	};
	
	Evermoar.prototype.load = function() {
		
		var data = localStorage.getItem("map");
		
		if(data) {
			if(data = JSON.TryParse(data)) {
		
				// Rescaling item position back to their relative position.
				var ratiox = this.width / (data.width  || this.width);
				var ratioy = this.height / (data.height || this.height);
				
				if(data.actions) {
					this.actions = data.actions.map(function(item) {
						item.x *= ratiox;
						item.y *= ratioy;
					
						return Action.fromObject(item);
					});
				}
				
				if(data.actors) {
					this.actors = data.actors.map(function(item) {
						item.x *= ratiox;
						item.y *= ratioy;
					
						return Action.fromObject(item);
					});
				}
				console.log("Loaded " + this.actions.length + " action(s) and " + this.actors.length + " actor(s).");
			} else {
				console.log("Malformed localStorage. Try clearing it.");
			}
		} else {
			console.log("Nothing inside localStorage.");
		}
		
	};
	
    Evermoar.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
		this.input.cursor(Input.Cursor.POINTER);

		if(this.tick.expired()) {
			var player = this.player.handleAction(this.lastLevelAction);
			
			console.log("In: " , this.lastLevelAction + ", out: " , player);
			
			this.actions.push(player);
		}
		
    };
	
    
    Evermoar.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
		var showIndices = this.showIndices;
		
		renderer.styled("<bold><10px><yellow>the <hotpink><Courier New><30px>EVERMOAR<10px><yellow> simulator v1", -this.hw + 10, this.hh - 30, "left", "bottom")
		
		this.actors.forEach(function(action, i) {
			renderer.texture(action.texture, action.x, action.y);
			
			if(showIndices){
				renderer.text(i, action.x+1, action.y-1, "black", "center", "middle", "bold 10px monospace");
				renderer.text(i, action.x, action.y, "white", "center", "middle", "10px monospace");
			}
		});
		
		this.actions.forEach(function(action, i) {
			renderer.texture(action.texture, action.x, action.y);
			
			if(showIndices){
				renderer.text(i, action.x+1, action.y-1, "black", "center", "middle", "bold 10px monospace");
				renderer.text(i, action.x, action.y, "white", "center", "middle", "10px monospace");
			}
		});

		
    };
    
    return Evermoar;
});
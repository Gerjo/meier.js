define(function(require){
    var Game   = require("meier/engine/Game");
    var Input  = require("meier/engine/Input");
    var dat    = require("meier/contrib/datgui");
    var Sprite = require("meier/prefab/Sprite");
	var World  = require("./World");
	var Action = require("./Action");
	var Timer  = require("meier/extra/Timer");

    Time.prototype = new Game();
	
    function Time(container) {        
        Game.call(this, container);
		this.logger.hideInternals();
		
		
		this.add(new Sprite(0, 0, this.width, this.height, "images/background.png"))
		this.add(this.world = new World(this.width, this.height));

		
		var actions = [
			new Action("Walk", "images/feet.png", "action"),
			new Action("Kill something", "images/skull.png", "action"),
			new Action("Violence", "images/violence.png", "action"),
			new Action("Friendly talk", "images/talk.png", "action"),
			new Action("Violent talk", "images/violenttalk.png", "action"),
			new Action("Die yourself", "images/cross.png", "action"),
			new Action("Enemy person", "images/redperson.png", "actor"),
			new Action("Some person", "images/blackperson.png", "actor"),
			new Action("Spawn location", "images/home.png", "actor"),
			new Action("Side quest", "images/side_quest.png", "actor"),
			new Action("Main quest", "images/kill_dragon.png", "actor"),
			new Action("Remove selected", null, null)
		];
		
		var dict = this.dict = {};
		actions.forEach(function(action) {
			dict[action] = action;
		});
		
		this.activeAction = actions.first().toString();
		
	    this.gui = new dat.GUI();
		this.gui.width = 400;
	    this.gui.add(this, "activeAction", dict).name("Actions");
		this.gui.add(this, "evolve").name("Evolve world");
		this.gui.add(this, "removeActions").name("Remove all actions");
		this.gui.add(this, "removeActors").name("Remove all actors");
		this.gui.add(this, "startReplay").name("Replay all actions");
		
		this.actions = [];
		this.actors  = [];
		this.replay  = [];
		this.replayInterval = new Timer(200);
		
		this.input.subscribe(Input.LEFT_DOWN, this.onLeftDown.bind(this));
		
		this.load();
    }
	
	
	Time.prototype.startReplay = function() {
		
		console.log(this);
		
		this.replay = this.actions.clone();
		this.actions.clear();
	};
	
	
	Time.prototype.removeActions = function() {
		if(this.actions.length > 0 && confirm("Remove all actions from the map?")) {
			this.actions.clear();
			
			this.save();
		}
	};
	
	Time.prototype.removeActors = function() {
		if(this.actors.length > 0 && confirm("Remove all actors from the map?")) {
			this.actors.clear();
			
			this.save();
		}
	};
    
	Time.prototype.evolve = function() {
		// genius code
	};
	
	Time.prototype.handleAction = function(action) {
		
		
		this.actions.push(action);
		
		console.clear();
		
		switch(action.text) {
		case "Walk":
			var distance  = 0;
			var lastwalk  = null;
			
			for(var i = 0; i < this.actions.length; ++i) {
				var action = this.actions[i];
				
				if(action.text == "Walk") {
					if(lastwalk != null) {
						distance += Math.hypot(lastwalk.x - action.x, lastwalk.y - action.y);
					}
					
					lastwalk = action;
				}
			}
			
			console.log("Traveled thus far: " + distance);
			
			break;
		default:
			console.log(action.toString());
		}
		
		
	};
	
	Time.prototype.onLeftDown = function(input) {
		
		if(this.activeAction == "Remove selected") {
			var radius = 15;
			this.actions = this.actions.filter(function(item) {
				return ! (Math.hypot(item.x - input.x, item.y - input.y) < 10);
			});
			
			this.actors = this.actors.filter(function(item) {
				return ! (Math.hypot(item.x - input.x, item.y - input.y) < 10);
			});
			
		} else {
			var instance = this.dict[this.activeAction].clone(input.x, input.y);
			
			if(instance.type == "action") {
				this.handleAction(instance);
				
			} else {
				this.actors.push(instance);
			}
		}
		
		
		this.save();
	};

	Time.prototype.save = function() {
		var out = {
			"actions": this.actions.map(function(item) { return item.toObject(); }),
			"actors":  this.actors.map(function(item) { return item.toObject(); }),
			"width": this.width,
			"height": this.height,
		};
		
		localStorage.setItem("map", JSON.stringify(out));
	};
	
	Time.prototype.load = function() {
		
		var data = localStorage.getItem("map");
		
		if(data) {
			if(data = JSON.TryParse(data)) {
		
				// Rescaling item position back to their relative position.
				var ratiox = this.width / (data.width  || this.width);
				var ratioy = this.height / (data.height || this.height);
				
			
				this.actions = data.actions.map(function(item) {
					item.x *= ratiox;
					item.y *= ratioy;
					
					return Action.fromObject(item);
				});
				
				this.actors = data.actors.map(function(item) {
					item.x *= ratiox;
					item.y *= ratioy;
					
					return Action.fromObject(item);
				});
				
				console.log("Loaded " + this.actions.length + " action(s) and " + this.actors.length + " actor(s).");
			} else {
				console.log("Malformed localStorage. Try clearing it.");
			}
		} else {
			console.log("Nothing inside localStorage.");
		}
		
	};
	
    Time.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
		this.input.cursor(Input.Cursor.POINTER);
		
		if(this.replay.length > 0) {
			if(this.replayInterval.expired()) {
				this.handleAction(this.replay.shift());
			}
		}
		
    };
    
    Time.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
		renderer.styled("<30px><bold><hotpink><Courier New>EVERMOAR<10px><yellow> simulator v1", -this.hw + 10, this.hh - 30, "left", "bottom")
		
		this.actions.forEach(function(action, i) {
			renderer.texture(action.texture, action.x, action.y);
			renderer.text(i, action.x+1, action.y-1, "black", "center", "middle", "bold 10px monospace")
			renderer.text(i, action.x, action.y, "white", "center", "middle", "10px monospace")
		});
		
		this.actors.forEach(function(action, i) {
			renderer.texture(action.texture, action.x, action.y);
			renderer.text(i, action.x+1, action.y-1, "black", "center", "middle", "bold 10px monospace")
			renderer.text(i, action.x, action.y, "white", "center", "middle", "10px monospace")
		});
		
    };
    
    return Time;
});
define(function(require){
    var Game   = require("meier/engine/Game");
    var Input  = require("meier/engine/Input");
    var dat    = require("meier/contrib/datgui");
    var Sprite = require("meier/prefab/Sprite");
	var World  = require("./World");
	var Action = require("./Action");

    Time.prototype = new Game();
	
    function Time(container) {        
        Game.call(this, container);
		this.logger.hideInternals();
		
		
		this.add(new Sprite(0, 0, this.width, this.height, "images/background.png"))
		this.add(this.world = new World(this.width, this.height));

		
		var actions = [
			new Action("Kill something", "images/skull.png", "action"),
			new Action("Violence", "images/violence.png", "action"),
			new Action("Friendly talk", "images/talk.png", "action"),
			new Action("Violent talk", "images/violenttalk.png", "action"),
			new Action("Walk", "images/feet.png", "action"),
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
		
		this.actions = [];
		this.actors  = [];
		
		this.input.subscribe(Input.LEFT_DOWN, this.onLeftDown.bind(this));
		
		this.load();
    }
	
	Time.prototype.removeActions = function() {
		if(this.actions.length > 0 && confirm("Remove all actions from the map?")) {
			this.actions.clear();
		}
	};
	
	Time.prototype.removeActors = function() {
		if(this.actors.length > 0 && confirm("Remove all actors from the map?")) {
			this.actors.clear();
		}
	};
    
	Time.prototype.evolve = function() {
		// genius code
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
				this.actions.push(instance);
			} else {
				this.actors.push(instance);
			}
		}
		
		
		this.save();
	};
	
	Time.prototype.save = function() {
		var out = {
			"actions": this.actions.map(function(item) { return item.toObject(); }),
			"actors":  this.actors.map(function(item) { return item.toObject(); })
		};
		
		localStorage.setItem("map", JSON.stringify(out));
	};
	
	Time.prototype.load = function() {
		
		var data = localStorage.getItem("map");
		
		if(data) {
			if(data = JSON.TryParse(data)) {
				console.log(data);
				
				this.actions = data.actions.map(function(item) {
					return Action.fromObject(item);
				});
				
				this.actors = data.actors.map(function(item) {
					return Action.fromObject(item);
				});
				
				
			}
		}
		
	};
	
    Time.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
		this.input.cursor(Input.Cursor.POINTER);
    };
    
    Time.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
		renderer.styled("<30px><bold><hotpink><Courier New>EVERMOAR<10px><yellow> simulator v1", -this.hw + 10, this.hh - 30, "left", "bottom")
		
		this.actions.forEach(function(action, i) {
			renderer.texture(action.texture, action.x, action.y);
			renderer.text(i, action.x, action.y, "red", "center", "middle", "10px monospace")
		});
		
		this.actors.forEach(function(action, i) {
			renderer.texture(action.texture, action.x, action.y);
			renderer.text(i, action.x, action.y, "red", "center", "middle", "10px monospace")
		});
		
    };
    
    return Time;
});
define(function(require) {
	
	var Texture = require("meier/engine/Texture");
	
	function Action(type, text, texture, category, x, y) {
		this.type    = type || "unknown";
		this.x       = x || 0;
		this.y       = y || 0;
		this.category    = category || null
		this.texture = new Texture(texture);
		this.text    = text || "Default Action";
		this.time    = NaN;
	}
	
	Action.prototype.clone = function(x, y) {
		
		x = isNaN(x) ? this.x : x;
		y = isNaN(y) ? this.y : y;
		
		return new Action(this.type, this.text, this.texture._url, this.category, x, y);
	};
	
	Action.prototype.toString = function() {
		return this.type;
	};
	
	Action.prototype.toObject = function() {
		return {
			x:        this.x,
			y:        this.y,
			type:     this.type,
			category: this.category,
			texture:  this.texture._url,
			text:     this.text
		};
	};
	
	Action.prototype.is = function(other) {
		return this.type == other.type;
	};
	
	Action.fromObject = function(json) {
		return new Action(json.type, json.text, json.texture, json.category, json.x, json.y);
	};
		
	Action.All = [
		new Action("walk",       "Walk", "images/feet.png", "action"),
		new Action("kill",       "Kill something", "images/skull.png", "action"),
		new Action("violence",   "Violence", "images/violence.png", "action"),
		new Action("friendlyTalk", "Friendly talk", "images/talk.png", "action"),
		new Action("violentTalk",  "Violent talk", "images/violenttalk.png", "action"),
		new Action("die",        "Die yourself", "images/cross.png", "action"),
		new Action("enemy",      "Enemy person", "images/redperson.png", "actor"),
		new Action("person",     "Some person", "images/blackperson.png", "actor"),
		new Action("spawn",      "Spawn location", "images/home.png", "actor"),
		new Action("sideQuest", "Side quest", "images/side_quest.png", "actor"),
		new Action("mainQuest", "Main quest", "images/kill_dragon.png", "actor"),
		new Action("nothing",    "nothing", null, null),
		new Action("remove",     "Remove selected", null, null)
	];	
	
	Action.All.forEach(function(item) {
		Action[item.type.ucFirst()] = item;
	});
	
	Action.Lookup = function(type) {
		return Action.All.find(function(item) {
			return item.type == type;
		});
	}
	
		
	return Action;
});
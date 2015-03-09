define(function(require) {
    var FuzzyLogic = require("meier/extra/FuzzyLogic");
	var Entity     = require("meier/engine/Entity");
	var Vec2       = require("meier/math/Vec")(2);
	var Math       = require("meier/math/Math");
	
	Logic.prototype = new Entity();
	
	function Logic() {
		Entity.call(this, 0, 0);
		
		this.showText = true;
		this.texts = [];
		this.actors = [];
		
		var brain = this.brain = new FuzzyLogic();
		
        brain.define("sinceLastViolentAction", 0, 40 /* unbounded? */, {
            "never_violent"      : brain.triangle(0.0, 1.0, 1.0),
            "somewhat_violent"   : brain.triangle(0.0, 1/2, 1.0),
            "recent_violent"     : brain.triangle(0.0, 0.0, 1.0)
        });
		
        brain.define("nearestQuest", 0, 300 /* unbounded? */, {
            "quest_far"        : brain.triangle(0.0, 1.0, 1.0),
            "quest_medium"     : brain.triangle(0.0, 1/2, 1.0),
            "quest_near"       : brain.triangle(0.0, 0.0, 1.0)
        });
		
        brain.define("ticks", 0, 60 /* unbounded? */, {
            "playing_long"        : brain.triangle(0.0, 1.0, 1.0),
            "moderately_long"     : brain.triangle(0.0, 1/2, 1.0),
            "just_started"        : brain.triangle(0.0, 0.0, 1.0)
        });
		/*
		brain.rule("just_started", function() {
			this.log("just_started");
		}.bind(this));
		
		brain.rule("moderately_long", function() {
			this.log("moderately_long");
		}.bind(this));
		
		brain.rule("playing_long", function() {
			this.log("playing_long");
		}.bind(this));
		*/
		brain.rule("quest_far and never_violent and playing_long", function() {
			this.log("Very bored");
		}.bind(this));
		
		brain.rule("quest_medium and not recent_violent", function() {
			this.log("meh");
		}.bind(this));
		
		brain.rule("quest_near or recent_violent", function() {
			this.log("Entertained");
		}.bind(this));
		
		this.reset();
	}
	
	
	Logic.prototype.sinceLastViolentAction = function() {
		var a = ("Violence" in this.lastEventType) ? (this.ticks - this.lastEventType["Violence"]) : Infinity;
		
		return a;
	};
	
	Logic.prototype.nearestQuest = function() {
				
		return this.actors.reduce(function(nearest, actor) {			
			if(actor.text == "Side quest") {				
				return Math.min(
					Math.hypot(actor.x - this.location.x, actor.y - this.location.y),
					nearest
				);
			}
			
			return nearest;
		}.bind(this), Infinity);
	};
	
	Logic.prototype.reset = function() {
		this.texts.clear();
		this.distanceTravelled = 0;
		this.spawn             = null;
		this.location          = null;
		this.ticks             = 0;
		this.lastEventType     = {};
	};
			
	Logic.prototype.handleAction = function(action, actors) {
		
		this.actors = actors;
		
		// Advance time
		this.ticks += 1;
		
		if(this.spawn == null) {
			this.location = this.spawn = actors.reduce(function(p, c) {
				if(c.text == "Spawn location") {
					return new Vec2(c.x, c.y);
				} else {
					return p;
				}
			}.bind(this));
		}
		
		var pos = this.location = new Vec2(action.x, action.y);
		
		// Record time of last action type
		this.lastEventType[action.text] = this.ticks;
		
		//console.log(action.text + ": " + this.sinceLastViolentAction());
		
		// Handle action specific things
		switch(action.text) {
		case "Walk":
			this.distanceTravelled += this.location.distance(pos);
			this.location = pos;
		}
				
		// Reason about the current state.
		this.brain.reason(this);	
	};
	
	Logic.prototype.update = function() {
		
	};
	
	Logic.prototype.log = function(text) {
		if(this.texts.empty() || this.texts.last().text != text) {
			this.texts.push({
				text: text,
				pos: this.location
			});
		}
	};
	
	Logic.prototype.draw = function(renderer) {
		
		if(this.showText) {
			this.texts.forEach(function(entry) {
				renderer.begin();
				renderer.rectangle(entry.pos.x, entry.pos.y, entry.text.length * 6.5, 20);
				renderer.fill("black");
			
				renderer.text(entry.text, entry.pos.x, entry.pos.y, "white", "center", "middle", "100 10px monospace");
			});
		}
	};	
	
	return Logic;
});
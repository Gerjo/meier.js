define(function(require) {
    var FuzzyLogic = require("meier/extra/FuzzyLogic");
	var Entity     = require("meier/engine/Entity");
	var Vec2       = require("meier/math/Vec")(2);
	var Math       = require("meier/math/Math");
	
	var Action     = require("./Action");
	
	Logic.prototype = new Entity();
	
	function Logic() {
		Entity.call(this, 0, 0);
		
		this.showText = true;
		this.texts = [];
		this.deaths = 0;
		
		var brain = this.brain = new FuzzyLogic();
		
        brain.define("sinceLastViolentAction", 0, 40 /* unbounded? */, {
            "never_violent"      : brain.triangle(0.0, 1.0, 1.0),
            "somewhat_violent"   : brain.triangle(0.0, 1/2, 1.0),
            "recent_violent"     : brain.triangle(0.0, 0.0, 1.0)
        });
		
        brain.define("sinceLastFriendlyTalk", 0, 40 /* unbounded? */, {
            "never_talks"      : brain.triangle(0.0, 1.0, 1.0),
            "somewhat_talks"   : brain.triangle(0.0, 1/2, 1.0),
            "recent_talk"      : brain.triangle(0.0, 0.0, 1.0)
        });
	
        brain.define("nearestQuest", 0, 300 /* unbounded? */, {
            "quest_far"        : brain.triangle(0.0, 1.0, 1.0),
            "quest_medium"     : brain.triangle(0.0, 1/2, 1.0),
            "quest_near"       : brain.triangle(0.0, 0.0, 1.0)
        });
		
        brain.define("ticks", 0, 300 /* unbounded? */, {
            "playing_long"        : brain.triangle(0.0, 1.0, 1.0),
            "moderately_long"     : brain.triangle(0.0, 1/2, 1.0),
            "just_started"        : brain.triangle(0.0, 0.0, 0.25)
        });
		
        brain.define("deaths", 0, 10 /* unbounded? */, {
            "many_deaths"       : brain.triangle(0.0, 1.0, 1.0),
            "semi_died"         : brain.triangle(0.0, 1/2, 1.0),
            "never_died"        : brain.triangle(0.0, 0.0, 0.5)
        });
		
		
		brain.subrule("just_started and never_violent", "is_starter");
		
		brain.rule("quest_far and never_violent and not is_starter", function() {
			this.log("Very bored");
			
			return Action.Enemy;
		}.bind(this), "Is really bored?");
		
		brain.rule("quest_medium and not recent_violent", function() {
			this.log("somewhat bored");
			
			return Action.Enemy;
		}.bind(this), "Is somewhat bored?");
		
		brain.rule("quest_near or recent_violent or just_started", function() {
			this.log("Entertained");
			
			return Action.Nothing;
		}.bind(this), "Is entertained?");
		
		this.reset();
	}
	
	Logic.prototype.sinceLastFriendlyTalk = function() {
		var type = Action.FriendlyTalk.type;
		return (type in this.lastEventType) ? (this.ticks - this.lastEventType[type]) : Infinity;
	};
	
	
	Logic.prototype.sinceLastViolentAction = function() {
		var type = Action.Violence.type;
		return (type in this.lastEventType) ? (this.ticks - this.lastEventType[type]) : Infinity;
	};
	
	Logic.prototype.nearestQuest = function() {
				
		return this.game.reactions.reduce(function(nearest, actor) {			
			if(actor.is(Action.SideQuest)) {				
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
			
	Logic.prototype.getReaction = function(actions) {
		
		var action = actions.last();
		
		// Advance time
		this.ticks += 1;
		
		if(this.spawn == null) {
			this.location = this.spawn = actions.reduce(function(p, c) {
				if(c.is(Action.Spawn)) {
					return new Vec2(c.x, c.y);
				} else {
					return p;
				}
			}.bind(this), null);
		}
		
		var pos = this.location = new Vec2(action.x, action.y);
		
		// Record time of last action type
		this.lastEventType[action.type] = this.ticks;
		
		
		// Handle action specific things
		switch(action.type) {
		case Action.Walk.type:
			this.distanceTravelled += this.location.distance(pos);
			this.location = pos;
		}
				
		// Reason about the current state.
		var out = this.brain.reason(this);
		
		return out.clone(pos.x, pos.y);
	};
	
	Logic.prototype.update = function() {
		
	};
	
	Logic.prototype.log = function(text) {
		if(this.texts.empty() || this.texts.last().text != text) {
			this.texts.push({
				text: text,
				pos:  this.location
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
		
		this.brain.draw(renderer, { width: 200, height: 40, y: -this.game.hh });
		
	};	
	
	return Logic;
});
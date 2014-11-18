define(function(require) {
	var Color  = require("meier/engine/Colors");
	var Input  = require("meier/engine/Input");
	var Key    = require("meier/engine/Key");
	var Random = require("meier/math/Random");
    var TextBubble = require("meier/prefab/TextBubble");
	var Moveable   = require("./Moveable");
    var FuzzyLogic = require("meier/extra/FuzzyLogic");
    var math       = require("meier/math/Math");

	Ghost.prototype = new Moveable();

	function Ghost(tile, world) {
		Moveable.call(this, tile, world);

		this.color = Color.Green;
        
        this.path = [];
        
        var brain = this.brain = new FuzzyLogic();

        this.foo = 7;
        
        brain.define("distanceToPacman", 0, world.diagonal(), {
            "pacman_near"  : brain.triangle(0.0, 0.0, 1/3),
            "pacman_med"   : brain.triangle(0.0, 1/3, 2/3),
            "pacman_far"   : brain.triangle(1/3, 2/3, 1.0)
        });
        
        brain.define("distanceToGhost", 0, world.diagonal(), {
            "ghost_near"  : brain.triangle(0.0, 0.0, 1/3),
            "ghost_med"   : brain.triangle(0.0, 1/3, 2/3),
            "ghost_far"   : brain.triangle(1/3, 2/3, 1.0)
        });
        
        // ??
        brain.define("sinceLastPellet", 0, world.baseTime(), {
            "pellet_short"  : brain.triangle(0.0, 0.0, 2/3),
            "pellet_med"    : brain.triangle(0.0, 2/3, 1.0),
            "pellet_long"   : brain.triangle(2/3, 1.0, 1.0)
        });
        
        // 
        brain.define("timeLife", 0, world.baseTime(), {
            "time_life_short"  : brain.triangle(0.0, 0.0, 0.5),
            "time_life_medium" : brain.triangle(0.0, 0.5, 1.0),
            "time_life_long"   : brain.triangle(0.0, 1.0, 1.0)
        });
        
        // what upper bound?
        brain.define("pelletRate", 0,1, {
            "pellet_rate_bad"    : brain.triangle(0.0, 0.0, 1.0),
            "pellet_rate_medium" : brain.triangle(0.0, 0.5, 1.0),
            "pellet_rate_good"   : brain.triangle(0.0, 1.0, 1.0)
        });
        
        brain.rule("pacman_near and (time_life_long or pellet_rate_good)", this.hunting.bind(this));
        brain.rule("pacman_near and (time_life_medium or pellet_rate_medium) and pellet_med", this.hunting.bind(this));
        brain.rule("pacman_near and (time_life_medium or pellet_rate_medium) and pellet_long", this.hunting.bind(this));
        brain.rule("pacman_med and (time_life_long or pellet_rate_good) and pellet_long", this.hunting.bind(this));
        brain.rule("pacman_med and (time_life_medium or pellet_rate_medium) and pellet_long", this.hunting.bind(this));
        brain.rule("pacman_far and (time_life_long or pellet_rate_good) and pellet_long", this.hunting.bind(this));
        
        brain.rule("pacman_far and (time_life_short or pellet_rate_bad) and ghost_far and pellet_short", this.defense.bind(this));
        brain.rule("pacman_far and (time_life_short or pellet_rate_bad) and ghost_med and pellet_med", this.defense.bind(this));
        brain.rule("pacman_far and (time_life_short or pellet_rate_bad) and ghost_med and pellet_short", this.defense.bind(this));
        brain.rule("pacman_far and (time_life_short or pellet_rate_bad) and ghost_med and pellet_med", this.defense.bind(this));
        brain.rule("pacman_far and (time_life_short or pellet_rate_bad) and ghost_far and pellet_short", this.defense.bind(this));
        brain.rule("pacman_med and (time_life_short or pellet_rate_bad) and ghost_far and pellet_short", this.defense.bind(this));

        brain.rule("pacman_far and (time_life_short or pellet_rate_bad) and ghost_near and pellet_short", this.shy.bind(this));
        brain.rule("pacman_far and (time_life_short or pellet_rate_bad) and ghost_near and pellet_med", this.shy.bind(this));
        brain.rule("pacman_far and (time_life_short or pellet_rate_bad) and ghost_med and pellet_short", this.shy.bind(this));
        brain.rule("pacman_far and (time_life_short or pellet_rate_bad) and ghost_med and pellet_med", this.shy.bind(this));
        brain.rule("pacman_far and (time_life_medium or pellet_rate_medium) and ghost_near and pellet_short", this.shy.bind(this));
        brain.rule("pacman_med and (time_life_short or pellet_rate_bad) and ghost_near and pellet_short", this.shy.bind(this));
	}
    
    Ghost.prototype.pelletRate = function() {
        return this.game.player.pelletRate();
    };
    
    Ghost.prototype.timeLife = function() {
        return this.game.player.timeLife();
    };
    
    Ghost.prototype.sinceLastPellet = function() {
        return this.game.player.sinceLastPellet();
    };
    
    Ghost.prototype.reason = function() {
        this.brain.reason(this);        
    };
    
    Ghost.prototype.distanceToPacman = function() {
        return this.position.distance(this.game.player.position);
    };
    
    Ghost.prototype.distanceToGhost = function() {
        var distance = +Infinity;
        
        this.game.ghosts.forEach(function (ghost) {
            if(ghost != this) {
                var tmp = this.position.distance(ghost.position);
                
                if(tmp < distance) {
                    distance = tmp;
                }
            }
        }.bind(this));
        
        return distance;
    };
    
    Ghost.prototype.hunting = function(score) {
        this.world.add(new TextBubble(this.position.x, this.position.y, "hunting(" + score.toFixed(2) + ")"));
        
        this.moveTo(this.world.atPosition(this.game.player.position));
    };
    
    Ghost.prototype.defense = function(score) {
        this.world.add(new TextBubble(this.position.x, this.position.y, "defense(" + score.toFixed(2) + ")"));
        
        
        var distribution = this.world.pelletDistribution();

        var max = math.ArgMax(distribution, math.ItemGetter("sum"));
        
        this.moveTo(distribution[max].tile);
    };
    
    Ghost.prototype.shy = function(score) {
        this.world.add(new TextBubble(this.position.x, this.position.y, "shy(" + score.toFixed(2) + ")"));
        
        var ghosts = this.game.ghosts;
        
        // Find nearest ghost
        var min = math.ArgMin(ghosts, function(ghost) {
            if(ghost == this) {
                return Infinity;
            }
            
            return ghost.position.distance(this.position);
        }.bind(this));
        
        // Walkable neighbours around the current ghost
        var neighbours = this.world.walkableNeighboursOf(this.getTile());

        // Find neighbouring tile farthest away from nearest ghost        
        var far = math.ArgMax(neighbours, function(tile) {
            return tile.position.distance(ghosts[min].position);
        });
        
        this.moveTo(neighbours[far]);
       
        //this.target = neighbours[far];
    };

	Ghost.prototype.atDestination = function(tile) {
        if(this.path.length > 0) {
            this.target = this.path.shift();
        }
	};

	Ghost.prototype.random = function(tile) {
		var directions = ["rightOf", "leftOf", "aboveOf", "belowOf"].shuffle();

		while( ! directions.empty()) {
			var fn = directions.pop();

			var candidate = this.world[fn](tile);

			if(candidate && ! candidate.wall) {
				this.target = candidate;
				break;
			}
		}
	};

	Ghost.prototype.atIntermediate = function(tile) {

		var count = 0;

		count += this.world.isWalkable(this.world.aboveOf(tile));
		count += this.world.isWalkable(this.world.rightOf(tile));
		count += this.world.isWalkable(this.world.leftOf(tile));
		count += this.world.isWalkable(this.world.belowOf(tile));

		if(count > 2) {
			//this.updatePath();
		}

        if(this.path.length > 0) {
		    this.target = this.path.shift();
        }
	};


	Ghost.prototype.draw = function(renderer) {
		renderer.begin();
		renderer.circle(0, 0, this.width);
		renderer.fill(this.color);

		if(this.target) {
			renderer.text(this.target.id, 0, 0);
		}
                
        renderer.begin();
        this.path.forEach(function(tile) {
            renderer.rectangle(this.toLocal(tile.position), 10, 10);
        }.bind(this));
        renderer.stroke("black");
        
        //console.log(this.distanceToPacman() / this.world.diagonal());
	};

	return Ghost;
});
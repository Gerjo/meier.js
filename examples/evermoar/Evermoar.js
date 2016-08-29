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
		
		
		this.add(new Sprite(0, this.height/4, this.width, this.height/2, "images/background.png"))
		this.add(this.world = new World(this.width, this.height));
		this.add(this.logic = new Logic());
		this.add(this.player = new Player());
		
		
	    //this.gui = new dat.GUI();
		//this.gui.width = 400;
		//this.gui.add(this.logic, "showText").name("Show text baloons");
		
		
		this.tick             = new Timer(500);

		this.actions    = [Action.Nothing];	// Player sourced
		this.reactions  = [Action.SideQuest.clone(280, this.hh * 0.5 - 180)];	// Level sourced		
    }
	
    Evermoar.prototype.iterate = function(dt) {
		var action   = this.player.getAction(this.reactions);
		this.actions.push(action);
		
		var reaction = this.logic.getReaction(this.actions);
		this.reactions.push(reaction);

		console.log("In: " + action + ", out: " + reaction);
		
	};
	
    Evermoar.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
		this.input.cursor(Input.Cursor.POINTER);

		if(this.tick.expired()) {
			//this.iterate();
		}
		
    };
	
    
    Evermoar.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
		var showIndices = this.showIndices;
		
		renderer.styled("<bold><10px><yellow>the <hotpink><Courier New><30px>EVERMOAR<10px><yellow> simulator v1", -this.hw + 10, this.hh - 30, "left", "bottom")
		
		this.actions.forEach(function(action, i) {
			if(action.texture) {
				renderer.texture(action.texture, action.x, action.y);
			
				if(showIndices){
					renderer.text(i, action.x+1, action.y-1, "black", "center", "middle", "bold 10px monospace");
					renderer.text(i, action.x, action.y, "white", "center", "middle", "10px monospace");
				}
			}
		});
		
		this.reactions.forEach(function(action, i) {
			
			if(action.texture) {
				renderer.texture(action.texture, action.x, action.y);
			
				if(showIndices){
					renderer.text(i, action.x+1, action.y-1, "black", "center", "middle", "bold 10px monospace");
					renderer.text(i, action.x, action.y, "white", "center", "middle", "10px monospace");
				}
			}
		});
    };
	
    return Evermoar;
});
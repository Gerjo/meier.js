define(function(require){
    var Game = require("meier/engine/Game");
    var Input = require("meier/engine/Input");
    var Freeform = require("meier/extra/Freeform");
    var dat     = require("meier/contrib/datgui");
	
    App.prototype = new Game();
    
    function App(container) {        
        Game.call(this, container);

		this.setFps(60);

		this.mls = {
			sigma: 1.2,
			vertices: 32
		};

        this.gui = new dat.GUI();
        this.gui.width = 300;
        
        var folder = this.gui.addFolder("Moving Least Squares");
		folder.add(this.mls, "sigma", 0.01, 5, 0.01).onChange(this.smoothen.bind(this));
		folder.add(this.mls, "vertices", 1, 350, 1).onChange(this.smoothen.bind(this));
		folder.open();
		 
    	//folder.add(this, 'numEntities', 1, 50, 0.01);
		
		
		this.freeforms = [];
		
		this.input.subscribe(Input.LEFT_DOWN, this.onLeftDown.bind(this));
		this.input.subscribe(Input.LEFT_UP, this.onLeftUp.bind(this));
    }
	
	App.prototype.smoothen = function() {
		this.freeforms.forEach(function(freeform) {
			if( ! freeform.original) {
				freeform.original = freeform.polygon.clone();
			}
			
			freeform.polygon = freeform.original.mls(
				this.mls.sigma,
				this.mls.vertices
			);
		}.bind(this));
	};
	
	App.prototype.onLeftDown = function() {
		
		this.freeforms.execute("destroy").clear();
		
		this.freeforms.push(this.add(new Freeform()));
		
		this.freeforms.last().record();
	};
	
	App.prototype.onLeftUp = function() {
		this.freeforms.last().stop();		
	};
		
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    App.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
		if(this.freeforms.isEmpty()) {
			
			renderer.styled("<black><17px>Hold your left mouse button down, and draw some shape on this canvas.", 0, 0, "center", "center");
			
		}
		
    };
    
    return App;
});
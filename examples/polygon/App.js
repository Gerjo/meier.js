define(function(require){
    var Game     = require("meier/engine/Game");
    var Input    = require("meier/engine/Input");
    var Freeform = require("meier/prefab/Freeform");
    var dat      = require("meier/contrib/datgui");
	var Math     = require("meier/math/Math");
	var Average     = require("meier/math/Average");
	
    App.prototype = new Game();
    
    function App(container) {        
        Game.call(this, container);

		this.setFps(15);

		this.mls = {
			sigma: 10,
			vertices: 32
		};

		this.doResample = false;
		this.resampleCount = 30;

        this.gui = new dat.GUI();
        this.gui.width = 300;
        
        var folder = this.gui.addFolder("Moving Least Squares");
		folder.add(this.mls, "sigma", 0.1, 30, 0.1).name("Gaussian Sigma").onChange(this.smoothen.bind(this));
		folder.add(this.mls, "vertices", 1, 350, 1).name("# Vertices").onChange(this.smoothen.bind(this));
		folder.add(this, "doResample").name("Uniform Resample").onChange(this.smoothen.bind(this));
		folder.add(this, "resampleCount", 1, 300, 1).name("# Resamples").onChange(this.smoothen.bind(this));
		
		folder.open();
		
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
				Math.pow(this.mls.sigma / 10, 3),
				this.mls.vertices
			);
			
			if(this.doResample) {
				freeform.polygon = freeform.polygon.uniformResample(this.resampleCount);
			}
		}.bind(this));
	};
	
	App.prototype.onLeftDown = function() {
		
		this.freeforms.execute("destroy").clear();
		
		this.freeforms.push(this.add(new Freeform()));
		
		this.freeforms.last().record();
	};
	
	App.prototype.onLeftUp = function() {
		
		if( ! this.freeforms.isEmpty()) {
			this.freeforms.last().stop();	

			this.smoothen();	
		
			if(this.freeforms.last().isEmpty()) {
				this.freeforms.pop();
			}
		}
	};
		
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);      
    };
    
    App.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
		
		this.freeforms.forEach(function(freeform) {
			renderer.begin();
			renderer.polygon(freeform.original);
			renderer.stroke("blue");
		});
		
        
		if(this.freeforms.isEmpty()) {
			renderer.styled("<black><17px>Hold your left mouse button down, and draw some shape on this canvas.", 0, 0, "center", "center");
		} else {
			
			if( ! this.freeforms.last().isRecording()) {
				renderer.styled("<black><17px>Click & drag anywhere to draw again.", 0, -this.hh+10, "center", "bottom");			
			}
		}
		
		
		
    };
    
    return App;
});
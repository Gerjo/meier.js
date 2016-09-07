define(function(require){
    var Game     = require("meier/engine/Game");
    var Color    = require("meier/engine/Colors");
    var Input    = require("meier/engine/Input");
    var Freeform = require("meier/prefab/Freeform");
    var dat      = require("meier/contrib/datgui");
	var Math     = require("meier/math/Math");
	var Average     = require("meier/math/Average");
	
    App.prototype = new Game();
    
    function App(container) {        
        Game.call(this, container);

		this.setFps(30);

		this.mls = {
			sigma: 10,
			vertices: 32
		};

		this.doMLS = true;
		this.doResample = false;
		this.doOriginal = true;
		this.resampleCount = 10;

        this.gui = new dat.GUI();
        this.gui.width = 300;
        
		var folder;
        
		folder = this.gui.addFolder("Original Polygon");
		folder.add(this, "doOriginal").name("Show").onChange(this.smoothen.bind(this));
		folder.open();
		
        folder = this.gui.addFolder("Moving Least Squares");
		folder.add(this, "doMLS").name("Show").onChange(this.smoothen.bind(this));
		folder.add(this.mls, "sigma", 0.1, 30, 0.1).name("Gaussian Sigma").onChange(this.smoothen.bind(this));
		folder.add(this.mls, "vertices", 1, 350, 1).name("# Vertices").onChange(this.smoothen.bind(this));
		folder.open();
		
        folder = this.gui.addFolder("Uniform Resample");
		folder.add(this, "doResample").name("Show").onChange(this.smoothen.bind(this));
		folder.add(this, "resampleCount", 1, 300, 1).name("# Resamples").onChange(this.smoothen.bind(this));
		//folder.open();
		
        
				
		
		this.freeforms = [];
		
		this.input.subscribe(Input.LEFT_DOWN, this.onLeftDown.bind(this));
		this.input.subscribe(Input.LEFT_UP, this.onLeftUp.bind(this));		
	}
	
	App.prototype.smoothen = function() {
		this.freeforms.forEach(function(freeform) {
			if( ! freeform.original) {
				freeform.original = freeform.polygon.clone();
				
				freeform.polygon.clear();
			}
			
			if(this.doMLS) {
				freeform.mlsversion = freeform.original.mls(
					Math.pow(this.mls.sigma / 10, 3),
					this.mls.vertices
				);
			} else {
				freeform.mlsversion = null;
			}
			
			if(this.doResample) {
				freeform.resample = freeform.original.uniformResample(this.resampleCount);
			} else {
				freeform.resample = null;
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
		
			if(this.freeforms.last().original.isEmpty()) {
				//this.freeforms.pop();
			}
		}
	};
		
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);      
    };
    
    App.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
		
		this.freeforms.forEach(function(freeform) {
			
			
			if(freeform.original && this.doOriginal) {
				renderer.begin();
				renderer.polygon(freeform.original);
				renderer.stroke("blue");
				renderer.fill(Color.Alpha("blue", 0.1));

				renderer.begin();				
				freeform.original.vertices.forEach(function(v) {
					renderer.rect(v, 4, 4);
				});
				renderer.fill("blue");
			}
			
			if(freeform.mlsversion) {
				renderer.begin();
				renderer.polygon(freeform.mlsversion);
				renderer.stroke("red");
				renderer.fill(Color.Alpha("red", 0.1));
				
				renderer.begin();				
				freeform.mlsversion.vertices.forEach(function(v) {
					renderer.rect(v, 4, 4);
				});
				renderer.fill("red");
			}
		
			if(freeform.resample) {
				renderer.begin();
				renderer.polygon(freeform.resample);
				renderer.stroke("green");
				renderer.fill(Color.Alpha("green", 0.1));
				
				renderer.begin();				
				freeform.resample.vertices.forEach(function(v) {
					renderer.rect(v, 4, 4);
				});
				renderer.fill("green");
			}

		}.bind(this));
		
		var h = -this.hh+10;
        
		if(this.freeforms.isEmpty()) {
			renderer.styled("<black><14px>Hold your left mouse button down, and draw some shape on this canvas.", 0, h, "center", "bottom");
		} else {
			
			if( ! this.freeforms.last().isRecording()) {
				renderer.styled("<black><14px>Click & drag anywhere to draw again.", 0, h, "center", "bottom");			
			}
		}
		
		
		
    };
    
    return App;
});
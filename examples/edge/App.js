define(function(require){
    var Game = require("meier/engine/Game");
    var RawTex = require("meier/engine/RawTexture");
	var M = require("meier/math/Mat");
	var dat = require("meier/contrib/datgui");
	var Random = require();
    var Freeform = require("meier/prefab/Freeform");
	var Input = require("meier/engine/Input");
	var Vec2 = require("meier/math/Vec")(2);
	var Angles = require("meier/math/Angle");
	var Histogram = require("meier/math/Histogram");
	var ShapeContext = require("meier/math/ShapeContext");
	var Task     = require("meier/extra/AsyncLoop");
	var Distance = require("meier/math/Distance");
	
	App.prototype = new Game();
    
    function App(container) {        
        Game.call(this, container);

		this.sigma = 8.2;
		this.size = 5;
		
		this.images = [
			"images/an-interesting-story.jpg",
			//"images/alfonso-d-este.jpg",
			//"test.png",
			"hands/1021_L_729.png",
			"hands/1021_L_728.png",
			"hands/1021_R_728.png",
			"hands/1030_L_797.png",
			"hands/1030_R_795.png",
			"hands/1034_L_815.png",
			"hands/1034_L_816.png",
		];
		
		this.setAutoClear(false);
		
        this.gui = new dat.GUI();
        this.gui.width = 340;
     
	 	this.gui.add(this, "sigma", 0, 20).step(0.1).onChange(this.onChange.bind(this));
	 	this.gui.add(this, "size", 1, 10).step(1).onChange(this.onChange.bind(this));
		
		this.original = new RawTex(this.images.first(), this.onChange.bind(this));
		
		this.add(this.marker = new Freeform());
		
		this.debug = [];
		//this.onChange();
		//console.log(mat.pretty());
		
		TODO("Contemplate automatically subscribing Game instances to left/right events.");
		this.input.subscribe(Input.LEFT_DOWN, this.onLeftDown.bind(this));
		this.input.subscribe(Input.LEFT_UP, this.onLeftUp.bind(this));
		
		this.add(this.task = new Task());
	}
	
	App.prototype.onLeftDown = function(input) {
		this.marker.clear();
		this.marker.record();
	};
	
	App.prototype.onLeftUp = function(input) {
		this.marker.stop();
		
		this.onChange();
	};
	
	App.prototype.onChange = function() {
		this.debug.clear();

		// Edge detection
		var size = parseInt(this.size, 10);
		var mat = M(size, size).CreateLoG(this.sigma * 0.1);
		var painting = this.painting = this.original.convolute(mat, true).inflection(1).keepWhite();
		
		// Extrac pixels from annotated area
		var pixels = [];		
		painting.extractPolygon(this.marker.polygon).forEach(function(r, g, b, a, x, y) {
		    if(r == g && r == b && r == 255) {
			    pixels.push(new Vec2(x, y));
		    }
		});
		
		var model = ShapeContext(pixels, 5, 6);
		this.shape = model;
		
		var vec = model.histogram.asVector(true);
		
		this.heatmap = new RawTex(this.painting.width, this.painting.height);
		
		var x = 0, y = 0;
		this.task.set(function(i, g) {
			var size = 4;

			var pixels = [];
			
			painting.window(x, y, size).forEach(function(p, i) {
				if(p[0] == p[1] && p[0] == p[2] && p[0] == 255) {
					
					var u = i % (size * 2);
					
					var v = Math.floor(i / (size * 2));
					
					pixels.push(new Vec2(
						u + x,
						v + y
					));
				}
			});
			
			
			
			var local = ShapeContext(pixels, 5, 6);

			//var w = Distance.Cosine(local, model.histogram);
			var w = vec.dot(local.histogram.asVector(true));

			this.heatmap.set(x, y, w * 255 * 10);
			
			//if(g == 0) {
				console.log(pixels.length, w * 255);
				//}

			++x;
			
			if(x >= this.painting.width) {
				x = 0;
				++y;
			}
			
			return y < this.painting.height;
		}.bind(this));
	};
	
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
    };
    
    App.prototype.draw = function(renderer) {
		
		renderer.clear("blue");
		
		if(this.painting) {
			renderer.texture(this.painting);
		}
		
		if(this.heatmap) {
			renderer.texture(this.heatmap);
		}
				
        Game.prototype.draw.call(this, renderer);
		
		if(this.shape) {
		    renderer.grid(0, 160, 220, 160, this.shape.matrix);
	    }
    };
    
    return App;
});
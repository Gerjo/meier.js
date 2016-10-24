define(function(require){
    var Game     = require("meier/engine/Game");
	var Freeform = require("meier/prefab/Freeform");
	var Input    = require("meier/engine/Input");
	var Sprite   = require("meier/prefab/Sprite");
	var Task     = require("meier/extra/AsyncLoop");
	var RawTex   = require("meier/engine/RawTexture");
	var Renderer = require("meier/engine/Renderer");
	var Picker   = require("meier/extra/RandomPicker");
	var Histogram = require("meier/math/Histogram")(0, 255, 100);
    var dat       = require("meier/contrib/datgui");
	var Colors    = require("meier/engine/Colors");
	var Heat      = require("meier/engine/Colors").HeatMap;
	
    App.prototype = new Game();
    
    function App(container) {        
        Game.call(this, container);

		this.setAutoClear(false);
		this.setFps(30);

		this.paintings = [
			"alfonso-d-este.jpg",
			"an-interesting-story.jpg",
			"bacchus-1524.jpg",
			"christ-carrying-the-cross(2).jpg",
			"cupid-complaining-to-venus.jpg",
			"danae-1531.jpg",
			"ganymede-1532.jpg",
			"head-of-st-john-the-evangelist.jpg",
			"hercules-and-antaeus-1531.jpg",
			"portrait-of-a-young-woman.jpg",
			"the-erythraean-sibyl-1564.jpg",
			"venus-and-cupid-1509.jpg",
			"venus-and-cupid-1525.jpg",
			"vgg.png",
			//"all hands.png",
			"VOC2007_325.jpg",
			"VOC2007_326.jpg",
			"VOC2007_327.jpg",
			"VOC2007_328.jpg",
			"VOC2007_329.jpg",
			"VOC2007_330.jpg",
			"VOC2007_331.jpg",
			"VOC2007_332.jpg",
			"VOC2007_333.jpg",
			"VOC2007_334.jpg",
			"VOC2007_335.jpg",
		];
		
		this.paintingSrc = this.paintings.first();
		
        this.gui = new dat.GUI();
		this.gui.width = 400;
        this.gui.add(this, "paintingSrc", this.paintings).name("Image").onChange(this.onChange.bind(this));
		this.gui.add(this, "reset").name("restart");
		
		this.painting = new RawTex("images/" + this.paintingSrc);
		
		this.add(this.freeform = new Freeform());
		
		this.input.subscribe(Input.LEFT_DOWN, this.onMouseDown.bind(this));
		this.input.subscribe(Input.LEFT_UP, this.onMouseUp.bind(this));
		this.input.subscribe(Input.MOUSE_MOVE, this.onMouseMove.bind(this));
		
		this.add(this.task = new Task());
    }
	
	App.prototype.reset = function() {
		this.heatmap = null;
		this.debug = null;
		this.freeform.clear();
		this.task.stop();
	};
	
	App.prototype.onChange = function(arg) {
		this.reset();
		this.painting = new RawTex("images/" + this.paintingSrc);
	};
    
	App.prototype.onMouseDown = function(input) {
		this.freeform.clear();
		this.freeform.start();
	};
	
	App.prototype.onMouseUp = function(input) {
		this.freeform.stop();
		this.freeform.polygon = this.freeform.polygon.mls(3.2, this.freeform.polygon.circumference() / 5);
		
		var ident = function(r, g, b) {
			var f = Colors.RGBToXYZ(r/255, g/255, b/255);
			var l = Colors.XYZToCieLab(f[0], f[1], f[2]);
			
			var c = Colors.RGBToHSV(r/255, g/255, b/255);
			
			return l[1] * l[2] * 255;;//c[0]*255;
		};
		
		var foo = function(painting, polygon) {
			var pixels = painting.extractPolygon(polygon);
			var histogram = new Histogram();
			
			// Create model.
			pixels.forEach(function(r, g, b, a, i) {
				if(! (r == g && r == b && r == 0)) {
					histogram.push(ident(r, g, b));
				}
			});
			
			this.debug = pixels;
			
			return histogram;
		}.bind(this);

		var model = foo(this.painting, this.freeform.polygon).toVector().normalize();
		
		var x = 0;
		var y = 0;
		
		this.heatmap = new RawTex(this.painting.width, this.painting.height);
		
		this.task.set(function(i, g) {

			var histogram = new Histogram();

			this.painting.window(x, y, 4).forEach(function(pixel) {
				histogram.add(ident(pixel[0], pixel[1], pixel[2]));				
			});

			var v = histogram.toVector().normalize();
			
			//console.log(x, y);

			this.heatmap.set(x, y, v.dot(model) * 255);

			++x;
			
			if(x >= this.painting.width) {
				x = 0;
				++y;
			}
			
			return y < this.painting.height;
		}.bind(this));
		
	};
	
	App.prototype.onMouseMove = function(input) {
		
	};
	
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    App.prototype.draw = function(renderer) {
		
		renderer.clear();
		renderer.texture(this.painting);
		renderer.begin();
		
		//renderer.texture(this.painting);
		
		if(this.debug) {
			renderer.texture(this.debug);
		}
		
		if(this.heatmap) {
			renderer.opacity(0.4);
			renderer.texture(this.heatmap);
		}
		
        Game.prototype.draw.call(this, renderer);		
    };
    
    return App;
});
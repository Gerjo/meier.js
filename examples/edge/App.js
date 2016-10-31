define(function(require){
    var Game = require("meier/engine/Game");
    var RawTex = require("meier/engine/RawTexture");
	var M = require("meier/math/Mat");
	var dat = require("meier/contrib/datgui");
	var Random = require("meier/math/Random");
    var Freeform = require("meier/prefab/Freeform");
	var Input = require("meier/engine/Input");
	var Vec2 = require("meier/math/Vec")(2);
	var Angles = require("meier/math/Angle");
	var Histogram = require("meier/math/Histogram");
	var ShapeContext = require("meier/math/ShapeContext");
	var Task     = require("meier/extra/AsyncLoop");
	var Distance = require("meier/math/Distance");
	var Math = require("meier/math/Math");
	
	App.prototype = new Game();
    
    function App(container) {        
        Game.call(this, container);
		this.logger.hideInternals();
		
		this.sigma = 8.2;
		this.size = 5;
		this.showContext = true;
		this.speed = 1;
		this.showEdges = true;
		this.images = [
			//"images/an-interesting-story.jpg",
			//"images/alfonso-d-este.jpg",
			//"test.png",
"hands/1021_L_728.png",
"hands/1021_L_729.png",
"hands/1030_L_797.png",
"hands/1030_R_795.png",
"hands/1034_L_817.png",
"hands/1034_R_817.png",
"hands/1044_L_831.png",
"hands/1044_L_833.png",
"hands/1044_R_831.png",
"hands/1044_R_834.png",
"hands/1046_L_1177.png",
"hands/1046_L_1180.png",
"hands/1046_R_1180.png",
"hands/1046_R_1181.png",
"hands/1096_LR_286.png",
"hands/1096_L_285.png",
"hands/1096_R_284.png",
"hands/1102_L_887.png",
"hands/1103_R_432.png",
"hands/1104_R_1092.png",
"hands/1105_L_1094.png",
"hands/1105_R_1094.png",
"hands/1111_L_597.png",
"hands/1111_R_597.png",
"hands/1167_L_897.png",
"hands/1167_L_898.png",
"hands/1176_L_324.png",
"hands/1176_L_334.png",
"hands/1195_L_667.png",
"hands/1195_R_667.png",
"hands/1195_R_672.png",
"hands/1205_L_1162.png",
"hands/1205_L_1166.png",
"hands/1205_R_1166.png",
"hands/1206_L_619.png",
"hands/1207_L_939.png",
"hands/1207_L_946.png",
"hands/1319_R_1122.png",
"hands/1319_R_1129.png",
"hands/1353_L_1160.png",
"hands/1356_R_500.png",
"hands/1365_L_1024.png",
"hands/1400_L_847.png",
"hands/1400_L_850.png",
"hands/1470_L_789.png",
"hands/1491_L_957.png",
"hands/1491_R_956.png",
"hands/1494_L_706.png",
"hands/1494_R_706.png",
"hands/1518_R_1016.png",
"hands/1527_L_892.png",
"hands/1527_R_892.png",
"hands/1529_L_912.png",
"hands/1546_L_606.png",
"hands/1560_R_863.png",
"hands/1576_L_215.png",
"hands/1576_L_218.png",
"hands/1576_R_215.png",
"hands/1576_R_218.png",
"hands/1582_LR_180.png",
"hands/1582_LR_184.png",
"hands/1582_LR_185.png",
"hands/1583_LR_208.png",
"hands/1583_LR_210.png",
"hands/1634_L_949.png",
"hands/1634_R_950.png",
"hands/1647_R_1065.png",
"hands/1653_R_638.png",
"hands/1654_L_470.png",
"hands/1687_L_516.png",
"hands/1894_R_771.png",
"hands/1894_R_775.png",
"hands/1898_R_995.png",
"hands/2005_R_1072.png",
"hands/2010_L_683.png",

		];
		
		this.images = this.images.slice(0, 36);
		
		this.setAutoClear(false);
		
        //this.gui = new dat.GUI();
        
		if(this.gui) {
			this.gui.width = 340;
     
		 	this.gui.add(this, "sigma", 0, 20).step(0.1).onChange(this.onChange.bind(this));
		 	this.gui.add(this, "size", 1, 10).step(1).onChange(this.onChange.bind(this));
			this.gui.add(this, "showContext");
			this.gui.add(this, "showEdges");
			this.gui.add(this, "speed");
		}
		
		this.original = new RawTex(this.images.first(), this.onChange.bind(this));
		
		this.add(this.marker = new Freeform());
		
		this.debug = [];
		//this.onChange();
		//console.log(mat.pretty());
		
		TODO("Contemplate automatically subscribing Game instances to left/right events.");
		this.input.subscribe(Input.LEFT_DOWN, this.onLeftDown.bind(this));
		this.input.subscribe(Input.LEFT_UP, this.onLeftUp.bind(this));
		
		this.add(this.task = new Task());
		
		this.compute();
	}
	
	App.prototype.onLeftDown = function(input) {
		this.marker.clear();
		this.marker.record();
	};
	
	App.prototype.onLeftUp = function(input) {
		this.marker.stop();
		
		this.onChange();
	};
	
	App.prototype.compute = function() {
		
		var size = 5;//parseInt(this.size, 10);
		var mat = M(size, size).CreateLoG(0.99);
		
		var blur = RawTex.Matrices.Blur1;
		
		this.res = [];
		this.distances = new (M(this.images.length, this.images.length));
		
		this.res = this.images.map(function(src, i) {
			
			var original = new RawTex(src, function(texture) {
				console.log("Loaded " + i);
				
				var obj = this.res[i];
			    
				obj.edges = texture.convolute(mat, true).inflection(1).binaryTuple();
				obj.model = ShapeContext(10, 12, texture.coordinatesNonBlackPixels());
				obj.descriptor = obj.model.histogram.asVector(true).normalize();
				
				if(this.res.every(Math.ItemGetter("original", "_isLoaded"))) {
					this.allLoaded();
				}
				
			}.bind(this));
			
			return {
			    original: original,
				edges: null,
				model: null,
				descriptor: new Vec2(1,1),
				pos: new Vec2(Random(-20, 20, true), Random(-20, 20, true))
			};
			
		}.bind(this));
	};
	
	App.prototype.allLoaded = function() {
		console.log("All are loaded.");
		
		for(var r = 0; r < this.res.length; ++r) {
			for(var c = r; c < this.res.length; ++c) {
				
				//var d = this.res[r].descriptor.dot(this.res[c].descriptor);
				var d = Distance.Pearson(this.res[r].descriptor, this.res[c].descriptor);
				
				
			    this.distances.set(r, c, d);
			    this.distances.set(c, r, d);
			}				
		}
		
		this.distances = this.distances.normalize();//.multiply(0.5);
		
		console.log(this.distances.pretty(2));
	};
	
	App.prototype.onChange = function() {
		return;
		this.debug.clear();

		// Edge detection
		var size = parseInt(this.size, 10);
		var mat = M(size, size).CreateLoG(this.sigma * 0.1);
		var painting = this.painting = this.original.convolute(mat, true).inflection(1).keepWhite();
		
		// Extract pixels from annotated area
		var pixels = [];		
		painting.extractPolygon(this.marker.polygon).forEach(function(r, g, b, a, x, y) {
		    if(r == g && r == b && r == 255) {
			    pixels.push(new Vec2(x, y));
		    }
		});
		
		var model = ShapeContext(10, 12, pixels);
		this.shape = model;
		
		var vec = model.histogram.asVector(true);
		
		this.heatmap = new RawTex(this.painting.width, this.painting.height);
		
		var x = 0, y = 0;
		
		var increment = 10;
		
		this.task.set(function(i, g) {
			var size = 15;

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

			var local = ShapeContext(20, 12, pixels);

			//var w = Distance.Cosine(local, model.histogram);
			var w = vec.dot(local.histogram.asVector(true));

            for(var u = 0; u < increment; ++u) {
	            for(var v = 0; v < increment; ++v) {
					this.heatmap.set(x + u, y + v, w * 255 * 10);
				}
			}
			
			//if(g == 0) {
				console.log(pixels.length, w * 255);
				//}

			x += increment;
			
			if(x >= this.painting.width) {
				x = 0;
				y += increment;
			}
			
			return y < this.painting.height;
		}.bind(this));
	};
	
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
		
		for(var i = 0; i < this.res.length; ++i) {
			
			
			var res = new Vec2(0, 0);
			
			for(var j = 0; j < this.res.length; ++j) {
				var dir = this.res[i].pos.direction(this.res[j].pos);
				var w = this.distances.get(i, j) - 1;
				var d = this.res[i].pos.distance(this.res[j].pos);
				
				
				if((w < 0 && d < 30) || (w > 0 && d > 30)) {
					res.addScaled(dir, w * dt * -0.1 * 10 * this.speed);
				}
				
			}
			
			this.res[i].pos.addScaled(res, 1 / this.res.length);
		}
		
    };
    
    App.prototype.draw = function(renderer) {
		renderer.clear("white");
		
		var s = 30;
		
		for(var x = 0; x < this.res.length; ++x) {
			
			for(var y = 0; y < this.res.length; ++y) {
				
				if(x == 0) {
					renderer.texture(this.res[y].original, x * s - this.hw + 80, y * -s + this.hh - 110);
					renderer.texture(this.res[y].edges, x * s - this.hw + 50, y * -s + this.hh - 110);
					
					if(this.res[y].model) {
					    renderer.grid(x * s - this.hw + 20, y * -s + this.hh - 110, s, s, this.res[y].model.matrix);
				    }
				}
				
				if(y == 0) {
					renderer.texture(this.res[x].original, x * s - this.hw + 110, y * -s + this.hh - 80);
					renderer.texture(this.res[x].edges, x * s - this.hw + 110, y * -s + this.hh - 50);
					
					if(this.res[x].model) {
					    renderer.grid(x * s - this.hw + 110, y * -s + this.hh - 20, s, s, this.res[x].model.matrix);
				    }
				}
				
				//var w = Math.pow(1-this.distances.get(x, y), 1);
				var w = Math.pow(this.distances.get(x, y), 5);
				
				renderer.begin();
				renderer.rect(x * s - this.hw + 110, y * -s + this.hh - 110, s, s);
				renderer.stroke("black");
				renderer.fill("rgba(0, 0, 0, " + w  + ")");
			}
		} 
		
		if(this.res && false) {
			this.res.forEach(function(obj) {
				if(this.showEdges)
					renderer.texture(obj.edges, obj.pos);
				else
					renderer.texture(obj.original, obj.pos);
				
				if(this.showContext) {
					renderer.grid(obj.pos.x, obj.pos.y, obj.original.width, obj.original.height, obj.model.matrix);
				}
			}.bind(this));
		}
    };
    
    return App;
});
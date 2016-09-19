define(function(require){
    var Game     = require("meier/engine/Game");
    var Vec2     = require("meier/math/Vec")(2);
    var Renderer = require("meier/engine/Renderer");
    var RawTex   = require("meier/engine/RawTexture");
    var Colors   = require("meier/engine/Colors");
    var Html     = require("meier/engine/HtmlEntity");
	
	var Designer = require("./Designer");
	
    App.prototype = new Game();
    
    function App(container) {        
        Game.call(this, container);

		this.setFps(30);
		this.logger.hideInternals();

		var p = 10;
		var w = this.hw;

		this.showDebug = false;

		this.designers = [];
		this.designers.push(new Designer(-w + w*0.5, 0, w - p * 2, w));
		this.designers.push(new Designer(+w - w*0.5, 0, w - p * 2, w));
	

		this.ui = new Html(this.hw - 100, -this.hh + 20);
		this.ui.append("<button>Toggle canvas raster</button>");
		this.ui.click("button", function() {
			this.showDebug = ! this.showDebug;
		}.bind(this));
		this.add(this.ui);
		
		this.designers.forEach(this.add.bind(this));
		
		// normal, weighted
		this.similarity = [0, 0];
		
		//              !A   !B 
		this.weights = [3/6, 4/6];
		this.debug = null;
    }
	
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
	
	App.prototype.doCompute = function(a, b) {
		
		// Align to touch the x and y axis.
		a = a.aligned(); 
		b = b.aligned();
		
		var u = a.boundingRect();
		var v = b.boundingRect();

		// Center onto canvas
		a.position.x = u.width() * -0.5;
		a.position.y = u.height() * -0.5;
		b.position.x = v.width() * -0.5;
		b.position.y = v.height() * -0.5;
		
		
		// Optimize the renderer size. Increases speed due
		// to a per pixel time complexity. Add a few bonus
		// pixels to account for out-of-screen anti-aliasing
		var w = Math.max(a.width(), b.width()) + 5;
		var h = Math.max(a.height(), b.height()) + 5;
		
		// Avoid errors with empty renderer.
		if(w == h && w == 0) {
			this.similarity = 0;
			return;
		}

		var renderer = new Renderer(w, h);
		
		renderer.begin();
		renderer.polygon(a);
		renderer.fill(Colors.Alpha("#ff0000", 0.5));

		renderer.begin();
		renderer.polygon(b);
		renderer.fill(Colors.Alpha("#00ff00", 0.5));
		
		this.debug = renderer;
		
		// Convert to raw texture to permit operations
		var tex = new RawTex(renderer);
		
		
		var obj = {};
		
		tex.forEach(function(r, g, b, a) {
			if(r != 0) { r = 255; }
			if(b != 0) { b = 255; }
			if(g != 0) { g = 255; }
			
			TODO("Rework string based logic.");			
			var c = "#" + r.toString(16).padLeft("0", 2) + g.toString(16).padLeft("0", 2) + b.toString(16).padLeft("0", 2);
						
			if( ! (c in obj)) {
				obj[c] = 0;
			}
			
			++obj[c];
		});
		
		var n  = obj["#000000"] || 0; // Success, bon't care.
		var a  = obj["#ff0000"] || 0; // Error
		var b  = obj["#00ff00"] || 0; // Error
		var ab = obj["#ffff00"] || 0; // Success, care.
		
		var total = a + b + ab;
				
		var w = this.weights; // Weight of an error.
		
		this.similarity[0] = ab / (a + b + ab);
		//console.log("not     : " + this.similarity);
		
		var Pow = Math.pow;

		this.similarity[1] = Pow(ab, Math.min(w[0])) / ( Pow(a, w[0]) + Pow(b, w[1]) + Pow(ab, Math.min(w[0])));
		//console.log("weighted: " + this.similarity);

		//this.debug = renderer;
	};
    
    App.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
		var sim = (this.similarity[1] * 100).toFixed(0) + "%";
		
		renderer.styled("<20px><black>Similarity between A and B: <bold>" + sim + "<>\n<12px><italic>try drawing something on the two canvases below", 0, this.hh - 20,  "center", "bottom");

		renderer.styled("<15px><black>Jaccard Index<10px> normal  <>: " + this.similarity[0].toFixed(2) + "\n" +
		"<15px><black>Jaccard Index<10px> weighted<>: " + this.similarity[1].toFixed(2) + " <10px>w<8px>1<> = " + this.weights[0].toFixed(1) + ", w<8px>1<> = " + this.weights[1].toFixed(1)
		, -this.hw+10, -this.hh + 30,  "left", "bottom");

		
		if( ! this.designers[0].freeform.isRecording()) {
			if( ! this.designers[1].freeform.isRecording()) {
				if(this.designers[0].freeform.change.notified("main") || this.designers[1].freeform.change.notified("main")) {
					this.doCompute(
						this.designers[0].freeform.polygon,
						this.designers[1].freeform.polygon
					);
				}
			}
		}
		
		
		if(this.showDebug && this.debug) {
			renderer.begin();
			renderer.rect(0, 0, this.debug.width + 20, this.debug.height + 20);
			renderer.fill("gray");
			
			renderer.texture(this.debug);
			
			renderer.styled("<black><15px>Polygons overlapped and rasterized", 1, this.debug.hh-1, "center", "bottom");			
		}
		
    };
    
    return App;
});
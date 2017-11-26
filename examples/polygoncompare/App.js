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
		this.weights = [3/6, 14/24];
		this.debug = null;
    }
	
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
	
	App.prototype.doCompute = function(a, b) {
		
		var res = a.rasterCompare(b);
				
		var w = this.weights; // Weight of an error.
		
		this.similarity[0] = res.intersection / res.union;
		
		var Pow = Math.pow;

		this.similarity[1] = Pow(res.intersection, Math.min(w[0])) / ( Pow(res.a, w[0]) + Pow(res.b, w[1]) + Pow(res.intersection, Math.min(w[0])));
		//console.log("weighted: " + this.similarity);

		this.debug = res.raster;
	};
    
    App.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
		var sim = (this.similarity[1] * 100).toFixed(0) + "%";
		
		renderer.styled("<20px><black>Similarity between A and B: <bold>" + sim + "<>\n<12px><italic>try drawing something on the two canvases below", 0, this.hh - 20,  "center", "bottom");

		renderer.styled("<15px><black>Jaccard Index<10px> normal  <>: " + this.similarity[0].toFixed(2) + "\n" +
		"<15px><black>Jaccard Index<10px> weighted<>: " + this.similarity[1].toFixed(2) + " <10px>w<8px>1<> = " + this.weights[0].toFixed(2) + ", w<8px>1<> = " + this.weights[1].toFixed(2)
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
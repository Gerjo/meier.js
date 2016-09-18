define(function(require){
    var Game     = require("meier/engine/Game");
    var Renderer = require("meier/engine/Renderer");
    var RawTex   = require("meier/engine/RawTexture");
    var Colors   = require("meier/engine/Colors");

	var Designer = require("./Designer");
	
    App.prototype = new Game();
    
    function App(container) {        
        Game.call(this, container);

		this.setFps(30);
		this.logger.hideInternals();

		var p = 10;
		var w = this.hw;

		this.designers = [];
		this.designers.push(new Designer(-w + w*0.5, 0, w - p * 2, w));
		this.designers.push(new Designer(+w - w*0.5, 0, w - p * 2, w));
	

		this.designers.forEach(this.add.bind(this));
		
		this.similarity = 0;
		
		this.debug = null;
    }
	
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
	
	App.prototype.doCompute = function(a, b) {
		var renderer = new Renderer(this.designers[0].width, this.designers[0].height);
		
		renderer.begin();
		renderer.polygon(a);
		renderer.fill(Colors.Alpha("#ff0000", 0.5));

		renderer.begin();
		renderer.polygon(b);
		renderer.fill(Colors.Alpha("#00ff00", 0.5));
		
		// Convert to raw texture to permit operations
		var tex = new RawTex(renderer);
		
		
		var obj = {};
		
		tex.forEach(function(r, g, b, a) {
			
			if(r != 0) { r = 255; }
			if(b != 0) { b = 255; }
			if(g != 0) { g = 255; }
			
			var c = "#" + r.toString(16).padLeft("0", 2) + g.toString(16).padLeft("0", 2) + b.toString(16).padLeft("0", 2);
			
			//console.log(r, g, b, a);
			
			if( ! (c in obj)) {
				obj[c] = 0;
			}
			
			++obj[c];
		});
		
		var n  = obj["#000000"] || 0;
		var a  = obj["#ff0000"] || 0;
		var b  = obj["#00ff00"] || 0;
		var ab = obj["#ffff00"] || 0;
		
		var total = a + b + ab;
		
		this.similarity = (a + b) / ab;
		

		//this.debug = renderer;
	};
    
    App.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
		renderer.styled("<20px><black>Similarity between A and B: <bold>" + this.similarity.toFixed(2) + "<>\n<15px>lower is more similar", 0, this.hh - 20,  "center", "bottom");
		
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
		
		
		if(this.debug) {
			renderer.texture(this.debug);
		}
		
    };
    
    return App;
});
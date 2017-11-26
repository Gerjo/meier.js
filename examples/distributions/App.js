define(function(require){
    var Game = require("meier/engine/Game");
    var Random = require("meier/math/Random");
    var Histogram = require("meier/math/Histogram");
    var dat       = require("meier/contrib/datgui");
	
    App.prototype = new Game();
    
	var Gaussian = {
		SumOfUniform: function(min, max, samples) {
		
			if(isNaN(samples)) {
				samples = 3;
			}
					
			var n = 0;
			for(var i = 0; i < samples; ++i) {
				n += Random(min, max, true);
			}
		
			return Math.round(n / samples);
		},
		BoxMuller: function(min, max) {
			
			var b = Random(0, 1, true);
			
			//do {
				var a = Random(0, 1, true);
			//} while(a < 0.36);
			
			var u = Math.sqrt(-2 * Math.ln(a));
			var v = Math.sin(2 * Math.PI * b);
			
			var c = u * v;
			
			
			//console.log(c);
			
			var mean = (max - min) / 2;
			
		//	console.log(c/2);
			
			var res = mean + (c/7) * (max - min);
			
			return res;
		},
	};
	
    function App(container) {        
        Game.call(this, container);

		this.max = 100;
		this.n = 2;
		this.samples = 10;//this.max * this.max;
		
        this.gui = new dat.GUI();
		this.gui.width = 400;
        this.gui.add(this, "max", 1, 1000).name("Max").onChange(this.recompute.bind(this));
        this.gui.add(this, "samples", 1, 100000).name("Samples").onChange(this.recompute.bind(this));
        this.gui.add(this, "n", 1, 20, 1).name("N").onChange(this.recompute.bind(this));

		this.histogram = null;
		
		this.recompute();
    }
	
	App.prototype.recompute = function() {
		this.histogram = new (Histogram(0, this.max, this.max))();
		
		this.n = parseInt(this.n, 10);
		
		for(var i = 0; i < this.samples; ++i) {
			//var n = Gaussian.SumOfUniform(0, this.max, this.n);
			var n = Gaussian.BoxMuller(0, this.max);
			
			this.histogram.add(n);
		}
	};
    
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
    };
    
    App.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
		if(this.histogram) {
			renderer.histogram(0, 0, this.hw, this.hh, this.histogram);
		}
    };
    
    return App;
});
define(function(require){
    var Game = require("meier/engine/Game");
    var Vec2 = require("meier/math/Vec")(2);
	var Math = require("meier/math/Math");
	
    App.prototype = new Game();
    
    function App(container) {        
        Game.call(this, container);

		var coords = "159,40 127,-15 63,-15 31,40 63,95 127,95 159,40";
		//var coords = "304.1,165.8 228,223 258,239.7 273,267 339,274.9 346.1,262.1 304.1,203.6 310.1,166.8";
		
		
		var coordinates = this.coordinates = [];
		
		coords.split(" ").forEach(function(pair) {
			pair = pair.split(",");
			
			coordinates.push(new Vec2(parseInt(pair[0]), parseInt(pair[1])));		
		});
		
		//this.coordinates = this.coordinates.reverse();
		
		var a = this.coordinates[0];
		
		for(var i = 1; i < this.coordinates.length; ++i) {
			var b = this.coordinates[i];
			
			console.log(b.pretty());
		}
    }
    
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    App.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
		renderer.begin();
		//renderer.scale(0.5);
		
		var a = this.coordinates[0];
		
		for(var i = 1; i < this.coordinates.length; ++i) {
			var b = this.coordinates[i];
			renderer.arrow(a, b);
			
			//renderer.styled(i, a.x, a.y);
			
			a = b;
		}
		renderer.stroke("red");

		renderer.begin();
		renderer.polygon(this.coordinates);
		
		renderer.fill("rgba(255, 0, 0, 0.5)");
    };
    
    return App;
});
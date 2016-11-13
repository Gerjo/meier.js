define(function(require){
    var Game = require("meier/engine/Game");
    var M = require("meier/math/Mat");
	
    App.prototype = new Game();
    
    function App(container) {        
        Game.call(this, container);

		var mat1 = new (M(4, 4))([
			10, 25, 15, 20,
			15, 30,  5, 15,
			35, 20, 12, 24,
			17, 25, 24, 20
		]);
		
		var mat2 = new (M(4, 4))([
			0, 25, 15, 20,
			15, 30,  5, 0,
			0, 20, 12, 24,
			17, 0, 0, 20
		]);
		
		console.log(mat1.pretty(0));
		console.log(mat1.hungarian());

		console.log(mat2.pretty(0));
		console.log(mat2.hungarian());
		
		//H(mat);
    }
    

	
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    App.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
    };
    
    return App;
});
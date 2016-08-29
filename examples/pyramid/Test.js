define(function(require){
    var Game       = require("meier/engine/Game");
    var RawTexture = require("meier/engine/RawTexture");
    var dat        = require("meier/contrib/datgui");
	
    Test.prototype = new Game();
    
    function Test(container) {        
        Game.call(this, container);

		this.src = "images/lenna.png";

        this.original  = new RawTexture(this.src, function(texture) {
			
			var m = texture.luminance().asMatrix().r;
			
			m = m.zoom(0.25/2);
			
			this.original = RawTexture.FromMatrix(m).gaussian(5,5,1.4).sobel();
			
			
			console.log(m);
			
			console.log("loaded.");
		}.bind(this));

    }
    
    Test.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    Test.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
		renderer.texture(this.original);
		
    };
    
    return Test;
});
define(function(require){
    var Game = require("meier/engine/Game");
    var HtmlEntity = require("meier/engine/HtmlEntity");
	
    Test.prototype = new Game();
    
    function Test(container) {        
        Game.call(this, container);
		
		this.add(this.html = new HtmlEntity(0, 0));
		
		this.html.html("<b>hello</b>, how are you doing today?");
    }
    
    Test.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
    };
    
    Test.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
    };
    
    return Test;
});
define(function(require) {
    var Entity = require("meier/engine/Entity");
    var Random = require("meier/math/Random");
    
    Unit.prototype = new Entity();
    function Unit(x, y) {
        Entity.call(this, x, y, 10, 10);
        this.velocity = Random.Vector().scaleScalar(30);
        this.color = "black";
        
        this.width  = Random(10, 15);
        this.height = Random(10, 15);
    }
    
    Unit.prototype.update = function(dt) {
        
        this.position.add(this.velocity.clone().scaleScalar(dt));
        
        [1, -1].forEach(function(sign) {
            if(this.position.x * sign > this.game.hw) {
                this.position.x = this.game.hw * sign;
                this.velocity.x *= -1;
            }
        
            if(this.position.y * sign > this.game.hh) {
                this.position.y = this.game.hh * sign;
                this.velocity.y *= -1;
            }
        }.bind(this));
        
        
    };
    
    Unit.prototype.draw = function(renderer) {
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.fill(this.color);
        
        // Reset the color.
        this.color = "black";
    };
    
    return Unit;
});
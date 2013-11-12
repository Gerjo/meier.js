define(function(require) {
    var Entity    = require("meier/engine/Entity");
    var Vector    = require("meier/math/Vec")(2);
    var Random    = require("meier/math/Random");
    
    Boid.prototype = new Entity();
    function Boid(x, y) {
        Entity.call(this, x, y);
        
        
        this.outline = [
            new Vector(0, 20),
            new Vector(10, -20),
            new Vector(-10, -20)
        ];
        
        this.velocity = Random.Vector().scaleScalar(60); new Vector(0, 0);
    }
    
    Boid.prototype.update = function(dt) {
        this.position.add(this.velocity.clone().scaleScalar(dt * this.game.speed));
        
        this.rotation = Math.atan2(this.velocity.y, this.velocity.x) - Math.PI/2;
        
        [1, -1].forEach(function(sign) {
            if(this.position.x * sign > this.game.hw) {
                this.position.x = -this.game.hw * sign;
                //this.velocity.x *= -1;
            }
        
            if(this.position.y * sign > this.game.hh) {
                this.position.y = -this.game.hh * sign;
                //this.velocity.y *= -1;
            }
        }.bind(this));
    };
    
    Boid.prototype.draw = function(renderer) {
        renderer.begin();
        renderer.polygon(this.outline);
        renderer.rectangle(0,0,1,1);
        renderer.stroke("black");
        
        renderer.begin();
        
        if(this.game.full360view) {
            renderer.arc(0, 0, this.game.viewRadius, Math.PI * 2, 0);
        } else {
            renderer.arc(0, 0, this.game.viewRadius, Math.PI, 0);
        }
        renderer.fill("rgba(0, 0, 0, 0.1)");
        renderer.stroke("rgba(0, 0, 0, 0.1)");
    };
    
    return Boid;
});
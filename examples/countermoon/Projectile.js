define(function(require){
    var Entity     = require("meier/engine/Entity");
    var Stopwatch = require("meier/aux/Stopwatch");
    var Vector    = require("meier/math/Vector");

    Projectile.prototype = new Entity();

    function Projectile(position, angle) {
        Entity.call(this, position.x, position.y, 20, 20);
        
        this.velocity = Vector.CreateAngular(angle).scaleScalar(25);
    
        this.timer = new Stopwatch();
    }

    Projectile.prototype.update = function(dt) {
    
        this.position.add(this.velocity);
        
        if(this.timer.peek() > 500)
        {
            this.delete();
        }
    
    };

    Projectile.prototype.draw = function(r) {
        r.begin();
        r.circle(0,0,this.width * 0.5);
        r.fill("hotpink");
    
    };

    return Projectile;
});
define(function(require) {
    var Entity = require("meier/engine/Entity");
    var V2     = require("meier/math/Vec")(2);
    var Lerp   = require("meier/math/Lerp");
    
    Vehicle.prototype = new Entity();
    function Vehicle(x, y) {
        Entity.call(this, x, y, 10, 10);
        
        this.direction = new V2(1, 1).normalize();
        this.speed = 200;
        this.momentum = 1;
        
        this.target   = new V2(10, 1);
    }
    
    Vehicle.prototype.update = function(dt) {
        
        this.target = this.game.map.getAttractionCandidates(this.position, this.direction)[3];
        
        var direction = this.target.direction(this.position).normalize();
        
        this.direction = Lerp(this.direction, direction, this.momentum);
        
        this.position.addScaled(this.direction, dt * this.speed);
    };
    
    Vehicle.prototype.draw = function(renderer) {
        renderer.begin();
        renderer.circle(0, 0, 10);
        renderer.stroke("black");
        
        renderer.save();
        renderer.translate(-this.position.x, -this.position.y);
        var candidates = this.game.map.getAttractionCandidates(this.position, this.direction, renderer);
        renderer.restore();
       /* renderer.begin();
        candidates.forEach(function(p) {
            renderer.circle(p.subtract(this.position), 3);    
        }.bind(this));
        renderer.fill("red");
        */
        
        
    };
    
    return Vehicle;
});
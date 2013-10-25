define(function(require) {
    var Entity       = require("meier/engine/Entity");
    var Input        = require("meier/engine/Input");
    var Timer        = require("meier/aux/Timer");
    var Vector       = require("meier/math/Vector");
    var PointInObb   = require("meier/math/Intersection").Test.PointInObb;
    
    
    // Inheritance:
    Demoid.prototype = new Entity();
    
    
    function Demoid(x, y) {
        // Call super class constructor:
        Entity.call(this, x, y, 40, 30);
        
        // One must subscribe for methods:
        this.enableEvent(
            Input.LEFT_DOWN,
            Input.LEFT_UP
        );
        
        // Scaling:
        this.scale  = 1;
        
        this.stroke = 'black';
        this.fill   = 'black';
        
        this.spawntimer = new Timer(300);
        this.deathtimer = new Timer(400);
        
        this.velocity   = new Vector(200, 0);
    }
    
    Demoid.prototype.clone = function() {
        var clone = new Demoid(this.position.x, this.position.y);
        clone.rotation = this.rotation;
        clone.velocity = this.velocity.clone();
        
        return clone;
    };
    
    Demoid.prototype.onLeftDown = function() {
        this.fill = "red";        
    };
    
    Demoid.prototype.onLeftUp = function() {
        this.fill = "black";
    };
    
    Demoid.prototype.onAdd = function(game) {
        
    };
    
    Demoid.prototype.update = function(dt) {
        this.rotation += dt * 0.5;
        
        // Movement:
        this.position.add(this.velocity.clone().scaleScalar(dt));
        
        // Spawn more Demoids:
        if(this.spawntimer.expired()) {
            var demoid = this.clone();
            demoid.velocity.perp();
            this.game.add(demoid);
        }
        
        if(this.deathtimer.expired()) {
            this.delete();
        }
    };
    
    Demoid.prototype.draw = function(renderer) {
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.stroke(this.stroke);
        renderer.fill(this.fill);
        
        renderer.begin();
        renderer.arrow(0, 0, this.width * 0.5, 0);
        renderer.stroke("red", 2);
    };
    
    return Demoid;
});
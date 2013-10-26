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
        Entity.call(this, x, y, 40, 40);
        
        // One must subscribe for methods:
        this.enableEvent(
              Input.LEFT_DOWN
            , Input.LEFT_UP
            , Input.MOUSE_MOVE
        );
        
        // Scaling:
        this.scale  = 1;
        
        this.stroke = 'black';
        this.fill   = 'black';
        
        this.spawnothers = true;
        
        this.deathtimer  = new Timer(2000);
        this.spawntimer  = new Timer(200);
        
        this.velocity    = new Vector(200, 0);
    }
    
    Demoid.prototype.clone = function() {
        var clone      = new Demoid(this.position.x, this.position.y);
        clone.rotation = this.rotation;
        clone.velocity = this.velocity.clone();
        clone.ticks    = this.ticks;
        return clone;
    };
    
    Demoid.prototype.onMouseMove = function(input) {
        
    };
    
    Demoid.prototype.onLeftDown = function() {
          
    };
    
    Demoid.prototype.onLeftUp = function() {
        
    };
    
    Demoid.prototype.update = function(dt) {
        
        if(this.containsPoint(this.game.input)) {
            this.fill = "red";
        } else {
            this.fill = "black";
        }
        
        this.rotation += dt * 0.5;
        
        // Movement:
        this.position.add(this.velocity.clone().scaleScalar(dt));
        
        if(this.deathtimer.expired() && this.spawnothers !== true) {
            this.delete();
            return;
        }
        
        if(this.spawntimer.expired() && this.spawnothers === true) {
            this.velocity.perp();
            for(var i = 0; i < 4; ++i) {
                var demoid = this.clone();
                demoid.spawnothers = false;
                
                this.game.add(demoid);
                
                this.velocity.perp();
            }
        }
    };
    
    Demoid.prototype.draw = function(renderer) {
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.stroke(this.stroke);
        renderer.fill(this.fill);
        
        renderer.begin();
        renderer.line(0, 0, this.toLocal(this.game.input));
        renderer.stroke("rgba(0,0,0,0.1)", 2);
    };
    
    return Demoid;
});
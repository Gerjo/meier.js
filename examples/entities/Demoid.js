define(function(require) {
    var Entity       = require("meier/engine/Entity");
    var Input        = require("meier/engine/Input");
    var Intersection = require("meier/math/Intersection");
    
    // Short-hand access: less typing.
    var PointInObb   = Intersection.Test.PointInObb;
    
    // Super class:
    Demoid.prototype = new Entity();
    
    
    function Demoid(x, y) {
        // Call super class constructor:
        Entity.call(this, x, y, 30, 40);
        
        this.enableEvent(
            Input.MOUSE_MOVE,
            Input.LEFT_DOWN,
            Input.LEFT_UP
        );
        
        this.scale  = 5;
        
        this.stroke = 'black';
        this.fill   = 'black';
    }
    
    Demoid.prototype.onMouseMove = function(input) {
        //console.log(this.obbContains(input));
    };
    
    Demoid.prototype.onLeftDown = function() {
        this.fill = "red";        
    };
    
    Demoid.prototype.onLeftUp = function() {
        this.fill = "black";
    };
    
    Demoid.prototype.onAdd = function(game) {
        console.log("Demoid was added.");
    };
    
    Demoid.prototype.update = function(dt) {
        this.rotation = Math.QuarterPI * 0.89 ; dt;
    };
    
    Demoid.prototype.draw = function(renderer) {
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.stroke(this.stroke);
        renderer.fill(this.fill);
        
        renderer.begin();
        renderer.circle(0, 0, 10);
        renderer.arrow(0, 0, 20, 0);
        renderer.stroke("yellow");
    };
    
    return Demoid;
});
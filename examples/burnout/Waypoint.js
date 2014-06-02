define(function(require) {
    var V2 = require("meier/math/Vec")(2);
    
    var NextUniqueId = 0;
    
    Waypoint.prototype = new V2();
    function Waypoint(x, y) {
        V2.call(this, x, y);
        
        this.roads  = [];
        
        this.radius = 10;
        
        this.id = ++NextUniqueId;
    }
    
    Waypoint.prototype.contains = function(point) {
        return this.distanceSq(point) < Math.pow(this.radius, 2);
    };
    
    Waypoint.prototype.equals = function(other) {
        return other.id == this.id;
    };
    
    Waypoint.prototype.toObject = function() {
        return {
            "type":  "Waypoint",
            "x":     this.x,
            "y":     this.y,
            "id":    this.id
        };
    };
    
    return Waypoint;
});
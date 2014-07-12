define(function(require) {
    var V2 = require("meier/math/Vec")(2);
    
    /// Collection of all used IDs
    var ids = [0];
    
    /// Create a unique ID for serialisation
    function UniqueId() {
        var max = Math.max.apply(null, ids);
        var next = max + 1;

        return next;
    }
    
    /// Store the unique ID internally
    function ReserveId(id) {
        ids.push(id);
        return id;
    }
    
    Waypoint.prototype = new V2();
    function Waypoint(x, y) {
        V2.call(this, x, y);
        
        this.roads  = [];
        
        this.radius = 10;
        
        this.id = ReserveId(UniqueId());
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
    
    Waypoint.fromObject = function(o) {
        var waypoint = new Waypoint(o.x, o.y);
        waypoint.id = ReserveId(o.id);
        
        return waypoint;
    };
    
    return Waypoint;
});
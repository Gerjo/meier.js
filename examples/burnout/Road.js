define(function(require) {
    var Waypoint    = require("./Waypoint");
    var LineSegment = require("meier/math/Line");
    
    function Road(from, to) {
        this.from  = from;
        this.to    = to;
        
        this.lanes = 2;
    }
    
    Road.prototype.segment = function() {
        return new LineSegment(this.from, this.to);
    };
    
    Road.prototype.equals = function(road) {
        var score = 0;
        
        // Need two matches for equivalence.
        score += road.from.id == this.to.id;
        score += road.to.id   == this.from.id;
        score += road.from.id == this.from.id;
        score += road.to.id   == this.to.id;
                
        return score >= 2;
    };
    
    Road.prototype.toObject = function() {
        return {
            "type":  "Road",
            "from":  this.from.id,
            "to":    this.to.id,
            "lanes": this.lanes
        };
    };
    
    return Road;
    
});
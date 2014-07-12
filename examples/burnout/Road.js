define(function(require) {
    var Waypoint    = require("./Waypoint");
    var LineSegment = require("meier/math/Line");
    
    Road.prototype = new LineSegment();
    
    function Road(from, to) {
        LineSegment.call(this, from, to);
        
        //this.from  = from;
        //this.to    = to;
        
        this.lanes = 2;
    }
    
    Road.prototype.segment = function() {
        return this;
    };
    
    Road.prototype.equals = function(road) {
        var score = 0;
        
        // Need two matches for equivalence.
        score += road.a.id == this.b.id;
        score += road.b.id   == this.a.id;
        score += road.a.id == this.a.id;
        score += road.b.id   == this.b.id;
                
        return score >= 2;
    };
    
    Road.prototype.toObject = function() {
        return {
            "type":  "Road",
            "from":  this.a.id,
            "to":    this.b.id,
            "lanes": this.lanes
        };
    };
    
    // TODO: from object.
    
    return Road;
    
});
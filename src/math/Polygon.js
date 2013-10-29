define(function(require) {
    var Vector       = require("meier/math/Vector");
    var M            = require("meier/math/Math");
    var Intersection = require("meier/math/Intersection");
    
    /// Accepts:
    /// [vector, array<vector>]
    /// [array<vector>]
    /// []
    ///
    /// TODO: rotate.
    /// TODO: convex hull
    /// TODO: triangulate
    /// TODO: simplex
    /// TODO: SAT
    /// TODO: Area
    /// TODO: isConvex
    /// TODO: GJK
    ///
    
    function Polygon(position, vertices) {
        if(position instanceof Vector) {
            this.position = position;
            
            if(vertices instanceof Array) {
                this.vertices = vertices;
            } else {
                this.vertices = [];
            }
        } else if(position instanceof Array) {
            this.vertices = position;
            this.position = new Vector(0, 0);
        } else {
            this.vertices = [];
            this.position = new Vector(0, 0);
        }
    }
    
    Polygon.prototype.isConcave = function() {
        return ! this.isConvex();
    };
    
    Polygon.prototype.isConvex = function() {
        
        // It might be weird, but a line would
        if(this.vertices.length <= 2) {
            return true;
        }
        
        var sign = null;
        
        return this.vertices.eachPair(function(a, b) {
            var c = M.Sign(a.cross(b));
            
            if(sign === null) {
                sign = c;
                return true;
            } else if(c !== sign) {
                return false;
            }
        });
        
    };
    
    return Polygon;
});
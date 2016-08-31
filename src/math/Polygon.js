/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Vector       = require("meier/math/Vector");
    var M            = require("meier/math/Math");
    var Intersection = require("meier/math/Intersection");
    var LineSegment  = require("meier/math/Line");
    var Line         = require("meier/math/Line");
	var Math         = require("meier/math/Math");
	
    /// Accepts:
    /// [vector, array<vector>]
    /// [array<vector>]
    /// []
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
	
	/// Determine if a 2D point lies inside a polygon. Point on the boundary
	/// are considered "inside", though that may change in due time. 
	/// Internally uses the intersection count of a ray into from the point
	/// into an arbitrary direction.
	///
	/// @param {point} A point to test for.
	/// @returns Whether or not the point lies inside.
	Polygon.prototype.contains = function(point) {
		
		TODO("Implement axis-aligned ray linesegment intersection test.");
		var Test = Intersection.Test.Segments;
		
		// Should be fairly offscreen.
		var veryFarAway = 1640000;
		
		if("x" in point && "y" in point) {
			var ray = new LineSegment(point.x - this.position.x, point.y - this.position.y, veryFarAway, veryFarAway);
			var hits = 0;
			
			this.vertices.eachPair(function(a, b) {
				var line = new Line(a, b);
				
				if(Test(ray, line)) {
					++hits;
				}
	        }, true);
			
			if(Math.IsEven(hits)) {
				return false;
			}
			
			return true;
		} else {
			// Amend code when triggered.
			ASSERT(false, "Anything other than x&y hasn't been programmed yet.");
		}
		
		return false;
	};
	
	/// Append a new coordinate. The order of added coordinates 
	/// does matter. This is not a point cloud.
	Polygon.prototype.add = function(coordinate) {
		this.vertices.push(coordinate);
		return this;
	};
    
    /// Determine if this polygon is concave.
    /// Runs in at most O(n).
    ///
    /// @return boolean indicating if concave.
    Polygon.prototype.isConcave = function() {
        return ! this.isConvex();
    };
    
    /// Determine if this polygon is convex.
    /// Runs in at most O(n).
    ///
    /// @return boolean indicating if convex.
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
	
    Polygon.prototype.first = function() {
		return this.vertices.first();
	};
    
	Polygon.prototype.last = function() {
		return this.vertices.last();
	};
    
	Polygon.prototype.isEmpty = function() {
		return this.vertices.isEmpty();
	};
	
    return Polygon;
});
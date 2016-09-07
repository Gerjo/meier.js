/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Vec2         = require("meier/math/Vec")(2);
    var M            = require("meier/math/Math");
    var Intersection = require("meier/math/Intersection");
    var LineSegment  = require("meier/math/Line");
    var Line         = require("meier/math/Line");
	var Math         = require("meier/math/Math");
    var MLS          = require("meier/math/Polynomial").MovingLeastSquares;
	
	
	// Determine if the last coordinate equals the first. Hidden in
	// private scope because this method may not always make sense.
	function IsClosed(polygon) {
		
		// Open to interpretation...
		if(polygon.vertices.length <= 2) {
			return true;
		}
		
		return polygon.vertices.last().equals(polygon.vertices.first());
	}
	
    /// Accepts:
    /// [vector, array<vector>]
    /// [array<vector>]
    /// []
    ///
    function Polygon(position, vertices) {
        if(position instanceof Vec2) {
            this.position = position;
            
            if(vertices instanceof Array) {
                this.vertices = vertices;
            } else {
                this.vertices = [];
            }
        } else if(position instanceof Array) {
            this.vertices = position;
            this.position = new Vec2(0, 0);
        } else {
            this.vertices = [];
            this.position = new Vec2(0, 0);
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
			
			return true;
        });
        
    };
	
	/// Compute the circumference of this polygon. If the
	/// polygon has two coordinates, the line length is
	/// returned.
	///
	/// @return The circumference.
	Polygon.prototype.circumference = function() {
		
		// Early out for edge cases.
		if(this.vertices.length <= 1) {
			return 0;
		}
		
		var distance = 0;
		
		var max = this.vertices.length;
		
		// Exclude last coordinate.
		if(IsClosed(this)) {
			max -= 1;
		}
		
		for(var i = 1; i < max; ++i) {
			distance += this.vertices[i - 1].distanceTo(this.vertices[i]);
		}
		
		// Close the loop.
		distance += this.vertices.first().distanceTo(this.vertices.last());
		
		return distance;
	};
	
	/// Compute the squared pience-wise circumference of 
	/// this polygon. If the polygon has two coordinates, 
	/// the squared line length is returned.
	/// 
	/// Note: dont think that this holds:
	///   sqrt(circumferenceSq) == circumference
	///
	/// @return The circumference.
	Polygon.prototype.circumferenceSq = function() {
		
		// Early out for edge cases.
		if(this.vertices.length <= 1) {
			return 0;
		}
		
		var distance = 0;
		
		var max = this.vertices.length;
		
		// Exclude last coordinate.
		if(IsClosed(this)) {
			max -= 1;
		}
		
		for(var i = 1; i < max; ++i) {
			distance += this.vertices[i - 1].distanceToSq(this.vertices[i]);
		}
		
		// Close the loop.
		distance += this.vertices.first().distanceToSq(this.vertices.last());
		
		return distance;
	};
	
	
	/// Create a new polygon by resampling N uniformly spaced
	/// vertices on the border of this polygon.
	/// Note that the spacing between vertices on the new border,
	/// is not nesseccarrily uniform.
	///
	/// @param numVertices The desired number of vertices.
	/// @return A new polygon with specified number of vertices.
	Polygon.prototype.uniformResample = function(numVertices) {
	
		var circumference = this.circumference();
		var stepsize = circumference / numVertices;
		
		var res = [];
		
		var traveled = 0;
		
		
		var max = this.vertices.length;
		
		if(IsClosed(this)) {
			max -= 1;
		}
		
		for(var i = 0; i < max; ++i) {
			var a = this.vertices[(i == 0 ? this.vertices.length : i) - 1].clone();
			var b = this.vertices[i];
			var dir = b.direction(a).normalize();
			
			var d = a.distanceTo(b);
			
			var epsilon = 0.00001;
			
			// Did we overshoot?
			while(traveled + d >= (stepsize-epsilon)) {
				
				// Distance traveled on current line segment.
				var me = stepsize - traveled;
				
				// If epsilon was required, then use the actual distance. This
				// makes sure that "errors" do not accru over the entire
				// circumference of the polygon.
				if(traveled + d >= stepsize-epsilon && traveled + d < stepsize) {
					me = d;
				}
				
				res.push(
					a.addScaled(dir, me).clone()
				);
								
				d -= me;
				traveled = 0;
			}
			
			//ASSERT(d < stepsize);
			
			traveled += d;
		}
		
		//console.log("Remnant: " + traveled.toFixed(4));
		//console.log("Step size: " + stepsize.toFixed(4));
		return new Polygon(this.position, res);
	};
	
	/// Retrieve the first added coordinate.
	/// @return The first entry, or undefined if empty.
    Polygon.prototype.first = function() {
		return this.vertices.first();
	};
    
	/// Retrieve the last added coordinate.
	/// @return The last entry, or undefined if empty.
	Polygon.prototype.last = function() {
		return this.vertices.last();
	};
    
	/// Determine if this polygon is empty. Empty
	/// is defined as having no coordinates.
	Polygon.prototype.isEmpty = function() {
		return this.vertices.isEmpty();
	};
	
	/// Create a deep copy of this polygon.
	Polygon.prototype.clone = function() {
		return new Polygon(this.position, this.vertices.clone());
	};
	
	/// Reset the position and remove vertices of this polygon.
	Polygon.prototype.clear = function() {
		this.vertices.clear();
		this.position.x = 0;
		this.position.y = 0;
		return this;
	};
	
	/// Compute a smoothed version of this polygon. 
	/// @param sigma The sigma value of the gaussian function.
	/// @param numVertices The desired number of vertices in the new polygon.
	/// @return A copy represented a smoothed polygon.
	Polygon.prototype.mls = function(sigma, numVertices) {
		
		sigma = sigma || 1.2;
		vertices = vertices || 32;
		
		TODO("Tie MLS padding coordinate repetition parameter into sigma.");
		var samplesRepetition = 20; 
		
		if(this.vertices.length < samplesRepetition) {
			samplesRepetition = this.vertices.length;
		}
		
		// Repeat beginning and end coordinates. Polygons are continuous, so
		// this should be a nice approximation :)
		var vertices = this.vertices.slice(this.vertices.length-samplesRepetition).concat(this.vertices).concat(this.vertices.slice(0, samplesRepetition));
		
		
		var t = 0;
		var x = [];
		var y = [];
		
		var sampleStart = 0;
		var sampleEnd   = 0;
		
		for(var i = 0; i < vertices.length; ++i) {
			var vertex = vertices[i];
			
			if(i > 0) {
				t += vertices[i].distanceTo(vertices[i-1]);
			}
			
			x.push(new Vec2(t, vertex.x));
			y.push(new Vec2(t, vertex.y));
			
			// Record the padding time
			if(i == samplesRepetition) {
				sampleStart = t;
			}
			
			// Record the padding time
			if(i == vertices.length - samplesRepetition) {
				sampleEnd = t;
			}
		}
		/*
            var res = {
                "xMin": Infinity,
                "xMax": -Infinity,
                "xRange": 0,
                "basis": [],
                "points": points.clone().sort(function(a,b) { return a.x - b.x; }),
                "f": null
            };
		(*/
		
		var a = MLS(x, sigma);
		var b = MLS(y, sigma);
		
		var res = [];
		

		var stepsize = (sampleEnd - sampleStart) / (numVertices-1);
		
		// Some coordinates are repeated. The offset marks
		// the start (and end) of the "original" series.		
		for(var j = sampleStart; j < sampleEnd; j += stepsize) {
			var v = new Vec2(
				a.f(j),
				b.f(j)
			);
						
			res.push(v);
		}
		
		return new Polygon(this.position, res);
	};
	
    return Polygon;
});
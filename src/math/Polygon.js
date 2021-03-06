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
	var Rectangle    = require("meier/math/Rectangle");
	var Hull         = require("meier/math/Hull");
	
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
        if(position && typeof position.x != "undefined") {
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
	
	/// Compute similarity to another polygon.
	///
	///
	Polygon.prototype.similarity = function(other) {
		TODO("Implement this.");
	
		return 0;
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
	
	Polygon.prototype.average = function() {
		
		if(this.vertices.length == 0) {
			return new Vec2(0, 0);
		}
		
		var x = 0, y = 0;
		
		this.vertices.forEach(function(v) {
			x += v.x;
			y += v.y;
		});
		
		return new Vec2(x / this.vertices.length, y / this.vertices.length);
	};
	
	/// Reset the position and remove vertices of this polygon.
	Polygon.prototype.clear = function() {
		this.vertices.clear();
		this.position.x = 0;
		this.position.y = 0;
		return this;
	};
	
	Polygon.prototype.aligned = function() {

		var min = this.min();
		var res = new Polygon(min);
		
		this.vertices.forEach(function(v) {
			res.add(new Vec2(
				v.x - min.x,
				v.y - min.y
			));
		});		
		
		return res;
	};
	
	Polygon.prototype.min = function() {
		var res = new Vec2();
		
		this.vertices.forEach(function(v, i) {
			
			if(v.x < res.x || i == 0) {
				res.x = v.x;
			}
			
			if(v.y < res.y || i == 0) {
				res.y = v.y;
			}
		});
		
		return res.add(this.position);
	};
	
	Polygon.prototype.max = function() {
		var res = new Vec2();
		
		this.vertices.forEach(function(v, i) {
			
			if(v.x > res.x || i == 0) {
				res.x = v.x;
			}
			
			if(v.y > res.y || i == 0) {
				res.y = v.y;
			}
		});
		
		return es.add(this.position);
	};
	
	Polygon.prototype.width = function() {
		var rect = this.boundingRect();
		
		return rect.max.x - rect.min.x
	};
	
	Polygon.prototype.height = function() {
		var rect = this.boundingRect();
		
		return rect.max.y - rect.min.y
	};

	/// Compute minimum fitting axis aligned rectangle.
	Polygon.prototype.boundingRect = function() {
		var r;
		
		if(this.vertices.length == 0) {
			r = new Rectangle(0, 0, 0, 0);
		} else {
			r = new Rectangle(this.vertices[0].clone(), this.vertices[0].clone());
		}
		
		this.vertices.forEach(function(v, i) {
			if(v.x < r.min.x) {
				r.min.x = v.x;
			}
			
			if(v.y < r.min.y) {
				r.min.y = v.y;
			}
			
			if(v.x > r.max.x) {
				r.max.x = v.x;
			}
			
			if(v.y > r.max.y) {
				r.max.y = v.y;
			}
		});
		
		r.min.add(this.position);
		r.max.add(this.position);
		
		return r;
	};
	
	/// Compute a smoothed version of this polygon. 
	/// @param sigma The sigma value of the gaussian function.
	/// @param numVertices The desired number of vertices in the new polygon.
	/// @return A copy represented a smoothed polygon.
	Polygon.prototype.mls = function(sigma, numVertices) {
		
		sigma = sigma || 1.2;
		numVertices = numVertices || 32;
		
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
	
	/// Compute the convex hull of this polygon.
	/// @return A new polygon representing the convex hull.
	Polygon.prototype.hull = function() {
		var hull = Hull.Convex(this.vertices);
		
		return new Polygon(this.position, hull);
	};
	
	/// Compute the overlap between polygons using a raster.
	/// @param other Some other polygon
	/// @return An object with union, intersection and 
	/// other properties
	Polygon.prototype.rasterCompare = function(other) {
		var Renderer = require("meier/engine/Renderer");
		
		
		var a = this.aligned(); 
		var b = other.aligned();
		
		var u = a.boundingRect();
		var v = b.boundingRect();

		// Center onto canvas
		a.position.x = u.width() * -0.5;
		a.position.y = u.height() * -0.5;
		b.position.x = v.width() * -0.5;
		b.position.y = v.height() * -0.5;
		
		// Optimize the renderer size. Increases speed due
		// to a per pixel time complexity. Add a few bonus
		// pixels to account for out-of-screen anti-aliasing
		var w = Math.max(a.width(), b.width()) + 5;
		var h = Math.max(a.height(), b.height()) + 5;

		var res = {
			raster: null,
			
			outer: 0,
			union: 0,
			a: 0,
			b: 0
		};
		
		
		if(w != 0 && h != 0) {
			var renderer = new Renderer(w, h);
			
			renderer.setSmoothing(false);
			renderer.begin();
			renderer.polygon(a);
			renderer.fill("RGBA(255, 0, 0, 0.5)");
			renderer.begin();
			renderer.polygon(b);
			renderer.fill("RGBA(0, 255, 0, 0.5)");
		
			var imdata = renderer.context.getImageData(0, 0, renderer.width, renderer.height);
		
			
			var R = 1 << 0;
			var G = 1 << 1;
			var B = 1 << 2;
			
			var obj = { };
			obj[0] = 0;
			obj[R] = 0;
			obj[G] = 0;
			obj[B] = 0;
			
			obj[R | G]     = 0;
			obj[R | G | B] = 0;
			obj[G | B]     = 0;
			obj[R | B]     = 0;

			for(var i = 0; i < imdata.data.length; i += 4) {
				var bits = 0;
				
				if(imdata.data[i + 0] > 0) {
					bits |= R;
				}
				if(imdata.data[i + 1] > 0) {
					bits |= G;
				}
				if(imdata.data[i + 2] > 0) {
					bits |= B;
				}
			
				++obj[bits];
			}
		
			res.raster = renderer;
		
			res.intersection = obj[R | G]; 
			res.outer        = obj[0];
			res.a            = obj[R];
			res.b            = obj[G];
			res.union        = res.intersection + res.a + res.b;
			
			res.total        = res.union + res.outer + res.a + res.b;
		}
				
		return res;
	};
	
    return Polygon;
});
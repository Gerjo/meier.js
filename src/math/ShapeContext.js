define(function(require) {
	var H = require("meier/math/Histogram");
	var M = require("meier/math/Mat");
	var Vec2 = require("meier/math/Vec")(2);
	var Angles = require("meier/math/Angle");
	var Dist = require("meier/math/Distance");
	
	
	function ShapeContextLocalDescriptor(distanceBuckets, angleBuckets, pixels) {
		var distances = new (M(pixels.length, pixels.length));
		var angles    = new (M(pixels.length, pixels.length));
		
		//console.log(pixels.length);
		
		var Histogram = H(0, distanceBuckets * angleBuckets, distanceBuckets * angleBuckets);
		
		var sum = {
			distance: 0,
			angle: 0,
			position: new Vec2(0, 0)
		};
		
		var avg = {
			distance: 0,
			angle: 0,
			position: new Vec2(0, 0)
		};
		
		for(var i = 0; i < pixels.length; ++i) {
			sum.position.x += pixels[i].x;
			sum.position.y += pixels[i].y;
		}
		
		
		avg.position.x = sum.position.x / pixels.length;
		avg.position.y = sum.position.y / pixels.length;
		
		// Accumulate & compute point-to-point
		for(var i = 0; i < pixels.length; ++i) {

			var baseline = pixels[i].direction(avg.position);


			for(var j = 0; j < pixels.length; ++j) {
				
				var dir = pixels[i].direction(pixels[j]);
				var a = baseline.angleBetween(dir);
				
				a = Angles.ToAbsoluteRadians(a);
				
				var d = pixels[i].distanceTo(pixels[j]);
				sum.distance += d;
				sum.angle += a;
				
				distances.set(i, j, d);
				
				angles.set(i, j, a);
			}
		}
		
		avg.distance = sum.distance / (pixels.length * pixels.length);
		avg.angle = sum.angle / (pixels.length * pixels.length);
		
		
		distances.multiply(1 / avg.distance);
		
		var lambda = 1;
		
		//console.log(distances.pretty(3));
		
		TODO("merge logic.");
		// Quantize results
		for(var i = 0; i < pixels.length; ++i) {
			for(var j = 0; j < pixels.length; ++j) {
				
				
				var v = distances.get(i, j);
				var n = 0;
				for(var base = 0; base < distanceBuckets; ++base) {
					if(v < 0.1250 * lambda * Math.pow(1.75, base)) {
						++n;
					}
				}
				
				distances.set(i, j, n);
				//distances.set(j, i, n); // dupe when i = j
				
				angles.set(i, j, Math.floor(angles.get(i, j) / (Math.TwoPI / angleBuckets)) );
				//angles.set(j, i, 1 + Math.floor(angles.get(j, i) / (Math.TwoPI / angleBuckets)) );
			}
		}

		//console.log(distances.pretty(0));
		
		//console.log("pixels: " + pixels.length);
		//console.log(distances.pretty(0));
		
		var histograms = [];
		
		for(var i = 0; i < pixels.length; ++i) {
			
			var histogram = new Histogram();
			
			for(var j = 0; j < pixels.length; ++j) {
				
				// Skip self.
				if(i == j) {
					continue;
				}
				
				// Remove one due to +1 earlier.
				var d = distances.get(i, j) - 1;
				var a = angles.get(i, j);

				var bin = a * distanceBuckets + d;
			
				histogram.add(bin, 1);
			}
			
			// Normalize, as return vector.
			histograms.push(histogram.toVector(true));
		}

		return histograms;
	}
	
	ShapeContextLocalDescriptor.Compute = function(a, b) {
		
		var Distance = Dist.Cosine;

		var weights = new (M(a.length, b.length))();
		
		// a = rows = r;
		// b = columns = c;
		
		if(false) {
			a.forEach(function(h, i) {
				console.log("a["+i+"]: " + h.pretty(2, true));
			});
		
			b.forEach(function(h, i) {
				console.log("b["+i+"]: " + h.pretty(2, true));
			});
		}
		
		for(var r = 0; r < weights.numrows; ++r) {
			for(var c = 0; c < weights.numcolumns; ++c) {
				weights.setSafe(r, c, 1 - Distance(b[c], a[r]));
			}
		}
		
		console.log(weights.pretty(3));
		
		//weights.rescaleValues();
		
		var path = weights.hungarian();
		
		
		var cost = path.reduce(function(prev, cur, i) {
			//console.log(c, i);
			
			if(weights.numrows <= cur || weights.numcolumns <= i) {
				console.error("wrong indexing");
			}
			
			return prev + weights.get(cur, i);
		}, 0);
		
		//weights.rescaleValues();
		
		console.log(path.join(", "));
		//console.log(cost);
		
		return { 
			weights: weights,
			path: path,
			cost: cost / path.length
		};
	};
	
	ShapeContextLocalDescriptor.Assignment = function(a, b) {
		
		var weights = new (M(b.length, a.length));
		
		for(var i = 0; i < a.length; ++i) {
			for(var j = 0; j < b.length; ++j) {
				
				var d = a[i].distanceTo(b[j]);
				
				weights.set(i, j, d);
			}	
		}
		
		var path = weights.hungarian();
		
		var cost = path.reduce(function(prev, cur, i) {
			//console.log(c, i);
			
			if(weights.numrows < cur || weights.numcolumns < i) {
				console.error("wrong indexing");
			}
			
			return prev + weights.get(cur, i);
		}, 0);
		
		return {
			path: path,
			weights: weights,
			cost: cost / path.length
		};
	}
	
	ShapeContextLocalDescriptor.Chamfer = function(a, b) {

		var path = [];
		
		var cost = a.reduce(function(score, p, i) {
						
			var min = b.reduce(function(prev, cur, j) {
				
				var d = p.distance(cur);
				
				if(d < prev) {
					path[i] = j;
					return d;
				}
				
				return prev;
				
			}, Infinity);
			
			return score + min;
		}, 0) / a.length;
		
		
		
		var weights = new (M(b.length, a.length))();

		return {
			weights: weights,
			path: path,
			cost: cost / path.length
		};
	};
	
	return ShapeContextLocalDescriptor;
});
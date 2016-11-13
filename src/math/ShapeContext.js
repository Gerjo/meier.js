define(function(require) {
	var H = require("meier/math/Histogram");
	var M = require("meier/math/Mat");
	var Angles = require("meier/math/Angle");
	var Dist = require("meier/math/Distance");
	
	
	//TODO("Resize all images to square. Perhaps shape makes it biased");
	//komt uit ocr domein.
	
	function ShapeContextLocalDescriptor(distanceBuckets, angleBuckets, pixels) {
		var distances = new (M(pixels.length, pixels.length));
		var angles    = new (M(pixels.length, pixels.length));
		
		//console.log(pixels.length);
		
		var Histogram = H(0, distanceBuckets * angleBuckets, distanceBuckets * angleBuckets);
		
		var sum = {
			distance: 0,
			angle: 0
		};
		
		// Accumulate & compute point-to-point
		for(var i = 0; i < pixels.length; ++i) {
			for(var j = i + 1; j < pixels.length; ++j) {
				
				var d = pixels[i].distanceTo(pixels[j]);
				var a = Angles.ToAbsoluteRadians(pixels[i].angleBetween(pixels[j]));
				
				sum.distance += d * 2;
				sum.angle += a;
				
				distances.set(i, j, d);
				distances.set(j, i, d);
				
				angles.set(i, j, a);
				angles.set(j, i, (Math.PI + a) % Math.TwoPI);				
			}
		}
		
		var avg = {
			distance: sum.distance / (pixels.length * pixels.length),
			angle: sum.angle / pixels.length
		};
		
		distances.multiply(1 / avg.distance);
		
		var lambda = 1; // 1 is sufficient due to normalisation of distances.
		
		//console.log(distances.pretty(2));
		
		TODO("merge logic.");
		// Quantize results
		for(var i = 0; i < pixels.length; ++i) {
			for(var j = i; j < pixels.length; ++j) {
				
				
				var v = distances.get(i, j);
				var base = 0;
				var n = 0;
				for(var base = 0; base < distanceBuckets; ++base) {
					if(v < 0.1250 * lambda * Math.pow(1.5, base)) {
						++n;
					}
				}
				
				distances.set(i, j, n);
				distances.set(j, i, n); // dupe when i = j
				
				angles.set(i, j, 1 + Math.floor(angles.get(i, j) / (Math.TwoPI / angleBuckets)) );
				angles.set(j, i, 1 + Math.floor(angles.get(j, i) / (Math.TwoPI / angleBuckets)) );
			}
		}
		
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
				var a = angles.get(i, j) - 1;

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

		var weights = new (M(b.length, a.length))();
		
		/*
		a.forEach(function(h, i) {
			console.log("a["+i+"]: " + h.pretty(2));
		});
		
		b.forEach(function(h, i) {
			console.log("b["+i+"]: " + h.pretty(2));
		});
		*/		
		
		for(var r = 0; r < weights.numrows; ++r) {
			for(var c = 0; c < weights.numcolumns; ++c) {
				weights.set(r, c, 1 - Distance(b[r], a[c]));
			}
		}
		
		//console.log(weights.pretty(2));
		
		//weights.rescaleValues();
		
		var path = weights.hungarian();
		
		var cost = path.reduce(function(prev, cur, i) {
			//console.log(c, i);
			
			if(weights.numrows < cur || weights.numcolumns < i) {
				console.error("wrong indexing");
			}
			
			return prev + weights.get(cur, i);
		}, 0);
		
		//weights.rescaleValues();
		
		//console.log(path);
		//console.log(cost);
		
		return { 
			weights: weights,
			path: path,
			cost: cost / path.length
		};
	};
	
	ShapeContextLocalDescriptor.Assignment = function(a, b) {
		
		var m = new (M(b.length, a.length));
		
		for(var i = 0; i < a.length; ++i) {
			for(var j = 0; j < b.length; ++j) {
				
				var d = a[i].distanceTo(b[j]);
				
				m.set(i, j, d);
			}	
		}
		
		return {
			path: m.hungarian(),
			weights: m
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
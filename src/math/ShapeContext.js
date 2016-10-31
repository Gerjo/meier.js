define(function(require) {
	var Histogram = require("meier/math/Histogram");
	var M = require("meier/math/Mat");
	var Angles = require("meier/math/Angle");
	
	function ShapeContextDescriptor(distanceBuckets, angleBuckets, pixels) {
		var distances = new (M(pixels.length, pixels.length));
		var angles    = new (M(pixels.length, pixels.length));
		
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
		
		// Quantize results
		for(var i = 0; i < pixels.length; ++i) {
			for(var j = i; j < pixels.length; ++j) {
				var base = 0.1250;
				
				var v = distances.get(i, j);
				var base = 0;
				var n = 0;
				for(var base = 0; base < distanceBuckets; ++base) {
					if(v < 0.1250 * Math.pow(1.5, base)) {
						++n;
					}
				}
				
				distances.set(i, j, n);
				distances.set(j, i, n); // dupe when i = j
				
				angles.set(i, j, 1 + Math.floor(angles.get(i, j) / (Math.TwoPI / angleBuckets)) );
				angles.set(j, i, 1 + Math.floor(angles.get(j, i) / (Math.TwoPI / angleBuckets)) );
			}
		}

		var mat = new (M(angleBuckets, distanceBuckets));
		
		var histogram = new (Histogram(0, distanceBuckets * angleBuckets, distanceBuckets * angleBuckets));
		
		for(var i = 0; i < pixels.length; ++i) {
			for(var j = 0; j < pixels.length; ++j) {
				// Remove one due to +1 earlier.
				var d = distances.get(i, j) - 1;
				var a = angles.get(i, j) - 1;
			
				mat.set(a, d, mat.get(a, d) + 1);
			
				var bin = a * distanceBuckets + d;
			
				histogram.add(bin, 1);
			}
		}

		return {
			histogram: histogram,
			matrix: mat
		};;
	}
	
	return ShapeContextDescriptor;
});
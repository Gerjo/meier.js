define(function(require) {
	var Statistics = require("meier/math/Statistics");
	
	function IsArray(arr) {
	  return (
	       arr instanceof Float64Array // Most likely.
		|| arr instanceof Array
	    || arr instanceof Int8Array
	    || arr instanceof Int16Array
	    || arr instanceof Int32Array
	    || arr instanceof Uint8Array
	    || arr instanceof Uint8ClampedArray
	    || arr instanceof Uint16Array
	    || arr instanceof Uint32Array
	    || arr instanceof Float32Array
	  )
	}
	
	function GetArray(arg) {
		
		if(arg) {
			if(IsArray(arg)) {
				return arg;
			}
		
			if(IsArray(arg._)) {
				return arg._;
			}
		}
		
		return arg;
	}
	
	
	var self = {
		
		/// 0 = similar
		/// 1 = dissimilar
		Cosine: function(a, b) {
			a = GetArray(a);
			b = GetArray(b);
			
			if(a.length != b.length) {
				throw new Error("Incorrect array length.");
			}
			
			var dot = 0;
			
			var u = 0;
			var v = 0;
			
			for(var i = 0; i < a.length; ++i) {
				dot += a[i] * b[i];
				
				u += a[i] * a[i];
				v += b[i] * b[i];
			}
			
			var denom = Math.sqrt(u * v)
			
			if(denom != 0) {
				return dot / denom;
			}
			
			return 1;
		},
		
		Minkowski: function(power, a, b) {
			a = GetArray(a);
			b = GetArray(b);
			
			if(a.length != b.length) {
				throw new Error("Incorrect array length.");
			}
			
			if(power ^ 1 == 1) {
				for(var i = 0; i < a.length; ++i) {
				    u += Math.pow(Math.abs(b[i] - a[i]), power);
				}
			} else {
				// Optimize the abs call away.
				for(var i = 0; i < a.length; ++i) {
				    u += Math.pow(b[i] - a[i], power);
				}
			}
			
			// Take the nth root.
			return Math.pow(u, 1 / power);
		},
		
		Euclidian: function(a, b) {
			return self.Minkoski(2, a, b);
		},
	
		Manhattan: function(a, b) {
			return self.Minkoski(1, a, b);
		},
		
		ChiSquared: function(a, b) {
			a = GetArray(a);
			b = GetArray(b);
			
			if(a.length != b.length) {
				throw new Error("Incorrect array length.");
			}
			
			var c = 0;
			
			for(var i = 0; i < a.length; ++i) {
				
				// Expected value: (could also take max(a,b) or min(a,b)).
				var sum = (a[i] + b[i]) * 0.5;
				
				if(sum != 0)
					c += Math.pow(a[i] - b[i], 2) / sum;
			}
			
			return c;
		},
		
		/// https://en.wikipedia.org/wiki/Pearson_product-moment_correlation_coefficient
		Pearson: function(a, b) {
			return Statistics.Correlation(GetArray(a), GetArray(b));
		},
		
		/// Spearman Rank Correlation. When two distributions
		/// do not measure the same quantity or type of items.
		Spearman: function(a, b) {
			
		},
		
		Covariance: function(a, b) {
			
		},
		
	};
	
	
	return self;
});
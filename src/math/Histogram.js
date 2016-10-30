define(function(require) {
	var Vec = require("meier/math/Vec");
	
	return function(min, max, buckets) {
		var VecN = Vec(buckets);
	
		var BucketSize = (max - min) / (buckets-1);
	
		function Index(item) {
			
			if(item > max) {
				return buckets - 1;
			} else if(item < min) {
				return 0;
			}

			return  Math.floor((item - min) / BucketSize);
		}
	
		function Histogram() {
			this.clear();

		}
		
		Histogram.prototype.clear = Histogram.prototype.reset = function() {
			this._ = [];
			this._sum = 0;
			this._max = 0;
			
			for(var i = 0; i < buckets; ++i) {
				this._[i] = 0;
			}
		};
		
		Histogram.prototype.add = Histogram.prototype.push = function(item) {
			
			if(item instanceof Array) {
				item.forEach(this.add.bind(this));
			} else {		
				var index = Index(item);
				
				++this._[index];
				
				if(this._[index] > this._max) {
					this._max = this._[index];
				}
				
				++this._sum;
			}
		};
		
		Histogram.prototype.toVector = function(normalize) {
			var v = new VecN();
			var sum = this._sum;
			
			if(normalize === true) {
				this._.forEach(function(b, i) {
					v.set(i, b / sum);
				});
			} else {
				this._.forEach(function(b, i) {
					v.set(i, b);
				});
			}
			
			return v;
		};
		
		Histogram.prototype.sum = function() {
			return this._sum;
		};
		
		Histogram.prototype.pretty = function() {
			
			var sum = this._sum;
			var res = "";
			
			this._.forEach(function(b, i) {
				res += "bucket[" + i + "] = " + b + " (" + (b / sum).toFixed(2) + ")\n";
			});
			
			return res;
		};
	
		return Histogram;
	}
});
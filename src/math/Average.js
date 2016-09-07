define(function(require) {
	
	/// Class to manage a rolling average value. It's 
	/// basically a box filter.
	function Average(size) {
		
		/// Size of history
		this.size  = size;
		
		/// Current average
		this.value = 0;
		
		this._dirty = false;
		
		/// Last N entries
		this._entries = [];
		
		/// Ring buffer, last inserted index
		this._index = -1;
	}
	
	/// Add a value to the rolling average. Internally
	/// recomputes the average in O(1)
	Average.prototype.add = function(value) {
		
		// Compute new index
		this._index = (this._index + 1) % this.size;
		
		// The value which is being replaced.
		var replacing = this._entries[this._index] || 0;
		
		var sum = this.value * this._entries.length - replacing + value;
		
		this._entries[this._index] = value;

		// Compute average
		this.value = sum / this._entries.length;		
	};
	
	/// Get the current value. Runs in O(1)
	Average.prototype.get = function() {
		return this.value;
	};
	
	
	return Average;
});
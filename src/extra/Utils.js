/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2017 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
	
	var self = {
		
		/// Create an n by m array with the given
		/// initial value. The initial value is 
		/// assigned by reference.
		Array: function(n, m, initial) {
			
			var array = new Array(n);
			
			for(var i = 0; i < n; ++i) {
				array[i] = new Array(m);
				
				for(var j = 0; j < n; ++j) {
					array[i][j] = initial;
				}
				
			}
			
			return array;
		},
	};
	
	return self;
});
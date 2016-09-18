/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2016 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

/// Create a resonably typed enum.
///
define(function(require) {
	
	return function() {
		
		var e = {};
		var args = Array.prototype.slice.call(arguments, 0);
		
		for(var i = 0; i < args.length; ++i) {
			
			var value = new Number(i);
			
			// Support all sensible keys.
			e[arguments[i]] = value;
			e[arguments[i].ucFirst()] = value;
			e[arguments[i].toUpperCase()] = value;
			e[arguments[i].toLowerCase()] = value;
		}
		
		e.Parse = function(key) {
			return e[key.toUpperCase()];
		};
		
		e.TryParse = function(key) {
			var upper = key.toUpperCase();
			
			if(upper in e) {
				return e[upper];
			}
			
			throw Error("Could not parse enum key '" + key + " into enum value'.");
		};
		
		return e;
	};
	
});
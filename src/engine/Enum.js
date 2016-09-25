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
			
			var key, value;
			
			if(args[i] instanceof Array) {
				key   = args[i][0];
				value = args[i][1];
			} else {
				key   = args[i];
				value = args[i];
			}
			
			var ident = new String("Enum." + key);
			
			(function(key, value, ident) {
			
				/*value.valueOf = function() {
					return "Enum." + key.ucFirst();
				};
				*/
					
				//ident.toString = function() {
				//	return key; // Makes sure "Foo" == Enum.Foo :)
				//};
				
				ident.value = function() {
					return value;
				};
			
				// Support all sensible keys.
				e[key] = ident;
				e[key.ucFirst()] = ident;
				e[key.toUpperCase()] = ident;
				e[key.toLowerCase()] = ident;
				e[ident.toString()] = ident; // has the enum prefix.
			}(key, value, ident))
		}
		
		e.Parse = function(key) {
			return e[key] || e[key.toUpperCase()];
		};
		
		e.TryParse = function(key) {
			// Try normalized
			var upper = key.toUpperCase();
			
			if(upper in e) {
				return e[upper];
			}
			
			throw Error("Could not parse enum key '" + key + " into enum value'.");
		};
		
		if(Object.freeze) {
			Object.freeze(e);
		}
		
		return e;
	};
	
});
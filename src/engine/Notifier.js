/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2016 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

/// Helper class for observers to take notice of change.
define(function(require) {
	
	var DEFAULT_IDENT = "MEIER DEFAULT EVENT IDENT";
	
	function Notifier() {
		this._fired = 0;
		
		this._cache = {};
	}
	
	/// Allow all future calls to hasChange
	/// trigger once for each unique ID.
	Notifier.prototype.notify = function() {
		++this._fired;
	};
	
	/// Observe whether change took place. Modifies
	/// the internal state to register the observation.
	/// @param ident Optional unique observer ID.
	Notifier.prototype.notified = function(ident) {
		
		if(arguments.length == 0) {
			ident = DEFAULT_IDENT;
		}
		
		if(this._cache.hasOwnProperty(ident)) {
			
			if(this._cache[ident] != this._fired) {
				this._cache[ident] = this._fired;				
				return true;
			}
			
			return false;
		} else {
			this._cache[ident] = this._fired;
			return true;
		}
	};
	
	
	return Notifier;
});
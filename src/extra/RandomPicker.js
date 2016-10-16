/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
	var Random = require("meier/math/Random");

	function RandomPicker(rng) {
		if( ! rng) {
			rng = Random;
		}
		
		this._rng = rng;
		
		this._options = [];
		this._max = 0;
	}
	
	RandomPicker.prototype.add = function(item, weight) {
		this._max += weight;
		this._options.push({
			item: item,
			weight: weight
		});
	};
	
	RandomPicker.prototype.update = function(item, weight) {
		for(var k in this._options) {
			if(this._options.hasOwnProperty(k)) {
				if(this._options[k].item == item) {
					this._max -= this._options[k].weight;
					this._options[k].weight = weight;
					this._max += this._options[k].weight;
				}
			}
		}
	};
	
	RandomPicker.prototype.weight = function(item) {
		
		for(var k in this._options) {
			if(this._options.hasOwnProperty(k)) {
				if(this._options[k].item == item) {
					return this._options[k].weight;
				}
			}
		}
		
		return -1;
	};
	
	RandomPicker.prototype.remove = function(item) {
		this._options = this._options.filter(function(e) {
			if(e.item != item) {
				return true;
			}

			this._max -= e.weight;
			
			return false;
		}.bind(this));
	};	
	
	RandomPicker.prototype.pick = function() {
		var n = Random(0, this._max, true);
		
		var sum = 0;
		
		for(var k in this._options) {
			if(this._options.hasOwnProperty(k)) {
				var e = this._options[k];
				
				if(e.weight != 0) {
				
					sum += e.weight;

					if(n <= sum) {
						return e.item;
					}
				
				}
			}
		}
		
		return undefined;
	};
	
	return RandomPicker;
});
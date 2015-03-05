define(function(require) {
	
	var Texture = require("meier/engine/Texture");
	
	function Action(text, texture, type, x, y) {
		this.x       = x || 0;
		this.y       = y || 0;
		this.type    = type || null
		this.texture = new Texture(texture);
		this.text    = text || "Default Action";
		this.time    = NaN;
	}
	
	Action.prototype.clone = function(x, y) {
		return new Action(this.text, this.texture._url, this.type, x, y);
	};
	
	Action.prototype.toString = function() {
		if(this.type == null) {
			return this.text;
		}
		return this.type.ucFirst() + ": " + this.text;
	};
	
	Action.prototype.toObject = function() {
		return {
			x: this.x,
			y: this.y,
			type: this.type,
			texture: this.texture._url,
			text: this.text
		};
	};
	
	Action.fromObject = function(json) {
		return new Action(json.text, json.texture, json.type, json.x, json.y);
	};
	
	return Action;
});
define(function(require) {
	var Vec2 = require("meier/math/Vec")(2);
	
	function Bucket(x, y, color) {
		this.position = new Vec2(x || 0, y || 0);
		this.color = color || "red";
	}
	
	return Bucket;
});
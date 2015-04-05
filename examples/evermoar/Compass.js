define(function(require) {
	
	var f = function Compass(a, b) {
		var out = 0;
		
		var dx = a.x - b.x;
		var dy = a.y - b.y;
		
		if(dx > 0) {
			out |= f.East;
		} else if(dx < 0) {
			out |= f.West;
		}
		
		if(dy > 0) {
			out |= f.North;
		} else if(dy < 0) {
			out |= f.South;
		}
		
		return out;
	};
	
	f.Null  = 0;
	
	f.North = 1 << 0;
	f.East  = 1 << 1;
	f.South = 1 << 2;
	f.West  = 1 << 3;
	
	f.NorthEast = f.North | f.East;
	f.SouthEast = f.South | f.East;
	
	f.NorthWest = f.North | f.West;
	f.SouthWest = f.South | f.West;
	
	return f;
});
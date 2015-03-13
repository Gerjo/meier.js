define(function(require) {
    var Entity     = require("meier/engine/Entity");
    var RawTexture = require("meier/engine/RawTexture");
    var Vec2       = require("meier/math/Vec")(2);
	var Color      = require("meier/engine/Colors");
	
	var Bucket     = require("./Bucket");
	
    World.prototype = new Entity();
    
    function World(w, h) {        
        Entity.call(this, 0, 0, w, h);
		
		this.bucketsize = new Vec2(0, 0);
		this.dimensions = new Vec2(0, 0);
		
		this.buckets = [];
		this.bycolor = {};
		
		this.pixelmap = new RawTexture("images/pixelmap.png", function(image) {
			var colors = image.asMatrix();
			
			var h = colors.r.numrows;
			var w = colors.r.numcolumns;
			
			this.bucketsize.x = this.width  / w;
			this.bucketsize.y = this.height / h;
			
			console.log("Rows: " + colors.r.numrows);
			console.log("Columns: " + colors.r.numcolumns);
				
			var hsize = this.bucketsize.clone().scaleScalar(0.5);
			
			for(var row = 0; row < colors.r.numrows; ++row) {
				
				this.buckets.push([]);
				
				for(var col = 0; col < colors.r.numcolumns; ++col) {
					
					var r = colors.r.get(colors.r.numrows - row - 1, col);
					var g = colors.g.get(colors.r.numrows - row - 1, col);
					var b = colors.b.get(colors.r.numrows - row - 1, col);
					
					var color = "rgb(" + r + ", " + g + ", " + b + ")";
					
					this.buckets.last().push(new Bucket(
						col * this.bucketsize.x - this.hw + hsize.x,
						(row * this.bucketsize.y - this.hh + hsize.y),
						color
					));
					
					if( ! this.bycolor[color]) {
						this.bycolor[color] = [];
					}
					
					this.bycolor[color].push(this.buckets.last().last());
				}
			}
			
			console.log("Grid size: " + this.buckets.length + "x" + this.buckets[0].length);
			
			this.dimensions.x = this.buckets.length;
			this.dimensions.y = this.buckets[0].length;
		}.bind(this));
    }
    
    World.prototype.update = function(dt) {
        Entity.prototype.update.call(this, dt);
        
    };
    
    World.prototype.draw = function(renderer) {
        Entity.prototype.draw.call(this, renderer);
        
		var size = this.bucketsize;
		
		// Render per color layer
		for(var k in this.bycolor) {
			if(this.bycolor.hasOwnProperty(k)) {
				renderer.begin();
				this.bycolor[k].forEach(function(bucket) {
					renderer.rectangle(bucket.position.x, bucket.position.y, size.x, size.y);
				});
				
				renderer.fill(Color.Alpha(k, 0.65));
				renderer.stroke(k);
			}
		}
    };
	
	return World;
});
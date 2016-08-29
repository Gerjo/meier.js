define(function(require) {
    var Entity = require("meier/engine/Entity");
    var V2     = require("meier/math/Vec")(2);
    var math   = require("meier/math/Math");
    var Colors = require("meier/engine/Colors");
    var Matrix = require("meier/math/Mat");
    
    var Bucket = Field.Bucket = function(x, y, v) {
        this.x     = x;
        this.y     = y;
        this.v     = v || new V2(0, 0);
        this.fill  = null;
        
        // Algorithmic related properties
        this.p     = null;    // Back pointer
        this.c     = 0;       // Cost from here to sink.
        
        this.count = 0;       // N times visited.
    }
    
    Field.prototype = new Entity();
    function Field(color, size, w, h) {
        Entity.call(this, 0, 0, w, h);        
        
        this.size  = size || 10;
        this.previousMouse = null;
        this.color = color || Colors.black;
        this.isNavigation = false;
        
        this.kernel = Matrix(3, 3).CreateGaussian(2.2);        
        
        this.buckets = [];
        
        var offsets = new V2(
            0, 0//(this.hw  % this.size),
            //(this.hh % this.size)
        );
        
        for(var x = -(this.hw + offsets.x); x <= this.hw; x += this.size) {
            this.buckets.push([]);
            for(var y = -this.hh - offsets.y; y <= this.hh; y += this.size) {
                this.buckets.last().push(new Bucket(x, y, null));
            }
        }
    }
    
    Field.prototype.toIndex = function(position) {
        return new V2(
            math.Round((position.x + this.hw) / this.size),
            math.Round((position.y + this.hh) / this.size)
        );
    }
    
    Field.prototype.onMouseMove = function(input) {
        var index = this.toIndex(this.toLocal(input));
    };
    
    Field.prototype.onMouseDrag = function(input) {
        var local = this.toLocal(input);
        var index = this.toIndex(local);
        
        if(this.previousMouse) {
            var direction = local.direction(this.previousMouse).normalize();

            var hx = parseInt(this.kernel.numcolumns * 0.5);            
            var hy = parseInt(this.kernel.numrows    * 0.5);
            
            for(var x = -hx; x <= hx; ++x) {
                for(var y = -hy; y <= hy; ++y) {
                    this.buckets[index.x + x][index.y + y].v.addScaled(direction, this.kernel.get(x + hx, y + hy)); 
                }
            }
        }
        
        this.previousMouse = local;
    };
    
    Field.prototype.atIndex = function(x, y) {
        if( ! isNaN(x.x)) {
            return this.buckets[x.x][x.y];
        }
    
        return this.buckets[x][y];
    };
    
    Field.prototype.atPosition = function(x, y) {
        if( ! isNaN(x)) {
            x = new V2(x, y);
        }
        
        return this.atIndex(this.toIndex(x));
    };
    
    Field.prototype.draw = function(renderer) {

        var hover = this.toIndex(this.toLocal(this.input));
        var l     = 10;
        
        var color = Colors.Alpha(this.color, 0.7);
        renderer.begin();
        
        for(var x = 0; x < this.buckets.length; ++x) {
            for(var y = 0; y < this.buckets[x].length; ++y) {
                var b = this.buckets[x][y];
                
                if(this.isNavigation) {
                    renderer.rectangle(b.x, b.y, this.size, this.size);
                }
                
                if(b.fill) {
                    renderer.stroke(color);
                    renderer.begin();
                    renderer.rectangle(b.x, b.y, this.size, this.size);
                    renderer.fill(b.fill);
                    renderer.begin();
                }
                
                if( ! b.v.isNull()) {
                    //renderer.line(b.x, b.y, b.x + b.v.x * l, b.y + b.v.y * l);
                    renderer.arrow(b.x, b.y, b.x + b.v.x * l, b.y + b.v.y * l);
                }
            }   
        }
        
        renderer.stroke(color, 1);
    }
    
    Field.prototype.load = function(storage) {

        storage.forEach(function(bucket) {
            var index = this.toIndex(this.toLocal(new V2(bucket.x, bucket.y)));
            var v = new V2(parseFloat(bucket.vx || 0), parseFloat(bucket.vy || 0));
            
            // The world might've been generated with a smaller resolution.
            if(this.buckets[index.x] && this.buckets[index.x][index.y]) {
                this.buckets[index.x][index.y].v = v;
                
                ;
            } else {
                this.game.log("Error","Could not load data. Data in memory is smaller than visual world.");
            }
            
        }.bind(this));
    };
    
    Field.prototype.toArray = function() {
        var array = [];
        
        this.buckets.walk(function(bucket) {
            
            // Skip null vectors.
            if(bucket.v && ! bucket.v.isNull()) {
                array.push({
                    x:  bucket.x,
                    y:  bucket.y,
                    vx: bucket.v.x,
                    vy: bucket.v.y
                });
            }
        });
        
        return array;
    }
    
    return Field;
});
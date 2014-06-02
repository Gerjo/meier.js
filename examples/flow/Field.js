define(function(require) {
    var Entity = require("meier/engine/Entity");
    var V2     = require("meier/math/Vec")(2);
    var math   = require("meier/math/Math");
    var Colors = require("meier/aux/Colors");
    var Matrix = require("meier/math/Mat");
    
    function Bucket(x, y, color, v) {
        this.x     = x;
        this.y     = y;
        this.color = color || Colors.BLACK;
        this.v     = v || new V2(0, 0);
    }
    
    Field.prototype = new Entity();
    function Field(color) {
        Entity.call(this, 0, 0, 10, 10);        
        
        this.previousMouse = null;
        this.color = color || Colors.black;
        
        
        this.kernel = Matrix(7, 7).CreateGaussian(2.2);        
    }
    
    Field.prototype.onAdd = function(game) {
        this.width   = game.width;
        this.height  = game.height;
        
        this.buckets = [];
        this.size    = 10;
        
        var offsets = new V2(
            0, 0//(this.hw  % this.size),
            //(this.hh % this.size)
        );
        
        for(var x = -(this.hw + offsets.x); x <= this.hw; x += this.size) {
            this.buckets.push([]);
            for(var y = -this.hh - offsets.y; y <= this.hh; y += this.size) {
                this.buckets.last().push(new Bucket(x, y, this.color, null));
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
    
    Field.prototype.draw = function(renderer) {
        var size  = this.size;
        var hover = this.toIndex(this.toLocal(this.input));
        var l     = 20;
        
        
        renderer.begin();
        
        for(var x = 0; x < this.buckets.length; ++x) {
            for(var y = 0; y < this.buckets[x].length; ++y) {
                var b = this.buckets[x][y];
                if( ! b.v.isNull()) {
                    renderer.line(b.x, b.y, b.x + b.v.x * l, b.y + b.v.y * l);
                }
                
            }   
        }
        
        renderer.stroke(Colors.Alpha(b.color, 0.7));
    }
    
    return Field;
});
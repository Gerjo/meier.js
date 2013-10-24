define(function(require){
    var Size   = require("meier/math/Size");
    var Vector = require("meier/math/Vector");
    
    function Stats(width, height) {
        // Tweakable:
        this.size       = new Size(width, height);
        this.offset     = new Size(10, (height * 0.5) - 10);
        this.stats      = {};
        this.fontSize   = 12;
        this.charWidth  = this.fontSize - 4;
        this.color      = "black";
    
        // Show by default:
        this.showstats = true;
    
        // Calculated internals.
        this.columnWidth    = 1;
        this.estimatedWidth = 0;
    }

    Stats.prototype.show = function(doShow) {
        this.showstats = doShow;
    };

    Stats.prototype.setColor = function(color) {
        this.color = color;
    };

    Stats.prototype.log = function(key, value) {
        this.set(key, value);
    };

    Stats.prototype.set = function(key, value) {
        this.stats[key + ":"] = value;
    
        // Estimate the column with. Works due to monospaced font.
        this.columnWidth = Math.max(this.columnWidth, (key.length + 1) * this.charWidth);
    
        var guess = (value.toString().length) * this.charWidth + this.columnWidth;
  
        this.estimatedWidth = Math.max(this.estimatedWidth, guess);
    };

    Stats.prototype.delete = function(key) {
        delete this.stats[key + ":"];
    };

    Stats.prototype.update = function(dt) {
    
    };

    Stats.prototype.draw = function(context) {
        if(!this.showstats) {
            return;
        }
    
    
        var x = (this.size.w * 0.5) - this.estimatedWidth - this.offset.w;
        var y = this.offset.h;
        
        var font = "bold " + this.fontSize + "px Monospace";

        for(var k in this.stats) {
            if(this.stats.hasOwnProperty(k)) {
            
                context.text(k, x, y, this.color, "left", "top", font)
                context.text(this.stats[k], x + this.columnWidth, y, this.color, "left", "top", font)
            
                y -= this.fontSize;
            }
        }
    
    };    
   
   return Stats;
});

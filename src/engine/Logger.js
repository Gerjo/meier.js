define(function(require){
    var Size   = require("meier/math/Size");
    var Vector = require("meier/math/Vector");
    
    function Logger(width, height) {
        // Tweakable:
        this.size       = new Size(width, height);
        this.offset     = new Size(10, (height * 0.5) - 10);
        this.Logger      = {};
        this.fontSize   = 12;
        this.charWidth  = this.fontSize - 4;
        this.color      = "black";
    
        // Show by default:
        this.showLogger = true;
    
        // Calculated internals.
        this.columnWidth    = 1;
        this.estimatedWidth = 0;
    }

    Logger.prototype.show = function(doShow) {
        this.showLogger = doShow;
    };

    Logger.prototype.setColor = function(color) {
        this.color = color;
    };

    Logger.prototype.log = function(key, value) {
        this.set(key, value);
    };

    Logger.prototype.set = function(key, value) {
        this.Logger[key + ":"] = value;
    
        // Estimate the column with. Works due to monospaced font.
        this.columnWidth = Math.max(this.columnWidth, (key.length + 1) * this.charWidth);
    
        var guess = (value.toString().length) * this.charWidth + this.columnWidth;
  
        this.estimatedWidth = Math.max(this.estimatedWidth, guess);
    };

    Logger.prototype.delete = function(key) {
        delete this.Logger[key + ":"];
    };

    Logger.prototype.update = function(dt) {
    
    };

    Logger.prototype.draw = function(context) {
        if(!this.showLogger) {
            return;
        }
    
    
        var x = (this.size.w * 0.5) - this.estimatedWidth - this.offset.w;
        var y = this.offset.h;
        
        var font = "bold " + this.fontSize + "px Monospace";

        for(var k in this.Logger) {
            if(this.Logger.hasOwnProperty(k)) {
            
                context.text(k, x, y, this.color, "left", "top", font)
                context.text(this.Logger[k], x + this.columnWidth, y, this.color, "left", "top", font)
            
                y -= this.fontSize;
            }
        }
    
    };    
   
   return Logger;
});

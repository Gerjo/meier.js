define(function(require) {
    var Entity = require("meier/engine/Entity");
    
    Frame.prototype = new Entity();
    function Frame(x, y, w, h) {
        Entity.call(this, x, y, w || 180, h || 180);
        
        this.spacing   = 30;
        
        
        this.gridcolor = "rgba(0,0,0,0.1)";
        this.axiscolor = "rgba(0,0,0,0.3)";
        this.backdrop  = "rgba(0,0,0,0.1)";
        this.shownum   = true;
        this.labelcolor = "black";
        this.labelfont  = "10px monospace"; 
    }
    
    Frame.prototype.draw = function(r) {
        
        var steps = Math.max(this.width, this.height) / this.spacing;
        var s = (steps * 0.5 * this.spacing);
                
        // Backdrop:
        r.begin();
        r.rectangle(0, 0, s * 2, s * 2);
        r.fill(this.backdrop);
        
        // Grid:
        [1, -1].forEach(function(j) {
            
            for(var i = 0; i <= steps * 0.5; ++i) {
                var x = i * this.spacing * j;
                r.begin();
                r.line(x, -s, x, s);
                r.line(-s, x, s, x);
                
                if(this.shownum && i != 0) {
                    r.text(i * j, x, 0, this.labelcolor, "center", "top", this.labelfont);
                    r.text(i * j, -2, x, this.labelcolor, "right", "middle", this.labelfont);
                }
                
                if(i == 0) {
                    r.stroke(this.axiscolor);
                } else {
                    r.stroke(this.gridcolor);
                }
            }
        }.bind(this));

        Entity.prototype.draw.call(this, r);
    };
    
    return Frame;
    
});
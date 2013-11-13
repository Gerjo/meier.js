define(function(require) {
    var Entity = require("meier/engine/Entity");
    var Pixel  = require("meier/prefab/Pixel");
    
    Frame.prototype = new Entity();
    function Frame(x, y, w, h) {
        Entity.call(this, x, y, w || 180, h || 180);
        
        this.spacing    = 30;
        
        this.gridcolor  = "rgba(0,0,0,0.1)";
        this.axiscolor  = "rgba(0,0,0,0.3)";
        this.backdrop   = "rgba(0,0,0,0.1)";
        this.shownum    = true;
        this.labelcolor = "black";
        this.labelfont  = "10px monospace";
        
        this.reallabels = false;
    }
    
    Frame.prototype.draw = function(r) {
        Entity.prototype.draw.call(this, r);
        
        var wsteps = this.width  / this.spacing;
        var hsteps = this.height / this.spacing;
        
        var w = (wsteps * 0.5 * this.spacing);
        var h = (hsteps * 0.5 * this.spacing);
                
        // Backdrop:
        r.begin();
        r.rectangle(0, 0, this.width, this.height);
        r.fill(this.backdrop);
        
        // Grid:
        [1, -1].forEach(function(j) {
            
            for(var i = 0; i <= hsteps * 0.5; ++i) {
                var x = i * this.spacing * j;
                var label = this.reallabels ? i * j * this.spacing : i * j;
                
                r.begin();
                
                r.line(-w, x, w, x);
                
                if(this.shownum && i != 0) {
                    if(this.reallabels) {
                        
                    }
                    r.text(label, -2, x, this.labelcolor, "right", "middle", this.labelfont);
                }
                
                if(i == 0) {
                    r.stroke(this.axiscolor);
                } else {
                    r.stroke(this.gridcolor);
                }
            }
        }.bind(this));
        
        // Grid:
        [1, -1].forEach(function(j) {
            
            for(var i = 0; i <= wsteps * 0.5; ++i) {
                var x = i * this.spacing * j;
                var label = this.reallabels ? i * j * this.spacing : i * j;
                
                r.begin();
                r.line(x, -h, x, h);
                
                
                if(this.shownum && i != 0) {
                    r.text(label, x, 0, this.labelcolor, "center", "top", this.labelfont);
                }
                
                if(i == 0) {
                    r.stroke(this.axiscolor);
                } else {
                    r.stroke(this.gridcolor);
                }
            }
        }.bind(this));
        
        
    };
        
    return Frame;
    
});
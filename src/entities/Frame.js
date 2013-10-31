define(function(require) {
    var Entity = require("meier/engine/Entity");
    var Pixel  = require("meier/entities/Pixel");
    
    Frame.prototype = new Entity();
    function Frame(x, y, w, h) {
        Entity.call(this, x, y, w || 180, h || 180);
        
        this.spacing = 30;
        this.v       = 1;
        
        this.gridcolor = "rgba(0,0,0,0.1)";
        this.axiscolor = "rgba(0,0,0,0.3)";
        this.backdrop  = "rgba(0,0,0,0.1)";
        this.shownum   = true;
        this.labelcolor = "black";
        this.labelfont  = "10px monospace"; 
        
        this.add(this.p = new Pixel());
    }
    
    Frame.prototype.update = function(dt) {
                
        if(this.position.x != 0) {
            this.rotation += dt * this.v;
        }
        
        this.p.position = this.toLocal(this.input.clone());
        
        Entity.prototype.update.call(this, dt);
    };
    
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

        var local = this.toLocal(this.input);

        r.begin();
        r.circle(local, 2);
        r.stroke("green");
        
        r.begin();
        r.line(local.x, local.y, local.x, 0);
        r.line(local.x, local.y, 0, local.y);
        r.stroke("rgba(0, 0, 0, 0.3)");

        Entity.prototype.draw.call(this, r);
    };
    
    return Frame;
    
});
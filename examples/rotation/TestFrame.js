define(function(require) {
    var Frame = require("meier/prefab/Frame");
    var Pixel  = require("meier/prefab/Pixel");
    
    TestFrame.prototype = new Frame();
    function TestFrame(x, y, w, h) {
        Frame.call(this, x, y, w, h);
        
        this.v       = 1;
        
        this.add(this.p = new Pixel());        
    }
    
    TestFrame.prototype.update = function(dt) {
                
        if(this.position.x != 0) {
            this.rotation += dt * this.v;
        }
        
        this.p.position = this.toLocal(this.input.clone());
        
        Frame.prototype.update.call(this, dt);
    };
    
    TestFrame.prototype.draw = function(r) {
        Frame.prototype.draw.call(this, r);
        
        var local = this.toLocal(this.input);

        r.begin();
        r.circle(local, 2);
        r.stroke("green");
        
        r.begin();
        r.line(local.x, local.y, local.x, 0);
        r.line(local.x, local.y, 0, local.y);
        r.stroke("rgba(0, 0, 0, 0.3)");
    };
    
    return TestFrame;
    
});
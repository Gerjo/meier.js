define(function(require) {
    var Sound  = require("meier/engine/Sound");
    var Entity = require("meier/engine/Entity");
    var Input  = require("meier/engine/Input");
    var Lerp   = require("meier/math/Lerp");
    
    Pad.prototype = new Entity();
    function Pad(x, y, w, h, src, name) {
        Entity.call(this, x, y, w, h);
        
        this.sound = new Sound(src);
        this.src   = src;
        this.name  = name;

        this.to    = [0,0,0,0.5];
        this.from  = [0,0,0,0.5];
        this.delay = 3;
        this.dt    = 0;
        
        this.enableEvent(Input.LEFT_DOWN);
    }
    
    Pad.prototype.fadeTo = function(color) {
        this.from  = this.to;
        this.to    = color.clone();
        this.dt    = 0;
    };
    
    Pad.prototype.onLeftDown = function(input) {
        
        this.game.pads[this.src].first().flash();
        
        this.sound.play();
        return true;
    };
    
    Pad.prototype.flash = function() {
        //this.opacity = 0;
        this.to[0] -= 25;
        this.to[1] -= 25;
        this.to[2] -= 25;
        this.to[3] += 0.1;
    };
    
    Pad.prototype.update = function(dt) {
        this.dt += dt;
        //console.log(this.dt);
    };
    
    Pad.prototype.draw = function(r) {
        r.begin();
        r.rectangle(0, 0, this.width, this.height);
        
        var i = Math.min(this.dt / this.delay, 1);
        r.fill(Lerp.Color(this.from, this.to, i));
        
        //console.log(this.dt / this.delay);
        
        r.text(this.name, 0, this.height * 0.5 - 40, "rgba(0,0,0,0.2)", "center", "middle", "30px monospace")
        
        //r.stroke("black");
        
        this.opacity = 1;
    };
    
    
    return Pad;
});
define(function(require) {
    var Game   = require("meier/engine/Game");
    var Frame  = require("meier/entities/Frame");
    var Pixel  = require("meier/entities/Pixel");
    var Vector = require("meier/math/Vector");
    var Matrix = require("meier/math/Matrix");

    
    Rotation.prototype = new Game();
    function Rotation(container) {
        Game.call(this, container);
        
        this.setFps(30);        
        
        var q = new Vector(4, 3);
        
        var r = Matrix.CreateRotation(Math.PI / -3);
        var t = Matrix.CreateTranslation(0, 0);
        
        var T = r.product(t);
                
        var p = T.transform(q);
                
        this.moving = new Frame(-20, 40); 
        this.fixed  = new Frame(0, 0, this.width, this.height);
        this.sub    = new Frame(210, 10);
        this.subsub = new Frame(100, -210);
        
        // Rotate relative to parent.
        this.moving.rotation = Math.PI / 6;
        this.sub.rotation = Math.PI / 6;
        this.sub.v = 1;
        this.subsub.v = -2;
        
        
        
        this.sub.add(this.subsub);
        this.moving.add(this.sub);
        this.fixed.add(this.moving);
        this.add(this.fixed);
    }
    
    Rotation.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
    };
    
    
    Rotation.prototype.draw = function(r) {
        Game.prototype.draw.call(this, r);
    };
    
    return Rotation;
    
});
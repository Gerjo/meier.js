define(function(require) {
    var Game   = require("meier/engine/Game");
    var Frame  = require("meier/entities/Frame");
    var Pixel  = require("meier/entities/Pixel");
    var Vector = require("meier/math/Vector");
    var Matrix = require("meier/math/Matrix");

    
    Rotation.prototype = new Game();
    function Rotation(container) {
        Game.call(this, container);
        
        var step = 30;
        var p = new Vector(2, 2);
        
        var r = Matrix.CreateRotation(Math.PI / 6);
        var t = Matrix.CreateTranslation(120, 120);
        
        var q = t.product(r).transform(p);
        
        
        // Round to nearest multiple of 20:
        this.moving = new Frame(0, 0); 
        this.fixed  = new Frame(0, 0, this.width, this.height);
        
        // Rotate relative to parent.
        this.moving.position.x = 120;
        this.moving.position.y = 120;
        this.moving.rotation = Math.PI / 6;
        
        this.moving.add(new Pixel(p.x * step, p.y * step));
        this.fixed.add(new Pixel(q.x * step, q.y * step));
        
        
        this.fixed.add(this.moving);
        this.add(this.fixed);
    }
    
    
    Rotation.prototype.draw = function(r) {
        Game.prototype.draw.call(this, r);

    };
    
    return Rotation;
    
});
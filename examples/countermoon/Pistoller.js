define(function(require) {
    var Entity     = require("meier/engine/Entity");
    var Texture    = require("meier/engine/Texture");
    var Vector     = require("meier/math/Vector");
    var Input      = require("meier/engine/Input");
    var Stopwatch  = require("meier/aux/Stopwatch");
    var Projectile = require("./Projectile");
    
    Pistoller.prototype = new Entity();
    
    function Pistoller(game)
    {
        // Call super class constructor:
        Entity.call(this, 0, 0, 100, 100);
        
        // One must subscribe for methods:
        this.enableEvent(
            Input.LEFT_DOWN,
            Input.LEFT_UP
        );
        
        this.isBeingDragged = false;
        this.timer = new Stopwatch();
    }
    
    Pistoller.prototype.update = function(dt)
    {
        this.rotation += dt ;
        
        if(this.isBeingDragged)
        {
            this.position = this.input.clone();
        }
        else if(this.timer.peek() > 250)
        {
            this.timer.start();
            var angle = this.game.input.clone().subtract(this.position).angle();
            var bullet = new Projectile(this.position, angle);
            this.game.add(bullet);
        }
    };
    
    Pistoller.prototype.onLeftDown = function()
    {
        this.isBeingDragged = true;
    };
    
    Pistoller.prototype.onLeftUp = function()
    {
        this.isBeingDragged = false;
    };
    
    Pistoller.prototype.draw = function(renderer) 
    {
        
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.stroke('blue', 5);
        renderer.fill('black');
        
        renderer.begin();
        renderer.line(0, 0, this.toLocal(this.game.input));
        renderer.stroke('black', 3);
    };
    
    return Pistoller;
    
});
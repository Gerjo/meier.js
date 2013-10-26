define(function(require) {
    var Entity     = require("meier/engine/Entity");
    var Texture    = require("meier/engine/Texture");
    var Vector     = require("meier/math/Vector");
    var Stopwatch  = require("meier/aux/Stopwatch");
    
    Zombie.prototype = new Entity();
    
    function Zombie(position, targetEntity)
    {
        // Call super class constructor:
        Entity.call(this, 0, 0, 100, 100);
        
        this.position = position;
        this.target = targetEntity;
        
        this.timer = new Stopwatch();
    }
    
    Zombie.prototype.update = function(dt)
    {
        var velo = Vector.CreateAngular(this.target.position.clone().subtract(this.position).angle());
        this.position.add(velo);
    };
    
    Zombie.prototype.draw = function(renderer) 
    {
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.stroke('yellow', 5);
        renderer.fill('green');
    };
    
    return Zombie;
});
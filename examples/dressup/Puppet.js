define(function(require) {
    var Entity     = require("meier/engine/Entity");
    var Texture    = require("meier/engine/Texture");
    var Vector     = require("meier/math/Vector");
    
    Puppet.prototype = new Entity();
    
    function Puppet(game)
    {
        // Call super class constructor:
        Entity.call(this, 200, 0, 100, 100);
        
        
    }
    
    Puppet.prototype.update = function(dt)
    {
        
    };
    
    Puppet.prototype.draw = function(renderer) 
    {
        
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.stroke('blue', 5);
        renderer.fill('black');
        
    };
    
    return Puppet;
    
});
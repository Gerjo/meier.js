define(function(require) {
    var Game = require("meier/engine/Game");
    var Tree = require("meier/collections/FooTree");
    var Unit = require("./Unit");
    
    TreeApp.prototype = new Game();
    function TreeApp(container) {
        Game.call(this, container);
        
        this.tree = new Tree(this.width, this.height);
        
        this.add(new Unit(100, 0));        
    }
    
    TreeApp.prototype.add = function(entity) {
        Game.prototype.add.call(this, entity);
        
        this.tree.add(entity);
    };
    
    TreeApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        this.tree.clear().add(this._entities);
        
        var r = this.tree.getNodeAt(new Tree.Criterion(), this.input);
        
        
        renderer.begin();
        this.tree.draw(renderer);
        renderer.fill("rgba(255, 0, 0, 0.1)");
        renderer.stroke("rgba(255, 0, 0, 0.3)");
    
    
    
    
        // Collision detection:
        
    };
    
    return TreeApp;
});
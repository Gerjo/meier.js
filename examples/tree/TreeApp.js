define(function(require) {
    var Game      = require("meier/engine/Game");
    var Tree      = require("meier/collections/FancyTree");
    var Unit      = require("./Unit");
    var Random    = require("meier/math/Random");
    var Vector    = require("meier/math/Vec")(2);
    var TestRect  = require("meier/math/Intersection").Rectangles;
    var dat       = require("meier/contrib/datgui");
    
    var NaiveIntersection = require("meier/engine/Entity").NaiveIntersection;
    
    TreeApp.prototype = new Game();
    function TreeApp(container) {
        Game.call(this, container);
        this.setFps(60);
        
        this.numEntities = 400;
        
        this.gui = new dat.GUI();
    	this.gui.add(this, 'numEntities', 0, 1000);
        
        this.tree = new Tree(this.width, this.height);
        
        Random.Seed(3);      
    }
    
    TreeApp.prototype.add = function(entity) {
        Game.prototype.add.call(this, entity);
        
        this.tree.add(entity);
    };
    
    TreeApp.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
    
        var c = this._entities.length;
        while(c > this.numEntities) {
            this._entities[--c].delete();
        }
        
        while(c < this.numEntities -1) {
            this.add(new Unit(Random.Range(-this.hw, this.hw), Random.Range(-this.hh, this.hh)));
            ++c;
        }
    
    };
    
    TreeApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        this.tree.clear().add(this._entities);
        
        //var r = this.trerenderer.begin();
        var collision = new Tree.Criterion();
        collision.minimalSize  = 2;
        collision.maximalSize  = 100;
        collision.minimalEntities = 2;
        collision.maximalEntities = 30;
        
        this.tree.visit(collision, function(node) {
            var a, b;
            for(var i = 0; i < node.entities.length; ++i) {
                a = node.entities[i];
                for(var j = i + 1; j < node.entities.length; ++j) {
                    b = node.entities[j];
                    
                    // OBB testing / SAT / GJK - soon.
                    if(NaiveIntersection(a, b)) {
                        b.color = "red";
                        a.color = "red";
                    }
                }
            }
            
            return true;
        });
        
        var start = new Vector(10, 10);
        var end   = this.input.clone();
        
        var path  = this.tree.findPath(start, end, renderer);
        
        if(path !== false) { 
            renderer.begin();
            for(var i = 1; i < path.length; ++i) {
                renderer.line(path[i - 1], path[i]);
            }
            renderer.stroke("black", 3);            
        }
                
        renderer.begin();
        this.tree.draw(renderer);
        renderer.fill("rgba(255, 0, 0, 0.1)");
        renderer.stroke("rgba(255, 0, 0, 0.1)");
    };
    
    return TreeApp;
});
define(function(require){
    var Game         = require("meier/engine/Game");
    var AvlTree      = require("meier/collections/AvlTree");
    var Polygon      = require("meier/math/Polygon");
    var Vector       = require("meier/math/Vector");
    var Intersection = require("meier/math/Intersection");
    var Minkowski    = require("meier/math/Minkowski");
    var Gjk          = require("meier/math/Gjk");
    
    Test.prototype = new Game();
    function Test(container) {
        Game.call(this, container);
        
        this.a = new Polygon(
            new Vector(200, -10),
            [
            new Vector(-10, 10),
            new Vector(10, 10),
            new Vector(0, -30)
            ]
        );
        
        this.b = new Polygon(
            new Vector(100, 1-0),
            [
            new Vector(-65.0, -130.0),
            new Vector(130.0, -130.0),
            new Vector(60.0, 195.0),
            new Vector(2.5, 195.0),
            new Vector(-65.0, 132.5)
            ]
        );
    }
    
    Test.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
        this.a.position = this.input.clone();
        
    };
    
    Test.prototype.draw = function(r) {
        Game.prototype.draw.call(this, r);
        
        r.begin();
        r.line(0, this.hh, 0, -this.hh);
        r.line(-this.hw, 0,this.hw, 0);
        r.stroke("rgba(0,0,0,0.3)");
        
        r.begin();
        r.polygon(this.a);
        r.stroke("black");
        
        r.begin();
        r.polygon(this.b);
        r.stroke("red");
        
        Gjk.Test(this.a, this.b, r);
    };
    
    return Test;
});
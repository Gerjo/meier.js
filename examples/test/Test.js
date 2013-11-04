define(function(require){
    var Game         = require("meier/engine/Game");
    var Input        = require("meier/engine/Input");
    var Key          = require("meier/engine/Key");
    var AvlTree      = require("meier/collections/AvlTree");
    var Polygon      = require("meier/math/Polygon");
    var Vector       = require("meier/math/Vector");
    var Intersection = require("meier/math/Intersection");
    var Minkowski    = require("meier/math/Minkowski");
    var Gjk          = require("meier/math/Gjk");
    var Frame        = require("meier/prefab/Frame");
    var Pixel        = require("meier/prefab/Pixel");
    var Matrix       = require("meier/math/Matrix");
    var Matrix4      = require("meier/math/Matrix4");
    var Vector3      = require("meier/math/Vector3");
    
    
    var M      = require("meier/math/Mat")(3);
    var V      = require("meier/math/Vec")(3);
    var V2     = require("meier/math/Vec")(2);
    var V3     = require("meier/math/Vec")(3);
    
    
    var M32    = require("meier/math/Mat")(3, 2);
    var M23    = require("meier/math/Mat")(2, 3);
    
    var M23 = require("meier/math/Mat")(2, 3);
    var M32 = require("meier/math/Mat")(3, 2);
    var M44 = require("meier/math/Mat")(4, 4);
    var M33 = require("meier/math/Mat")(3, 3);
    
    
    Test.prototype = new Game();
    function Test(container) {
        
        Game.call(this, container);
        
        this.setFps(60);
        this.add(new Frame(0,0,this.width, this.height));
        

        this.rotation = new V3(0, 0, 0.1);
        
        this.input.subscribe(Input.KEY_DOWN, function(input, key) {
            
        });
    }
    
    Test.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    Test.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        var s = M33.CreateScale(30);
        var z = M33.CreateXoY(this.rotation.z);
        var y = M33.CreateXoZ(this.input.x / 300);
        var x = M33.CreateYoZ(this.input.y / -300);
        
        var v = x.product(s).product(z).product(y);
        
        var p = new V3(2, -5, 4);
        var q = new V3(4,  2, 4);
        var c = p.cross(q);
        
        console.log(c.length() / p.length());
        
        renderer.begin();
        renderer.line(
            v.transform(p).x,
            v.transform(p).y,
            v.transform(q).x,
            v.transform(q).y
        );
        
        renderer.arrow(0,0,
            v.transform(c).x,
            v.transform(c).y
        );
        
        renderer.stroke("red", 1);
        
        
        renderer.begin();
        [new V3(6,0,0), new V3(0,6,0), new V3(0,0,6)].forEach(function(a) {
            renderer.arrow(0,0,
                v.transform(a).x,
                v.transform(a).y
            );
        });
        renderer.stroke("black", 2);
        
    }
    
    return Test;
});
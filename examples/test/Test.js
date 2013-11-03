define(function(require){
    var Game         = require("meier/engine/Game");
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
        
        /*var a = new M32([
            1, 0, 
            0, 1,
            1, 0
        ]);
        
        
        //     x x x x
        //     x x x x
        // x x
        // x x
        
        var at = a.transpose();
        
        
        var t = a.product(at.product(a).inverse().product(at));
        
        
        console.log(t.pretty());*/
        
        this.proj = M44.CreatePerspectiveProjection(0, 3000, Math.PI/2);
       
        console.log(this.proj.pretty());
        
        console.log(this.proj.transform(new V(100, 100, 4), true).wolfram());
        
        
        this.rot = Math.PI/4;
        
        
        
        this.box = [
        new V(0, 0, 0),
        new V(100, 0, 0),
        new V(100, 100, 0),
        new V(0, 100, 0),
        
        new V(0, 100, 200),
        new V(100, 100, 200),
        new V(100, 0, 200),
        
        new V(0, 0, 200)
        ];
        
        this.rot = 12;
        
        var param = M.CreateEulerParametersTransform(this.rot, new V(1, 1, 1));
        var axis = M.CreateAngleAxisRotation(this.rot, new V(1, 1, 1));
        
        console.log("eulerparam:");
        console.log(param.pretty());
        
        console.log("axis angle:");
        console.log(axis.pretty());
        
        var euler = M.CreateEulerAngles(Math.PI/6, Math.PI/4, Math.PI/3);
        
        console.log("euler angles:");
        console.log(euler.pretty());
        
    }
    
    Test.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        this.rot += dt;
        
        
    };
    
    Test.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        //this.rot = Math.PI/3;
        
        
        
        var euler = M.CreateEulerAngles(this.rot, this.rot, this.rot);

        var z = M.CreateXoY(this.rot);
        var y = M.CreateXoZ(this.rot);
        var x = M.CreateYoZ(this.rot);
        
        var xyz = z.product(x).product(y);
        
        var t1 = M44.CreateTranslation(new V(-100, 0, 0));
        var t2 = M44.CreateTranslation(new V(100, 0, 0));
        
        var param = M.CreateEulerParametersTransform(this.rot, new V(1, 1, 1));
        var axis = M.CreateAngleAxisRotation(this.rot, new V(1, 1, 1));
        
        // Build first polytope:
        var poly = [];
        for(var i = 0, p; i < this.box.length; ++i) {
            p = this.box[i];
            p = param.transform(p);
            p = t1.transform(p);
            poly.push(p);
        }
        renderer.begin();
        renderer.polygon(poly);
        renderer.stroke("black");
        renderer.fill("rgba(0,0,0,0.1)");
        renderer.text("Euler–Rodrigues", 300, 20, "black");    
        
        //return false;
        
        // Build second polytope:
        var poly2 = [];
        for(var i = 0, p; i < this.box.length; ++i) {
            p = this.box[i];
            p = axis.transform(p);
            p = t2.transform(p);
            poly2.push(p);
        }
        renderer.begin();
        renderer.polygon(poly2);
        renderer.stroke("red");
        renderer.fill("rgba(255,0,0,0.1)");    
        renderer.text("Axis angle rotation", 300, 40, "red");    
        
    }
    
    return Test;
});
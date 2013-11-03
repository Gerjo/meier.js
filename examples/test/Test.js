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
        
        
        
    }
    
    Test.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        this.rot += dt;
        
        
    };
    
    Test.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        renderer.save();
        renderer.begin();
        //renderer.scale(30);
        
        
        // Window.
        var view = M.CreateAxisProjection(new V(1, 1, 1));
        
     
        var r = M.CreateAngleAxisRotation(this.input.x / 100, new V(0, 1, 0));
                
        r = r.product(M.CreateAngleAxisRotation(this.input.y / -100, new V(1, 0, 0)));
        
       // this.rot = Math.PI / 2;
       
       // Rotate as usual.
       //var r = M.CreateXoY(this.rot);
       
       // About y axis
       //var r = M.CreateXoZ(this.rot);
       
       // About x axis
       //var r = M.CreateYoZ(this.rot);
       
       //var r = M.CreateIdentity();
        //var r = M.CreateYoZ(this.rot);
        
        r = M.CreateEulerAngles(this.rot, this.rot, this.rot);
        
        
        var poly = [];
        
        for(var i = 0, p; i < this.box.length; ++i) {
            p = this.box[i];
            
            p = r.transform(p);
            
            poly.push(p);
                        
            renderer.circle(p.x, p.y, 2);
        }
        
        renderer.polygon(poly);
        
        renderer.stroke("red");
        renderer.fill("rgba(0,0,0,0.1)");
        
        renderer.restore();
    }
    
    return Test;
});
define(function(require) {
    var Game     = require("meier/engine/Game");
    var Vector3  = require("meier/math/Vec")(3);
    var Matrix33 = require("meier/math/Mat")(3, 3);
    var Matrix44 = require("meier/math/Mat")(4, 4);
    var Grid     = require("meier/prefab/Grid");
    
    ThreeD.prototype = new Game();
    
    function ThreeD(container) {
        Game.call(this, container);
        
        this.coordinates = [
            new Vector3(0, 0, 0),
            new Vector3(100, 0, 0),
            new Vector3(100, 100, 0),
            new Vector3(0, 100, 0),
        
            new Vector3(0, 100, 200),
            new Vector3(100, 100, 200),
            new Vector3(100, 0, 200),
        
            new Vector3(0, 0, 200)
        ];
        
        this.rotation = 0;
        this.axis = new Vector3(1, 1, 1);
        
        this.add(new Grid(0, 0, this.width, this.height));
        
        this.setFps(60);
    }
    
    ThreeD.prototype.update = function(dt) {
        this.rotation += dt;
    };
    
    ThreeD.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        var z   = Matrix33.CreateXoY(this.rotation);
        var y   = Matrix33.CreateXoZ(this.rotation);
        var x   = Matrix33.CreateYoZ(this.rotation);
        var xyz = z.product(x).product(y);
        
        var param = Matrix33.CreateEulerParametersTransform(this.rotation, this.axis);
        var axis  = Matrix33.CreateAngleAxisRotation(this.rotation, this.axis);
        var euler = Matrix33.CreateEulerAngles(this.rotation, this.rotation, this.rotation);
        
        var t1 = Matrix44.CreateTranslation(new Vector3(-350, 0, 0));
        var t2 = Matrix44.CreateTranslation(new Vector3(-150, 0, 0));
        var t3 = Matrix44.CreateTranslation(new Vector3(150, 0, 0));
        var t4 = Matrix44.CreateTranslation(new Vector3(300, 0, 0));
        
        
        // Build first polytope:
        var poly1 = [];
        for(var i = 0, p; i < this.coordinates.length; ++i) {
            p = this.coordinates[i];
            p = param.transform(p);
            p = t1.transform(p);
            poly1.push(p);
        }
        renderer.begin();
        renderer.polygon(poly1);
        renderer.stroke("black");
        renderer.fill("rgba(0,0,0,0.1)");
        renderer.text("Euler–Rodrigues (1,1,1)", -350, -40, "black");    


        // Build second polytope:
        var poly2 = [];
        for(var i = 0, p; i < this.coordinates.length; ++i) {
            p = this.coordinates[i];
            p = axis.transform(p);
            p = t2.transform(p);
            poly2.push(p);
        }
        renderer.begin();
        renderer.polygon(poly2);
        renderer.stroke("red");
        renderer.fill("rgba(255,0,0,0.1)");    
        renderer.text("Axis angle rotation (1,1,1)", -130, -40, "red");    

        // Build third polytope:
        var poly3 = [];
        for(var i = 0, p; i < this.coordinates.length; ++i) {
            p = this.coordinates[i];
            p = euler.transform(p);
            p = t3.transform(p);
            poly3.push(p);
        }
        renderer.begin();
        renderer.polygon(poly3);
        renderer.stroke("blue");
        renderer.fill("rgba(0,0,255,0.1)");    
        renderer.text("XZX Euler Angles", 150, -40, "blue");    

        // Build third polytope:
        var poly4 = [];
        for(var i = 0, p; i < this.coordinates.length; ++i) {
            p = this.coordinates[i];
            p = xyz.transform(p);
            p = t4.transform(p);
            poly4.push(p);
        }
        renderer.begin();
        renderer.polygon(poly4);
        renderer.stroke("green");
        renderer.fill("rgba(0,255,0,0.1)");    
        renderer.text("XYZ rotation", 300, -40, "green");  
    }
    
    return ThreeD;
});
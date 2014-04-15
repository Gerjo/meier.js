define(function(require) {
    var V3 = require("meier/math/Vec")(3);
    
    var Types = {};
    Types.Triangle  = 1;
    Types.Rectangle = 2;
    Types.Cube      = 3;
    Types.Sphere    = 4;
    
    //
    // Suggested meta formatting: type / front-face-direction / sampler?
    
    
    function Triangle(a, b, c) {
        this.meta = new V3(Types.Triangle);
        this.a    = a || new V3(0, 0, 0);
        this.b    = b || new V3(0, 0, 0);
        this.c    = c || new V3(0, 0, 0);
        
        this.export = function() {
            var data = [];
            
            data.merge(this.meta._);
            data.merge(this.a._);
            data.merge(this.b._);
            data.merge(this.c._);
            
            return data;
        }
    }
    
    function Rectangle() {
        this.meta = new V3(Types.Rectangle);
        this.a    = new V3(0, 0, 0);
        this.b    = new V3(0, 0, 0);
        this.c    = new V3(0, 0, 0);
    }
    
    function Cube() {
        this.meta   = new V3(Types.Cube);
        this.center = new V3(0, 0, 0);
        this.size   = new V3(0, 0, 0);
    }
    
    function Sphere() {
        this.meta   = new V3(Types.Sphere);
        this.center = new V3(0, 0, 0);
        this.size   = new V3(0, 0, 0);
    }
    
    
    return {
        Types:     Types,
        Triangle:  Triangle,
        Rectangle: Rectangle,
        Cube:      Cube,
        Sphere:    Sphere
    };
});
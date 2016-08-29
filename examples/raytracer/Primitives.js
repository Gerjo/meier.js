define(function(require) {
    var V3 = require("meier/math/Vec")(3);
    
    var Types = {};
    Types.Triangle  = 1;
    Types.Rectangle = 2;
    Types.Cube      = 3;
    Types.Sphere    = 4;
    
    //
    // Suggested meta formatting: type / front-face-direction / sampler?
    
    
    function Triangle(a, b, c, n1, n2, n3, u, v, w, meta) {
        this.meta = meta || new V3(Types.Triangle, 0, 0);
        this.a    = a || new V3(0, 0, 0);
        this.b    = b || new V3(0, 0, 0);
        this.c    = c || new V3(0, 0, 0);
        
        this.n1   = n1 || new V3(0, 0, 0);
        this.n2   = n2 || new V3(0, 0, 0);
        this.n3   = n3 || new V3(0, 0, 0);
        
        this.u = u || new V3(0, 0, 0);
        this.v = v || new V3(1, 0, 0);
        this.w = w || new V3(1, 1, 0);
        
        this.export = function() {
            var data = [];
            
            data.merge(this.meta._);
            
            data.merge(this.a._);
            data.merge(this.b._);
            data.merge(this.c._);
            
            data.merge(this.n1._);
            data.merge(this.n2._);
            data.merge(this.n3._);
            
            data.merge(this.u._);
            data.merge(this.v._);
            data.merge(this.w._);
            
            ASSERT(data.length == 10 * 3);
            
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
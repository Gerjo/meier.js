define(function(require) {
    var Vector = require("meier/math/Vector");
    var Hull   = require("meier/math/Hull");
    
    return {
        ConvexSum: function(a, b, renderer) {
            var r = [];
            
            a.forEach(function(p) {
                var sub = b.map(function(q) {
                    return new Vector(q.x + p.x, q.y + p.y);
                });
                
                renderer.begin();
                renderer.polygon(sub);
                renderer.stroke("black");
                renderer.fill("rgba(0, 0, 0, 0.2)");

                r.merge(sub);
                
            });
            
            var hull = Hull.GiftWrap(r);
            
            renderer.begin();
            renderer.polygon(hull);
            renderer.stroke("black");
            renderer.fill("rgba(0, 0, 0, 0.2)");
            
            renderer.begin();
            renderer.polygon(a);
            renderer.stroke("black");
            renderer.fill("rgba(0, 0, 0, 0.2)");
            
            return r;
        }
    };
    
});
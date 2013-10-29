define(function(require) {
    var Vector = require("meier/math/Vector");
    var Hull   = require("meier/math/Hull");
    
    return {
        ConvexSum: function(translateA, a, translateB, b) {
            var r = [];
            
            a.forEach(function(p) {
                
                // Perhaps some filtering? We don't need every coordinate.
                var sub = b.map(function(q) {
                    return new Vector(
                            q.x - p.x - translateA.x + translateB.x, 
                            q.y - p.y - translateA.y + translateB.y);
                });
                
                r.merge(sub);
            });
            
            // TODO: implement more efficient algorithm.
            var hull = Hull.GiftWrap(r);
            
            return hull;
        }
    };
    
});
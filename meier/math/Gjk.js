/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Minkowski = require("meier/math/Minkowski");
    var Vector    = require("meier/math/Vector");
    var Polygon   = require("meier/math/Polygon");
    var Hull      = require("meier/math/Hull");
    
    return {
        Test: function(a, b, r) {
            
            //var t = a.vertices.map(function(p){ return new Vector(p.x + a.position.x, p.y + a.position.y); });
            
            var hull = Minkowski.ConvexSum(a.position, a.vertices, b.position, b.vertices);
        
            r.begin();
            r.polygon(hull);
            r.stroke("blue");
            
            r.begin();
            r.polygon(a);
            r.stroke("red");
            
            r.begin();
            r.polygon(b);
            r.stroke("green");
        
        }
    };
    
});
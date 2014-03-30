/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Vector       = require("meier/math/Vector");
    var M            = require("meier/math/Math");
    var Intersection = require("meier/math/Intersection");
    
    /// Accepts:
    /// [vector, array<vector>]
    /// [array<vector>]
    /// []
    ///
    
    function Polygon(position, vertices) {
        if(position instanceof Vector) {
            this.position = position;
            
            if(vertices instanceof Array) {
                this.vertices = vertices;
            } else {
                this.vertices = [];
            }
        } else if(position instanceof Array) {
            this.vertices = position;
            this.position = new Vector(0, 0);
        } else {
            this.vertices = [];
            this.position = new Vector(0, 0);
        }
    }
    
    /// Determine if this polygon is concave.
    /// Runs in at most O(n).
    ///
    /// @return boolean indicating if concave.
    Polygon.prototype.isConcave = function() {
        return ! this.isConvex();
    };
    
    /// Determine if this polygon is convex.
    /// Runs in at most O(n).
    ///
    /// @return boolean indicating if convex.
    Polygon.prototype.isConvex = function() {
        
        // It might be weird, but a line would
        if(this.vertices.length <= 2) {
            return true;
        }
        
        var sign = null;
        
        return this.vertices.eachPair(function(a, b) {
            var c = M.Sign(a.cross(b));
            
            if(sign === null) {
                sign = c;
                return true;
            } else if(c !== sign) {
                return false;
            }
        });
        
    };
    
    return Polygon;
});
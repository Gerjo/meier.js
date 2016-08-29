/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/


/// I frequently require randomish noise of sorts. Let's see
/// if we can maintain generic noise functions in one file.
define(function(require) {
    
    /// Based on mersenne twister
    var Random = require("meier/math/Random");
    var Lerp   = require("meier/math/Lerp");
    var Vector = require("meier/math/Vec")(2);

    var self = {
        /// Generate a logerithmic curve and its mirrored counterpart.
        ///
        /// @param {grid} A grid instance to add the coordiates to.
        /*Logarithmic: function(grid) {
            grid.clear();
        
            // Number of coordinates to add
            var n = 20;
        
            // Scaling factor
            var d = 20;
        
            // Function to generate a random sign
            var RandomSign = function() {
                return Random(0, 1) == 0 ? -1 : 1;
            };
        
            for(var i = 0, x, y; i < n; ++i) {
                x = Random(1, d);
                y = Random(1, d);
            
                x = Math.ln(x) * y * 2;
                y = Math.ln(y) * x;
                
                // Introduce a sign {-1, 1}... imaginary logarithm?
                y *= RandomSign();
                
                // Voronoi crashes with non unique coordinates
                if( ! grid.hasCoordinate(x, y)) {
                    --i;
                    continue;
                }
                        
                // Trigger a click on the last add. This forces a 
                // recomputation of internals.
                if(i == n - 1) {
                    grid.onLeftDown(new Vector(x, y));
                } else {
                    grid.add(new Vector(x, y));
                }
            }
        },*/
    
        /// Generate a circle with some noise added to each coordinate
        ///
        /// @param {grid} A grid instance to add the coordiates to.
        Circle: function(center, radius, n) {
            
            
            // The radius
            radius = radius || Random(100, 200);
        
            // Center of the circle
            center = center || new Vector(Random(-30, 30), Random(-30, 30));
        
            // Number of points to generate
            n      = n || 50;
        
            // Noise margin [-e, e], defaults to e = 10
            var e      = isNaN(noise) ? 10 : noise; 
        
            var noise = new Array(n);
        
            for(var i = 0, x, y, angle = 0, error; i < n; ++i) {
                angle += Math.TwoPI / n;
            
                // Positional error
                error = Random(-e, e);
            
                // Parametric circle
                x = Math.cos(angle) * radius + center.x + error;
                y = Math.sin(angle) * radius + center.y + error;
            
                noise[i] = new Vector(x, y);
            }
            
            return noise;
        },
        
        Line: function(from, to) {
            
            from = from || new Vector(-100, -100);
            to   = to   || new Vector(100, 100);
            
            var n     = parseInt(to.distance(from) / 10);
            var noise = new Array(n);
            var e     = 5;
            
            for(var i = 0; i < n; ++i) {
                var base = Lerp(from, to, i / n);
                
                base.add(base.clone().perp().normalize().scaleScalar(Random(-e, e)));
                
                noise[i] = base;
            }
            
            
            return noise;
        },
        
        /// A single large arc
        LargeArc: function(width, height) {
            
            // Generate a data set:
            var w = width * 0.9, hw = w * 0.5;
    
            var coordinates = [];
    
            for(var x = -hw; x <= hw; x += Random(20, 50)) {
                var t = (x + hw) / w * Math.PI;
        
                var v = new Vector(x, Math.sin(t) * 100);
                v.y += Random(-20, 20);
        
                coordinates.push(v);
            }
    
            return coordinates;
        },
        
        /// A single large arc
        LargeArc: function(width, height) {
            
            // Generate a data set:
            var w = width * 0.9, hw = w * 0.5;
    
            var coordinates = [];
    
            for(var x = -hw; x <= hw; x += Random(20, 50)) {
                var t = (x + hw) / w * Math.PI;
        
                var v = new Vector(x, Math.sin(t) * 100);
                v.y += Random(-20, 20);
        
                coordinates.push(v);
            }
    
            return coordinates;
        },
        
        /// A single large arc
        Wave: function(width, height) {
            
            // Generate a data set:
            var w = width * 0.9, hw = w * 0.5;
    
            var coordinates = [];
    
            for(var x = -hw; x <= hw; x += Random(20/3, 50/3)) {
                var t = (x + hw) / w * Math.PI;
        
                var v = new Vector(x, Math.sin(t * 10) * 100);
                v.y += Random(-20, 20);
        
                coordinates.push(v);
            }
    
            return coordinates;
        },
        
        /*,
        
        /// Generate uniformly distributed noise.
        ///
        /// @param {grid} A grid instance to add the coordiates to.
        Noise: function(grid) {
            grid.clear();
            
            // Number of points to generate
            var n  = 50;
            
            var hw = grid.hw - 50;
            var hh = grid.hh - 50;
            
            for(var i = 0, x, y; i < n; ++i) {
                x = Random(-hw, hw);
                y = Random(-hh, hh);
                
                if(i == n - 1) {
                    grid.onLeftDown(new Vector(x, y));
                } else {
                    grid.add(new Vector(x, y));
                }
            }
            
        },*/
        
    }; // End self
    
    return self;
});
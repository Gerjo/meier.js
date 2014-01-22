define(function(require) {
    
    /// Based on mersenne twister
    var Random = require("meier/math/Random");
    var Vector = require("meier/math/Vec")(2);

    var self = {
        /// Generate a logerithmic curve and its mirrored counterpart.
        ///
        /// @param {grid} A grid instance to add the coordiates to.
        Logarithmic: function(grid) {
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
        },
    
        /// Generate a circle with some noise added to each coordinate
        ///
        /// @param {grid} A grid instance to add the coordiates to.
        NoisyCircle: function(grid, noise) {
            grid.clear();
        
            // The radius
            var radius = Random(100, 200);
        
            // Center of the circle
            var center = new Vector(Random(-30, 30), Random(-30, 30));
        
            // Number of points to generate
            var n      = 50;
        
            // Noise margin [-e, e], defaults to e = 10
            var e      = isNaN(noise) ? 10 : noise; 
        
            for(var i = 0, x, y, angle = 0, error; i < n; ++i) {
                angle += Math.TwoPI / n;
            
                // Positional error
                error = Random(-e, e);
            
                // Parametric circle
                x = Math.cos(angle) * radius + center.x + error;
                y = Math.sin(angle) * radius + center.y + error;
            
                // Trigger a click on the last add. This forces a 
                // recomputation of internals.
                if(i == n - 1) {
                    grid.onLeftDown(new Vector(x, y));
                } else {
                    grid.add(new Vector(x, y));
                }
            }
        },
        
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
            
        },
        
    }; // End self
    
    return self;
});
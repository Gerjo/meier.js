/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    
    return {
        /// From degrees to radians.
        ToRadians: function(degrees) {
            return degrees * Math.PI / 180;
        },

        /// From radians to degrees.
        ToDegrees: function(radians) {
            return 180 / Math.PI * radians;
        },

        /// Radians to multiples of pi.
        ToPiMultiples: function(radians) {
            return radians / Math.PI;
        },

        /// Map a [0..PI, -PI..0] range to [0...2PI]
        ToAbsoluteRadians: function(a) {
            var r = a;
            
            if(r < 0) {
                r = Math.PI + (Math.PI + r);
            }
            
            //while(a >= Math.TwoPI) {
            //    a -= Math.TwoPI;
            //}
    
            return r;
        },

        DeltaRelativeRadians: function(a, b) {
            var delta = b - a;
            return delta + ((delta > Math.PI) ? -Math.TwoPI : (delta < -Math.PI) ? Math.TwoPI : 0)
        },

        /// Map [-nPI...nPI] to [0..PI, -PI..0] range
        ToRelativeRadians: function(a) {
    
            // Normalize to something positive:
            while(a < 0) {
                a += Math.TwoPI;
            }
    
            // Normalize to [0...2PI]:
            while(a >= Math.TwoPI) {
                a -= Math.TwoPI;
            }
    
            // Normalize [PI...2PI] to [-PI..0]
            if(a > Math.PI) {
                return (a - Math.PI) - Math.PI;
            }
    
            // Range good as-is.
            return a;
        },


        /// Radians to degrees and Math.round.
        ToDegreesRounded: function(radians) {
            return Math.round(180 / Math.PI * radians);
        },


        /// Determine if an angle lies between two other angles. This
        /// assumes the angles are given in atan2 format.
        ///
        /// @todo better efficency on the inner workings.
        ///
        /// @param {angle} The angle to test for.
        /// @param {a} The lower (or upper) bound
        /// @param {b} The upper (or lower) bound
        /// @return boolean indicating whether angle lies between angles.
        IsAngleInBetween: function(angle, a, b) {
    
            a     = Vector.CreateAngular(a);
            b     = Vector.CreateAngular(b);
            angle = Vector.CreateAngular(angle);
    
            return (
                Math.sgn(a.cross(angle)) != Math.sgn(b.cross(angle))
            );
        }
        
    }; // And return object.
});


define(function(require) {
    
    var MersenneTwister = require("meier/contrib/MersenneTwister");
    var Vector = require("meier/math/Vector");
    
    
    var mt = new MersenneTwister();
    
    return {
        Seed: function(seed) {
            mt.setSeed(seed);
        },
        
        /// [0..1]
        Float: function() {
            return mt.nextFloat();
        },
        
        Integer: function() {
            return mt.nextInteger();
        },
        
        Boolean: function() {
            return mt.nextBoolean();
        },
        
        /// Returns a floating point.
        Range: function(min, max) {
            return mt.nextFloat() * (max - min) + min;
        },
        
        Byte: function() {
            return Math.round(255 * mt.nextFloat());
        },
        
        /// Array of floating points
        FloatArray: function(size) {
            var r = new Array(size);
            
            while(size--) {
                r[size] = mt.nextFloat();
            }
            
            return r;
        },
        
        /// Array of integers:
        IntegerArray: function(size) {
            var r = new Array(size);
            
            while(size--) {
                r[size] = mt.nextInteger();
            }
            
            return r;
        },
        
        /// Array of booleans:
        BooleanArray: function(size) {
            var r = new Array(size);
            
            while(size--) {
                r[size] = mt.nextBoolean();
            }
            
            return r;
        },
        
        RangeArray: function(size, min, max) {
            var r = new Array(size);
            
            while(size--) {
                r[size] = mt.nextFloat() * (max - min) + min;
            }
            
            return r;
        },
        
        /// Returns a random vector distributed on a unit circle.
        Vector: function() {
            var tan = mt.nextFloat() * Math.PI * 2;
            
            return new Vector(Math.cos(tan), Math.sin(tan));
        }
    };
});

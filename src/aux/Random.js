/// Exposing my own interface to contrib/MersenneTwister.
Random = (function() {
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
        
        Range: function(min, max) {
            return mt.nextFloat() * (max - min) + min;
        },
        
        /// Returns a random vector distributed on a unit circle.
        Vector: function() {
            var tan = mt.nextFloat() * Math.PI * 2;
            
            return new Vector(Math.cos(tan), Math.sin(tan));
        }
    };
}());

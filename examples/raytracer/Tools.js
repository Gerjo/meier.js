define(function(require) {
    var M    = require("meier/math/Math");
    var V2   = require("meier/math/Vec")(2);
    
    var self = {
        
        BalanceDimensions: function(num) {
            var primes = M.PrimeFactors(num);
        
            var size = new V2(1, 1);
            for(var i = 0; primes.length > 0; i = 1 - i) {
                size._[i] *= primes.pop();
            }
        
            return size;
        },
        
    }; // End var self = {}
    
    return self;
});
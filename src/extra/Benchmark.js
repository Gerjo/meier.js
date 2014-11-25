define(function(require) {
    var math = require("meier/math/Math");
    var functions = [];
    var names = [];
    
    var self = {
        
        Add: function(name, callback) {
            functions.push(callback);
            names.push(name);
        },
        
        Clear: function() {
            functions.clear();
            names.clear();
        },
        
        Run: function(iterations) {
            iterations = iterations || 100;
            
            var times = [];
            
            functions.forEach(function(f, i) {
                
                console.log("Measuring method " + names[i] + " " + iterations + " times.")
                
                var start = new Date().getTime();
                
                // Repeated runs
                for(var j = iterations; j > 0; --j) {
                    f();
                }
                
                times.push({
                    duration: new Date().getTime() - start,
                    name: names[i]
                });
            });
            
            console.log("---------------");
            
            times.sort(math.ItemGetter("duration"));
            
            
            var max = times.first().duration;
            
            times.forEach(function(time) {
                var percentage = (100 / max * time.duration) - 100;
                
                console.log((time.duration / 1000).toFixed(3) + " seconds for method " + time.name + " taking " + percentage.toFixed(0) + "% slower.");
            });
            
            console.log("---------------");
        },
        
    };
    
    return self;
});
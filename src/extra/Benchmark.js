define(function(require) {
    var math = require("meier/math/Math");
	
	function MakeBench(title) {

	    var functions = [];
	    var names = [];
		
	    var self = {
	        Add: function(name, callback) {
	            functions.push(callback);
	            names.push(name);
				
				//console.log(name, callback);
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
            
            
				var plot = [];
				
	            var max = times.first().duration;
            
	            times.forEach(function(time, i, arr) {
	                var percentage = (100 / max * time.duration) - 100;
					var p = 0;
					
					if(i != 0) {
						p = (time.duration - arr[i - 1].duration) / time.duration;
						
						p = p.toFixed(2);
					}
                
					plot.push([
						i, time.duration / iterations / 1000
					]);
				
	                console.log((time.duration / iterations / 1000).toFixed(4) + " seconds for method " + time.name + " taking " + percentage.toFixed(0) + "% slower. (" + p + "x since previous)");
	            });
            
	            console.log("---------------");
				
				var wolfram = plot.reduce(function(p, c){
					return p + ", (" + c[0] + "," + c[1] + ")";
				}, "").trim(", ");
				
				console.log(wolfram);
				
	        },
	    };
		
		return self;
	}
	
	var anonymous = MakeBench();
	
	function Bench(title) {
		return MakeBench(title);
	}
	
	Bench.Run = anonymous.Run;
	Bench.Clear = anonymous.Clear;
	Bench.Add = anonymous.Add;
   
    
    return Bench;
});

var Meier = (function() {
    
    var requireTagAdded = false;
    var requireJsLoaded = false;
    var loadfn          = null;
    
    // Path where meier.js files are located:
    var path            = "";

    var Meier = function(arg) {
        
        if(typeof arg == "function") {
            loadfn = arg;
            
            // RequireJS was already loaded:
            if(requireJsLoaded === true) {
                loadfn();
            }
            
        } else if(typeof arg === "string") {
            if(requireTagAdded === false) {
                path = arg;
                
                // Load my hacks the old fashioned way:
                document.write('<script src="' + path + '/aux/JsExtensions.js"></sc' + 'ript>');
                
                // Load requireJS slightly more modern:
                var script = document.createElement("script");
                script.src = path + '/contrib/require.js';
            
                script.onload = function() {
                    requireJsLoaded = true;
                    
                    requirejs.config({
                        paths: {
                            "meier" : path
                        },
                        
                        // Hopefully counter any browser cache.
                        urlArgs: "v=" + (new Date()).getTime()
                        
                    });
                                        
                    // Call initializer, if available:
                    if(loadfn) {
                        loadfn();
                    }
                };
            
                script.onerror = function() {
                    console.log("Failed to load requirejs. Did you specify a correct path to meier.js?");
                };
            
                var head = document.getElementsByTagName("head")[0];
                head.insertBefore(script, head.firstChild)
                
                // Make sure we only add one tag.
                requireTagAdded = true;
            } else {
                console.error("Warning: you're setting a path to meier.js twice.");
            }
        } else {
            console.error("You called me... but I'm not sure what to do. Argument received:", arg);
        }
        
    };
    
    return Meier;

})();

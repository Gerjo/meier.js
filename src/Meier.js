/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

var Meier;

if(typeof define != "function") {
	define = function(fn) {
		Meier = fn(null);
	};
}

define(function(req) {
    
    var requireTagAdded = typeof req == "function";
    var requireJsLoaded = requireTagAdded;
    var loadfn          = null;
    
    // Path where meier.js files are located:
    var path            = "";

	// Make sure require.js actually loads.
	if( ! requireTagAdded) {
		define = undefined;
	}
	
	var OnLoad = function() {
	
        // Firstly load my javascript extentions, then start loading everything else.
        require(["meier/engine/JsExtensions"], function(Extentions) {
            // Call initializer, if available:
            if(loadfn) {
                loadfn(require);
            }
        });
		
	};
	
    var Meier = function(arg) {
        
        if(typeof arg == "function") {
            loadfn = arg;
			
            // RequireJS was already loaded:
            if(requireJsLoaded === true) {				
				OnLoad();
            }
            
        } else if(typeof arg === "string") {
            if(requireTagAdded === false) {
                path = arg;
                
                // Load requireJS
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
					
					OnLoad();
                    
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
});

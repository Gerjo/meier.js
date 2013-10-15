///
/// A file to load all required files in the correct order. At 
/// some point I'll bundle a proper dependancy loader, such as
/// RequireJS or LABjs or whatever. For now this does the job
/// perfectly.
///

var LoadEngine = function(prefix) {

    // Support for the old load system by calling the new system.
    Meier(prefix);
    
    Meier.Include("meier/aux/Functions.js");
    
    Meier.Include("meier/math/Intersection.js");
    Meier.Include("meier/math/Vector.js");
    Meier.Include("meier/math/Line.js");
    Meier.Include("meier/math/Size.js");
    Meier.Include("meier/math/Disk.js");
    Meier.Include("meier/math/Rectangle.js");
    Meier.Include("meier/math/Matrix.js");
    Meier.Include("meier/math/Math.js");
    
    Meier.Include("meier/engine/Game.js");
    Meier.Include("meier/engine/Renderer.js");
    Meier.Include("meier/engine/Resources.js");
    Meier.Include("meier/engine/Input.js");
    
    Meier.Include("meier/contrib/Heap.js");
    Meier.Include("meier/contrib/MersenneTwister.js");
    
    Meier.Include("meier/aux/Random.js");
    Meier.Include("meier/aux/Stats.js");
    Meier.Include("meier/aux/Stopwatch.js");
    Meier.Include("meier/aux/Tree.js");
};



var Meier = (function() {
    var enginePrefix = "";
    var ident        = "meier/";
    var extension    = ".js";
    var loaded       = {};
    
    var exposed = function(prefix) {
        enginePrefix = prefix;
    }
    
    exposed.Include = function(file) {
        var normalized = file;
        
        if(normalized.substr(-extension.length) != extension) {
            normalized += extension;
        }
        
        // Prefix the engine code (e.g., load from a different URL)
        if(normalized.substr(0, ident.length) == ident) {
            normalized = enginePrefix + normalized.substring(ident.length);
        } else {
            //normalized = normalized;
        }
        
        if( ! loaded[normalized] ) {
            console.log("Loading: " + normalized);
            
            loaded[normalized] = true;
            
            // Load the file, directly, blocking. 
            document.writeln('<scri' + 'pt src="' + normalized + '" type="text/javascript"></scri' + 'pt>'); 
            
        } else {
            console.log("Already loaded: " + normalized);
        }
    }
    
    return exposed;
}());



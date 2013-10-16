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
    Meier.Include("meier/math/Statistics.js");
    
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


/// Simple file loading facility. This is designed to eliminate
/// the need for maintaining a bunch "script" tags.
///
/// Engine code can be configured to be loaded from a specific
/// folder or URL. E.g., calling:
///    Meier("www.example.com");
///    Meier.Include("meier/engine/Game");
/// Will attempt to load 'www.example.com/engine/Game.js'. 
///
/// Non-engine code will be loaded as-is. E.g.,
///   Meier("www.example.com");
///   Meier.Include("./MyGame.js");
///
/// Will attempt to load './MyGame.js' literally.
///
/// TODO: expand code to store files in LocalStorage for extremely
/// fast loading. Though this require versioning. 
///
var Meier = (function() {
    var enginePrefix = "";          // New prefix.
    var ident        = "meier/";    // To replace prefix.
    var extension    = ".js";       // Default javascript extension.
    var loaded       = {};          // Files already loaded.
    var verbose      = false;       // Per default, no logging.
    
    // Actors like a C++ functor, sets up the engine file prefix.
    var exposed = function(prefix) {
        enginePrefix = prefix || "";
    }
    
    // Enable or disable logging.
    exposed.SetVerbose = function(beVerbose) {
        verbose = beVerbose;
    }
    
    // Load files directly:
    exposed.Include = function(file) {
        var normalized = file;
        
        // The ".js" file extension is optional. Append it here
        // if not found.
        if(normalized.substr(-extension.length) != extension) {
            normalized += extension;
        }
        
        // Prefix the engine code (e.g., load from a different URL)
        if(normalized.substr(0, ident.length) == ident) {
            normalized = enginePrefix + normalized.substring(ident.length);
        
        } else {
            // TODO: possibly prefix game code, too?
            //normalized = someprefix + normalized;
        }
        
        // Make sure this file isn't loaded already:
        if( ! loaded[normalized.toLowerCase()] ) {
            
            if(verbose) {
                console.log("Loading: " + normalized);
            }
            
            loaded[normalized.toLowerCase()] = true;
            
            // Load the file, directly, blocking.
            document.writeln('<scri' + 'pt src="' + normalized + '" type="text/javascript"></scri' + 'pt>'); 
            
            /*var s = document.createElement("script");
            s.src = normalized;
            
            s.onload = function() {
                console.log("Loaded.", normalized);
            }
            
            var head = document.getElementsByTagName("head")[0];
            
            head.insertBefore(s, head.firstChild);*/
            
            
        } else {
            if(verbose) {
                console.log("Already loaded: " + normalized);
            }
        }
    }
    
    // Return the publically available logic:
    return exposed;
}());



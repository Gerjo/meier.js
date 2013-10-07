///
/// A file to load all required files in the correct order. At 
/// some point I'll bundle a proper dependancy loader, such as
/// RequireJS or LABjs or whatever. For now this does the job
/// perfectly.
///

var LoadEngine = function(prefix) {

    // All files to load, the order here is important.
    var files = [
        // Inject functionality into existing javascript constructs:
        "Functions.js",
        
        // Math heavy files:
        "math/Intersection.js",
        "math/Vector.js",
        "math/Line.js",
        "math/Size.js",
        "math/Disk.js",
        "math/Rectangle.js",
        "math/Matrix.js",
        "math/Math.js",
        
        // Core code:
        "engine/Game.js",
        "engine/Renderer.js",
        "engine/Resources.js",
        "engine/Input.js",
        
        // Not written by me.
        "contrib/Heap.js",
        "contrib/MersenneTwister.js",
        
        // Doesn't belong to any category.
        "aux/Random.js",
        "aux/Stats.js",
        "aux/Stopwatch.js",
        "aux/Tree.js",
    ];
    
    // Add all files as a script:
    files.forEach(function(src) {
        document.writeln('<scri' + 'pt src="' + prefix + src + '" type="text/javascript"></scri' + 'pt>');
        
    });
};
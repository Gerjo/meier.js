///
/// A file to load all required files in the correct order. At 
/// some point I'll bundle a proper dependancy loader, such as
/// RequireJS or LABjs or whatever. For now this does the job
/// perfectly.
///

var LoadEngine = function(prefix) {

    // All files to load:
    var files = [
        "Functions.js",
        "Game.js",
        "Heap.js",
        "Intersection.js",
        
        "geometry/Vector.js",
        "geometry/Line.js",
        "geometry/Size.js",
        
        "Matrix.js",
        "MersenneTwister.js",
        "Renderer.js",
        "Resources.js",
        "Stats.js",
        "Stopwatch.js",
        "Tree.js",
        "Input.js"
    ];
    
    // Add all files as a script:
    files.forEach(function(src) {
        document.writeln('<scri' + 'pt src="' + prefix + src + '" type="text/javascript"></scri' + 'pt>');
        
    });

    //console.log(document.href, window.location.host, window.location);

// Self calling function:
};
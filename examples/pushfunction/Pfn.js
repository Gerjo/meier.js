define(function(require) {

    function CreatePushFunction(hull) {
        var Vector  = require("meier/math/Vector");
        var Line    = require("meier/math/Line");
        var Segment = Line;
        var Disk    = require("meier/math/Disk");
        var Intersection = require("meier/math/Intersection");
        
        require("meier/math/Angle");
    
        // Expose these to the world:
        var vertices = f.vertices = hull.clone();
        var normals  = f.normals  = [];
        var bounds   = f.bounds   = [];
        var edges    = f.edges    = [];
    
        // Flag to toggle that the function isn't happy.
        // Commenly occurs when center-of-mass is outside
        // the object. Such things never happen in real-life
        // anyway, so we don't account for it.
        f.isDegenerate = false;
    
        // The hull is expected to be mapped around
        // the center-of-mass.
        var center   = new Vector(0, 0);
    
        // Radius to project onto, de actual diameter doesn't really
        // matter other than for visualization purposes.
        var disk     = new Disk(center, 200);
    
        // The "0" angle.
        var axis     = new Vector(1, 0);
    
        for(var i = 0, a, b, n, j; i < vertices.length; ++i ) {
            // Wrap j around:
            j = (i + 1 == vertices.length) ? 0 : i + 1;
        
            // A side of the polygon
            edges[i] = new Segment(vertices[i], vertices[j]);
        
            // The edge, taken perpendicular:
            normals[i]  = edges[i].direction().perp();
        
            // Yields the secant points of intersection. Tangents are treated
            // as two identical secants.
            a = Intersection.Get.DiskLine(disk, new Line(center, vertices[i]))[0].angle();
            b = Intersection.Get.DiskLine(disk, new Line(center, vertices[j]))[0].angle();
            n = Intersection.Get.DiskLine(disk, new Line(center, normals[i]))[1].angle();
        
            // Project axis of interest onto a disk, with this set, if
            // a force falls between a and b, angle n will be assumed.
            bounds[i] = {
                // Begin:
                "a": a,
            
                // End:
                "b": b,
                
                // Size of the actual edge.
                "e": vertices[i].distance(vertices[j]),
            
                // Unique ID to identify.
                "i": i,
            
                // Range (grows when merged)
                "r": [[a, b]],
            
                // Edge normal i.e., possible equilibrium:
                "n": n
            };
        }
    
        function InRange(angle, a, b) {
            var base = Vector.CreateAngular(angle);
            return base.cross(Vector.CreateAngular(a)) >= 0 
                    && base.cross(Vector.CreateAngular(b)) <= 0
        }
    
        //for(var i = 0, bound; i < bounds.length; ++i) {
        for(var i = bounds.length - 1, bound; i >= 0; --i) {
            bound = bounds[i];
        
            // Out-of-bounds:
            if( ! InRange(bound.n, bound.a, bound.b)) {
                    
                // See if "bound" fits in any other bound.
                var r = bounds.every(function(whom) {
                
                    // It's pointless to merge with thyself.
                    if(bound.i == whom.i) {
                        return true;
                    }
                
                    // Test all subspaces
                    return whom.r.every(function(pair) {
                        if(InRange(bound.n, pair[0], pair[1])) {
                            // Other bound inherits all.
                            whom.r.merge(bound.r); 
                        
                            // Remove this bound:
                            bounds.splice(i, 1);
                            return false;
                        }
                    
                        //console.log(pair.join());
                        return true;
                    });
                });
            
                // The normal does not fall within the bounds, but
                // the bounds weren't merged either. Usually this
                // means something is NaN or a floatpoint error.
                if(r) {
                    //console.log("Murphy's law.");
                    f.isDegenerate = true;
                }
            }
        }
    
        // Build the new upper and lower bounds from the
        // merged ranges.
        bounds.forEach(function(bound) {
            if(bound.r.length > 1) {
            
                var pair = bound.r.flatten().unique();
                  
                bound.a = pair[0];
                bound.b = pair[1];
            }
        });
       
        // Ironically, the push function as a function is only
        // usefull for simulations - not calculations. 
        function f(angle) {
            var base = Vector.CreateAngular(angle);
        
            for(var i = 0; i < bounds.length; ++i) {
                if(base.cross(Vector.CreateAngular(bounds[i].a)) >= 0 
                && base.cross(Vector.CreateAngular(bounds[i].b)) <= 0) {
                    return bounds[i].n;
                }
            }
        
            console.log("Unable to find an equilibrium for the given angle.");
            return 999;
        }

        // NB: f is a function with some public properties.
        return f;
    }

    return CreatePushFunction;
});
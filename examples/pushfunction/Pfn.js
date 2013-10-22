
function CreatePushFunction(hull) {
    
    // Expose these to the world:
    var vertices = f.vertices = hull.clone();
    var normals  = f.normals  = [];
    var bounds   = f.bounds   = [];
    var edges    = f.edges    = [];
    
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
                        
            "e": vertices[i].distance(vertices[j]),
            
            "i": i,
            
            "r": [[a, b]],
            
            // Normal:
            "n": n
        };
    }
    
    function A(angle, a, b) {
        var base = Vector.CreateAngular(angle);
        return base.cross(Vector.CreateAngular(a)) >= 0 
                && base.cross(Vector.CreateAngular(b)) <= 0
    }
    
    //for(var i = 0, bound; i < bounds.length; ++i) {
    for(var i = bounds.length - 1, bound; i >= 0; --i) {
        bound = bounds[i];
        
        // Out-of-bounds:
        if( ! A(bound.n, bound.a, bound.b)) {
                    
            // See if "bound" fits in any other bound.
            var r = bounds.every(function(whom) {
                if(bound.i == whom.i) {
                    return true;
                }
                
                // Test all subspaces
                return whom.r.every(function(pair) {
                    if(A(bound.n, pair[0], pair[1])) {
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
            
            if(r) {
                console.log("murphy");
            }
        }
    }
    
    bounds.forEach(function(bouwnd) {
        if(bouwnd.r.length > 1) {
            
            var pair = bouwnd.r.flatten().unique();
            
            // The order might be... broken.            
            bouwnd.a = pair[0];
            bouwnd.b = pair[1];
            
        }
    });
        
    function f(angle) {
        var base = Vector.CreateAngular(angle);
        
        for(var i = 0; i < bounds.length; ++i) {
            if(base.cross(Vector.CreateAngular(bounds[i].a)) >= 0 
            && base.cross(Vector.CreateAngular(bounds[i].b)) <= 0) {
                return bounds[i].n;
            }
        }
        
        console.log("unknown angle...");
        return 999;
    }

    return f;
}
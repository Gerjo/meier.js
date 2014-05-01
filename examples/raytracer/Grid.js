define(function(require) {
    var V3 = require("meier/math/Vec")(3);
    
    function Grid(x, y, z) {
        this.photons = [];
        // Amount of buckets
        this.resolution = new V3(5, 5, 5);
    }
    
    Grid.prototype.indexOf = function(vector) {
        return vector.z + (vector.y * this.resolution.x) + (vector.x * this.resolution.x * this.resolution.y);
    };
    
    Grid.prototype.insert = function(photon) {
        this.photons.push(photon);
    };
    
    Grid.prototype.toGrid = function() {
        var min = new V3( Infinity,  Infinity,  Infinity);
        var max = new V3(-Infinity, -Infinity, -Infinity);
        
        // Find extrema (bounding volume)
        for(var i = 0; i < this.photons.length; ++i) {
            var p = this.photons[i];

            min.x = Math.min(min.x, p.position.x);
            min.y = Math.min(min.y, p.position.y);
            min.z = Math.min(min.z, p.position.z);
            
            max.x = Math.max(max.x, p.position.x);
            max.y = Math.max(max.y, p.position.y);
            max.z = Math.max(max.z, p.position.z);
        }
        
        // Distance between bounds
        var range    = max.subtract(min);
        
        // Vector to scale world space to grid space. Removing one to bound it
        // by [0,max)
        var interval = range.clone().divide(this.resolution.clone().subtract(new V3(1, 1, 1)));
        
        // array of arrays?
        var buckets = [];
        
        // Spread photons accross grid.
        this.photons.forEach(function(p) {

            // TODO: one liner.
            var sub = new V3(
                Math.floor((p.position.x - min.x) / interval.x),
                Math.floor((p.position.y - min.y) / interval.y),
                Math.floor((p.position.z - min.z) / interval.z)
            );
            
            // Quantize to grid space. NB: Some numbers might be flipped here
            var index = this.indexOf(sub);
            
            console.log(index);
            
            
            ASSERT(index >= 0);
            ASSERT(index < this.resolution.volume());
            
            if( ! buckets[index]) {
                buckets[index] = [];
            }
            
            buckets[index].push(p);
        }.bind(this));
        
        
        // TODO: determine optimal size.
        var floatons =[];
        
        var gridIndex    = 0;
        
        // Index space matches resolution volume times 3 (count, start, end)
        var photonIndex  = this.resolution.volume() * 3;
        
        for(var i = 0; i < this.resolution.volume() * 3; i += 3) {
            
            // If something inside bucket
            if(buckets[i]) {

                var count = buckets[i].length;
                
                // Amount of photons in grid bucket.
                floatons[i + 0] = count;
                
                // Record index pre exporting
                floatons[i + 1] = photonIndex / 3;
                
                // Export photons to float array
                for(var j = 0; j < count; ++j) {
                    floatons[photonIndex + 0] = buckets[i].x;
                    floatons[photonIndex + 1] = buckets[i].y;
                    floatons[photonIndex + 2] = buckets[i].z;
                    
                    // Proceed to the next index.
                    photonIndex += 3;
                }
                
                // Record position post exporting.
                floatons[i + 2] = photonIndex / 3;
                
            } else {
                floatons[i + 0] = 0;  // No photons.
                floatons[i + 1] = 0;  // No start index.
                floatons[i + 2] = 0;  // No end index.
            }
        }
        
        return new Float32Array(floatons);
    };
    
    Grid.prototype.toArray = function() {
        var stride = 9;
        var array  = new Float32Array(this.photons.length * stride);
        
        for(var i = 0, j = 0; i < array.length; i += stride, ++j) {
            var photon = this.photons[j];
            
            array[i + 0] = photon.direction.x;
            array[i + 1] = photon.direction.y;
            array[i + 2] = photon.direction.z;

            array[i + 3] = photon.position.x;
            array[i + 4] = photon.position.y;
            array[i + 5] = photon.position.z;

            array[i + 6] = photon.meta.x;
            array[i + 7] = photon.meta.y;
            array[i + 8] = photon.meta.z || 0;
        }
        
        return array;
    };
    
    return Grid;
});
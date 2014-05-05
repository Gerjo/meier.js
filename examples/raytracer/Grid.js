define(function(require) {
    var V2    = require("meier/math/Vec")(2);
    var V3    = require("meier/math/Vec")(3);
    var Tools = require("./Tools");
    
    function Grid(x, y, z) {
        this.photons = [];
        // Amount of buckets
        //this.resolution = new V3(2, 2, 2);
        this.resolution = new V3(15, 15, 15);
        //this.resolution = new V3(1, 1, 1);
    }
    
    Grid.prototype.indexOf = function(vector) {
        return vector.z + (vector.y * this.resolution.x) + (vector.x * this.resolution.x * this.resolution.y);
    };
    
    Grid.prototype.insert = function(photon) {
        this.photons.push(photon);
    };
    
    Grid.prototype.upload = function(shader) {
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
        
        /*min.x = -41;
        min.y = -41;
        min.z = -41;
        max.x = 41;
        max.y = 41;
        max.z = 41;
        */
        // Distance between bounds
        var range    = max.clone().subtract(min);
        
        // Vector to scale world space to grid space. Removing one to bound it
        // by [0,max)
        var interval = range.clone().divide(this.resolution.clone());
        //.subtract(new V3(1, 1, 1)));
        
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
            
            //console.log("Index: " + sub.pretty());
            //console.log("Position: " + p.position.wolfram());
            // Quantize to grid space. NB: Some numbers might be flipped here
            var index = this.indexOf(sub);
            
            
            ASSERT(index >= 0);
            ASSERT(index <= this.resolution.volume());
            
            if( ! buckets[index]) {
                buckets[index] = [];
            }
            
            buckets[index].push(p);
        }.bind(this));
        
        
        // TODO: determine optimal size.
        var floatons = [];
                
        // Index space matches resolution volume times 3 (count, start, end)
        var photonIndex  = this.resolution.volume() * 3;
        var indexIndex   = 0;
        
        for(var x = 0, i = 0; x < this.resolution.x; ++x) {
            for(var y = 0; y < this.resolution.y; ++y) {
                for(var z = 0; z < this.resolution.z; ++z, ++i) {
            
                    // If something inside bucket
                    if(buckets[i]) {

                        var count = buckets[i].length;
                
                        // Amount of photons in grid bucket.
                        floatons[indexIndex + 0] = count;
            
                        // Record index pre exporting, to pixel index.
                        floatons[indexIndex + 1] = photonIndex / 3.0;
                
                        // Export photons to float array
                        for(var j = 0; j < count; ++j) {

                            var xIndex = Math.floor((buckets[i][j].position.x - min.x) / interval.x);
                            var yIndex = Math.floor((buckets[i][j].position.y - min.y) / interval.y);
                            var zIndex = Math.floor((buckets[i][j].position.z - min.z) / interval.z);
                    
                            if(xIndex != x) {
                                console.log("%d != %d\n", xIndex, x);
                                ASSERT(xIndex == x);
                            }
                            if(yIndex != y) {
                                console.log("%d != %d\n", yIndex, y);
                                ASSERT(yIndex == y);
                            }
                            if(zIndex != z) {
                                console.log("%d != %d\n", zIndex, z);
                                ASSERT(zIndex == z);
                            }
                    
                    
                            floatons[photonIndex + 0] = buckets[i][j].direction.x;
                            floatons[photonIndex + 1] = buckets[i][j].direction.y;
                            floatons[photonIndex + 2] = buckets[i][j].direction.z;
                    
                            floatons[photonIndex + 3] = buckets[i][j].position.x;
                            floatons[photonIndex + 4] = buckets[i][j].position.y;
                            floatons[photonIndex + 5] = buckets[i][j].position.z;
                    
                            floatons[photonIndex + 6] = buckets[i][j].meta.x;
                            floatons[photonIndex + 7] = buckets[i][j].meta.y;
                            floatons[photonIndex + 8] = buckets[i][j].meta.z || 0;
                    
                            // Proceed to the next index.
                            photonIndex += 3 * 3;
                        }
                
                        // Record position post exporting. Scale to pixel
                        floatons[indexIndex + 2] = photonIndex / 3; 
                        
                        indexIndex += 3;
                    } else {
                        floatons[indexIndex + 0] = 0;  // No photons.
                        floatons[indexIndex + 1] = 0;  // No start index.
                        floatons[indexIndex + 2] = 0;  // No end index.
                        indexIndex += 3;
                    }
                }
            }
        }
        
        
        var texture = gl.createTexture();
        var dims;
        var texmax = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        
        // TODO: Causes a null pointer for one photon.
        do {
            dims = Tools.BalanceDimensions(floatons.length / 3);
            
            // Remove one photon.
            if(dims.x > texmax || dims.y > texmax) {
                floatons.splice(-9);
            } else {
                break;
            }
        } while(true);
        
        var floats = new Float32Array(floatons);
        
        // TODO: pop photons till dims are OK.
        
        console.log("min  " + min.wolfram());
        console.log("max  " + max.wolfram());
        console.log("int  " + interval.wolfram());
        console.log("dims " + dims.wolfram());
        console.log("res  " + this.resolution.wolfram());
        console.log("");
        
        shader.use();
        gl.uniform3f(shader.uniform("gridInterval"), interval.x, interval.y, interval.z);
        gl.uniform3i(shader.uniform("gridResolution"), this.resolution.x, this.resolution.y, this.resolution.z);
        gl.uniform3f(shader.uniform("gridMin"), min.x, min.y, min.z);
        gl.uniform3f(shader.uniform("gridMax"), max.x, max.y, max.z);
        gl.uniform2f(shader.uniform("photonTextureSize"), dims.x, dims.y);
        gl.uniform2f(shader.uniform("photonTextureUnit"), 1.0 / dims.x, 1.0 / dims.y);
        
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); 
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, dims.x, dims.y, 0, gl.RGB, gl.FLOAT, floats);
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        //console.log(floats);
        
        return texture;
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
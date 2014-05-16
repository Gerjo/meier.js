define(function(require) {
    var V2    = require("meier/math/Vec")(2);
    var V3    = require("meier/math/Vec")(3);
    var Tools = require("./Tools");
    
    function Grid(x, y, z) {
        this.photons = [];
        // Amount of buckets
        //this.resolution = new V3(2, 2, 2);
        //this.resolution = new V3(15, 15, 15);
        this.resolution = new V3(20, 20, 20);
        //this.resolution = new V3(1, 1, 1);
    }
    
    Grid.prototype.indexOf = function(vector) {
        return vector.z + (vector.y * this.resolution.x) + (vector.x * this.resolution.x * this.resolution.y);
    };
    
    Grid.prototype.quantize = function(p) {
        return new V3(
            Math.floor((p.x - this.min.x) / this.interval.x),
            Math.floor((p.y - this.min.y) / this.interval.y),
            Math.floor((p.z - this.min.z) / this.interval.z)
        );
    };
    
    Grid.prototype.toBucket = function(gridQuantize) {
        var gridResolution = this.resolution;
        
        return gridQuantize.z + (gridQuantize.y * gridResolution.x) + (gridQuantize.x * gridResolution.x * gridResolution.y)
    };
    
    Grid.prototype.insert = function(photon) {
        this.photons.push(photon);
    };
    
    Grid.prototype.upload = function(shader) {
        this.min = new V3( Infinity,  Infinity,  Infinity);
        this.max = new V3(-Infinity, -Infinity, -Infinity);
        
        // Find extrema (bounding volume)
        for(var i = 0; i < this.photons.length; ++i) {
            var p = this.photons[i];

            this.min.x = Math.min(this.min.x, p.position.x);
            this.min.y = Math.min(this.min.y, p.position.y);
            this.min.z = Math.min(this.min.z, p.position.z);

            this.max.x = Math.max(this.max.x, p.position.x);
            this.max.y = Math.max(this.max.y, p.position.y);
            this.max.z = Math.max(this.max.z, p.position.z);
        }
        
        this.min.x = -41;
        this.min.y = -41;
        this.min.z = -41;
        this.max.x = 41;
        this.max.y = 41;
        this.max.z = 41;
        
        // Distance between bounds
        var range    = this.max.clone().subtract(this.min);
        
        // Vector to scale world space to grid space. Removing one to bound it
        // by [0,max)
        this.interval = range.clone().divide(this.resolution.clone());
        //.subtract(new V3(1, 1, 1)));
        
        // array of arrays?
        var buckets = [];
        
        // Spread photons accross grid.
        this.photons.forEach(function(p) {

            // TODO: one liner.
            var sub = this.quantize(p.position);
            
            //console.log("Index: " + sub.pretty());
            //console.log("Position: " + p.position.wolfram());
            // Quantize to grid space. NB: Some numbers might be flipped here
            var index = this.indexOf(sub);
            
            //console.log(index,this.resolution.volume());
            ASSERT(index >= 0);
            ASSERT(index <= this.resolution.volume());
            
            if( ! buckets[index]) {
                buckets[index] = [];
            }
            
            buckets[index].push(p);
        }.bind(this));
        
        var perBucket = 10;
        buckets.forEach(function(bucket) {
            if(bucket.length > perBucket) {
                bucket.shuffle();
                
                while(bucket.length > perBucket) {
                    bucket.pop();
                }
            }
        });
        
        var merged = [];
    

        for(var x = 0, i = 0; x < this.resolution.x; ++x) {
            for(var y = 0; y < this.resolution.y; ++y) {
                for(var z = 0; z < this.resolution.z; ++z, ++i) {
                    merged[i] = [];
                    
                    for(var offsetX = -1; offsetX <= 1; ++offsetX) {
                        for(var offsetY = -1; offsetY <= 1; ++offsetY) {
                            for(var offsetZ = -1; offsetZ <= 1; ++offsetZ) {
                                var index = this.toBucket(new V3(x + offsetX, y + offsetY, z + offsetZ));
                                
                                if(buckets[index]) {
                                    merged[i].merge(buckets[index]);
                                    
                                    ASSERT(buckets[index].length > 0);
                                }
                            }
                        }   
                    }
    
                    // Sort by distance to grid "center". TODO: "center!"
                    var pos = new V3(
                        x * this.interval.x + this.interval.x * 0.5, 
                        x * this.interval.y + this.interval.y * 0.5,
                        x * this.interval.z + this.interval.z * 0.5
                    );
                    
                    merged[i].sort(function(aton, bton) {
                        return aton.position.distanceSq(pos) < bton.position.distanceSq(pos);
                    });
                }
            }
        }
        
        // Overwrite the previous buckets with the convoluted set.
        buckets = merged;
        
        // TODO: determine optimal size.
        var floatons = [];
                
        // Index space matches resolution volume times 3 (count, start, end)
        var photonIndex  = this.resolution.volume() * 3;
        var indexIndex   = 0;
        
        
        var maxPerCell = 0;
        
        for(var x = 0, i = 0; x < this.resolution.x; ++x) {
            for(var y = 0; y < this.resolution.y; ++y) {
                for(var z = 0; z < this.resolution.z; ++z, ++i) {
            
                    // If something inside bucket
                    if(buckets[i]) {
                        //console.log("[" + i + "] " + buckets[i].length + " photons");
                        
                        var count = buckets[i].length;
                
                        maxPerCell = Math.max(maxPerCell, count);
                
                        // Amount of photons in grid bucket.
                        floatons[indexIndex + 0] = count;
            
                        // Record index pre exporting, to pixel index.
                        floatons[indexIndex + 1] = photonIndex / 3.0;
                
                        // Export photons to float array
                        for(var j = 0; j < count; ++j) {
                            /*var q = this.quantize(buckets[i][j].position);
                    
                            if(q.x != x) {
                                console.log("%d != %d\n", xIndex, x);
                                ASSERT(q.x == x);
                            }
                            if(q.y != y) {
                                console.log("%d != %d\n", yIndex, y);
                                ASSERT(q.y == y);
                            }
                            if(q.z != z) {
                                console.log("%d != %d\n", zIndex, z);
                                ASSERT(q.z == z);
                            }*/
                    
                    
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
        
        console.log("min  " + this.min.wolfram());
        console.log("max  " + this.max.wolfram());
        console.log("int  " + this.interval.wolfram());
        console.log("dims " + dims.wolfram());
        console.log("res  " + this.resolution.wolfram());
        console.log("max  " + maxPerCell + " per bucket");
        
        shader.use();
        gl.uniform3f(shader.uniform("gridInterval"), this.interval.x, this.interval.y, this.interval.z);
        gl.uniform3i(shader.uniform("gridResolution"), this.resolution.x, this.resolution.y, this.resolution.z);
        gl.uniform3f(shader.uniform("gridMin"), this.min.x, this.min.y, this.min.z);
        gl.uniform3f(shader.uniform("gridMax"), this.max.x, this.max.y, this.max.z);
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
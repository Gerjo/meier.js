define(function(require) {
    
    function Grid(x, y, z) {
        this.photons = [];
    }
    
    Grid.prototype.insert = function(photon) {
        this.photons.push(photon);
        /*
        console.log(photon.meta.x.toFixed(0) + " " + photon.meta.y.toFixed(4) + " [" + photon.position.x.toFixed(4) + ", " + photon.position.y.toFixed(4) + ", " + 
        photon.position.z.toFixed(4) + "] [" + photon.direction.x.toFixed(4) + ", " + photon.direction.y.toFixed(4) + ", " + photon.direction.z.toFixed(4) + "]");
        */
    };
    
    Grid.prototype.toArray = function() {
        var stride = 9;
        var array  = new Float32Array(this.photons.length * stride);
        
        for(var i = 0, j = 0; i < array.length; i += stride,  ++j) {
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
define(function(require) {
   
    function Mesh(vertices, indices, meshes) {        
        this._vertices = vertices || [];
        this._indices  = indices || [];
        this._meshes   = meshes || [];
    }
    
    Mesh.prototype.vertices = function() {
        var queue = [];
        
        this._vertices.forEach(function(vertex) {            
            queue.merge(vertex.export());
            
        });
                
        return new Float32Array(queue);
    };
    
    Mesh.prototype.indices = function() {
        return new Uint16Array(this._indices);
    };
    
    return Mesh;
});
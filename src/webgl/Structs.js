define(function(require) {
    var V2 = require("meier/math/Vec")(2);
    var V3 = require("meier/math/Vec")(3);
    var V4 = require("meier/math/Vec")(4);
    
    
    
    var self = {
        Vertex: function(position, normal, color, uv) {
            this.position = position || new V3(0, 0, 0);
            this.normal   = normal || new V3(0, 1, 0);
            this.color    = color || new V4(1, 0, 0, 1);
            this.uv       = uv || new V2(0.5, 0.5);
            // TODO: some sort of textureID?
            
            /// Export to flattened array. Used to create an Array of Structs (AoS).
            this.export = function() {
                return [
                    this.position._[0], this.position._[1], this.position._[2],
                    this.normal._[0],   this.normal._[1],   this.normal._[2],
                    this.color._[0],    this.color._[1],    this.color._[2], this.color._[3],
                    this.uv._[0],       this.uv._[1]
                ];
            };
            
            /// Byte size of this vertex
            this.stride = function() {
                return self.Vertex.Stride;
            };
        },
        
        Light: function(position) {
            this.position = position || new V3(0, 0, 0);
            
            /// Export to flattened array. Used to create an Array of Structs (AoS).
            this.export = function() {
                return [
                    this.position._[0], this.position._[1], this.position._[2]
                ];
            };
            
            /// Byte size of this vertex
            this.stride = function() {
                return self.Light.Stride;
            };
        }
    };
    
    // Dynamically determine (byte) stride based on export side.
    self.Vertex.Stride = new self.Vertex().export().length * 4;
    self.Light.Stride = new self.Light().export().length * 4;
    
    return self;
});
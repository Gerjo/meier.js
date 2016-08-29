define(function(require) {
    var V3     = require("meier/math/Vec")(3);
    var Mesh   = require("meier/webgl/Mesh");
    var Vertex = require("meier/webgl/Structs").Vertex;
    
    var vertices = [];
    var indices  = [];
    
    var positions = [
        // Front face
        new V3(-1.0, -1.0,  1.0),
        new V3( 1.0, -1.0,  1.0),
        new V3( 1.0,  1.0,  1.0),
        new V3(-1.0,  1.0,  1.0),

        // Back face
        new V3(-1.0, -1.0, -1.0),
        new V3(-1.0,  1.0, -1.0),
        new V3( 1.0,  1.0, -1.0),
        new V3( 1.0, -1.0, -1.0),

        // Top face
        new V3(-1.0,  1.0, -1.0),
        new V3(-1.0,  1.0,  1.0),
        new V3( 1.0,  1.0,  1.0),
        new V3( 1.0,  1.0, -1.0),

        // Bottom face
        new V3(-1.0, -1.0, -1.0),
        new V3( 1.0, -1.0, -1.0),
        new V3( 1.0, -1.0,  1.0),
        new V3(-1.0, -1.0,  1.0),

        // Right face
        new V3( 1.0, -1.0, -1.0),
        new V3( 1.0,  1.0, -1.0),
        new V3( 1.0,  1.0,  1.0),
        new V3( 1.0, -1.0,  1.0),

        // Left face
        new V3(-1.0, -1.0, -1.0),
        new V3(-1.0, -1.0,  1.0),
        new V3(-1.0,  1.0,  1.0),
        new V3(-1.0,  1.0, -1.0)
      ];
   
      vertices = positions.map(function(position) {
          var vertex = new Vertex();
          vertex.position = position;
          vertex.normal = position.clone().normalize();
                    
          return vertex;
      });
      
    indices = [
          0,  1,  2,      0,  2,  3,    // front
          4,  5,  6,      4,  6,  7,    // back
          8,  9,  10,     8,  10, 11,   // top
          12, 13, 14,     12, 14, 15,   // bottom
          16, 17, 18,     16, 18, 19,   // right
          20, 21, 22,     20, 22, 23    // left
    ];
    
    return new Mesh(vertices, indices);
});
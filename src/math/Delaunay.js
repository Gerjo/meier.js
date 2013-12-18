define(function(require) {
    var Vector    = require("meier/math/Vec")(2);
    
    function Triangle(a, b, c) {
        this.a = c;
        this.b = a;
        this.c = b;
        
        this.center   = new Vector(0, 0);
        this.radius   = 0;
        this.radiusSQ = 0;
        
        //this.neighbours = [];
        
        if(a && b && c) {
            this.updateInternals();
        }
    }
    
    Triangle.prototype.updateInternals = function() {
        
        // Circumscribing radius code kindly borrowed 
        // from Game Oven Studios.
        
        var bPos = this.b.clone().subtract(this.a);
        var cPos = this.c.clone().subtract(this.a);
        var d    = 2 * (bPos.x * cPos.y - bPos.y * cPos.x);
        
        // Vertices are colinear, anything fits in the radius.
        if (Math.abs(d) <= 0.000001) {
            this.center = new Vector(0, 0);
            this.radius = Number.MAX_VALUE;
            
        } else {
            this.center = new Vector(
                this.a.x + (cPos.y * bPos.lengthSQ() - bPos.y * cPos.lengthSQ()) / d,
                this.a.y + (bPos.x * cPos.lengthSQ() - cPos.x * bPos.lengthSQ()) / d
            );
        }
        
        this.radiusSQ = this.a.distanceSQ(this.center)
        this.radius = Math.sqrt(this.radiusSQ);    
    };
    
    Triangle.prototype.draw = function(renderer) {
        renderer.line(this.a, this.b);
        renderer.line(this.b, this.c);
        renderer.line(this.c, this.a);
    };
    
    // Within the triangle:
    Triangle.prototype.contains = function(vertex) {
        
        function isLeft(a, b) {            
            return (b.x - a.x) * (vertex.y-a.y) - (b.y - a.y) * (vertex.x-a.x) > 0;
        }
        
        return isLeft(this.a, this.b) && isLeft(this.b, this.c) && isLeft(this.c, this.a);
    };
    
    // Within bounding circle:
    Triangle.prototype.inCircle = function(vertex) {
        return this.center.distanceSQ(vertex) < this.radiusSQ;
    };
    
    var exposed = {
        
        Triangle: Triangle,
        
        Triangulate: function(coordinates) {
            if(coordinates.length > 0) {
                var triangles = [];
            
                // I'm guessing this is large enough _lol_
                var s = 1000000000;
                s = new Triangle(
                    new Vector(0, s),   // top center
                    new Vector(-s, -s), // bottom left
                    new Vector(s,  -s)  // bottom right
                );

                // Omnipotent super triangle, we will add coordinates to this
                // triangle one-by-one.
                triangles.push(s);
            
                // Insert each coordinate:
                coordinates.forEach(function(vertex) {
                    
                    if( ! vertex.neighbours) { 
                        vertex.neighbours = [];
                    } else { 
                        vertex.neighbours.clear(); 
                    }
                   
                    
                    var edges = {};
                
                    // Find a triangle that contains the given coordinate:
                    for(var i = 0, triangle; i < triangles.length; ++i) {
                    
                        triangle = triangles[i];
                    
                        function Hash(a, b) {
                            return "" + Math.min(a.x, b.x) + Math.max(a.x, b.x) + 
                                Math.min(a.y, b.y) + Math.max(a.y, b.y);
                        }
                                        
                        if(triangle.inCircle(vertex)) {
                            var hash;
                        
                            hash = Hash(triangle.a, triangle.b);
                            if(edges[hash]) {
                                edges[hash] = false;
                            } else {
                                edges[hash] = [triangle.a, triangle.b];
                            }
                        
                            hash = Hash(triangle.b, triangle.c);
                            if(edges[hash]) {
                                edges[hash] = false;
                            } else {
                                edges[hash] = [triangle.b, triangle.c];
                            }
                        
                            hash = Hash(triangle.c, triangle.a);
                            if(edges[hash]) {
                                edges[hash] = false;
                            } else {
                                edges[hash] = [triangle.c, triangle.a];
                            }
                        
                            // Remove triangle
                            triangles.splice(i--, 1);
                        }
                    }
                
                    // Create new triangles from the unique edges and new vertex
                    for(var k in edges) {
                        if(edges.hasOwnProperty(k) && edges[k] !== false) {
                            triangles.push(new Triangle(edges[k][0], edges[k][1], vertex));
                        }
                    }
                });
            
                // Remove triangles connected to super triangle.
                return triangles.filter(function(triangle) {
                    var r = triangle.a == s.a || triangle.b == s.a || triangle.c == s.a ||
                            triangle.a == s.b || triangle.b == s.b || triangle.c == s.b ||
                            triangle.a == s.c || triangle.b == s.c || triangle.c == s.c;
                  
                    if(! r) {
                        // Subscribe the triangle to the vertices
                        triangle.a.neighbours.push(triangle.center);
                        triangle.b.neighbours.push(triangle.center);
                        triangle.c.neighbours.push(triangle.center);
                    }
                  
                    return !r;
                });
            }
            
            return [];
            
        }, // End triangulate
    }; // End exposed
    
    return exposed;
    
});
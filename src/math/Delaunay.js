define(function(require) {
    var Vector    = require("meier/math/Vec")(2);
    
    function Triangle(a, b, c) {
        this.a = c;
        this.b = a;
        this.c = b;
        
        this.center = new Vector(0, 0);
        this.radius = 0;
        
        this.neighbours = [];
        
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
            //this.center = new Vector(0, 0);
            //this.radius = Number.MAX_VALUE;
            //console.log("collinear");
            
            var minx = Math.min(this.a.x, this.b.x, this.c.x);
            var miny = Math.min(this.a.y, this.b.y, this.c.y);
            var maxx = Math.max(this.a.x, this.b.x, this.c.x);
            var maxy = Math.max(this.a.y, this.b.y, this.c.y);

            this.center = new Vector((minx + maxx) / 2, (miny + maxy) / 2);
            
        } else {
            this.center = new Vector(
                this.a.x + (cPos.y * bPos.lengthSQ() - bPos.y * cPos.lengthSQ()) / d,
                this.a.y + (bPos.x * cPos.lengthSQ() - cPos.x * bPos.lengthSQ()) / d
            );
        }
        
        this.radius = this.a.distance(this.center);    
    };
    
    Triangle.prototype.draw = function(renderer) {
        renderer.arrow(this.a, this.b);
        renderer.arrow(this.b, this.c);
        renderer.arrow(this.c, this.a);
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
        // TODO: use squared distance once everything works.
        return this.center.distance(vertex) < this.radius;
    };
    
    var exposed = {
        
        Triangle: Triangle,
        
        Triangulate: function(coordinates) {
            if(coordinates.length > 0) {
                var triangles = [];
            
                // I'm guessing this is large enough _lol_
                var s = 100000;
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
                            if( edges[hash] ) {
                                edges[hash] = false;
                            } else {
                                edges[hash] = [triangle.a, triangle.b];
                            }
                        
                            hash = Hash(triangle.b, triangle.c);
                            if( edges[hash] ) {
                                edges[hash] = false;
                            } else {
                                edges[hash] = [triangle.b, triangle.c];
                            }
                        
                            hash = Hash(triangle.c, triangle.a);
                            if( edges[hash] ) {
                                edges[hash] = false;
                            } else {
                                edges[hash] = [triangle.c, triangle.a];
                            }
                        
                            // Remove triangle
                            triangles.splice(i, 1); i--;
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
                  
                    return !r;
                });
            }
        }, // End triangulate
    }; // End exposed
    
    return exposed;
    
});
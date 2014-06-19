/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*/

define(function(require) {
    var Vector    = require("meier/math/Vec")(2);
    var GiftWrap  = require("meier/math/Hull").GiftWrap;
    var Disk      = require("meier/math/Disk");
    var Line      = require("meier/math/Line");
    
    /// Some canvas implementations crash when rendering too 
    /// extreme coordinates. The standard doesn't mandate
    /// a minimal size. At the time of writing, the following seems
    /// sensible (signed 16 bit range, with some removed).
    var MAX_CANVAS_DRAW_SIZE = Math.pow(2, 16) * 0.25;
    
    function Triangle(a, b, c) {
        this.a = c;
        this.b = a;
        this.c = b;
        
        this.center   = new Vector(0, 0);
        this.radius   = 0;
        this.radiusSQ = 0;
                
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
        
        // Vertices are collinear, anything fits in the radius.
        if (Math.abs(d) <= 0.000001) {
            this.center = new Vector(0, 0);
            this.radius = Number.MAX_VALUE;

        } else {
            this.center = new Vector(
                this.a.x + (cPos.y * bPos.lengthSQ() - bPos.y * cPos.lengthSQ()) / d,
                this.a.y + (bPos.x * cPos.lengthSQ() - cPos.x * bPos.lengthSQ()) / d
            );
            
            this.radiusSQ = this.a.distanceSQ(this.center)
            this.radius = Math.sqrt(this.radiusSQ);    
        }
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
    
    
    function SortSiteCounterClock(site) {
        // Sort vertices counter clockwise (great for drawing)
        site.neighbours.sort(function(a, b) {
            return Math.atan2(a.y - site.y, a.x - site.x) - 
            Math.atan2(b.y - site.y, b.x - site.x)
        });
    }
    
    var self = {

        Triangle: Triangle,
        
        /// Generate a Voronoi diagram.
        ///
        /// TODO: Contemplate winged edge data structure
        ///
        /// @param {coordinates} Array containing 2d vectors
        /// @param {w} Optional maximum diagram width. 
        /// @param {h} Optional maximum diagram height. 
        /// @return An array with delaunay triangles. The voronoi edges are
        ///         added as an array property (coordiate.neighbours) to the input 
        ///         coordinates.
        Voronoi: function(coordinates, w, h) {
            
            w = w || MAX_CANVAS_DRAW_SIZE * 0.5;
            h = h || MAX_CANVAS_DRAW_SIZE * 0.5;
            
            var triangles = self.Triangulate(coordinates, true);
                        
            coordinates.forEach(SortSiteCounterClock);
            
            return triangles;
        },
        
        
        /// Apply delaunay triangluation to a set of given vectors. Uses the
        /// incremental build strategy.
        ///
        /// @param {coordinates} Array containing 2d vectors
        /// @param {prepareForVoronoi} Internally record some voronoi details. On 
        ///         its own this isn't quite a voronoi yet, but provides enough data
        ///         to generate one. Use Delaunay.Voronoi() to generate a voronoi.
        /// @return An array containing delaunay triangles.
        Triangulate: function(coordinates, prepareForVoronoi) {
            if(coordinates.length > 0) {
                var triangles = [];
            
                // Limit diagram to the max canvas drawing size, it's a resonable 
                // assumption we're using voronoi for visual purposes, not scientific.
                var s = MAX_CANVAS_DRAW_SIZE;
                
                s = new Triangle(
                    new Vector(0, s),   // top center
                    new Vector(-s, -s), // bottom left
                    new Vector(s,  -s)  // bottom right
                );
                
                // We're not trimming the super triangle with voronoi. The super
                // triangle acts as "infinity".
                if(prepareForVoronoi) {
                    s.a.neighbours = [];
                    s.b.neighbours = [];
                    s.c.neighbours = [];
                }
                
                // Omnipotent super triangle, we will add coordinates to this
                // triangle one-by-one.
                triangles.push(s);
            
                // Insert each coordinate:
                coordinates.forEach(function(vertex) {
                    
                    if(prepareForVoronoi === true) {
                        if( ! vertex.neighbours) { 
                            vertex.neighbours = [];
                        } else { 
                            vertex.neighbours.clear(); 
                        }
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
                                delete edges[hash];
                            } else {
                                edges[hash] = [triangle.a, triangle.b];
                            }
                        
                            hash = Hash(triangle.b, triangle.c);
                            if(edges[hash]) {
                                delete edges[hash];
                            } else {
                                edges[hash] = [triangle.b, triangle.c];
                            }
                        
                            hash = Hash(triangle.c, triangle.a);
                            if(edges[hash]) {
                                delete edges[hash];
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
                  
                    
                    if(prepareForVoronoi === true) {
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
        
        /// Generate the so-called farthest voronoi diagram
        /// of a given set of coordinates.
        ///
        /// @param {coordinates} An array of 2d vectors
        /// @return An object with the vertices and edges. This is subject to change.
        FarthestVoronoi: function(coordinates) {
            var hull     = GiftWrap(coordinates);
            var lines    = []; // All edges
            var centers  = []; // Centers of circumcircles

            // Work on a copy of the hull
            for(var h = hull.clone(); h.length >= 3;) {
            
                // Search for the triplet with the largest circumcircle
                for(var i = 0, largest = null; i < h.length; ++i) {
            
                    // Tuple to hold referenced data on circumcircles. Has wrap
                    // around code for vertices.
                    var t = {
                        c:   h[i],
                        cw:  h[i - 1] || h.last(),
                        ccw: h[i + 1] || h.first(),
                        i:   i
                    };
            
                    t.d = Disk.CreateCircumcircle(t.cw, t.c, t.ccw);
            
                    // Find the largest
                    if(largest === null || largest.d.radius < t.d.radius) {
                        largest = t;
                    }
                }
           
                // Center of the circumcircle
                var center = largest.d.position;
           
                var directions = [
                    largest.c.direction(largest.cw).perp(),
                    largest.ccw.direction(largest.c).perp()
                ];
            
                // Special case for |h| == 3
                if(h.length == 3) {
                    directions.push(largest.cw.direction(largest.ccw).perp());
                }
           
                directions.forEach(function(v) {
                    // Edge between two Voronoi cells
                    var edge = new Line(center, center.clone().add(v.trim(MAX_CANVAS_DRAW_SIZE)));
                
                    lines.push(edge);
            
                    // Normal of the direction
                    var n = edge.direction().perp();
                
                    // Some point on the line
                    var r = edge.a;
                
                    // Solve c for a.x + b.y = c
                    var c = n.dot(r);
                
                    // Then using this "Hesse normal form" we can determine
                    // the distance between a line and a point. If the point
                    // lines on the line, we connect the vertices, otherwise
                    // they extend to "infinity".
                    centers.every(function(p) {
                    
                        // Distance from line to point.
                        var d = Math.abs(p.dot(n) - c);
                    
                        // Account for floating point precision
                        if(d >= 0 && d <= 0.000001) {
                        
                            // Extend the edge to reach the next vertex,
                            // this is for visual purposes only.
                            edge.b = edge.a.clone().add(edge.direction().trim(edge.a.distance(p)));
                        
                            return false;
                        }
                    
                        return true;
                    }.bind(this));
                }.bind(this));
            
                // Farthest Voronoi vertices
                centers.push(largest.d.position);
    
                // Remove from all
                h.splice(largest.i, 1);
            }
            
            // TODO: return Voronoi sites instead of two disjoint datasets.
            return {
                "edges":    lines,
                "vertices": centers,
                "hull":     hull 
            };
        },
        
    }; // End self
    
    return self;
});
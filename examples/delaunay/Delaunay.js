define(function(require) {
    var Game      = require("meier/engine/Game");
    var Input     = require("meier/engine/Input");
    var Random    = require("meier/math/Random");
    var Grid      = require("meier/prefab/Grid");
    var Pixel     = require("meier/prefab/Pixel");
    var Vector    = require("meier/math/Vec")(2);
    var dat       = require("meier/contrib/datgui");

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
            this.center = new Vector(0, 0);
            this.radius = Number.MAX_VALUE;
            
        } else {
            this.center = new Vector(
                this.a.x + (bPos.x * cPos.lengthSQ() - cPos.x * bPos.lengthSQ()) / d,
                this.a.y + (cPos.y * bPos.lengthSQ() - bPos.y * cPos.lengthSQ()) / d
            );
            
            this.radius = this.a.distance(this.center);                        
        }
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
        return this.center.distance() < this.radius;
    };


    Delaunay.prototype = new Game();
    function Delaunay(container) {
        Game.call(this, container);
        this.setFps(30);
        
        // Debug log alignment:
        this.log.top().right();
        
        // Pretty pointer:
        this.input.cursor(Input.Cursor.FINGER);
        
        // Cache of coordinates:
        this.coordinates = [];
        
        
        // Editable grid:
        this.add(this.grid = new Grid(0, 0, this.width, this.height));
        this.grid.setEditable(true);
        this.grid.showPoints(true);
        this.grid.onChange = this.recompute.bind(this);
        
        
        this.grid.onLeftDown(new Vector(100, 100));
        //this.grid.onLeftDown(new Vector(0, 100));
        //this.grid.onLeftDown(new Vector(100, 0));
    }


    Delaunay.prototype.recompute = function(coordinates) {
        this.coordinates = coordinates;
       
    };
    
    Delaunay.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);

    };
    
    Delaunay.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);

        if(this.coordinates.length > 0) {
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
            this.coordinates.forEach(function(vertex) {
                
                // Find a triangle that contains the given coordinate:
                for(var i = 0, triangle; i < triangles.length; ++i) {
                    triangle = triangles[i];
                    
                    if(triangle.contains(vertex)) {

                        // Split this triangle in 3 new triangles:
                        var a = new Triangle(triangle.a, triangle.b, vertex);
                        var b = new Triangle(vertex, triangle.b, triangle.c);
                        var c = new Triangle(vertex, triangle.c, triangle.a);

                        // Two new neighbours, and inherit old ones: (nb double check.)
                        //a.neighbours.merge(triangle.neighbours).push(b, c);
                        //b.neighbours.merge(triangle.neighbours).push(a, c);
                        //c.neighbours.merge(triangle.neighbours).push(b, a);
                        
                        a.neighbours.push(b, c);
                        b.neighbours.push(a, c);
                        c.neighbours.push(b, a);
                        
                        
                        // Two new ones:
                        triangles.push(a, b);
                        
                        // Overwrite existing triangle:
                        triangles[i] = c;
                    }
                }
            });
            
            triangles = triangles.filter(function(triangle) {
                var r = triangle.a == s.a || triangle.b == s.a || triangle.c == s.a ||
                        triangle.a == s.b || triangle.b == s.b || triangle.c == s.b ||
                        triangle.a == s.c || triangle.b == s.c || triangle.c == s.c;
                  
                return !r;
            });
            
            triangles.forEach(function(triangle) {

                renderer.begin();
                triangle.draw(renderer);
                renderer.stroke("rgba(0,255,0,1)", 2);
                
                renderer.begin();
                renderer.circle(triangle.center, triangle.radius);
                renderer.stroke("rgba(0, 0, 0, 0.8)");
                renderer.fill("rgba(0, 0, 0, 0.05)");
            });
            
            triangles.every(function(triangle) {
                if(triangle.contains(this.input)) {
                    
                    renderer.begin();
                    triangle.draw(renderer);
                    renderer.stroke("red", 2);
                    
                    /*renderer.begin();
                    triangle.neighbours.forEach(function(n) {
                        n.draw(renderer);
                    });
                    renderer.stroke("blue", 2);*/
                    
                    return false;
                }
                return true;
            }.bind(this));
                        

        }
        
        
    };
    
    return Delaunay;
});
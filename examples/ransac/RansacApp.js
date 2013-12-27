define(function(require){
    var Game   = require("meier/engine/Game");
    var Grid   = require("meier/prefab/Grid");
    var LeastSquareCircle = require("meier/math/Math").LeastSquareCircle
    
    // LeastSquareCircle
    var Vector = require("meier/math/Vec")(2);
    var Disk   = require("meier/math/Disk");
    var GJ     = require("meier/math/Math").GaussJordanElimination;
    var Random = require("meier/math/Random");
    var M      = require("meier/math/Mat");
    var Line   = require("meier/math/Line");
    
    var Voronoi   = require("meier/math/Delaunay").Voronoi;
    var Colors    = require("meier/aux/Colors");
    
    var dat       = require("meier/contrib/datgui");
    
    
    RansacApp.prototype = new Game();
    
    
    
    function RansacApp(container) {        
        Game.call(this, container);

        this.log.top().right();
        this.setFps(15);
                
        this.grid = new Grid(0, 0, this.width, this.height);
        this.add(this.grid);
        this.grid.setEditable(true);
        this.grid.onChange = this.onChange.bind(this);
        
        this.coordinates = [];
        
        var r = 200;
        Random.Seed(10);
        
        for(var i = 0; i < Math.TwoPI; i += Math.TwoPI/4) {
            var n = Random(-10, 10);
            this.grid.onLeftDown(new Vector(Math.cos(i) * r + n, Math.sin(i) * r + n));
        }
        
        
        this.colors = Colors.Random(50);
        
        this.showVoronoi = false;
        this.showLeastSquareCircle = false;
        this.showFarthestVoronoi = true;
        this.showDelaunay = false;
        this.showHull = false;
        
        this.gui = new dat.GUI();
        var folder = this.gui.addFolder("Change visibility state");
        folder.add(this, "showVoronoi").name("Voronoi");
        folder.add(this, "showLeastSquareCircle").name("Least Squares");
        folder.add(this, "showDelaunay").name("Delaunay");
        folder.add(this, "showFarthestVoronoi").name("Farthest Voronoi");
        folder.add(this, "showHull").name("Convex Hull");
        
        
        this.verbose = true;
    }
    
    RansacApp.prototype.onChange = function(coordinates) {
        if(coordinates instanceof Array) {
            this.coordinates = coordinates;
        }
                
        this.verbose = true;
    };
    
    RansacApp.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    RansacApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        if(this.coordinates.length < 3) {
            return;
        }
        
        var Hull      = require("meier/math/Hull").GiftWrap;
        var Disk      = require("meier/math/Disk");
    
        var hull = Hull(this.coordinates);
        
        if(this.showLeastSquareCircle) {
            var disk = LeastSquareCircle(hull || this.coordinates);
            renderer.begin();
            renderer.circle(disk);
            renderer.fill("rgba(0, 0, 0, 0.3)");
            renderer.stroke("rgba(0, 0, 0, 0.7)");
        }
        
        
        if(this.showHull) {
            renderer.begin();
            hull.eachPair(function(a, b) {
                renderer.arrow(a, b);
            });        
            renderer.stroke("black");
        }
        
        var vertices = [];
        var lines    = [];
        var centers  = []; // Centers of circumcircles
        
        // Outer cells reach infinity, this is less practical for 
        // our purposes. So this limit will make do.
        var inf = 1000;
        
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
                var edge = new Line(center, center.clone().add(v.trim(inf)));
                
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
        
        // Voronoi edges
        renderer.begin();
        lines.forEach(renderer.line.bind(renderer));
        renderer.stroke("red");
        
        // Circumcircle centers
        renderer.begin();
        centers.forEach(function(v) {
            renderer.circle(v, 2);
        });
        renderer.fill("black");
        
        
        if(this.showVoronoi || this.showDelaunay) {
            var delaunay = Voronoi(hull);
        
            if(this.showVoronoi) {
                this.coordinates.forEach(function(coordinate, i) {
                    renderer.begin();
                    renderer.polygon(coordinate.neighbours);
                    renderer.fill(Colors.Alpha(this.colors[i], 0.2));
                    renderer.stroke("rgba(0, 0, 0, 0.4)");
            
                }.bind(this));
            }
            
            if(this.showDelaunay) {
                delaunay.forEach(function(triangle) {
                    renderer.begin();
                    triangle.draw(renderer);
                    renderer.stroke("#393939", 2);
                });
            }
            
        }
        
        this.verbose = false;
        
        //this.showVoronoi = false;
        //this.showFarthestVoronoi = true;
        //this.showDelaunay = false;
    }
    
    
    
    return RansacApp;
});







/**

var k = 10; // Repetitions
var n = 2;  // Initial coordiates
var t = 20; // Maximal error


while(--k > 0) {
    var coordinates = this.coordinates.clone().shuffle();
    var maybe_inliers = [];
    
    // Gather baseline
    for(var i = 0; i < n; ++i) {
        maybe_inliers.push(maybe_inliers.pop());
    }
    
    var consensus_set = maybe_inliers.clone();
    
    // Find those who fall in error < t
    for(var i = 0; i < coordinates.length; ++i) {
        if() {
            
        }
    }
    
        }

**/
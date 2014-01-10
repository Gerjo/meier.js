define(function(require){
    var Game          = require("meier/engine/Game");
    var Grid          = require("meier/prefab/Grid");
    var LeastSqCircle = require("meier/math/Math").LeastSquaresCircle
    var Vector        = require("meier/math/Vec")(2);
    var Disk          = require("meier/math/Disk");
    var Random        = require("meier/math/Random");
    var Voronoi       = require("meier/math/Voronoi").Voronoi;
    var Colors        = require("meier/aux/Colors");
    var Farthest      = require("meier/math/Voronoi").FarthestVoronoi;
    var dat           = require("meier/contrib/datgui");
    var Hull          = require("meier/math/Hull").GiftWrap;
    var Disk          = require("meier/math/Disk");
    var ClosestVector = require("meier/math/Math").ClosestVector;
    var FarthestVector= require("meier/math/Math").FarthestVector;
    
    RansacApp.prototype = new Game();
    
    function RansacApp(container) {        
        Game.call(this, container);

        this.log.top().left();
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
        
        this.showVoronoi = true;
        this.showLeastSquareCircle = false;
        this.showFarthestVoronoi = true;
        this.showDelaunay = false;
        this.showHull = false;
        this.showVoronoiAnnulus = true;
        this.showFarthestAnnulus = true;
        
        
        this.gui = new dat.GUI();
        var folder = this.gui.addFolder("Debug visibility state");
        folder.add(this, "showVoronoi").name("Voronoi");
        folder.add(this, "showDelaunay").name("Delaunay");
        folder.add(this, "showFarthestVoronoi").name("Farthest Voronoi");
        folder.add(this, "showHull").name("Convex Hull");
        
        var folder = this.gui.addFolder("Annulus visibility state");
        folder.add(this, "showVoronoiAnnulus").name("By Voronoi");
        folder.add(this, "showFarthestAnnulus").name("By Farthest");
        folder.add(this, "showLeastSquareCircle").name("By Least Squares");
        
        
        
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
        
        // It takes 3 for a non ambiguous circle.
        if(this.coordinates.length < 3) {
            return;
        }
        
        var farthest = Farthest(this.coordinates);
        var voronoi  = Voronoi(this.coordinates);
        
        var voronoiColor  = Colors.green;
        var farthestColor = Colors.red;
        
        if(this.showLeastSquareCircle) {
            var disk = LeastSqCircle(Hull(this.coordinates));
            renderer.begin();
            renderer.circle(disk);
            renderer.fill("rgba(255, 0, 255, 0.3)");
            renderer.stroke("rgba(255, 0, 255, 0.7)");
        }
        
        
        if(this.showFarthestVoronoi) {
            // Voronoi edges
            renderer.begin();
            farthest.edges.forEach(renderer.line.bind(renderer));
            renderer.stroke(Colors.Alpha(farthestColor, 0.7), 1);
        
            // Circumcircle centers
            //renderer.begin();
            //farthest.vertices.forEach(function(v) {
            //    renderer.circle(v, 4);
            //});
            //renderer.fill("black");
        }
        
        if(this.showVoronoi || this.showDelaunay) {
            if(this.showVoronoi) {
                // Each coordinate is also a Voronoi cell
                this.coordinates.forEach(function(coordinate, i) {
                    renderer.begin();
                    renderer.polygon(coordinate.neighbours);
                    renderer.stroke(Colors.Alpha(voronoiColor, 0.7), 1);
                }.bind(this));
            }
            
            // This is just here... because we can.
            if(this.showDelaunay) {
                voronoi.forEach(function(triangle) {
                    renderer.begin();
                    triangle.draw(renderer);
                    renderer.stroke("#393939", 1);
                });
            }
        }
      
        if(this.showVoronoiAnnulus) {
        
            // Reduce the collection of triangles into a large
            // list with vertices:
            var n = [];
            voronoi.forEach(function(v) {
                n.merge(v.a.neighbours);
                n.merge(v.b.neighbours);
                n.merge(v.c.neighbours);
            });
                
            var best = SmallestAnnulus(n, this.coordinates);
            renderer.begin();
            renderer.circle(best.center, best.closest + best.annulus*0.5);
            renderer.stroke(Colors.Alpha(Colors.green, 0.2), best.annulus);
        
            renderer.begin();
            renderer.circle(best.center, best.closest);
            renderer.circle(best.center, best.farthest);
            renderer.circle(best.center, 2);
            renderer.stroke(Colors.green);
        }
        
        if(this.showHull) {
            renderer.begin();
            farthest.hull.eachPair(function(a, b) {
                renderer.line(a, b);
            });        
            renderer.stroke("black", 2);
        }
                
        if(this.showFarthestAnnulus) {
            var best = SmallestAnnulus(farthest.vertices, this.coordinates);
            renderer.begin();
            renderer.circle(best.center, best.closest + best.annulus*0.5);
            renderer.stroke(Colors.Alpha(farthestColor, 0.2), best.annulus);
        
            renderer.begin();
            renderer.circle(best.center, 2);
            renderer.circle(best.center, best.closest);
            renderer.circle(best.center, best.farthest);
            renderer.stroke(Colors.Alpha(farthestColor, 0.7));
        }
    }
    
    function SmallestAnnulus(centers, coordinates) {
        var best = null; 

        centers.forEach(function(center) {
            var closest  = ClosestVector(center, coordinates);
            var farthest = FarthestVector(center, coordinates);
            
            var cd = closest.distance(center);
            var fd = farthest.distance(center);
            
            var annulus = fd - cd;
            
            if(best == null || annulus < best.annulus) {
                best = {
                    center:     center,
                    closest:    cd,
                    farthest:   fd,
                    annulus:    annulus
                };
            }
        });
        
        return best;
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
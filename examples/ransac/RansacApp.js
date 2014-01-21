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
                
        this.showVoronoi = false;true;
        this.showLeastSquareCircle = false;
        this.showFarthestVoronoi = false;true;
        this.showDelaunay = false;
        this.showHull = false;
        this.showVoronoiAnnulus = false;true;
        this.showFarthestAnnulus = false;true;
        this.showRansac = true;
        
        this.ransacDisk      = null;
        this.ransacConsensus = null;
        this.ransacAnnulus   = Infinity;
        this.ransacNearest   = Infinity;
        this.ransacFarthest  = -Infinity;
        
        this.gui = new dat.GUI();
        var folder = this.gui.addFolder("Debug visibility state");
        folder.add(this, "showVoronoi").name("Voronoi");
        folder.add(this, "showDelaunay").name("Delaunay");
        folder.add(this, "showFarthestVoronoi").name("Farthest Voronoi");
        folder.add(this, "showHull").name("Convex Hull");
        
        folder = this.gui.addFolder("Annulus visibility state");
        folder.add(this, "showVoronoiAnnulus").name("By Voronoi");
        folder.add(this, "showFarthestAnnulus").name("By Farthest");
        folder.add(this, "showLeastSquareCircle").name("By Least Squares");
        folder.add(this, "showRansac").name("By RANSAC");
        
        folder = this.gui.addFolder("Randomness");
        folder.add(this.grid, "clear").name("Clear");
        folder.add(this, "generateLogarithmic").name("Logarithmic Curve");
        folder.add(this, "generateNoisyCircle").name("Noisy Circle");
                
        this.generateLogarithmic();
    }
    
    RansacApp.prototype.generateLogarithmic = function() {
        this.grid.clear();
        
        // Number of coordinates to add
        var n = 50;
        
        // Scaling factor
        var d = 20;
        
        // Function to generate a random sign
        var RandomSign = function() {
            return Random(0, 1) == 0 ? -1 : 1;
        };
        
        for(var i = 0, x, y; i < n; ++i) {
            x = Random(1, d);
            y = Random(1, d);
            
            x = Math.ln(x) * y;
            
            // Introduce a sign {-1, 1}... imaginary logarithm?
            y = Math.ln(y) * x * RandomSign();
            
            // Voronoi crashes with non unique coordinates
            if( ! this.grid.hasCoordinate(x, y)) {
                --i;
                continue;
            }
                        
            // Trigger a click on the last add. This forces a 
            // recomputation of internals.
            if(i == n - 1) {
                this.grid.onLeftDown(new Vector(x, y));
            } else {
                this.grid.add(new Vector(x, y));
            }
        }
    };
    
    RansacApp.prototype.generateNoisyCircle = function(noise) {
        this.grid.clear();
        
        
        // The radius
        var radius = Random(100, 200);
        
        // Center of the circle
        var center = new Vector(Random(-30, 30), Random(-30, 30));
        
        // Number of points to generate
        var n      = 50;
        
        // Noise margin [-e, e]
        var e      = isNaN(noise) ? 10 : noise; 
        
        for(var i = 0, x, y, angle = 0, error; i < n; ++i) {
            angle += Math.TwoPI / n;
            
            error = Random(-e, e);
            
            x = Math.cos(angle) * radius + center.x + error;
            y = Math.sin(angle) * radius + center.y + error;
            
            
            // Trigger a click on the last add. This forces a 
            // recomputation of internals.
            if(i == n - 1) {
                this.grid.onLeftDown(new Vector(x, y));
            } else {
                this.grid.add(new Vector(x, y));
            }
        }
    };
    
    RansacApp.prototype.onChange = function(coordinates) {
        if(coordinates instanceof Array) {
            this.coordinates = coordinates;
        }

        // Restart ransac guessing
        this.ransacDisk = null;
        this.ransacAnnulus = Infinity;
        this.ransacNearest   = Infinity;
        this.ransacFarthest  = -Infinity;
    };
    
    RansacApp.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
        // Don't bother computing if it's hidden.
        if(this.showRansac) {
            this.ransac(this.coordinates);
        }
    };
    
    RansacApp.prototype.ransac = function(coordinates) {
        var k = 1; // Repetitions
        var t = 5; // Maximal error
        
        if(coordinates.length < 3) {
            return;
        }
        
        var bestConsensus = this.ransacConsensus || [];
        var bestModel     = this.ransacDisk || null;
        var bestAnnulus   = this.ransacAnnulus;
        var bestNearest   = this.ransacNearest;
        var bestFarthest  = this.ransacFarthest;
        
        while(k-- > 0) {
            // Randomly shuffle all candidates
            var candidates = coordinates.clone().shuffle();
            
            // Pick initial coordinates
            var consensus  = candidates.splice(0, 3);
    
            // Our model is a circle that runs through the initial 3 coordinates
            var model = Disk.CreateCircumcircle(consensus[0], consensus[1], consensus[2]);
    
            // Extrema
            var farthestDistance = -Infinity;
            var nearestDistance  = Infinity;
    
            // See how well the points fit the model
            for(var i = 0; i < candidates.length; ++i) {
                var distance = candidates[i].distance(model.position);
                
                if(distance > farthestDistance) {
                    farthestDistance = distance;
                }
                
                if(distance < nearestDistance) {
                    nearestDistance = distance;
                }
            }
            
            // Resulting annulus width
            var annulus = farthestDistance - nearestDistance;
            
            if(annulus < bestAnnulus) {
                bestAnnulus  = annulus;
                bestModel    = model;
                bestFarthest = farthestDistance;
                bestNearest  = nearestDistance;
            }
            
    
            // Find candidates with an error < t
            /*for(var i = 0; i < candidates.length; ++i) {
                if(model.distance(candidates[i]) <= t) {
                    consensus.push(candidates.splice(i, 1));
                }
            }
            
            // Compare previously best model
            if( ! bestModel || consensus.length > bestConsensus.length) {
                bestModel     = model;
                bestConsensus = consensus   
            }*/
        }
        
        this.ransacConsensus = bestConsensus;
        this.ransacAnnulus   = bestAnnulus;
        this.ransacDisk      = bestModel;
        this.ransacNearest   = bestNearest;
        this.ransacFarthest  = bestFarthest;
    };
    
    RansacApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        
        // It takes 3 for a non ambiguous circle.
        if(this.coordinates.length < 3) {
            return;
        }
        
        if(this.showRansac && this.ransacDisk) {
            renderer.begin();
            renderer.circle(this.ransacDisk.position, this.ransacNearest + this.ransacAnnulus*0.5);
            renderer.stroke(Colors.Alpha("purple", 0.3), this.ransacAnnulus);
            
            renderer.begin();
            renderer.circle(this.ransacDisk.position, this.ransacNearest);
            renderer.circle(this.ransacDisk.position, this.ransacFarthest);
            renderer.stroke("purple");
        }
        

        
        var farthest = Farthest(this.coordinates);
        var voronoi  = Voronoi(this.coordinates);
        
        var voronoiColor  = Colors.green;
        var farthestColor = Colors.red;
        
        if(this.showLeastSquareCircle) {
            var disk = LeastSqCircle(this.coordinates);
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

        // Test all posible centers i.e., voronoi vertices to find
        // the smallest annulus.
        centers.forEach(function(center) {
            
            // Closest to center (inner radius).
            var closestDistance  = ClosestVector(center, coordinates).distance(center);
            
            // Farthest removed from center (outer radius).
            var farthestDistance = FarthestVector(center, coordinates).distance(center);
            
            // Difference gives the annulus width.
            var annulus = farthestDistance - closestDistance;
            
            // Accept only the smallest annulus
            if(best == null || annulus < best.annulus) {
                best = {
                    center:     center,
                    closest:    closestDistance,
                    farthest:   farthestDistance,
                    annulus:    annulus
                };
            }
        });
        
        return best;
    }
    
    return RansacApp;
});
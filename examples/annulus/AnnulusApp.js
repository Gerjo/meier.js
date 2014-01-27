define(function(require){
    var Game            = require("meier/engine/Game");
    var Grid            = require("meier/prefab/Grid");
    var LeastSqCircle   = require("meier/math/Math").LeastSquaresCircle
    var Vector          = require("meier/math/Vec")(2);
    var Disk            = require("meier/math/Disk");
    var Colors          = require("meier/aux/Colors");
    var NearestVoronoi  = require("meier/math/Voronoi").Voronoi;
    var FarthestVoronoi = require("meier/math/Voronoi").FarthestVoronoi;
    var dat             = require("meier/contrib/datgui");
    var Hull            = require("meier/math/Hull").GiftWrap;
    var Disk            = require("meier/math/Disk");
    var ClosestVector   = require("meier/math/Math").ClosestVector;
    var FarthestVector  = require("meier/math/Math").FarthestVector;
    var Intersection    = require("meier/math/Intersection").Get;            
    var Segment         = require("meier/math/Line");
    
    var Annulus    = require("./Annulus");
    var Ransac     = require("./Ransac");
    var Randomness = require("./Randomness");
    
    Application.prototype = new Game();
    
    function Application(container) {        
        Game.call(this, container);

        // Debug logger alignment and visiblity
        this.logger.top().left().hideInternals().setFontSize(15);
        
        // Run at interactive speed
        this.setFps(15);
                
        // Setup an interactive convas
        this.grid = new Grid(0, 0, this.width, this.height);
        this.add(this.grid);
        this.grid.setEditable(true);
        this.grid.onChange = this.onChange.bind(this);
        
        // Will hold the canvas coordinates
        this.coordinates = [];
        
        // Will hold the nearest/farthest voronoi intersections
        this.intersections = [];
        
        // Will hold all generated annuli
        this.annuli = {
            nearest:      null,
            farthest:     null,
            intersection: null,
            ransac:       null
        };
                
        // Visibility states
        this.showVoronoi             = false;
        this.showLeastSquareCircle   = false;
        this.showFarthestVoronoi     = false;
        this.showDelaunay            = false;
        this.showHull                = false;
        this.showVoronoiAnnulus      = true;
        this.showFarthestAnnulus     = true;
        this.showRansacAnnulus       = true;
        this.showIntersectionAnnulus = true;
        this.showVoronoiIntersection = false;
        
        // Ransac options 
        this.ransacK      = 5000;
        this.ransacModels = ["Circumcircle", "3 Mean Position", "2 Points"];
        this.ransacModel  = this.ransacModels.first();
        
        // We use "dat.GUI" project for the interface.
        this.gui = new dat.GUI();
        this.gui.width = 340;
        
        // Debug visibility
        var folder = this.gui.addFolder("Debug visibility state");
        folder.add(this, "showVoronoi").name("Voronoi");
        folder.add(this, "showFarthestVoronoi").name("Farthest Voronoi");
        folder.add(this, "showVoronoiIntersection").name("Voronoi Intersections");
        folder.add(this, "showDelaunay").name("Delaunay");
        folder.add(this, "showHull").name("Convex Hull");
        folder.add(this, "showLeastSquareCircle").name("Least Squares");
        
        // Annulus visibility
        folder = this.gui.addFolder("Annulus visibility state");
        folder.add(this, "showVoronoiAnnulus").name("By Nearest");
        folder.add(this, "showFarthestAnnulus").name("By Farthest");
        folder.add(this, "showIntersectionAnnulus").name("By Intersection");
        folder.add(this, "showRansacAnnulus").name("By RANSAC");
        
        // Canvas editing options
        folder = this.gui.addFolder("Randomness");
        folder.add(this.grid, "clear").name("Clear");
        folder.add(this, "logarithmic").name("Logarithmic");
        folder.add(this, "noise").name("Noise");
        folder.add(this, "noisyCircle").name("Noisy Circle");
        
        // RANSAC options
        folder = this.gui.addFolder("RANSAC");
        folder.add(this, "ransacK", 1, 10000).name("Repetitions (K)").onChange(this.onChange.bind(this));
        folder.add(this, "ransacModel", this.ransacModels).name("Model").onChange(this.onChange.bind(this));
        folder.add(this, "ransacIterate").name("Run K iterations");
        folder.add(this, "onChange").name("Restart");
        
        // Show some default data
        this.noisyCircle();
    }
    
    /// Facade method to generate a noise circle.
    Application.prototype.noisyCircle = function() {
        Randomness.NoisyCircle(this.grid);
    };
    
    /// Facade method to generate a logarithmic curve
    Application.prototype.logarithmic = function() {
        Randomness.Logarithmic(this.grid);
    };
    
    /// Facade method to generate random noise
    Application.prototype.noise = function() {
        Randomness.Noise(this.grid);
    };
    
    Application.prototype.ransacIterate = function() {
        
        if(this.coordinates.length < 3) {
            return;
        }
        
        var estimationModel = this.ransacModels.indexOf(this.ransacModel);
        this.annuli.ransac  = Ransac(this.coordinates, this.ransacK, estimationModel, this.annuli.ransac);        
        this.annuli.ransac.name  = "RANSAC";
        this.annuli.ransac.color = Colors.purple;
    };
    
    Application.prototype.onChange = function(coordinates) {
        if(coordinates instanceof Array) {
            this.coordinates = coordinates;
        }

        if(this.coordinates.length < 3) {
            return;
        }

        // TODO: bundle code for each access
        this.leastSquaresDisk = LeastSqCircle(this.coordinates);        
        this.farthestVoronoi  = FarthestVoronoi(this.coordinates);
        this.nearestVoronoi   = NearestVoronoi(this.coordinates);
        
        // Reduce the collection of delaunay triangles into a large list with
        // all their circumcircles, i.e., voronoi vertices.
        var vertices = this.nearestVoronoi.reduce(function(previous, current) {
            previous.merge(current.a.neighbours);
            previous.merge(current.b.neighbours);
            previous.merge(current.c.neighbours);
            
            return previous;
        }, []);
        
        // Clear previous voronoi intersections
        this.intersections.clear();
        
        // Find farthest and nearest voronoi intersections
        this.coordinates.forEach(function (v) {
            for(var i = 0; i < v.neighbours.length; ++i) {
                
                // Edges have wrap-around code.
                var nearestEdge = new Segment(
                    v.neighbours[i - 1] || v.neighbours.last(),
                    v.neighbours[i] || v.neighbours.first()
                );
                
                this.farthestVoronoi.edges.forEach(function(fathestEdge) {
                    
                    // Run intersection test of edges
                    var p = Intersection.Segments(nearestEdge, fathestEdge);
                    
                    if(p !== false) {
                        // There was an intersection. This is a potential annulus
                        // center. (case 3 in the slides).
                        this.intersections.push(p);
                    }
                }.bind(this));   
            }
        }.bind(this));
      
        this.annuli.intersection = SmallestAnnulus(this.intersections, this.coordinates);
        this.annuli.intersection.name = "Voronoi Intersection";
        this.annuli.intersection.color = Colors.blue;
        
        this.annuli.nearest = SmallestAnnulus(vertices, this.coordinates);        
        this.annuli.nearest.name  = "Nearest Voronoi";
        this.annuli.nearest.color = Colors.green;
        
        this.annuli.farthest = SmallestAnnulus(this.farthestVoronoi.vertices, this.coordinates);        
        this.annuli.farthest.name  = "Farthest Voronoi";
        this.annuli.farthest.color = Colors.red;
        
        var estimationModel = this.ransacModels.indexOf(this.ransacModel);
        this.annuli.ransac  = Ransac(this.coordinates, this.ransacK, estimationModel, null);        
        this.annuli.ransac.name  = "RANSAC";
        this.annuli.ransac.color = Colors.purple;
    };
    
    Application.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        for(var k in this.annuli) {
            if(this.annuli.hasOwnProperty(k)) {
                if(this.annuli[k] != null) {
                    this.log(this.annuli[k].name, "" + this.annuli[k].width.toFixed(6) + "px wide", this.annuli[k].color);
                }
            }
        }
        
        // It takes 3 for a non ambiguous circle.
        if(this.coordinates.length < 3) {
            return;
        }
        
        if(this.showRansacAnnulus) {
            this.annuli.ransac.draw(renderer);
        }
        
        if(this.showVoronoiAnnulus) {
            this.annuli.nearest.draw(renderer);
        }
        
        if(this.showFarthestAnnulus) {
            this.annuli.farthest.draw(renderer);
        }
        
        if(this.showIntersectionAnnulus) {
            this.annuli.intersection.draw(renderer);
        }
        
        
        if(this.showLeastSquareCircle) {
            renderer.begin();
            renderer.circle(this.leastSquaresDisk);
            renderer.fill("rgba(255, 0, 255, 0.3)");
            renderer.stroke("rgba(255, 0, 255, 0.7)");
        }
        
        if(this.showFarthestVoronoi) {
            // The edges are drawn as line segments
            renderer.begin();
            this.farthestVoronoi.edges.forEach(renderer.line.bind(renderer));
            renderer.stroke(Colors.Alpha(this.annuli.farthest.color , 0.7), 1);
        }
        
        if(this.showVoronoi) {
            this.coordinates.forEach(function(coordinate, i) {
                // Draw each voronoi cell as a polygon
                renderer.begin();
                renderer.polygon(coordinate.neighbours);
                renderer.stroke(Colors.Alpha(this.annuli.nearest.color, 0.7), 1);
            }.bind(this));
        }
        
        // Cannot show a voronoi without showing a delaunay
        if(this.showDelaunay) {
            this.nearestVoronoi.forEach(function(triangle) {
                renderer.begin();
                triangle.draw(renderer);
                renderer.stroke("#393939", 1);
            });
        }
      
        // The convex hull (as used by farthest vorono)
        if(this.showHull) {
            renderer.begin();
            this.farthestVoronoi.hull.eachPair(renderer.line.bind(renderer));        
            renderer.stroke("#393939", 2);
        }
        
        if(this.showVoronoiIntersection) {
            renderer.begin();
            
            this.intersections.forEach(function(p) {
                renderer.circle(p, 2);
            });
            renderer.fill("blue");
        }
        
    }
    
    /// Helper function to find the minima and maxima, indicating
    /// the annules.
    function SmallestAnnulus(centers, coordinates) {
        
        // Accept an array or single value. A single value is
        // normalized into a 1 item array.
        if( ! (centers instanceof Array)) {
            centers = [centers];
            
        }
        
        if(centers.length == 0) {
            //debugger;
        }

        // To hold the best match
        var best = null; 
        
        // Test all posible centers i.e., voronoi vertices to find
        // the smallest annulus.
        centers.forEach(function(center) {
            
            // Closest to center (inner radius).
            var closestDistance  = ClosestVector(center, coordinates).distance(center);
            
            // Farthest removed from center (outer radius).
            var farthestDistance = FarthestVector(center, coordinates).distance(center);
            
            // Difference gives the annulus width.
            var width = farthestDistance - closestDistance;
            
            // Accept only the smallest annulus
            if(best == null || width < best.width) {
                best = {
                    center:     center,
                    closest:    closestDistance,
                    farthest:   farthestDistance,
                    width:      width
                };
            }
        });
        
        return new Annulus(best.center, best.closest, best.farthest);
    }
    
    return Application;
});
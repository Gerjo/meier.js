define(function(require){
    var Game            = require("meier/engine/Game");
    var Grid            = require("meier/prefab/Grid");
    var LeastSqCircle   = require("meier/math/Math").LeastSquaresCircle
    var Vector          = require("meier/math/Vec")(2);
    var Disk            = require("meier/math/Disk");
    var Random          = require("meier/math/Random");
    var NearestVoronoi  = require("meier/math/Voronoi").Voronoi;
    var Colors          = require("meier/aux/Colors");
    var FarthestVoronoi = require("meier/math/Voronoi").FarthestVoronoi;
    var dat             = require("meier/contrib/datgui");
    var Hull            = require("meier/math/Hull").GiftWrap;
    var Disk            = require("meier/math/Disk");
    var ClosestVector   = require("meier/math/Math").ClosestVector;
    var FarthestVector  = require("meier/math/Math").FarthestVector;
    
    RansacApp.prototype = new Game();
    
    function RansacApp(container) {        
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
        
        // Will hold all generated annuli
        this.annuli = {
            farthest: null,
            nearest:  null,
            ransac:   null
        };
                
        // Visibility states
        this.showVoronoi           = false;
        this.showLeastSquareCircle = false;
        this.showFarthestVoronoi   = false;
        this.showDelaunay          = false;
        this.showHull              = false;
        this.showVoronoiAnnulus    = true;
        this.showFarthestAnnulus   = true;
        this.showRansacAnnulus     = true;
        
        // Ransac options 
        this.ransacK      = 200;
        this.ransacModels = ["Circumcircle", "Mean Position"];
        this.ransacModel  = this.ransacModels.first();
        
        // We use "dat.GUI" project for the interface.
        this.gui = new dat.GUI();
        
        // Debug visibility
        var folder = this.gui.addFolder("Debug visibility state");
        folder.add(this, "showVoronoi").name("Voronoi");
        folder.add(this, "showDelaunay").name("Delaunay");
        folder.add(this, "showFarthestVoronoi").name("Farthest Voronoi");
        folder.add(this, "showHull").name("Convex Hull");
        folder.add(this, "showLeastSquareCircle").name("Least Squares");
        
        // Annulus visibility
        folder = this.gui.addFolder("Annulus visibility state");
        folder.add(this, "showVoronoiAnnulus").name("By Voronoi");
        folder.add(this, "showFarthestAnnulus").name("By Farthest");
        folder.add(this, "showRansacAnnulus").name("By RANSAC");
        
        // Canvas editing options
        folder = this.gui.addFolder("Randomness");
        folder.add(this.grid, "clear").name("Clear");
        folder.add(this, "generateLogarithmic").name("Logarithmic Curve");
        folder.add(this, "generateNoisyCircle").name("Noisy Circle");
        
        // RANSAC options
        folder = this.gui.addFolder("RANSAC");
        folder.add(this, "ransacK", 1, 10000).name("Repetitions (K)").onChange(this.onChange.bind(this));
        folder.add(this, "ransacModel", this.ransacModels).name("Model").onChange(this.onChange.bind(this));
        folder.add(this, "ransacIterate").name("Run K iterations");
        folder.add(this, "onChange").name("Restart");
        
        // Show some default data
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
            
            // Positional error
            error = Random(-e, e);
            
            // Parametric circle
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
    
    RansacApp.prototype.ransacIterate = function() {
        
        if(this.coordinates.length < 3) {
            return;
        }
        
        var estimationModel = this.ransacModels.indexOf(this.ransacModel);
        this.annuli.ransac  = this.ransac(this.coordinates, this.ransacK, estimationModel, this.annuli.ransac);        
        this.annuli.ransac.name  = "RANSAC";
        this.annuli.ransac.color = Colors.purple;
    };
    
    RansacApp.prototype.onChange = function(coordinates) {
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
        
        this.annuli.nearest = SmallestAnnulus(vertices, this.coordinates);        
        this.annuli.nearest.name  = "Nearest Voronoi";
        this.annuli.nearest.color = Colors.green;
        
        this.annuli.farthest = SmallestAnnulus(this.farthestVoronoi.vertices, this.coordinates);        
        this.annuli.farthest.name  = "Farthest Voronoi";
        this.annuli.farthest.color = Colors.red;
        
        var estimationModel = this.ransacModels.indexOf(this.ransacModel);
        this.annuli.ransac  = this.ransac(this.coordinates, this.ransacK, estimationModel, null);        
        this.annuli.ransac.name  = "RANSAC";
        this.annuli.ransac.color = Colors.purple;
    };
    
    RansacApp.prototype.ransac = function(coordinates, k, estimationModel, bestAnnulus) {  
        
        k = Math.max(1, k);
              
        // Initial annulus
        var bestAnnulus = bestAnnulus || null;
        var bestModel   = null;
        
        while(k-- > 0) {

            // Randomly shuffle all candidates
            var candidates = coordinates.clone().shuffle();
            
            // Pick initial coordinates
            var consensus = [candidates[0], candidates[1], candidates[2]];
    
            // Our model is a circle that runs through the initial 3 coordinates
            var model;
            
            // Find a circle that runs through the 3 coordinates, and use that as center
            if(estimationModel == 0) {
                 model = Disk.CreateCircumcircle(consensus[0], consensus[1], consensus[2]);
                 
            // Take the average position as the center
            } else if(estimationModel == 1) {
                var center = consensus.reduce(function(c, v) {
                    return c.add(v);
                }, new Vector(0, 0)).scaleScalar(1 / consensus.length);
                
                model = new Disk(center, 0);
            } else {
                throw new Error("Not a valid estimation model. Try '0' or '1'.");
            }
            
            
            // Initial annulus
            var annulus = new Annulus(model.position);
        
            // See how well the points fit the model
            for(var i = 0; i < candidates.length; ++i) {
                var distance = candidates[i].distance(model.position);
                
                // Test for a better outer radius
                if(distance > annulus.max) {
                    annulus.max = distance;
                }
                
                // Test for a better inner radius
                if(distance < annulus.min) {
                    annulus.min = distance;
                }
            }
            
            // Is the new better than the previous?
            if(bestAnnulus == null || annulus.width < bestAnnulus.width) {
                bestAnnulus  = annulus;
                bestModel    = model;
            }
        }
                
        // And the winner is...
        return bestAnnulus;
    };
    
    RansacApp.prototype.draw = function(renderer) {
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
    
    /// Class that represents an annulus.
    function Annulus(position, min, max) {
        
        // Center position
        this.position = position || new Vector(0, 0);
        
        // Inner radius
        this.min      = min || Infinity;
        
        // Outer radius
        this.max      = max || -Infinity;
        
        // Associate a visualisation color
        this.color    = Colors.black;
        
        // A identifier name
        this.name     = "Arbitrary Annulus";
        
        // Draw onto a canvas
        this.draw = function(renderer) {
            renderer.begin();
            renderer.circle(this.position, this.min + this.width * 0.5);
            renderer.stroke(Colors.Alpha(this.color, 0.3), this.width);
            
            renderer.begin();
            renderer.circle(this.position, this.min);
            renderer.circle(this.position, this.max);
            renderer.stroke(this.color);
        };
        
        this.log = function(logger) {
            logger.log(this.name, "foooo");
        };
    }
    
    Object.defineProperty(Annulus.prototype, "width", {
        get: function() { return this.max - this.min; },
    });
    
    return RansacApp;
});
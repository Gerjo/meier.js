define(function(require) {
    var Game      = require("meier/engine/Game");
    var Input     = require("meier/engine/Input");
    var Random    = require("meier/math/Random");
    var Grid      = require("meier/prefab/Grid");
    var Pixel     = require("meier/prefab/Pixel");
    var Vector    = require("meier/math/Vec")(2);
    var dat       = require("meier/contrib/datgui");
    var Voronoi   = require("meier/math/Voronoi").Voronoi;
    var Colors    = require("meier/engine/Colors");
    var Lerp      = require("meier/math/Lerp");
    var Noise     = require("meier/aux/Noise");
    var Circle    = require("meier/math/Disk");
    var ClosestVector      = require("meier/math/Math").ClosestVector;
    var LeastSquaresCircle = require("meier/math/Math").LeastSquaresCircle;

    Clustering.prototype = new Game();
    function Clustering(container) {
        Game.call(this, container);
        this.setFps(60);
        
        // Debug log alignment:
        this.logger.right().bottom();
        
        // Pretty pointer:
        this.input.cursor(Input.Cursor.FINGER);
        
        // Editable grid:
        this.add(this.grid = new Grid(0, 0, this.width, this.height));
        this.grid.setEditable(true);
        this.grid.showPoints(false);
        this.grid.onChange = this.recompute.bind(this);
      
        // Cached copy of coordinates, in these we will find
        // clusters.
        this.coordinates = [];
                
        // Number of clusters / centroids:
        this.numCentroids = 4;
        
        // Random initial spawn:
        this.randomClusters = 0;
        
        // Criteria for autotune
        this.auto = {
            enable: false,
            seedSingle: true,
            maxDisplacement: 5,  // pixels
            minDistance: 40,     // pixels
            minCoordinates: 1
        };
        
        // Will eventually hold the centroids:
        this.centroids   = [];
        this.radii       = []; // Radii of each centroid, for k-circles.
        this.clusters    = []; // coordinates per cluster.
        
        this.easing = 0.96;
                
        // Colors per index:
        this.colors = Colors.Random(40);
        
        this.methods = ["k-means", "k-medoids", "k-circles"/*, "k-polynomial"*/];
        this.method  = this.methods.first();
        
        // Settings GUI:
        this.gui = new dat.GUI();
        this.gui.add(this, "method", this.methods).name("Method");
        this.gui.add(this, "numCentroids", 1, 40).name("Centroids").step(1).onChange(this.onClusterChange.bind(this));
        this.gui.add(this, "easing").name("Easing").step(0.01).min(0).max(1);
        this.gui.add(this, "reseedAllCentroid").name("Reseed Centroids");
        
        var folder = this.gui.addFolder("Automatic Reseed");
        folder.add(this.auto, "enable").name("Enable");
        folder.add(this.auto, "seedSingle").name("Seed Single");
        folder.add(this.auto, "maxDisplacement", 0, 50).step(1).name("Displacement");
        folder.add(this.auto, "minCoordinates", 0, 100).step(1).name("Min Coordinates");
        folder.add(this.auto, "minDistance", 0, 100).step(1).name("Min Distance");
        
        folder = this.gui.addFolder("Randomness");
        folder.add(this, "addRandomCluster").name("Add Cluster");
        folder.add(this, "addRandomCircle").name("Add Circle");
        folder.add(this.grid, "clear").name("Clear");
        
        
        // Random number seeding:
        Random.Seed(49);
        this.addRandomCluster();
        this.addRandomCluster();
        this.addRandomCluster();
        this.addRandomCluster();
        
        //this.addRandomCircle();
        
        this.reseedAllCentroid();
    }
    
    Clustering.prototype.onClusterChange = function() {
        // Remove too many (i.e., the slider quantity went down)
        while(this.centroids.length > this.numCentroids) {
            this.centroids.pop();
            this.radii.length    = this.centroids.length;
            this.clusters.length = this.centroids.length;
        }
        
        // Add new (i.e., the slider quantity went up)
        while(this.centroids.length < this.numCentroids) {
            var centroid;
            
            // k-medoids, pick a random coordinate as centroid
            if(this.method == "k-medoids") {
                // Find a random centroid, (we could/should pick a unique...)
                centroid = this.coordinates.random();
                
            // Any other algorithm
            } else {
                // Random position on the canvas. This works for our demo implementation,
                // however for mission critical applications, "k-means++" might be 
                // worth a study.
                centroid = new Vector(Random(-this.hw, this.hw), Random(-this.hh, this.hh));
            }
            
            if(centroid) {
                // Make sure there is a random radius. (not used by k-means and k-medoids)
                this.radii[this.centroids.length] = Random(100, 200);
                
                this.centroids.push(
                    centroid
                );
                
            // No new centroid, break the loop.
            } else {
                break;
            }
        }
        
    };
    
    Clustering.prototype.reseedAllCentroid = function() {
        // Remove them all.
        this.centroids.clear();
        
        // This method will add fresh new ones.
        this.onClusterChange();
    };
    
    Clustering.prototype.addRandomCircle = function() {
        var ring = Noise.Circle(new Vector(Random(-200, 200)));
        
        this.grid.addCoordinate(ring);
    };
    
    Clustering.prototype.addRandomCluster = function() {
        var size   = 10;
        var radius = 40;
        
        var cluster = [];
        
        var place = new Vector(
            Random(-this.hw + radius, this.hw - radius),
            Random(-this.hh + radius, this.hh - radius)
        );
        
        for(var i = 0, p; i < size; ++i) {
            p = Random.Vector().scaleScalar(Random(-radius, radius));
            cluster.push(p.add(place));
        }
        
        this.grid.addCoordinate(cluster);
    };

    /// Method called when the interactive grid received
    /// new coordinates, or coordinates were deleted.
    Clustering.prototype.recompute = function(coordinates) {
        if(coordinates instanceof Array) {
            // No computations are done here, everything is set in
            // update loop.
            this.coordinates = coordinates;
        }
    };
    
    Clustering.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
        // The user changed the quantity
        if(this.centroids.length != this.numClusters) {
            this.onClusterChange();
        }
        
        // Create new lookup for each cluster. And new
        // empty accumulators for the average position of
        // each cluster.
        var accumulators = new Array(this.centroids.length);
        for(var j = 0; j < this.centroids.length; ++j) {
            this.clusters[j] = [];
            accumulators[j] = new Vector(0, 0);
        }

        // Map coordiates to a cluster
        this.coordinates.forEach(function(coordinate) {
            
            var nearest  = -1;          // Some invalid index. 
            var distance = Infinity;    // Initially quite far away.
            
            // Find clusest centroid i.e. cluster.
            for(var i = 0, d; i < this.centroids.length; ++i) {
                
                if(this.method == "k-circles") {
                    var translate = coordinate.clone().subtract(this.centroids[i]).length();
                    d = Math.abs(translate - this.radii[i]);
                    
                } else {
                    // Euclidian squared distance
                    d = this.centroids[i].distanceSQ(coordinate);
                }
                
                // Compare distances for a closter match:
                if(d < distance) {
                    distance = d;
                    nearest  = i;
                }
            }
            
            if(nearest != -1) {
                // Coordinate join the cluster:
                this.clusters[nearest].push(coordinate);
                
                accumulators[nearest].add(coordinate);
            }
        }.bind(this));
        
        
        var displacementSQ = 0;
        
        // Update centroid positions
        for(var i = 0; i < accumulators.length; ++i) {
            
            if(this.clusters[i].length > 0) {
                var mean = accumulators[i].scaleScalar(1 / this.clusters[i].length)
                var newCentroid;
                
                if(this.method == "k-means") {
                    // Normal k-means does not Lerp between previous centroid and 
                    // the new centroid. We do this just for animation purposes.
                    newCentroid = Lerp(this.centroids[i], mean, 1-this.easing);
                
                } else if(this.method == "k-circles") {
                    var fittedCircle  = LeastSquaresCircle(this.clusters[i]);
                    
                    newCentroid   = Lerp(this.centroids[i], fittedCircle.position, 1-this.easing);
                    this.radii[i] = Lerp(this.radii[i], fittedCircle.radius, 1-this.easing);
                    
                } else {
                    // The nearest coordinate to the average position is promoted to
                    // centroid. No animations here!
                    newCentroid = ClosestVector(mean, this.coordinates).clone();
                }
                
                // Accumulate displacement
                displacementSQ += this.centroids[i].distanceSQ(newCentroid);
                
                this.centroids[i] = newCentroid;
                
            } else {
                // Cluster is empty! (local minima)
            }
        }
        
        // Automatically test if clusters are "good"
        if(this.auto.enable === true && this.coordinates.length > 0) {
            
            // Only  test when displacement is minimal
            if(displacementSQ < Math.pow(this.auto.maxDisplacement, 2)) {
                var requireReseed = false;
                
                for(var i = 0; i < this.clusters.length && !requireReseed; ++i) {
                    // Empty clusters
                    if(this.clusters[i].length <= this.auto.minCoordinates) {
                        requireReseed = true;
                        
                    }
                    
                    // Distance between centroids
                    for(var j = i + 1; j < this.centroids.length; ++j) {
                        if(this.centroids[i].distanceSQ(this.centroids[j]) < Math.pow(this.auto.minDistance, 2)) {
                            requireReseed = true;
                        }
                    }
                    
                    if(this.auto.seedSingle && requireReseed) {
                        this.centroids[i].x = Random(-this.hw, this.hw);
                        this.centroids[i].y = Random(-this.hh, this.hh);
                        this.radii[i] = Random(100, 200);
                        requireReseed = false;
                    }
                    
                }
                
                if(requireReseed) {
                    this.reseedAllCentroid();
                }
            }
        }
        
    };
    
    Clustering.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);

        // Find the first order voronoi. Note that the voronoi sites
        // are attached to "this.centroids" as a "neighbours" property.
        Voronoi(this.centroids);

        // Draw the voronoi sites and entroids
        this.centroids.forEach(function(centroid, i) {
            
            
            
            if(this.method == "k-circles") {
                renderer.begin();
                renderer.circle(centroid, this.radii[i]);
                renderer.fill(Colors.Alpha(this.colors[i], 0.2));
                renderer.stroke("rgba(0, 0, 0, 0.4)");  
            } else {
                // Voronoi site
                renderer.begin();
                renderer.polygon(centroid.neighbours);
                renderer.fill(Colors.Alpha(this.colors[i], 0.2));
                renderer.stroke("rgba(0, 0, 0, 0.4)");    
            }
            
            
            // Centroid
            renderer.begin();
            renderer.circle(centroid, 10);
            renderer.rectangle(centroid, 10, 10);
            renderer.fill(this.colors[i]);
            renderer.stroke("rgba(0, 0, 0, 0.3)");
            
            renderer.begin();
            this.clusters[i].forEach(function(coordinate) {
                renderer.circle(coordinate, 4);
            });
            renderer.fill(this.colors[i]);
            renderer.stroke("rgba(0, 0, 0, 0.3)");
            
        }.bind(this));
    };
    
    return Clustering;
});

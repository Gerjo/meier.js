define(function(require) {
    var Game      = require("meier/engine/Game");
    var Input     = require("meier/engine/Input");
    var Random    = require("meier/math/Random");
    var Grid      = require("meier/prefab/Grid");
    var Pixel     = require("meier/prefab/Pixel");
    var Vector    = require("meier/math/Vec")(2);
    var dat       = require("meier/contrib/datgui");
    var Voronoi   = require("meier/math/Voronoi").Voronoi;
    var Colors    = require("meier/aux/Colors");
    var Lerp      = require("meier/math/Lerp").Vector;
    var ClosestVector = require("meier/math/Math").ClosestVector;

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
        
        // Will eventually hold the centroids:
        this.centroids   = [];
        this.clusters    = []; // coordinates per cluster.
        
        this.easing = 0.9;
                
        // Colors per index:
        this.colors = Colors.Random(40);
        
        this.methods = ["k-means", "k-medoids"];
        this.method  = this.methods.first();
        
        // Settings GUI:
        this.gui = new dat.GUI();
        this.gui.add(this, "method", this.methods).name("Method");
        this.gui.add(this, "numCentroids", 1, 40).name("Centroids").step(1).onChange(this.onClusterChange.bind(this));
        this.gui.add(this, "reseedCentroid").name("reseedCentroid");
        this.gui.add(this, "addRandomCluster").name("Add Random");
        this.gui.add(this.grid, "clear").name("Clear");
        
        
        // Random number seeding:
        Random.Seed(34);
        this.addRandomCluster();
        this.addRandomCluster();
        this.addRandomCluster();
        this.addRandomCluster();
        
        this.reseedCentroid();
    }
    
    Clustering.prototype.addRandomCluster = function() {
        this.addRandomCluster();
    };
    
    Clustering.prototype.onClusterChange = function() {
        // Remove too many (i.e., the slider quantity went down)
        while(this.centroids.length > this.numCentroids) {
            this.centroids.pop();
        }
        
        // Add new (i.e., the slider quantity went up)
        while(this.centroids.length < this.numCentroids) {
            var centroid;
            
            if(this.method == "k-means") {
                // Random position on the canvas. This works for our demo implementation,
                // however for mission critical applications, "k-means++" might be 
                // worth a study.
                centroid = new Vector(Random(-this.hw, this.hw), Random(-this.hh, this.hh));
                
            // k-medoids, pick a random coordinate as centroid
            } else {
                var timeout  = 10;
                var contains = false;
                
                // Find a random centroid, (we could/should pick a unique...)
                centroid = this.coordinates.random();
            }
            
            if(centroid) {
                this.centroids.push(
                    centroid
                );
                
            // No new centroid, break the loop.
            } else {
                break;
            }
        }
        
    };
    
    Clustering.prototype.reseedCentroid = function() {
        
        this.centroids.clear();
        
        this.onClusterChange();
    };
    
    Clustering.prototype.addRandomCluster = function() {
        var size   = 10;
        var radius = 40;
        
        var place = new Vector(
            Random(-this.hw + radius, this.hw - radius),
            Random(-this.hh + radius, this.hh - radius)
        );
        
        for(var i = 0, p; i < size; ++i) {
            p = Random.Vector().scaleScalar(Random(-radius, radius));

            p.add(place);
            
            this.grid.onLeftDown(p);
        }
    };

    Clustering.prototype.recompute = function(coordinates) {
        if(coordinates instanceof Array) {
            // No computations are done here, everything is set in
            // update loop.
            this.coordinates = coordinates;
        }
    };
    
    Clustering.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
        if(this.clusters.length != this.numClusters) {
            this.onClusterChange();
        }
        
        // Create new lookup for each cluster. And new
        // empty accumulators for the average position of
        // each cluster.
        var accumulators = new Array(this.centroids.length);
        for(var j = 0; j < this.centroids.length; ++j) {
            this.clusters[j] = [];
            accumulators[j] = new Vector(0, 0);;
        }

        // Map coordiates to a cluster
        this.coordinates.forEach(function(coordinate) {
            
            var nearest  = -1;          // Some invalid index. 
            var distance = Infinity;    // Initially quite far away.
            
            // Find clusest centroid i.e. cluster.
            for(var i = 0, d; i < this.centroids.length; ++i) {
                d = this.centroids[i].distanceSQ(coordinate);
                
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
        
        // Update centroid positions
        for(var i = 0; i < accumulators.length; ++i) {
            
            if(this.clusters[i].length > 0) {
                var mean = accumulators[i].scaleScalar(1 / this.clusters[i].length)
            
                if(this.method == "k-means") {
                    // Normal k-means does not Lerp between previous centroid and 
                    // the new centroid. We do this just for animation purposes.
                    this.centroids[i] = Lerp(this.centroids[i], mean, this.easing * dt);
                } else {
                    // The nearest coordinate to the average position is promoted to
                    // centroid. No animations here!
                    return ClosestVector(sum, this.coordinates);
                }
            } else {
                // Cluster is empty! (local minima)
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
            // Voronoi site
            renderer.begin();
            renderer.polygon(centroid.neighbours);
            renderer.fill(Colors.Alpha(this.colors[i], 0.2));
            renderer.stroke("rgba(0, 0, 0, 0.4)");
            
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

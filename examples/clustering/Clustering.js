define(function(require) {
    var Game      = require("meier/engine/Game");
    var Input     = require("meier/engine/Input");
    var Random    = require("meier/math/Random");
    var Grid      = require("meier/prefab/Grid");
    var Pixel     = require("meier/prefab/Pixel");
    var Vector    = require("meier/math/Vec")(2);
    var dat       = require("meier/contrib/datgui");
    var Voronoi   = require("meier/math/Delaunay").Voronoi;
    var Colors    = require("meier/aux/Colors");

    Clustering.prototype = new Game();
    function Clustering(container) {
        Game.call(this, container);
        this.setFps(60);
        
        // Debug log alignment:
        this.log.right().bottom();
        
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
        this.numClusters = 4;
        
        // Random initial spawn:
        this.randomClusters = 0;
        
        // Will eventually hold the centroids:
        this.centroids   = [];
        this.clusters    = []; // coordinates per cluster.
        

        
        this.easing = 0.9;
                
        // Colors per index:
        this.colors = Colors.Random(40);["red", "blue", "green", "hotpink", "limegreen", "brown", "purple", "yellow"];
        
        // Settings GUI:
        this.gui = new dat.GUI();
        this.gui.add(this, "numClusters", 1, 40).step(1).onChange(this.onClusterChange.bind(this));
        this.gui.add(this, "Click_To_Reseed");
        this.gui.add(this, "Add_Cluster");
        
        // Random number seeding:
        Random.Seed(33);
        this.addRandomCluster();
        this.addRandomCluster();
        this.addRandomCluster();
        this.addRandomCluster();
     
        // Delta time cache, let's run some physics in the drawloop.
        this.dt = 1 / 60;
        
        this.Click_To_Reseed();
    }
    
    Clustering.prototype.Add_Cluster = function() {
        this.addRandomCluster();
    };
    
    Clustering.prototype.onClusterChange = function() {
        while(this.centroids.length > this.numClusters) {
            this.centroids.pop();
        }
        
        while(this.centroids.length < this.numClusters) {
            this.centroids.push(
                new Vector(Random(-this.hw, this.hw), Random(-this.hh, this.hh))
            );
        }
        
    };
    
    Clustering.prototype.Click_To_Reseed = function() {
        
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
            this.coordinates = coordinates;
        }
        
        //this.clusters.clear();
        //this.centroids.clear();
        
        //for(var i = 0; i < this.numClusters; ++i) {
        //    this.centroids.push(Random.Vector().scaleScalar(100));
        //}
    };
    
    Clustering.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
        this.dt = dt;
        
        this.clusters.clear();
        
        for(var i = 0; i < this.centroids.length; ++i) {
            this.clusters.push([]);
        }
        
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
            
            // Coordinate join the cluster:
            this.clusters[nearest].push(coordinate);
            
        }.bind(this));
        
        
    };
    
    Clustering.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);

        this.centroids = this.centroids.map(function(centroid, i) {

            renderer.begin();
            renderer.circle(centroid, 10);
            renderer.rectangle(centroid, 10, 10);
            
            var sum = new Vector(0, 0);
            
            if(this.clusters[i]) {
                this.clusters[i].forEach(function(coordinate) {
                    renderer.circle(coordinate, 4);
                    
                    sum.x += coordinate.x;
                    sum.y += coordinate.y;
                });
            }
            
            renderer.fill(this.colors[i]);
            renderer.stroke("rgba(0, 0, 0, 0.3)");
            
            // Average position:
            sum.scaleScalar(1 / this.clusters[i].length)
            
            return centroid.add(new Vector(sum.x - centroid.x, sum.y - centroid.y).scaleScalar(this.easing * this.dt));
            
        }.bind(this));

        var centers = Voronoi(this.centroids);
        
        this.centroids.forEach(function(coordinate, i) {
         
            renderer.begin();
            renderer.polygon(coordinate.neighbours);
            renderer.fill(Colors.Alpha(this.colors[i], 0.2));
            renderer.stroke("rgba(0, 0, 0, 0.4)");
            
        }.bind(this));
        
    };
    
    
    return Clustering;
});

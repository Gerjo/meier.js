define(function(require) {
    var Game      = require("meier/engine/Game");
    var Input     = require("meier/engine/Input");
    var Random    = require("meier/math/Random");
    var Grid      = require("meier/prefab/Grid");
    var Pixel     = require("meier/prefab/Pixel");
    var Vector    = require("meier/math/Vec")(2);
    var dat       = require("meier/contrib/datgui");

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
        this.colors = ["red", "blue", "green", "hotpink", "limegreen", "brown", "purple", "yellow"];
        
        // Settings GUI:
        this.gui = new dat.GUI();
        this.gui.add(this, "numClusters", 1, 20).step(1).onChange(this.recompute.bind(this));
        
        // Random number seeding:
        Random.Seed(33);
        this.addRandomCluster();
        this.addRandomCluster();
        this.addRandomCluster();
        this.addRandomCluster();
     
        // Delta time cache, let's run some physics in the drawloop.
        this.dt = 1 / 60;
    }
    
    Clustering.prototype.addRandomCluster = function() {
        var size   = 20;
        var radius = 50;
        
        var place = new Vector(
            Random.FloatInRange(-this.hw + 100, this.hw - 100),
            Random.FloatInRange(-this.hh + 100, this.hh - 100)
        );
        
        for(var i = 0, p; i < size; ++i) {
            p = Random.Vector().scaleScalar(Random.FloatInRange(0, radius));

            p.add(place);
            
            this.grid.onLeftDown(p);
        }
    };

    Clustering.prototype.recompute = function(coordinates) {
        
        if(coordinates instanceof Array) {
            this.coordinates = coordinates;
        }
        
        this.clusters.clear();
        this.centroids.clear();
        
        for(var i = 0; i < this.numClusters; ++i) {
            this.centroids.push(Random.Vector().scaleScalar(100));
        }
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
            } else {
                //console.log('na');
            }
            
            renderer.stroke(this.colors[i] || "rgba(0, 0, 0, 0.2)");
            
            // Average position:
            sum.scaleScalar(1 / this.clusters[i].length)
            
            return centroid.add(new Vector(sum.x - centroid.x, sum.y - centroid.y).scaleScalar(this.easing * this.dt));
            
        }.bind(this));

        this.voronoi(renderer);
    };
    
    
    Clustering.prototype.voronoi = function(renderer) {
        
    };
    
    
    return Clustering;
});

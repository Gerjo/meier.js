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
    var Farthest  = require("meier/math/Delaunay").FarthestVoronoi;
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
    
        
        if(this.showLeastSquareCircle) {
            var disk = LeastSquareCircle(this.coordinates);
            renderer.begin();
            renderer.circle(disk);
            renderer.fill("rgba(0, 0, 0, 0.3)");
            renderer.stroke("rgba(0, 0, 0, 0.7)");
        }
        
        var farthest = Farthest(this.coordinates);
        
        if(this.showHull) {
            
            renderer.begin();
            farthest.hull.eachPair(function(a, b) {
                renderer.line(a, b);
            });        
            renderer.stroke("black");
        }
        
        
        var x = this.input.x;
        
        if(this.showFarthestVoronoi) {
            // Voronoi edges
            renderer.begin();
            farthest.edges.forEach(renderer.line.bind(renderer));
            renderer.stroke("red", 2);
        
            // Circumcircle centers
            renderer.begin();
            farthest.vertices.forEach(function(v) {
                renderer.circle(v, 4);
                
            });
            renderer.fill("black");
        }
        
        if(this.showVoronoi || this.showDelaunay) {
            var delaunay = Voronoi(this.coordinates);
        
            if(this.showVoronoi) {
                this.coordinates.forEach(function(coordinate, i) {
                    renderer.begin();
                    renderer.polygon(coordinate.neighbours);
                    renderer.stroke(Colors.green);
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
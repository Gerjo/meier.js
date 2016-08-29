define(function(require) {
    var Game      = require("meier/engine/Game");
    var Input     = require("meier/engine/Input");
    var Random    = require("meier/math/Random");
    var Grid      = require("meier/prefab/Grid");
    var Pixel     = require("meier/prefab/Pixel");
    var Vector    = require("meier/math/Vec")(2);
    var dat       = require("meier/contrib/datgui");
    var Hull      = require("meier/math/Hull").GiftWrap;

    var Voronoi   = require("meier/math/Voronoi").Voronoi;
    var Delaunay  = require("meier/math/Voronoi").Triangulate;
    

    DelaunayApp.prototype = new Game();
    function DelaunayApp(container) {
        Game.call(this, container);
        this.setFps(30);
        
        this.showCircumscribedCircle = false;
        this.showDelaunay    = false;
        this.showVoronoi     = true;
        
        // Debug log alignment:
        this.logger.bottom().right();
        
        // Pretty pointer:
        this.input.cursor(Input.Cursor.FINGER);
        
        // Cache of coordinates:
        this.coordinates = [];
        
        
        // Editable grid:
        this.add(this.grid = new Grid(0, 0, this.width, this.height));
        this.grid.setEditable(true);
        this.grid.showPoints(true);
        this.grid.onChange = this.recompute.bind(this);
        
        
        this.grid.onLeftDown(new Vector(100, 100));
        this.grid.onLeftDown(new Vector(0, 100));
        this.grid.onLeftDown(new Vector(-10, 10));
        
        this.gui = new dat.GUI();
        this.gui.add(this, "showVoronoi").name("Voronoi Diagram");
        this.gui.add(this, "showDelaunay").name("Delaunay Triangulation");
        this.gui.add(this, "showCircumscribedCircle").name("Show Circumcircles");
        this.gui.add(this.grid, "clear").name("Remove Coordinates");
        this.gui.width = 400;
    }


    DelaunayApp.prototype.recompute = function(coordinates) {
        this.coordinates = coordinates;
       
    };
	
    DelaunayApp.prototype.update = function(dt) {
		this.input.cursor(Input.Cursor.POINTER);
	};
    
    DelaunayApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);

        if(this.showVoronoi) {
            var coordinates = this.coordinates.clone();
            var triangles = Voronoi(coordinates);

            coordinates.forEach(function(coordinate, i) {
                renderer.begin();
                renderer.polygon(coordinate.neighbours);
                renderer.opacity(0.4);
                renderer.fill(["hotpink","blue","green","magenta","brown","cyan","yellow","purple"][i%7]);
                renderer.stroke("rgba(0, 0, 0, 0.4)");
                renderer.opacity(1);
            }.bind(this));
        }

        if(this.showDelaunay || this.showCircumscribedCircle) {
            
            var coordinates = this.coordinates.clone();
            var triangles = Delaunay(coordinates);
            
            triangles.forEach(function(triangle) {
                
                if(this.showDelaunay) {
                    renderer.begin();
                    triangle.draw(renderer);
                    renderer.stroke("#393939", 2);
                }
            
                if(this.showCircumscribedCircle) {
                    renderer.begin();
                    renderer.circle(triangle.center, triangle.radius);
                    renderer.fill("rgba(0, 0, 0, 0.1)");
                    renderer.stroke("rgba(0, 0, 0, 0.2)");
					
                    renderer.begin();
                    renderer.circle(triangle.center, 2);
                    renderer.fill("black");
                }
            
            }.bind(this));
        }

        
    };
    
    return DelaunayApp;
});
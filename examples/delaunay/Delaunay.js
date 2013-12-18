define(function(require) {
    var Game      = require("meier/engine/Game");
    var Input     = require("meier/engine/Input");
    var Random    = require("meier/math/Random");
    var Grid      = require("meier/prefab/Grid");
    var Pixel     = require("meier/prefab/Pixel");
    var Vector    = require("meier/math/Vec")(2);
    var dat       = require("meier/contrib/datgui");
    var Hull      = require("meier/math/Hull").GiftWrap;

    var Triangulate  = require("meier/math/Delaunay").Triangulate;

    Delaunay.prototype = new Game();
    function Delaunay(container) {
        Game.call(this, container);
        this.setFps(30);
        
        // Debug log alignment:
        this.log.top().right();
        
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
    }


    Delaunay.prototype.recompute = function(coordinates) {
        this.coordinates = coordinates;
       
    };
    
    Delaunay.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);

    };
    
    Delaunay.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);

        var coordinates = this.coordinates.clone();
        var triangles = Triangulate(coordinates);

        coordinates.forEach(function(coordinate, i) {
            
            
            coordinate.neighbours.sort(function(a, b) {
                return Math.atan2(a.y - coordinate.y, a.x - coordinate.x) - 
                        Math.atan2(b.y - coordinate.y, b.x - coordinate.x)
            });
            
            renderer.begin();
            renderer.polygon(coordinate.neighbours);
            renderer.opacity(0.4);
            renderer.fill(["hotpink","blue","green","gray","cyan","yellow","purple"][i%7]);
            renderer.opacity(1);
            
        });

        triangles.forEach(function(triangle) {

            renderer.begin();
            triangle.draw(renderer);
            renderer.stroke("rgba(255,0,0,0.8)", 2);
            
            renderer.begin();
            renderer.circle(triangle.center, 2);
            renderer.fill("rgba(0, 0, 0, 1)");
        });
    };
    
    return Delaunay;
});
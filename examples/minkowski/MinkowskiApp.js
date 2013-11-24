define(function(require) {
    var Game   = require("meier/engine/Game");
    var Pixel  = require("meier/prefab/Pixel");
    
    var Editor = require("./Editor");
    var World  = require("./World");
    
    MinkowskiApp.prototype = new Game();
    function MinkowskiApp(container) {
        Game.call(this, container);
        
        this.log.right();
        
        // Polygon editor width, height and spacing. The world properties are inferred.
        var spacing = 20;
        var size    = this.height * 0.5 - spacing * 1.5;
        var hsize   = size * 0.5;
        
        
        this.editors = [
            new Editor(-this.hw + hsize + spacing, this.hh - hsize - spacing, size, size),
            new Editor(-this.hw + hsize + spacing, this.hh - hsize * 3 - spacing * 2, size, size)
        ];
        
        this.editors[0].title = "Polygon editor A";
        this.editors[1].title = "Polygon editor B";
        
        this.editors[0].color = "blue";
        this.editors[0].shade = "rgba(0, 0, 255, 0.3)";
        
        this.editors[1].color = "red";
        this.editors[1].shade = "rgba(255, 0, 0, 0.3)";
        
        this.editors.forEach(this.add.bind(this));
        
        // Carefully aligned:
        this.world = new World(hsize + spacing * 0.5, 0, this.width - size - spacing * 3, this.height - spacing * 2);
        
        // Link polygon editors to the world:
        this.world.polygon[0] = this.editors[0];
        this.world.polygon[1] = this.editors[1];
        
        this.add(this.world);
        
        this.editors[0].add(new Pixel(-30, 30));
        this.editors[0].add(new Pixel(30, 30));
        this.editors[0].add(new Pixel(-30, -30));
        this.editors[0].add(new Pixel(30, -30));
        
        this.editors[1].add(new Pixel(-40, 40));
        this.editors[1].add(new Pixel(0, 60));
        this.editors[1].add(new Pixel(40, 40));
        this.editors[1].add(new Pixel(0, -30));
        
    }
    
    return MinkowskiApp;
});
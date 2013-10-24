

define(function(require) {
    var Game   = require("meier/engine/Game");
    var Vector = require("meier/math/Vector");
    
    Grid.prototype = new Game();

    function Grid(container) {
        // Call super class' constructor:
        Game.apply(this, arguments);
    
        this.stats.show(true);
        this.stats.setColor("black");
        this.setFps(30);
    }

    Grid.prototype.draw = function(renderer) {
        renderer.clear();
        
        var color   = "rgba(0, 0, 0, 0.2)";
        var spacing = 40;
        var font    = "bold 11px monospace";
        var fontColor = "black";
    
    
        //string, x, y, color, align, valign, font
    
        renderer.begin();
        for(var x = 0; x < this.hw; x += spacing) {
            renderer.line(x, -this.hh, x, this.hh);
            renderer.text(x, x, 0, fontColor, "center", "middle", font);
        }
    
        for(var x = 0; x > -this.hw; x -= spacing) {
            renderer.line(x, -this.hh, x, this.hh);
            renderer.text(x, x, 0, fontColor, "center", "middle", font);
        }
    
        for(var y = 0; y < this.hh; y += spacing) {
            renderer.line(-this.hw, y, this.hw, y);
            renderer.text(y, 0, y, fontColor, "center", "middle", font);
        }
    
        for(var y = 0; y > -this.hh; y -= spacing) {
            renderer.line(-this.hw, y, this.hw, y);
            renderer.text(y, 0, y, fontColor, "center", "middle", font);
        }
    
        renderer.circle(0, 0, 10);
        renderer.stroke(color);
    
    
    
        renderer.begin();
        renderer.arrow(0, 0, this.input.x, this.input.y);
        renderer.stroke("red");
    
        renderer.begin();
        renderer.line(this.input.x, this.input.y, this.input.x, 0);
        renderer.line(this.input.x, this.input.y, 0, this.input.y);
        renderer.stroke("rgba(10, 255, 10, 1)");
    
        renderer.text(this.input.x + " x " + this.input.y, this.input.x, this.input.y, "black", "center", "bottom");
    
    
        var v = Vector.CreateAngular(-Math.QuarterPI).trim(220);
        renderer.begin();
        renderer.vector(v);
        renderer.stroke("hotpink");
        renderer.text("PI/-4", v.x, v.y);
    
        var v = Vector.CreateAngular(Math.QuarterPI).trim(220);
        renderer.begin();
        renderer.vector(v);
        renderer.stroke("hotpink");
        renderer.text("PI/4", v.x, v.y);
    };


    Grid.prototype.update = function(dt) {
    
    };
    
    
    return Grid;
});



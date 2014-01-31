define(function(require){
    var Game   = require("meier/engine/Game");
    var Grid   = require("meier/prefab/Grid");
    var Line   = require("meier/math/Line");
    var Vector = require("meier/math/Vec")(2);
    var Colors = require("meier/aux/Colors");
    var Intersection = require("meier/math/Intersection");
    
    HoughApp.prototype = new Game();
    
    function HoughApp(container) {        
        Game.call(this, container);
        
        this.grid = new Grid(
            -this.hw * 0.5, 0, this.hw, this.height
        );
        this.grid.setEditable(true);
        this.grid.onChange = this.onChange.bind(this);
        this.add(this.grid);
        
        this.coordinates = [];
        this.polar       = [];
        this.minDistance = 0;
        this.maxDistance = 0;
        
        this.setFps(0);
        this.redraw();
    }
    
    HoughApp.prototype.onChange = function(coordinates) {
        if(coordinates instanceof Array) {
            this.coordinates = coordinates;
        }
        
        this.polar.clear();;
        var min = +Infinity;
        var max = -Infinity;
        
        var grid = this.grid;
        function ToWorld(x) {
            return grid.toWorld(x);
        }
        
        for(var i = 0; i < this.coordinates.length; ++i) {
            for(var j = i + 1; j < this.coordinates.length; ++j) {
                var line = new Line(ToWorld(this.coordinates[i]), ToWorld(this.coordinates[j]));
                var dir  = line.direction().perp();
                
                var angle    = dir.angle();
                var normal   = Intersection.Nearest.PointOnLineSegment(new Vector(0, 0), line);
                var distance = normal.length();
                
                if(distance > max) {
                    max = distance;
                }
                if(distance < min) {
                    min = distance;
                }
                
                this.polar.push({
                    angle: angle,
                    distance: distance,
                    line: line,
                    normal: normal,
                });
            }
        }
        
        this.minDistance = min;
        this.maxDistance = max;
        
        this.redraw();
    };
    
    HoughApp.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    HoughApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        var normalize = 1;//(this.maxDistance - this.minDistance) / this.hw;
        
        this.polar.forEach(function(polar) {
            renderer.begin();
            renderer.circle(polar.angle * 100, polar.distance * normalize, 4);
            renderer.fill(Colors.Alpha(Colors.blue, 0.1));
            
            renderer.begin();
            renderer.line(polar.line);
            renderer.vector(polar.normal);
            renderer.stroke(Colors.Alpha(Colors.red, 0.1));
        });
                
    }
    
    return HoughApp;
});
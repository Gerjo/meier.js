define(function(require){
    var Game   = require("meier/engine/Game");
    var Grid   = require("meier/prefab/Grid");
    var Line   = require("meier/math/Line");
    var Vector = require("meier/math/Vec")(2);
    var Colors = require("meier/aux/Colors");
    var Noise  = require("meier/aux/Noise");
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
        
        
        var p = Noise.Line().map(function(p) {
            return p.add(this.grid.position);            
        }.bind(this));
       
        this.grid.addCoordinates(p);
        
        
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
                    angle: Math.abs(angle),
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
        
        var dNormalize = this.grid.height / Math.sqrt(Math.pow(this.grid.width, 2) + Math.pow(this.grid.height, 2));
        var aNormalize = this.hw / Math.PI;
        
        //console.clear();
        this.polar.forEach(function(polar) {
            polar.distance *= dNormalize;
            //polar.distance -= this.hh;
            polar.angle    *= aNormalize;
            
            renderer.begin();
            renderer.circle(polar.angle, polar.distance, 5);
            renderer.fill(Colors.Alpha(Colors.blue, 0.3));
            
            renderer.begin();
            //renderer.line(polar.line);
            //renderer.arrow(polar.normal);
            renderer.stroke(Colors.Alpha(Colors.red, 0.1));
        }.bind(this));
                
        //console.log("Normalization terms:", aNormalize, dNormalize);
                
    }
    
    return HoughApp;
});
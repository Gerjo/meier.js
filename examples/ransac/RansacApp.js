define(function(require){
    var Game   = require("meier/engine/Game");
    var Grid   = require("meier/prefab/Grid");
    var LeastSquareCircle = require("meier/math/Math").LeastSquareCircle
    
    // LeastSquareCircle
    var Vector = require("meier/math/Vec")(2);
    var Disk   = require("meier/math/Disk");
    var GJ     = require("meier/math/Math").GaussJordanElimination;
    var M      = require("meier/math/Mat");
    
    
    RansacApp.prototype = new Game();
    
    
    // uuu uvv
    
    function RansacApp(container) {        
        Game.call(this, container);

        this.log.top().right();
        this.setFps(15);
                
        this.grid = new Grid(0, 0, this.width, this.height);
        this.add(this.grid);
        this.grid.setEditable(true);
        this.grid.onChange = this.onChange.bind(this);
        
        this.coordinates = [];
        
        var r = 100;
        for(var i = 0; i < Math.PI; i += Math.PI*0.1) {
            //this.grid.onLeftDown(new Vector(Math.cos(i) * r, Math.sin(i) * r));
        }
    }
    
    RansacApp.prototype.onChange = function(coordinates) {
        if(coordinates instanceof Array) {
            this.coordinates = coordinates;
        }
        
        this.disk = LeastSquareCircle(this.coordinates);
    };
    
    RansacApp.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    RansacApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        
        renderer.begin();
        renderer.circle(this.disk);
        renderer.fill("rgba(0, 0, 0, 0.3)");
        renderer.stroke("rgba(0, 0, 0, 0.7)");
        
        //console.log(
        //    Math.abs(this.input.length() - r)
        //);
        
        
    }
    
    return RansacApp;
});
define(function(require) {
    var Game      = require("meier/engine/Game");
    var Random    = require("meier/math/Random");
    var Sprite    = require("meier/prefab/Sprite");
    var Pixel     = require("meier/prefab/Pixel");
    var Vector    = require("meier/math/Vec")(2);
    var Curve     = require("meier/math/Polynomial").PolynomialPath;
    var Bernstein = require("meier/math/Polynomial").BernsteinBasis;
    var factorial = require("meier/math/Math").Factorial;
        
    ForrestApp.prototype = new Game();
    function ForrestApp(container) {
        Game.call(this, container);
        this.setFps(60);
        
        Random.Seed(14);
        
        this.coordinates = [];
        
        var steps = 100;
        var degree = 3;
        var width = this.width;
        var height = this.height;
     
        for(var d = 0; d < degree; ++d) {
            for(var t = 0, x = 0; t < 1; t += 1 / steps, x += width / steps) {
                var y = Bernstein(degree-1, d, t);
                
                //this.add(new Sprite(x, y * 300, "tree.png"));
                this.add(new Pixel(t * width - width * 0.5, y * height - height * 0.5));
            }
        }
        
        /*
        var min = 0;
        var max = 10;
        for(var i = 0; i < 10; ++i) {
            this.coordinates.push(new Vector(Random.Range(min, max), Random.Range(min, max)));
        }
        
        var f = Curve(this.coordinates);
        
        console.log(f);
        
        var spacing = 1;
        for(var x = -this.hw; x < this.hw; x += spacing) {
            var y = f(x);
            
            this.add(new Sprite(x, y, "tree.png"));
        }*/
      
    }
    
    ForrestApp.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
    };
    
    ForrestApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        
    };
    
    
    
    return ForrestApp;
});
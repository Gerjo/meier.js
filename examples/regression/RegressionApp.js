define(function(require) {
    var Game       = require("meier/engine/Game");
    var Input      = require("meier/engine/Input");
    var Grid       = require("meier/prefab/Grid");
    var Vector     = require("meier/math/Vec")(2);
    var Random     = require("meier/math/Random");
    
    var Polynomial = require("meier/math/Polynomial");
    
    var LSQ = require("meier/math/Polynomial").LeastSquaresLinearRegression;


    RegressionApp.prototype = new Game();
    function RegressionApp(container) {
        Game.call(this, container);
        
        this.grid = new Grid(0, 0, this.width, this.height);
        this.grid.setRealLabels(true);
        this.grid.setEditable(true);
        this.grid.onChange = this.recompute.bind(this);
        this.add(this.grid);
        
        // Generate a data set:
        var w = 400, hw = w * 0.5;
        
        Random.Seed(1);
        
        for(var x = -hw; x <= hw; x += Random.Range(3, 25)) {
            var t = (x + hw) / w * Math.PI;
            
            var v = new Vector(x, Math.sin(t) * 100);
            this.grid.onLeftDown(v);            
        }
    }
   
    RegressionApp.prototype.recompute = function(coordinates) {
        
        // Least squares linear regression:
        var regression = LSQ(coordinates, function(row) { return [row.x, row.y]; });
        
        this.lsq = function(x) {
            // Pretty much a line equation:
            return regression[0] + x * regression[1];
        };
    };
    
    RegressionApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        renderer.text("Linear regression (least squares)", -this.hw + 10, this.hh - 10, "blue", "left")

        this.plot(renderer, this.lsq, "blue", 2);

    };
    
    RegressionApp.prototype.plot = function(renderer, f, color, width) {
        var step = (this.grid.max.x - this.grid.min.x) / 100;
        
        var previous = new Vector(
            this.grid.min.x,
            f(this.grid.min.x)
        );
        
        renderer.begin();
        for(var x = this.grid.min.x + step, y; x < this.grid.max.x; x += step) {
            y = f(x);
            
            renderer.line(previous.x, previous.y, x, y);
            
            previous.x = x;
            previous.y = y;
        }
        renderer.stroke(color, width);
    };  
    
    return RegressionApp;
});
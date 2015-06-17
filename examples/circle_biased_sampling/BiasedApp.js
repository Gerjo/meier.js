define(function(require){
    var Game = require("meier/engine/Game");
    var Vec2 = require("meier/math/Vec")(2);
    var Random = require("meier/math/Random");
    var ToAbsoluteRadians = require("meier/math/Angle").ToAbsoluteRadians;
    var dat    = require("meier/contrib/datgui");
    var Math   = require("meier/math/Math");
    var Timer  = require("meier/extra/Timer");
    
    App.prototype = new Game();
    
    function RandomVector() {
        var angle = Random(0, Math.TwoPI, true);
        return new Vec2(Math.cos(angle), Math.sin(angle));
    }
    
    function App(container) {        
        Game.call(this, container);
        
        this.timer = new Timer(1000);
        
        //this.myrenderer = new Renderer(container, this.width, this.height);
        //this.myrenderer.translate(this.hw, -this.hh);
        
        Random.Seed(39);
        
        this.biasedCenter = new Vec2(-120, 0);
        this.biasedNeighbours = [];
        
        this.uniformCenter = new Vec2(120, 0);
        this.uniformNeighbours = [];
        
        this.sampleCount = 4;
        
        
        this.gui = new dat.GUI();
        this.gui.width = 300;
        
        this.gui.add(this, 'sampleCount', 0, 100).step(1).name("Sample count").
        onChange(this.restart.bind(this));
        
        this.gui.add(this, 'restart').name("Restart");
    }
    
    App.prototype.restart = function() {
        this.biasedNeighbours.clear();
        this.uniformNeighbours.clear();        
    }
    
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);

        // Only automate in default mode.
        if(this.timer.expired() && this.sampleCount == 4) {
            this.restart();
        }

        if(this.biasedNeighbours.length < this.sampleCount) {
            
            this.lastBiasedSample = Math.CircleUniformRandom(this.biasedCenter, this.biasedNeighbours).scaleScalar(100).add(this.biasedCenter);
        
            this.biasedNeighbours.push(this.lastBiasedSample);
            
            
            this.lastUniformSample = RandomVector().scaleScalar(100).add(this.uniformCenter);
            this.uniformNeighbours.push(this.lastUniformSample);
        }
    };
    
    App.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        renderer.begin();
        for(var i = 0; i < this.biasedNeighbours.length; ++i) {
            renderer.arrow(this.biasedCenter, this.biasedNeighbours[i]);
        }
        renderer.stroke("gray");
       
        
        renderer.begin();
        renderer.arrow(this.biasedCenter, this.lastBiasedSample);
        renderer.stroke("red");
        renderer.text("Rejection sampling", this.biasedCenter.x, this.biasedCenter.y - 100);
        
        
        renderer.begin();
        renderer.rectangle(this.biasedCenter, 10, 10);
        renderer.fill("blue");
        
        
        ////////////////////
        
        renderer.begin();
        for(var i = 0; i < this.uniformNeighbours.length; ++i) {
            renderer.arrow(this.uniformCenter, this.uniformNeighbours[i]);
        }
        renderer.stroke("gray");
    
        renderer.begin();
        renderer.arrow(this.uniformCenter, this.lastUniformSample);
        renderer.stroke("red");
        
        
        renderer.begin();
        renderer.rectangle(this.uniformCenter, 10, 10);
        renderer.fill("blue");
        
        
        renderer.text("Uniform sampling", this.uniformCenter.x, this.uniformCenter.y - 100);
        
    };
    
    return App;
});
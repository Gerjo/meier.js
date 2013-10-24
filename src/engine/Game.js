///
/// Train of thought: leave most things up to the user. Just
/// have some boilerplate code here.
///
/// Second train: don't use statics, the user should be able
/// to run two games on the same page, at the same time.
///
/// If it can be mutable, it should be mutable. This for
/// performance reasons.
///


define(function(require) {
    var Stopwatch = require("meier/aux/Stopwatch");
    var Renderer  = require("meier/engine/Renderer");
    var Vector    = require("meier/math/Vector");
    var Logger    = require("meier/engine/Logger");
    var Input     = require("meier/engine/Input");


    function Game(container) {

        // Default contructor, do nothing.
        if( ! container) {
            return;
        }

        this.isTablet = ('ontouchstart' in document.documentElement);
        this.isSlow   = false;
    
        // Update loop related matter:
        this.frame            = 0;               // frame counter.
        this.clock            = new Stopwatch(); // Wall Clock.
        this.fps              = 15;              // Desired framerate
        this.timer            = new Stopwatch(); // Delta time counter.
        this.width            = container.offsetWidth;
        this.height           = container.offsetHeight;
        this.hw               = this.width  * 0.5;
        this.hh               = this.height * 0.5;    
        
        this.renderer         = new Renderer(container, this.width, this.height);
    
        // Debug information:
        this.log             = new Logger(this.width, this.height);
        this.stats           = this.log; // Legacy support.
    
        // Keyboard, touch and mouse events:
        this.input           = new Input(this.renderer.canvas, this.width, this.height, this.isTablet);
    
        // Default loop:
        this.intervalId      = setInterval(this._update.bind(this), 1000 / this.fps);
    }
    
    Game.prototype.setFps = function(fps) {
        this.fps = fps;
    
        // Remove current loop:
        clearTimeout(this.intervalId);
    
        // Scedule a new loop:
        this.intervalId = setInterval(this._update.bind(this), 1000 / this.fps);
    };

    Game.prototype._update = function() {
        var dt = this.timer.peek() * 0.001;
        this.timer.start();
    
        // Clamp dt:
        if(dt > 0.2) {
            dt = 0.2;
        }
    
        this.log.log("FPS", Math.ceil(1 / dt) + "/" + this.fps);
        this.log.log("Clock", Math.floor(this.clock.peek() * 0.001));
    
        // User defined update.
        this.update(dt);
    
        /// Reset the transform to an identity matrix:
        /// We can tweak the letters in:
        /// a b 0
        /// c d 0
        /// e f 1
        this.renderer.context.setTransform(
            1,  0, 
            0,  1, 
        
            // Draw from center. A half pixel offset 
            // gives sharper lines.
            this.renderer.hw + 0.5,
            this.renderer.hh + 0.5);
    
        // User defined draw loop:
        this.draw(this.renderer);
    
        // Update statistics (TODO: rework some things)
        this.log.update();
    
        this.log.draw(this.renderer);
    };

    Game.prototype.update = function(dt) {
        // TODO: Override...
    };

    Game.prototype.draw = function(renderer) {
        // Clear the canvas:
        renderer.clear();
    
        // TODO: Override...
    };
    
    return Game;
});

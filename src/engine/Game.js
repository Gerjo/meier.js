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
    var Entity    = require("meier/engine/Entity");


    function Game(container) {

        // Default contructor, do nothing.
        if( ! container) {
            return;
        }

        this.isTablet = ('ontouchstart' in document.documentElement);
        this.isSlow   = false;
    
        // Update loop related matter:
        this._frameCounter   = 0;               // frame counter.
        this.clock           = new Stopwatch(); // Wall Clock.
        this._fps            = 15;              // Desired framerate
        this._dttimer        = new Stopwatch(); // Delta time counter.
        this.width           = container.offsetWidth;
        this.height          = container.offsetHeight;
        this.hw              = this.width  * 0.5;
        this.hh              = this.height * 0.5;    
        
        this._renderer       = new Renderer(container, this.width, this.height);
    
        // Debug information:
        this.log             = new Logger(this.width, this.height);
        this.stats           = this.log; // Legacy support.
    
        // Keyboard, touch and mouse events:
        this.input           = new Input(this._renderer.canvas, this.width, this.height, this.isTablet);
    
        // Default loop:
        this._intervalId     = setInterval(this._update.bind(this), 1000 / this._fps);
        
        // Build-in entity system. Optional usage.
        this._entities       = [];
    }
    
    Game.prototype.add = function(entity) {
        if(entity instanceof Entity) {
            this._entities.push(entity);
            entity._onAdd(this);
        } else {
            throw new Error("Game::add is only meant of entities.");
        }
    };
    
    Game.prototype.delete = function(entity) {
        if(entity instanceof Entity) {
            entity.delete = true;
        } else {
            throw new Error("Game::delete is only meant of entities.");
        }
    };
    
    Game.prototype.setFps = function(fps) {
        this._fps = fps;
    
        // Remove current loop:
        clearTimeout(this._intervalId);
    
        // Scedule a new loop:
        this._intervalId = setInterval(this._update.bind(this), 1000 / this._fps);
    };

    Game.prototype._update = function() {
        var dt = this._dttimer.peek() * 0.001;
        this._dttimer.start();
    
        // Clamp dt:
        if(dt > 0.2) {
            dt = 0.2;
        }
    
        this.log.log("FPS", Math.ceil(1 / dt) + "/" + this._fps);
        this.log.log("Clock", Math.floor(this.clock.peek() * 0.001));
    
        // Show or hide entity count depending on whether there
        // are any to begin with.
        if(this._entities.length > 0) {
            this.log.log("Entities", "#" + this._entities.length);
        } else {
            this.log.delete("Entities");
        }
    
        this.log.log("Listeners", "#" + this.input.countListeners());
    
        // This probably only works in Chrome
        if(window.performance && window.performance.memory) {
            this.stats.set("Memory", Math.round(window.performance.memory.totalJSHeapSize * 10e-7) + "mb");
        }
    
        // User defined update.
        this.update(dt);
    
        /// Reset the transform to an identity matrix:
        /// We can tweak the letters in:
        /// a b 0
        /// c d 0
        /// e f 1
        this._renderer.context.setTransform(
            1,  0, 
            0,  1, 
        
            // Draw from center. A half pixel offset 
            // gives sharper lines.
            this._renderer.hw + 0.5,
            this._renderer.hh + 0.5);
    
        // User defined draw loop:
        this.draw(this._renderer);
    
        // Update statistics (TODO: rework some things)
        this.log.update();
    
        this.log.draw(this._renderer);
    };

    Game.prototype.update = function(dt) {
        
        for(var i = 0; i < this._entities.length; i++) {
            this._entities[i].update(dt);
            
            // Remove the entity:
            if(this._entities[i].delete === true) {
                this._entities[i]._onDelete(this);
                this._entities.splice(i--, 1);
            }
        }
    };

    Game.prototype.draw = function(renderer) {
        // Clear the canvas:
        renderer.clear();
    
        this._entities.forEach(function(entity) {
            entity._draw(renderer);
        });
    };
    
    return Game;
});

/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

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

        // This is mostly a TODO thing
        this.isTablet        = ('ontouchstart' in document.documentElement);
        this.isSlow          = false;
    
        // Update loop related matter:
        this._frameCounter   = 0;               // frame counter.
        this.clock           = new Stopwatch(); // Wall Clock.
        this._fps            = 15;              // Desired framerate
        this._lowFps         = null;
        this._previousFps    = this._fps;
        this._dttimer        = new Stopwatch(); // Delta time counter.
        this.width           = parseInt(container.offsetWidth / 2, 10) * 2;
        this.height          = parseInt(container.offsetHeight / 2, 10) * 2;
        this.hw              = this.width  * 0.5;
        this.hh              = this.height * 0.5;    
        this.htmlContainer   = container;
        
        this._renderer       = new Renderer(container, this.width, this.height);
        
        // Debug information.
        this.logger          = new Logger(this, this.width, this.height);
    
        // Keyboard, touch and mouse events.
        this.input           = new Input(this._renderer.canvas, this.width, this.height, this.isTablet);
    
        // Cache for the interval id.
        this._intervalId     = null;
        
        // Default high FPS.
        this.setHighFps(this._fps);
        
        // Default low FPS, run at quarter of the normal speed.
        this.setLowFps(this._fps * 0.25);
        
        // Build-in entity system. Optional usage.
        this._entities       = [];
        
        // Automatically clear the canvas.
        this._doClear        = true;
        
        // TODO: contemplate on which DOM node to capture blur event.
        window.onblur     = this._onBlur.bind(this);
        window.onfocus    = this._onFocus.bind(this);
    }
    
    Game.prototype._onBlur = function() {
        if(this._lowFps !== null) {
            this._applyFps(this._lowFps);
        }
    };
    
    Game.prototype._onFocus = function() {
        // Restore high FPS
        this._applyFps(this._highFps);
    };
    
    Game.prototype.onBlur = function() {
        // Overload available for your convenience
    };
    Game.prototype.onFocus = function() {
        // Overload available for your convenience
    };
    
    Game.prototype.log = function(key, value, color) {
        this.logger.log(key, value, color);
    };
    
    Game.prototype.add = function(entity) {
        
        if(entity instanceof Entity) {
            this._entities.push(entity);
            entity._onAdd(this);
        } else {
            throw new Error("Game::add is only meant of entities.");
        }
        
        return entity;
    };
    
    Game.prototype.destroy = function(entity) {
        if(entity instanceof Entity) {
            entity._destroy = true;
        } else {
            throw new Error("Game::delete is only meant of entities.");
        }
    };
    
    Game.prototype.setAutoClear = function(autoClear) {
        this._doClear = autoClear;
        return this;
    };
    
    Game.prototype._applyFps = function(fps) {
        // Remove current loop:
        if(this._intervalId !== null) {
            clearInterval(this._intervalId);
        }
        
        if(fps > 0) {
            // Schedule a new loop
            this._intervalId = setInterval(this._update.bind(this), 1000 / fps);
            
            //console.log("new fps: ");
        } else {
            // There shall be no new loop
            this._intervalId = null;
        }
    };
    
    // Depricated call. Use "setHighFps" instead.
    Game.prototype.setFps = function(fps) {
        return this.setHighFps(fps);
    };
    
    Game.prototype.setHighFps = function(fps) {
        this._applyFps(this._highFps = fps);
        return this;
    };
    
    Game.prototype.setLowFps = function(fps) {
        this._lowFps = fps;
        return this;
    };

    Game.prototype._update = function() {
        var dt = this._dttimer.peek() * 0.001;
        this._dttimer.start();
    
        // Clamp dt:
        if(dt > 0.2) {
            dt = 0.2;
        }
    
        this.logger.update(dt);
       
        // User defined update.
        this.update(dt);
        
        // Start a draw loop.
        this._draw();
    };

    Game.prototype._draw = function() {
        /// Reset the transform to an identity matrix:
        /// We can tweak the letters in:
        /// a b 0
        /// c d 0
        /// e f 1
        this._renderer.context.setTransform(
            1,  0, 
            0,  1, 
        
            // Draw from center. A 0.5 offset is given to align the game
            // coordinate frame with canvas coordinate frame.
            this._renderer.hw + 0.5,
            this._renderer.hh + 0.5);
    
        // User defined draw loop:
        this.draw(this._renderer);
    
        this.logger.draw(this._renderer);
    };

    /// Update the game.
    Game.prototype.update = function(dt) {
        
        this.input.update(dt);
        
        for(var i = 0; i < this._entities.length; i++) {
            
            if(this._entities[i]._delete !== true) {
                this._entities[i].update(dt);
            }
            
            // Remove the entity:
            if(this._entities[i]._delete === true) {
                this._entities[i]._onDelete(this);
                this._entities.splice(i--, 1);
            }
        }
    };
    
    /// Trigger a redraw immediately.
    Game.prototype.redraw = function() {
        this._draw();
    };

    /// Draw the entire game.
    Game.prototype.draw = function(renderer) {
        
        // Clear the canvas:
        if(this._doClear) {
            renderer.clear();
        }
        
        this._entities.forEach(function(entity) {
            if(entity._delete !== true) {
                if(entity.visible === true) {
                    entity._draw(renderer);
                }
            }
        });
    };
    
    return Game;
});

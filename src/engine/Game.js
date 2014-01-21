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

        this.isTablet = ('ontouchstart' in document.documentElement);
        this.isSlow   = false;
    
        // Update loop related matter:
        this._frameCounter   = 0;               // frame counter.
        this.clock           = new Stopwatch(); // Wall Clock.
        this._fps            = 15;              // Desired framerate
        this._dttimer        = new Stopwatch(); // Delta time counter.
        this.width           = parseInt(container.offsetWidth / 2, 10) * 2;
        this.height          = parseInt(container.offsetHeight / 2, 10) * 2;
        this.hw              = this.width  * 0.5;
        this.hh              = this.height * 0.5;    
        this.htmlContainer   = container;
        
        this._renderer       = new Renderer(container, this.width, this.height);
        
        // Debug information:
        this.log             = new Logger(this, this.width, this.height);
        this.stats           = this.log; // Legacy support.
    
        // Keyboard, touch and mouse events:
        this.input           = new Input(this._renderer.canvas, this.width, this.height, this.isTablet);
    
        // Cache for the interval id
        this._intervalId     = null;
        
        // Default FPS:
        this.setFps(this._fps);
        
        // Build-in entity system. Optional usage.
        this._entities       = [];
        
        // Automatically clear the canvas.
        this._doClear        = true;
    }
    
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
    
    Game.prototype.setFps = function(fps) {
        this._fps = fps;
    
        // Remove current loop:
        if(this._intervalId !== null) {
            clearTimeout(this._intervalId);
        }
        
        if(fps > 0) {
            // Schedule a new loop
            this._intervalId = setInterval(this._update.bind(this), 1000 / this._fps);
        } else {
            // There shall be no new loop
            this._intervalId = null;
        }
        
        return this;
    };

    Game.prototype._update = function() {
        var dt = this._dttimer.peek() * 0.001;
        this._dttimer.start();
    
        // Clamp dt:
        if(dt > 0.2) {
            dt = 0.2;
        }
    
        this.log.update(dt);
       
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
    
        // Update statistics (TODO: rework some things)
        this.log.update();
    
        this.log.draw(this._renderer);
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
                entity._draw(renderer);
            }
        });
    };
    
    return Game;
});

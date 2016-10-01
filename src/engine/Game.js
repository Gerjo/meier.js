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
    var Stopwatch = require("meier/extra/Stopwatch");
    var Renderer  = require("meier/engine/Renderer");
    var Vector    = require("meier/math/Vector");
    var Logger    = require("meier/engine/Logger");
    var Input     = require("meier/engine/Input");
    var Entity    = require("meier/engine/Entity");
	var Average   = require("meier/math/Average");
	
	var StopAnimationInterval = false;

	function SetAnimationFrameInterval(callback) {
		
		StopAnimationInterval = false;
		
		function UponNewFrame() {
			
			if( ! StopAnimationInterval) {
				callback();
			
				window.requestAnimationFrame(UponNewFrame);
			}
		}
		
		// Scedule initial call async.
		window.requestAnimationFrame(UponNewFrame);
	}

	TODO("Re use entity system between Game and Entity. Inheritance? Mix-in?");

    function Game(container) {

        // Default contructor, do nothing.
        if( arguments.length == 0) {
            return;
        }
		
		if(typeof container == "string") {
			container = document.querySelector(container);
			
			if( ! container) {
				throw new Error("HTML Container '" + arguments[0] + "' not found.");
				return;
			}
		} else if(container === undefined) {
			container = document.getElementsByTagName("body")[0];
		}       

		
		if(container.nodeName == "BODY") {
			var html = document.documentElement;
			html.style.height = container.style.height = "100%";
			html.style.width = container.style.width = "100%";
			html.style.margin = container.style.margin = "0px";
			html.style.padding = container.style.padding = "0px";
			
			console.log("[engine] Detected document.body as root. Adding CSS properties to set window width/height.");
		}

		// Hide canvas that doesn't fit in the container. Recently iframe 
		// parents have some issues by adding padding to the bottom. This  
		// hides that padding.
		if( ! container.style.overflow) {
			container.style.overflow = "hidden";
		}
		
        // This is mostly a TODO thing
        this.isTablet        = ('ontouchstart' in document.documentElement);
        this.isSlow          = false;
		
		var computedStyle = window.getComputedStyle ? window.getComputedStyle(container, null) : null;
    
        // Update loop related matter:
        this.clock           = new Stopwatch(); // Wall Clock.
        this._avgFps         = new Average(30); // Last 30 frames.
		this._fps            = 15;              // Desired framerate
        this._lowFps         = null;
        this._previousFps    = this._fps;
        this._dttimer        = new Stopwatch(); // Delta time counter.
        
		// Support style set via stylesheets.
		if(computedStyle) {
			this.width           = parseInt(computedStyle.width, 10);
        	this.height          = parseInt(computedStyle.height, 10);
			
		// Default dimensional properties.
		} else {
			this.width           = parseInt(container.offsetWidth, 10);
        	this.height          = parseInt(container.offsetHeight, 10);		
		}
		
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
        //if(this._lowFps !== null) {
        //    this._applyFps(this._lowFps);
        //}
    };
    
    /// Retrieve a child entity at a given offset.
    Game.prototype.get = function(n) {
        return this._entities[n] || null;
    };
    
    /// Rettrieve first add child entity.
    Game.prototype.first = function() {
        return this._entities.first() || null;
    };
    
    /// Retrieve last added child entity.
    Game.prototype.last = function() {
        return this._entities.last() || null;
    };
    
    Game.prototype._onFocus = function() {
        // Restore high FPS
        //this._applyFps(this._highFps);
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
		this._fps = fps;
		
        // Remove current loop:
        if(this._intervalId !== null) {
            clearInterval(this._intervalId);
        }
		
		StopAnimationInterval = true;
        
		if(fps == 60 && window.requestAnimationFrame) {
			
			this._fps = "vsync";
			
			NOTICE("Using experimental requestAnimationFrame");
			
			SetAnimationFrameInterval(this._update.bind(this));
						
		} else if(fps > 0) {
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
		
		this._avgFps.add(1 / dt);
	
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
				this._entities[i]._delete = false; // Allow re-adding in future.
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

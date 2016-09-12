/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/


define(function(require){
    var Vector   = require("meier/math/Vec")(2);
    
    function Logger(game, width, height) {
        this._game       = game;
        this._size       = new Vector(width, height);
        this._offset     = new Vector(10, (height * 0.5) - 10);
        this._data       = {};
        this._fontSize   = 12;
        this._charWidth  = this._fontSize - 4;
        this._charHeight = this._fontSize;
        this._color      = "black";
        this._numRows    = 0;
    
        // FPS, memory usage and a clock.
        this._showInternals = true;
    
        // Show or hide the whole logger.
        this._showLogger = true;
    
        // Calculated internals.
        this._columnWidth     = 1;
        this._estimatedWidth  = 0;
        
        // Align top, bottom, left or right?
        this._left = true;
        this._top  = true;
    }
    
    Logger.prototype.setFontSize = function(size) {
        if(this._fontSize != size) {
            this._fontSize = size;

            this._charWidth  = this._fontSize - 4;
            this._charHeight = this._fontSize;
        }
        
        // TODO: recompute all estimated widths
        
        return this;
    };
    
    Logger.prototype.left = function() {
        this._left = true;
        return this;
    };
    
    Logger.prototype.right = function() {
        this._left = false;
        return this;
    };
    
    Logger.prototype.top = function() {
        this._top = true;
        return this;
    };
    
    Logger.prototype.bottom = function() {
        this._top = false;
        return this;
    };
    
    Logger.prototype.showInternals = function(doShow) {
        this._showInternals = doShow === false ? false : true;
        return this;
    };
    
    Logger.prototype.hideInternals = function(doShow) {
        this._showInternals = false;
        return this;
    };

    Logger.prototype.show = function(doShow) {
        this._showLogger = doShow === false ? false : true;
        return this;
    };
    
    Logger.prototype.hide = function() {
        this.show(false);
        return this;
    };

    Logger.prototype.setColor = function(color) {
        this._color = color;
        return this;
    };

    Logger.prototype.log = function(key, value, color) {
        this.set(key, value, color);
        return this;
    };
    
    Logger.prototype.set = function(key, value, color) {
        key = key + ":";
        
        if( ! this._data.hasOwnProperty(key)) {
            // New entry, increment count:
            ++this._numRows;
        }
        
        this._data[key] = {
                value: value, 
                color: color || this._color 
        };
    
        // Estimate the column width. Works due to monospaced font.
        this._columnWidth = Math.max(this._columnWidth, (key.length + 1) * this._charWidth);
    
        var guess = (value.toString().length) * this._charWidth + this._columnWidth;
  
        this._estimatedWidth = Math.max(this._estimatedWidth, guess);
        
        return this;
    };

    Logger.prototype.remove = function(key) {
        
        if( this._data.hasOwnProperty(key)) {
            // Existing entry is removed. Decrement count:
            --this._numRows;
        }
        
        delete this._data[key + ":"];
        return this;
    };

    Logger.prototype.update = function(dt) {
        if(this._showInternals === true) {
            this.log("avgFPS", Math.ceil(this._game._avgFps.get()) + "/" + this._game._fps);
            this.log("Clock", Math.floor(this._game.clock.peek() * 0.001));
            //this.log("Listeners", "#" + this._game.input.countListeners());
    
            // This probably only works in Chrome
            if(window.performance && window.performance.memory) {
                this.log("Memory", Math.round(window.performance.memory.totalJSHeapSize * 10e-7) + "mb");
            }
        }
    };

    Logger.prototype.draw = function(context) {
        if(!this._showLogger) {
            return;
        }
        
        var x, y;
        
        if(this._left) {
            x = this._size.x * -0.5 + this._offset.x;
        } else {
            x = (this._size.x * 0.5) - this._estimatedWidth - this._offset.x;
        }
        
        if(this._top) {
            y = this._offset.y;
        } else {
            y = this._size.y * -0.5 + this._numRows * this._charHeight + 20;
        }
                
        var font = "bold " + this._fontSize + "px Monospace";

        for(var k in this._data) {
            if(this._data.hasOwnProperty(k)) {
            
                context.text(k, x, y, this._color, "left", "top", font)
                context.text(this._data[k].value, x + this._columnWidth, y, this._data[k].color, "left", "top", font)
            
                y -= this._fontSize;
            }
        }
    };    
   
   return Logger;
});

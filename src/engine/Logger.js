/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/


define(function(require){
    var Vector   = require("meier/math/Vec")(2);
    
    function Logger(width, height) {
        // Tweakable:
        this.size       = new Vector(width, height);
        this.offset     = new Vector(10, (height * 0.5) - 10);
        this.data       = {};
        this.fontSize   = 12;
        this.charWidth  = this.fontSize - 4;
        this.charHeight = this.fontSize;
        this.color      = "black";
        this.numRows    = 0;
    
        // Show by default:
        this.showLogger = true;
    
        // Calculated internals.
        this.columnWidth     = 1;
        this.estimatedWidth  = 0;
        
        // Align left, or right?
        this._left = true;
        this._top  = true;
    }
    
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

    Logger.prototype.show = function(doShow) {
        this.showLogger = doShow === false ? false : true;
        return this;
    };
    
    Logger.prototype.hide = function() {
        this.show(false);
        return this;
    };

    Logger.prototype.setColor = function(color) {
        this.color = color;
        return this;
    };

    Logger.prototype.log = function(key, value) {
        this.set(key, value);
        return this;
    };
    
    Logger.prototype.set = function(key, value) {
        key = key + ":";
        
        if( ! this.data.hasOwnProperty(key)) {
            // New entry, increment count:
            ++this.numRows;
        }
        
        this.data[key] = value;
    
        // Estimate the column width. Works due to monospaced font.
        this.columnWidth = Math.max(this.columnWidth, (key.length + 1) * this.charWidth);
    
        var guess = (value.toString().length) * this.charWidth + this.columnWidth;
  
        this.estimatedWidth = Math.max(this.estimatedWidth, guess);
        
        return this;
    };

    Logger.prototype.remove = function(key) {
        
        if( this.data.hasOwnProperty(key)) {
            // Existing entry is removed. Decrement count:
            --this.numRows;
        }
        
        delete this.data[key + ":"];
        return this;
    };

    Logger.prototype.update = function(dt) {
    
    };

    Logger.prototype.draw = function(context) {
        if(!this.showLogger) {
            return;
        }
        
        var x, y;
        
        if(this._left) {
            x = this.size.x * -0.5 + this.offset.x;
        } else {
            x = (this.size.x * 0.5) - this.estimatedWidth - this.offset.x;
        }
        
        if(this._top) {
            y = this.offset.y;
        } else {
            y = this.size.y * -0.5 + this.numRows * this.charHeight + 20;
        }
                
        var font = "bold " + this.fontSize + "px Monospace";

        for(var k in this.data) {
            if(this.data.hasOwnProperty(k)) {
            
                context.text(k, x, y, this.color, "left", "top", font)
                context.text(this.data[k], x + this.columnWidth, y, this.color, "left", "top", font)
            
                y -= this.fontSize;
            }
        }
    };    
   
   return Logger;
});

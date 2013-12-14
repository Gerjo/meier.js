/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/


define(function(require) {
    var Entity = require("meier/engine/Entity");
    var Input  = require("meier/engine/Input");
    var Round  = require("meier/math/Math").Round;
    var Vector = require("meier/math/Vec")(2);
    
    Sketch.prototype = new Entity();
    
    function Sketch(x, y, w, h)  {
        Entity.call(this, x || 0, y || 0, w || 100, h || 100);
        
        this.enableEvent(Input.LEFT_DOWN, Input.RIGHT_DOWN, Input.LEFT_UP, Input.RIGHT_UP, Input.MOUSE_MOVE);
        
        this.isLeftDown  = false;        
        this.isRightDown = false;        
        this.cursor      = new Vector(0, 0);
        this.canvas      = null;
        this.radius      = 10;
        
        // Weird initial coordinates to force an update.
        this._canvasPosition = new Vector(Infinity, Infinity);
        
        this.lastDraw = new Vector(0, 0);
        
        
        this.min = new Vector(Infinity, Infinity);
        this.max = new Vector(-Infinity, -Infinity);
    }
    
    /// Generate summary statistics of the current drawing.
    Sketch.prototype.fingerprint = function() {
        var w      = this.width;
        var h      = this.height;
        var data   = this.context.getImageData(0, 0, w, h);
        var pixels = data.data;
        
        function at(x, y) {
            return (pixels[(y * w + x) * 3] > 0);
        }
        
        var stats = {};
        stats.onpix  = 0;
        stats.minx   = Infinity;
        stats.maxx   = -Infinity;
        stats.miny   = Infinity;
        stats.maxy   = -Infinity;
        stats.xbar   = 0;
        stats.ybar   = 0;
        stats.x2bar  = 0;
        stats.y2bar  = 0;
        stats.x2ybr  = 0;
        stats.xy2br  = 0;
        stats.xege   = 0;
        stats.xegvy  = 0; 
        stats.yege   = 0;
        stats.yegvx  = 0;
        
        // The mean horizontal position of all ”on” pixels relative to the center of the box and 
        // divided by the width of the box. This feature has a negative value if the image 
        // is ”left- heavy” as would be the case for the letter L.
        
        var previous = true; // on;
        
        for (var i = 0, on, x = 0, y = 0; i < pixels.length; i += 4) {
            on = pixels[i + 3] != 0;
            
            if(on) {
                // Total on pixels
                ++stats.onpix;
                
                stats.xbar += x;
                stats.ybar += y;
                
                stats.x2bar += x * x;
                stats.y2bar += y * y;
                
                stats.x2ybr += x * x * y;
                stats.xy2br += x * y * y;
                
                // Previous pixel was off, current is on.
                if( ! previous) {
                    ++stats.xege;
                    stats.xegvy += y * y;
                }
                
                
                // if below == off
                if( y == h - 1 || ! at(x, y + 1)) {
                    ++stats.yege;
                    stats.yegvx  += x * x;
                }
                
                
                // Determine bounds
                if(stats.minx > x) { stats.minx = x; }
                if(stats.maxx < x) { stats.maxx = x; }
                if(stats.miny > y) { stats.miny = y; }
                if(stats.maxy < y) { stats.maxy = y; }
            }
            
            previous = on;
            
            // Proceed to next row
            if(++x >= w) {
                x = 0;
                ++y;
                
                // Assume on
                previous = false;
            }
        }

        stats.width  = (stats.maxx - stats.minx) + 1;
        stats.height = (stats.maxy - stats.miny) + 1;
                        
        stats.xbox   = stats.minx + (stats.maxx - stats.minx) * 0.5;
        stats.ybox   = stats.miny + (stats.maxy - stats.miny) * 0.5;

        stats.xbar = (stats.xbar - stats.onpix * stats.xbox) / stats.width;
        stats.ybar = (stats.ybar - stats.onpix * stats.ybox) / stats.height;
        
        stats.x2bar = (stats.xbar - stats.onpix * stats.xbox * stats.xbox) / Math.pow(stats.width, 3);
        stats.y2bar = (stats.ybar - stats.onpix * stats.ybox * stats.ybox) / Math.pow(stats.height, 3);
        
        stats.x2ybr /= stats.onpix * stats.onpix;
        stats.xy2br /= stats.onpix * stats.onpix;
        
        //stats.xege /= stats.onpix;
        stats.xegvy = stats.xegvy / stats.xege / stats.onpix;
        stats.yegvx = stats.yegvx / stats.yege / stats.onpix;
        
        return stats;
    };
    
    Sketch.prototype.onAdd = function(game) {
        // Private canvas for drawing:
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
        this.canvas.style.position = "absolute";
        this.canvas.style.pointerEvents = "none";
        this.context = this.canvas.getContext("2d");
        
        game.htmlContainer.appendChild(this.canvas);
    };
    
    Sketch.prototype.onMouseMove = function(input) {
        if(this.contains(input)) {
            this.cursor = this.toLocal(input);
        }
    };
    
    Sketch.prototype.onLeftDown = function(input) {
        this.lastDraw  = input.clone();
        this.isLeftDown = true;
    };
    
    Sketch.prototype.onLeftUp = function(input) {
        this.isLeftDown = false;
    };
    
    Sketch.prototype.onRightDown = function(input) {
        this.lastDraw   = input.clone();
        this.isRightDown = true;
    };
    
    Sketch.prototype.onRightUp = function(input) {
        this.isRightDown = false;
    };
    
    Sketch.prototype.update = function(dt) {
        // Update the canvas position.
        if( this.canvas && ! this.position.equals(this._canvasPosition)) {
            this.canvas.style.left = ((this.game.width - this.width) * 0.5 + this.position.x) + "px";
            this.canvas.style.top  = this.game.height - ((this.game.height + this.height) * 0.5 + this.position.y) + "px";
            
            this._canvasPosition.set(this.position);
        }
        
        // TODO: width, height, rotation and scale.
    };
    
    Sketch.prototype._drawPath = function(context) {
        var dir = this.cursor.clone().subtract(this.lastDraw);
        var l = dir.length();
        dir.normalize();
        
        // Interpolate between previous and current position.
        for(var i = 0; i <= l; ++i) {
            var x = dir.x * i + this.lastDraw.x;
            var y = dir.y * i + this.lastDraw.y;
            //this.context.rect(x + this.width * 0.5, (-y + this.height * 0.5), 1, 1);
            this.context.arc(x + this.width * 0.5, (-y + this.height * 0.5), this.radius, 0, Math.TwoPI);
        }
        
        this.lastDraw = this.cursor.clone();
    };
    
    Sketch.prototype.clear = function() {
        this.context.clearRect(0, 0, this.width, this.height);
    };
    
    Sketch.prototype.draw = function(renderer) {
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.stroke("rgba(0, 0, 0, 0.3)");
        
        // Draw the cursor:
        renderer.begin();
        renderer.circle(this.cursor, this.radius);
        renderer.stroke("rgba(0, 0, 0, 0.3)");
        
        if(this.isLeftDown && ! this.isRightDown) {
            this.context.beginPath();
            
            this._drawPath(this.context);
            
            this.context.fillStyle = "black";
            this.context.fill();
            
            this.lastDraw = this.cursor.clone();
            
        } else if(this.isRightDown) {
            this.context.save();
            this.context.beginPath();
            
            this._drawPath(this.context);
            
            this.context.clip();
            this.context.clearRect(0, 0, this.width, this.height);
            this.context.restore();
        }
        
        //if(this.stats) {
        //    this.context.beginPath();
        //    this.context.rect(this.stats.minx+1,this.stats.miny+1,this.stats.maxx-this.stats.minx-1,this.stats.maxy-this.stats.miny-1);
        //    this.context.strokeStyle = "black";
        //    this.context.stroke();
        //}
    };
    
    return Sketch;
});
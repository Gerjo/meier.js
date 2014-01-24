/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/


define(function(require) {
    
    var Matrix      = require("meier/math/Mat")(3, 3);
    var Vector      = require("meier/math/Vec")(2);
    var Texture     = require("meier/engine/Texture");
    var LineSegment = require("meier/math/Line");
    var Disk        = require("meier/math/Disk");
    var Rectangle   = require("meier/math/Rectangle");
    var Polygon     = require("meier/math/Polygon");
    
    
    // Macro to determine if argument is a vector.
    function IsVector(v) {
        // Nice duck typing. If it has x & y, it must be a vector.
        return v && v.hasOwnProperty('x') || v && v._;
    }
    
    /// Canvas wrapper. Lateron I'll add WebGL as a drop-in replacement.
    function Renderer(container, width, height) {
    
        // Create canvas element:
        var canvas            = this.canvas   = document.createElement("canvas");
        var context           = this.context  = this.canvas.getContext("2d");
        this.width            = canvas.width  = width;
        this.height           = canvas.height = height;
        this.hw               = this.width * 0.5
        this.hh               = this.height * 0.5;
        this._rotation        = 0;
        this._translate       = new Vector(0, 0);
    
        canvas.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
        canvas.style.position = "absolute";
    
        container.appendChild(canvas);
    }

    /// Save the current rotation/translation state.
    Renderer.prototype.save = function() {
        this.context.save();
        return this;
    };

    /// Restore the previously saved state:
    Renderer.prototype.restore = function() {
        this.context.restore();
        return this;
    };
    
    /// Transparently clear the canvas:
    Renderer.prototype.opacity = function(level) {
        this.context.globalAlpha = level;
        return this;
    };

    /// Transparently clear the canvas:
    Renderer.prototype.clear = function() {
        this.context.clearRect(-this.hw, -this.hh, this.width, this.height);
        return this;
    };

    Renderer.prototype.scale = function(scale) {
        this.context.scale(scale, scale);
    };

    /// Clear the canvas with a solid fill color:
    Renderer.prototype.clearSolid = function(color) {
        this.context.fillStyle = color;
        this.context.fillRect(-this.hw, -this.hh, this.width, this.height);  
        return this;  
    };

    /// Clear the canvas with a solid fill color:
    Renderer.prototype.clearTexture = function(texture) {
        this.context.drawImage(
                texture.image,  // The image
                0,              // Source X
                0,              // Source Y
                texture.width,  // Source width
                texture.height, // Source height
                -this.hw,       // Target X
                -this.hh,       // Target Y
                this.width,     // Target width
                this.height     // Target height
        );    
        return this;
    };

    /// Rotate any subsequent draw calls:
    Renderer.prototype.rotate = function(radians) {
        this.context.rotate(-radians);
        this._rotation = radians;
        return this;
    };

    /// Translate all subsequent draw calls:
    Renderer.prototype.translate = function(x, y) {
        this.context.translate(x, -y);
        this._translate.x = x;
        this._translate.y = -y;
        return this;
    };

    /// Draw a rectangle:
    /// Accepts:
    /// [Rectangle]
    /// [Number, Number, Number, Number]
    /// [Vector, Number, Number]
    Renderer.prototype.rectangle = function(a, b, c, d) {
        
        var x, y, h, w;
        
        if(a instanceof Rectangle) {
            w = a.width();
            h = a.height();
            
            x = a.min.x;// - w * 0.5;
            y = -a.min.y;// - h * 0.5; 
    
        } else if(IsVector(a)) {
            x = a.x;
            y = -a.y;
            w = b;
            h = c;
                
        } else {
            x = a
            y = -b;
            w = c;
            h = d;
        }
        
        this.context.rect(x - w * 0.5, y - h * 0.5, w, h);

        return this;
    };

    /// Draw a texture:
    /// Accepts:
    /// [Texture, Number, Number]
    /// [Texture, Number, Number, Number, Number]
    Renderer.prototype.texture = function(texture, x, y, width, height) {
    
    	if(IsVector(x)) {
    		height = width;
    		width = y;
    		y = x.y;
    		x = x.x;
    	}
	
        if(isNaN(x)) {
            x = 0;
        }
    
        if(isNaN(y)) {
            y = 0;
        }
    
        // No width given, draw as-is:
        if(isNaN(width)) {
            width = texture.width;
        }
    
        // No height given, draw as-is:
        if(isNaN(height)) {
            height = texture.height;
        }
 
        if( ! texture._isLoaded) {
            return this;
        }
        
        // Render an "img" tag onto the canvas.
        if(texture._image !== null) {
            this.context.drawImage(
                    texture._image,    // The image
                    0,                 // Source X
                    0,                 // Source Y
                    texture.width,     // Source width
                    texture.height,    // Source height
                    x - width * 0.5,   // Target X
                    -y - height * 0.5, // Target Y
                    width,             // Target width
                    height             // Target height
            );
        } else if(texture._raw !== null) {
            // TODO: this is free from transformations. Simulate them here?
            //   - scaling
            //   - rotation (ugh!)
            this.context.putImageData(
                texture._raw, 
                x - width * 0.5 + this.hw,
                -y - height * 0.5 + this.hh, 
                0, 
                0, 
                width, 
                height
            );
            
        } else {
            throw new Error("Renderer::texture(), unable to draw texture. It's not a texture?");
        }
    
     
        return this;
    };

    /// Start a new set of drawing calls.
    Renderer.prototype.begin = function() {
        this.context.beginPath();
        return this;
    };

    /// Accepts:
    /// [number, number, number]
    /// [Vector, number]
    /// [Disk]
    Renderer.prototype.circle = function(a, b, c) {
        if(IsVector(a)) {
            this.context.moveTo(a.x + b, -a.y);
            this.context.arc(a.x, -a.y, b, 0, 2 * Math.PI);
        
        } else if(a instanceof Disk) {
            this.context.moveTo(a.position.x + a.radius, -a.position.y);
            this.context.arc(a.position.x, -a.position.y, a.radius, 0, 2 * Math.PI);
        
        } else {
            this.context.moveTo(a + c, -b);
            this.context.arc(a, -b, c, 0, 2 * Math.PI);
        }
        return this;
    };

    /// Draw an arc at [x,y] with radius R from radians to radians.
    /// Example: arc(0, 0, 40, 0, Math.PI)  - A semi circle
    /// Example: arc(0, 0, 40, 0, Math.PI * 2) - A circle
    /// Example: arc(0, 0, 40, 0, Math.PI * 0.5) - 90 degree arc
    ///
    /// Accepts:
    /// [Number, Number, Number, Number, Number]
    /// [Vector, Number, Number, Number]
    Renderer.prototype.arc = function(a, b, c, d, e) {
        if(IsVector(a)) {
            this.context.arc(a.x, -a.y, b, c, d);
        } else {
            this.context.arc(a, -b, c, d, e);
        }
        return this;
    };

    /// Accepts:
    /// [LineSegment]
    /// [Vector, Vector]
    /// [Number, Number, Number, Number]
    Renderer.prototype.line = function(a, b, c, d) {
        
        var fromX, fromY, toX, toY;
    
        if(a instanceof LineSegment) {
            fromX = a.a.x;
            fromY = -a.a.y;
            toX   = a.b.x;
            toY   = -a.b.y;
    
        } else if(IsVector(a) && IsVector(b)) {
            fromX = a.x;
            fromY = -a.y;
            toX   = b.x;
            toY   = -b.y;
        } else if(IsVector(a)) {
            toX = a.x;
            toY = -a.y;
            fromX = 0;
            fromY = 0;
        } else if(IsVector(c)) {
            fromX = a;
            fromY = -b;
            toX   = c.x;
            toY   = -c.y;
        } else {
            fromX = a;
            fromY = -b;
            toX   = c;
            toY   = -d;
        }
        
        this.context.moveTo(toX, toY);
        this.context.lineTo(fromX, fromY);
        
        return this;
    };

    /// Draw a dashed line.
    ///
    /// @todo optimize internal workings.
    Renderer.prototype.dashed = function(fromX, fromY, toX, toY, length) {
        length = length || 10;
    
        var dir = new Vector(
            toX - fromX,
            toY - fromY
        );
    
        // Total length to cover:
        var l = Math.sqrt(Math.pow(dir.x, 2) + Math.pow(dir.y, 2));
    
        dir.normalize();
    
        for(var i = 0; i < l; i += length * 2) {
            this.line(
                fromX + dir.x * i,
                fromY + dir.y * i,
                fromX + dir.x * (i + length),
                fromY + dir.y * (i + length)
            );
        }
    
        return this;
    };

    Renderer.prototype.text = function(string, x, y, color, align, valign, font) {
    
        if( ! color) {
            color = "black";
        }
    
        if( ! align) {
            align = "center";
        }
    
        if( ! valign) {
            valign = "top";
        }
    
        if( ! font) {
            font = "bold 14px monospace";
        }
    
        this.context.font         = font;
        this.context.fillStyle    = color;
        this.context.textAlign    = align;
        this.context.textBaseline = valign;
        this.context.fillText(string, x, -y);
        return this;
    };

    /// Accepts: 
    /// [Vector]
    /// [Number, Number]
    Renderer.prototype.vector = function(a, b) {
        this.context.moveTo(0, 0);
    
        if(IsVector(a)) {
            this.context.lineTo(a.x, -a.y);
        } else {
            this.context.lineTo(a, -b);
        }
        return this;
    };

    /// Accepts:
    /// [Polygon]
    /// [Array<Vector>]
    /// NB: automatically closes the loop, if not closed.
    Renderer.prototype.polygon = function(a) {
        
        if(a instanceof Polygon) {
            if(a.vertices.length > 0) {
                this.save();
            
                this.context.translate(
                    this._translate.x + a.position.x,
                    this._translate.y - a.position.y
                );
            
                // TODO: move this duplicated code.
                this.context.moveTo(a.vertices[0].x, -a.vertices[0].y);
            
                for(var i = 1; i < a.vertices.length; ++i) {
                    this.context.lineTo(a.vertices[i].x, -a.vertices[i].y);
                }

                // Close the polygon loop:
                if( ! a.vertices.first().equals(a.vertices.last())) {
                    this.context.lineTo(a.vertices[0].x, -a.vertices[0].y);
                }
                
                this.restore();
            }
            
        } else if(a instanceof Array) {
            // The minimal required minimum for the code not to crash.
            if(a.length > 0) {
    
                this.context.moveTo(a[0].x, -a[0].y);
    
                for(var i = 1; i < a.length; ++i) {
                    this.context.lineTo(a[i].x, -a[i].y);
                }
    
                // Close the polygon loop:
                if( ! a.first().equals(a.last())) {
                    this.context.lineTo(a[0].x, -a[0].y);
                }
            } 
        }
        
        return this;
    };
    
    Renderer.prototype.alpha = function(alpha) {
        this.context.globalAlpha = alpha;
    };

    /// Fill all draw calls since begin() with a given color.
    Renderer.prototype.fill = function(color) {
		if(color instanceof Texture) {
			var pattern = this.context.createPattern(color.image, 'repeat');
	        this.context.fillStyle = pattern;
		} else {
	        this.context.fillStyle = color;
		}
        this.context.fill();
        return this;
    };

    /// Stroke the outline of all draw calls since begin() with a given color.
    Renderer.prototype.stroke = function(color, thickness) {
        this.context.lineWidth = thickness || 1;
        this.context.strokeStyle = color;
        this.context.stroke();
        return this;
    };

    /// Accepts:
    /// [Vector]
    /// [LineSegment]
    /// [Vector, Vector]
    /// [Number, Number, Vector]
    /// [Vector, Number, Number]
    /// [Number, Number, Number, Number]
    Renderer.prototype.arrow = function(a, b, c, d) {
        var fromX, fromY, toX, toY;
    
        if(a instanceof LineSegment) {
            fromX = a.a.x;
            fromY = -a.a.y;
            toX   = a.b.x;
            toY   = -a.b.y;
    
        } else if(IsVector(a) && IsVector(b)) {
            fromX = a.x;
            fromY = -a.y;
            toX   = b.x;
            toY   = -b.y;
        } else if(IsVector(a)) {
            toX = a.x;
            toY = -a.y;
            fromX = 0;
            fromY = 0;
        } else if(IsVector(c)) {
            fromX = a;
            fromY = -b;
            toX   = c.x;
            toY   = -c.y;
        } else {
            fromX = a;
            fromY = -b;
            toX   = c;
            toY   = -d;
        }
    
        var headlen = 10;   // length of head in pixels
        var angle = Math.atan2(toY - fromY, toX - fromX);
        this.context.moveTo(fromX, fromY);
        this.context.lineTo(toX, toY);
        this.context.lineTo(
            toX - headlen * Math.cos(angle - Math.PI / 6),
            (toY - headlen * Math.sin(angle - Math.PI / 6))
        );
        this.context.moveTo(toX, toY);
        this.context.lineTo(
            toX - headlen * Math.cos(angle + Math.PI / 6),
            (toY - headlen * Math.sin(angle + Math.PI / 6))
        );
        return this;
    };
    return Renderer;
});
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
    var Colors      = require("meier/engine/Colors");
    var LineSegment = require("meier/math/Line");
    var Disk        = require("meier/math/Disk");
    var Rectangle   = require("meier/math/Rectangle");
    var Polygon     = require("meier/math/Polygon");
    var Fonts       = require("meier/engine/Fonts");
    var math        = require("meier/math/Math");
	
	var UseCairo    = typeof document == "undefined";
	var Cario       = null;
	//var Image;
	
	if(UseCairo) {
		// By pass requireJS include system. (it scans files for
		// string literals)
		var req = require;
		Cairo = req("canvas");
		//Image = req("image");
		
		
		console.log("No document detected. Loading Cairo bindings instead.");
	}
	
    // Macro to determine if argument is a vector.
    function IsVector(v) {
        // Nice duck typing. If it has x & y, it must be a vector.
        return v && v.hasOwnProperty('x') || v && v._;
    }
    
    /// Canvas wrapper. Lateron I'll add WebGL as a drop-in replacement.
    function Renderer(container, width, height) {
    
		// Permit optional container parameter.
		if( ! isNaN(container)) {
			height    = width;
			width     = container;
			container = null;
		}
	
		// Allow a game instance instead of some HTML wrapper.
		if(container && container.htmlContainer) {
			container = container.htmlContainer;
		}
	
		if(UseCairo) {
			this.canvas = new Cairo(width, height);
			this.context = this.canvas.getContext("2d");
			
		} else {
	        // Create canvas element:
			this.canvas   = document.createElement("canvas");
			this.context  = this.canvas.getContext("2d");
	        this.canvas.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
		}
       
        this.width            = this.canvas.width  = width;
        this.height           = this.canvas.height = height;
        this.hw               = this.width * 0.5
        this.hh               = this.height * 0.5;
        this._rotation        = 0;
        this._translate       = new Vector(0, 0);
		
		if(container) {
			// This is weird. Multiple root renderers. Adjust CSS to atleast
		    // show the canvas, and thus the error in one's ways.
			if(container.firstChild) {
		        this.canvas.style.position = "absolute";
			}
		
	        container.appendChild(this.canvas);
		} else {
	        //canvas.style.position = "absolute";
			//document.getElementsByTagName("body")[0].appendChild(canvas);
		}
		
		this.clear();
    }
	
	Renderer.prototype.setSmoothing = function(doSmooth) {
		this.context.imageSmoothingEnabled = doSmooth;
		return this;
	};

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
    Renderer.prototype.clear = function(color) {
        
        /// Reset the transform to an identity matrix:
        /// We can tweak the letters in:
        /// a b 0
        /// c d 0
        /// e f 1
        this.context.setTransform(
            1,  0, 
            0,  1, 
        
            // Draw from center. A 0.5 offset is given to align the game
            // coordinate frame with canvas coordinate frame.
            // TODO: Windows platforms seem to disagree with this. Further study is required
            // to determine optimal platform independend solutions.
            this.hw + 0.5,
            this.hh + 0.5);
		
		if(color) {
			this.begin();
			this.context.rect(-this.hw, -this.hh, this.width, this.height);
			this.fill(color);
		} else {
			this.context.clearRect(-this.hw, -this.hh, this.width, this.height);
		}
		
        return this;
    };

    Renderer.prototype.scale = function(scale) {
        this.context.scale(scale, scale);
    };

    /// Clear the canvas with a solid fill color:
    Renderer.prototype.clearSolid = function(color) {
		this.clear(color);
		return this;  
    };

    /// Clear the canvas with a solid fill color:
    Renderer.prototype.clearTexture = function(texture, tileImage) {
        
        // Image is still loading.
        if(texture._image === null) {
            return;
        }
        
        // File image with a pattern:
        if(tileImage === true) {
            this.begin();
            this.rectangle(0, 0, this.width, this.height);
            this.fill(texture);
            
        // Stretch image to fit
        } else {
            this.context.drawImage(
                    texture._image,  // The image
                    0,              // Source X
                    0,              // Source Y
                    texture.width,  // Source width
                    texture.height, // Source height
                    -this.hw,       // Target X
                    -this.hh,       // Target Y
                    this.width,     // Target width
                    this.height     // Target height
            );    
        }
        
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
    Renderer.prototype.rectangle = Renderer.prototype.rect = function(a, b, c, d) {
        
        var x, y, h, w;
        
        if(a instanceof Rectangle) {
            w = a.width();
            h = a.height();
            
            x = a.min.x + w * 0.5;
            y = -a.min.y - h * 0.5; 
    
        } else if(IsVector(a) && IsVector(b)) {
            w = b.x - a.x;
            h = b.y - a.y;
            
            x = a.x + w * 0.5;
            y = -a.y - h * 0.5; 
    
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
    Renderer.prototype.texture = function(texture, x, y, width, height, top, right, bottom, left) {
    
    	if(IsVector(x)) {
            // Shift everyhing
            left   = bottom;
            bottom = right;
            right  = top
            top    = height;
    		height = width;
    		width  = y;
    		y      = x.y;
    		x      = x.x;
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
        
        // clipping default values
        top    = top    || 0;
        right  = right  || 0;
        bottom = bottom || 0;
        left   = left   || 0;
 
        if( ! texture._isLoaded && ! texture.canvas) {
            return this;
        }
        
        // Render an "img" tag onto the canvas.
        if(texture._image || texture.canvas) {
			
			// Don't bother with this.
			if(width == 0 || height == 0) {
				return this;
			}
			
            this.context.drawImage(
                    texture._image || texture.canvas,  // The image
                    right,                             // Source X
                    top,                               // Source Y
                    texture.width + left,              // Source width
                    texture.height + bottom,           // Source height
                    x - width * 0.5 + right,           // Target X
                    -y - height * 0.5 + top,           // Target Y
                    width,                             // Target width
                    height                             // Target height
            );
		} else if(texture._raw !== null) {
            
            // NPOT doesn't work in all browsers.
            if( ! math.IsPowerOfTwo(width) || ! math.IsPowerOfTwo(height)) {
                NOTICE("Rendering a non power of two RawTexture (" + width + "x" + height + ").");
            }
            
            // TODO: this is free from transformations. Simulate them here?
            //   - scaling
            //   - rotation (ugh!)
            //   - alpha blending
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
        var defaultRadius = 5;
        
        if(IsVector(a)) {
            this.context.moveTo(a.x + (isNaN(b) ? defaultRadius : b), -a.y);
            this.context.arc(a.x, -a.y, isNaN(b) ? defaultRadius : b, 0, 2 * Math.PI);
        
        } else if(a instanceof Disk) {
            this.context.moveTo(a.position.x + a.radius, -a.position.y);
            this.context.arc(a.position.x, -a.position.y, a.radius, 0, 2 * Math.PI);
        
        } else {
            this.context.moveTo(a + (isNaN(c) ? defaultRadius : c), -b);
            this.context.arc(a, -b, isNaN(c) ? defaultRadius : c, 0, 2 * Math.PI);
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
    
	/// Draw an array of points as if being a line-loop.
	/// Optional parameter allowing a closed-line-loop incase
	/// it wasn't already.
	Renderer.prototype.lines = function(array, closeLoop) {
		return this.polygon(array, ! closeLoop);
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
    
    
    /// Render text formatting according to the stack-based 
    /// markup language (SBML). Which is something I just
    /// made up on the fly.
    ///
    /// Example: <monospace><10px>grass<> is <#00ff00>green<> and
    ///          the <yellow>sun<> is <bold>yellow.
    ///
    ///
    ///
    Renderer.prototype.styled = function(string, x, y, align, valign) {
        x = x || 0;
        y = y || 0;
        align  = align || "center";
        valgin = valign || "bottom"
        
        /// Struct to hold statemachine states
        function Style(text, size, color, font, style, line, height, measure) {
            this.text    = text;
            this.size    = size;
            this.color   = color;
            this.font    = font;
            this.style   = style;
            this.line    = line;
            this.width   = null;
            this.height  = height;
            this.measure = measure;
        }
        
        var states = [];
        var events = [];
        
        var height = 0;
        var width  = 0;
        var baseline = 0;
        
        // Default figures:
        var style = ""; // bold / italic and normal.
        var font  = "monospace";
        var color = "cyan"; // Not as nice, but works with white and black backgrounds.
        var size  = 10;
        var startBracket = null;
        var startString  = 0;
        
        // Adding two brackets makes sure the statemachine terminates.
        string = string + "<>";
        
        // Totals
        var widths    = [0];
        var heights   = [0];
        var baselines = [0];
        var offsets   = [0];
        var line   = 0;
        
        for(var i = 0, sub; i < string.length; ++i) {
                            
            if(string[i] == "<" || string[i] == "\n") {
                
                if(startString != i) {
                    sub = string.substring(startString, i);
                                    
                    states.push(new Style(
                        sub,
                        size,
                        color,
                        font,
                        style,
                        line,
                        parseInt(size, 10),
                        Fonts.Measure(size + " " + style + " " + font)
                    ));
                                        
                    // Load text style, then measure it.
                    this.context.font   =  size + " " + font;
                    states.last().width = this.context.measureText(sub).width,
                    
                    // Collect dimensions of each fragment
                    heights[line]    = Math.max(heights[line],   states.last().measure.height);  
                    baselines[line]  = Math.max(baselines[line], states.last().measure.baseline);
                    widths[line]    += states.last().width;
                    
                    // Offset to skip a newline or bracket character.
                    startString = i + 1;
                }
                
                startBracket = i;
                
                if(string[i] == "\n") {
                    ++line;
                    
                    // Reset counters for the next line
                    offsets.push(heights.last() + offsets.last());
                    widths.push(0);
                    heights.push(0);
                    baselines.push(0);
                }
                
            // "command" terminating symbol
            } else if(string[i] == ">") {
                sub = string.substring(startBracket + 1, i);
                
                // Undo last event
                if(startBracket + 1 == i) {      
                    if( ! events.empty()) {       
                        events.pop()();
                    }
                    
                // It's a number.
                } else if(parseInt(sub[0]) == sub[0]) {
                    
                    events.push(function(old) {
                        size = old;
                    }.curry(size));
                    
                    size = sub;
                
                // Or a color.
                } else if(Colors.IsColor(sub)) {
                    events.push(function(old) {
                        color = old;
                    }.curry(color));
                    
                    color = sub;
                
                // Font styling
                } else if(sub == "bold" || sub == "italic" || sub == "normal" || sub == "italic bold" || sub == "bold italic") {
                    events.push(function(old) {
                        style = old;
                    }.curry(style));
                    
                    style = sub;
                     
                // Whatever else, it's a font.
                } else {
                    events.push(function(old) {
                        font = old;
                    }.curry(font));
                    
                    font = sub;
                }
                
                startBracket = null;
                startString  = i + 1;
            }
        }
        
        var baseX = x;
        
        var h = 0;
        for(var i = 0, yOffset; i < states.length; ++i) {
            var state = states[i];
            
            
            if(i == 0 || state.line != states[i-1].line) {
                if(align == "center") {
                    x = baseX - widths[state.line] / 2;
                } else if(align == "right") {
                    x = baseX - widths[state.line];
                } else {
                    x = baseX;
                }
            }
            
            // e.g.,  "bold 14px monospace";
            this.context.font         = states[i].style + " " + states[i].size + " " + states[i].font;
            this.context.fillStyle    = states[i].color;
            this.context.textAlign    = "left";
            this.context.textBaseline = "bottom";
            
            yOffset = 0;
            
            if(valign == "center") {
                this.context.textBaseline = "middle";
                
                yOffset = state.measure.baseline * 0.5 - baseline * 0.25;   
            
            } else if(valign == "bottom") {
                this.context.textBaseline = "bottom";
                
                yOffset = -state.measure.baseline + baseline * 0.5;   
            
            // Unsure how top align should look like.
            } else if(valign == "top") {
                this.context.textBaseline = "top";
				TODO("Implement baseline top for the renderer typesetter. Pretty hard.");
                throw new Error("Not implemented yet");
            }
            
            this.context.fillText(
                states[i].text, 
                x, 
                -(y + yOffset) + offsets[state.line]);
                        
            x += states[i].width;
        }
        
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
    Renderer.prototype.polygon = function(a, doNotClose) {
        
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
                if( ! a.vertices.first().equals(a.vertices.last()) && doNotClose !== true) {
                    this.context.lineTo(a.vertices[0].x, -a.vertices[0].y);
                }
                
                this.restore();
            }
            
        } else if(a instanceof Array) {
            // The minimal required minimum for the code not to crash.
            if(a.length > 1) {
    
                this.context.moveTo(a[0].x, -a[0].y);
    
                for(var i = 1; i < a.length; ++i) {
                    this.context.lineTo(a[i].x, -a[i].y);
                }
    
                // Close the polygon loop:
                if( ! a.first().equals(a.last()) && doNotClose !== true) {
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
			var pattern = this.context.createPattern(color._image, 'repeat');
	        this.context.fillStyle = pattern;
		} else {
			TODO("Support fancy hex colors for renderer.fill and renderer.stroke");
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
	
	/// Export canvas to PNG format.
	Renderer.prototype.toPng = function() {

		if(UseCairo) {
			return this.canvas.pngStream();
		}

		// ... it's something.
		return this.canvas.toDataURL("image/png");
	};
	
	/// Export canvas contents to given file.
	Renderer.prototype.toFile = function(file) {
		if(UseCairo) {
			var stream = this.toPng();
			
			stream.on("data", function(chunk) {
			  file.write(chunk);
			});
		}
	};
	
    return Renderer;
});
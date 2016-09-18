define(function(require) {
    var Texture  = require("meier/engine/Texture");
    var Angle    = require("meier/math/Angle");
    var M        = require("meier/math/Mat");
    var V        = require("meier/math/Vec");
    var Vector2  = require("meier/math/Vec")(2);
    var math     = require("meier/math/Math");
    var Renderer = require("meier/engine/Renderer");
	
    // Some operations require a canvas to create a so-called "ImageData"
    // object. Rather than introducing a dependancy on Renderer, a private
    // hidden canvas is created to handle this.
    var canvas    = document.createElement("canvas");
    var context   = canvas.getContext('2d');
    canvas.width  = 0;
    canvas.height = 0;
    
    
    function ClampByte(b) {
        return Math.min(Math.max(0, b), 255);
    }
    
    /// Common convolution kernels, as found on the internet
    RawTexture.Matrices = {
        // The following ae from wikipedia: http://en.wikipedia.org/wiki/Kernel_(image_processing)
        Original:    new (M(3,3))([0, 0, 0, 0, 1, 0, 0, 0, 0]),
        EdgeDetect1: new (M(3,3))([1, 0, -1, 0, 0, 0, -1, 0, 1]),
        EdgeDetect2: new (M(3,3))([0, 1, 0, 1, -4, 1, 0, 1, 0]),
        EdgeDetect3: new (M(3,3))([-1, -1, -1, -1, 8, -1, -1, -1, -1]),
        Sharpen:     new (M(3,3))([0, -1, 0, -1, 5, -1, 0, -1, 0]),
        Blur1:       new (M(3,3))([1, 2, 1, 2, 4, 2, 1, 2, 1]),
        Blur2:       new (M(3,3))([1, 1, 1, 1, 1, 1, 1, 1, 1]),
        
        // The following are gradient-based operators (come in pairs)
        SobelX: new (M(3,3))([1, 0, -1, 2, 0, -2, 1, 0, -1]),
        SobelY: new (M(3,3))([1, 2, 1, 0, 0, 0, -1, -2, -1]),        
        PrewittX: new (M(3,3))([-1, 0, 1, -1, 0, 1, -1, 0, 1]),
        PrewittY: new (M(3,3))([1, 1, 1, 0, 0, 0, -1, -1, -1]),
        RobertsCrossX: new (M(2,2))([1, 0, 0, -1]),
        RobertsCrossY: new (M(2,2))([0, 1, -1, 0]),
        ScharrX: new (M(3,3))([3, 10, 3, 0, 0, 0, -3, -10, -3]),
        ScharrY: new (M(3,3))([3, 0, -3, 10, 0, -10, 3, 0, -3])
    };
    
    
    
    RawTexture.fromMatrix = RawTexture.FromMatrix = function(r, g, b, a) {
        
		var tex = new RawTexture();
		
		tex._loadFromMatrix(r, g, b, a);
		
        return text;
    };
    
    
    RawTexture.prototype = new Texture(null);
    function RawTexture(url, callback) {
        Texture.call(this, null, null);
        
		if(url instanceof Renderer) {
			url = url.context.getImageData(0, 0, url.width, url.height);
		}
		
        // Will hold the "ImageData" object.
        this._raw          = null;
        
        // User specified onload callback.
        this._rawCallback  = callback;
        
        // Number of channels. Only 4 channel textures are available to HTML.
        this._channels     = 4;
        
        // Proceed to load the image from a URL.
        if(typeof url == "string") {
            this._getRawByUrl(url);
          
		} else if(url.numrows && url.numcolumns) { 
		    this._loadFromMatrix(url);
			
            this.hw        = this.width * 0.5;
            this.hh        = this.height * 0.5;
            this._isLoaded = true;
			
			if(typeof this._rawCallback == "function") {
				this._rawCallback(this);
			}
			
        // Load from ImageData
        } else if(url instanceof ImageData) { 
            this._raw      = url;
            this.width     = this._raw.width;
            this.height    = this._raw.height;
            this.hw        = this.width * 0.5;
            this.hh        = this.height * 0.5;
            this._isLoaded = true;
			
			if(typeof this._rawCallback == "function") {
				this._rawCallback(this);
			}
        }
    }
    
	RawTexture.prototype._loadFromMatrix = function(r, g, b, a) {
        
        var width  = this.width = r.numcolumns;
        var height = this.height = r.numrows;
        
        if( ! math.IsPowerOfTwo(width) || ! math.IsPowerOfTwo(height)) {
            NOTICE("Creating non power of two texture (" + width + "x" + height + ") using RawTexture.FromMatrix");
        }
        
        this._raw = context.createImageData(width, height);
        
        for(var i = 0, j = 0; i < this._raw.data.length; i += 4, ++j) {
            var red = r._[j];
            
            this._raw.data[i + 0] = red;
                        
            // Use the given channel, or switch to "red" (grey scale)
            this._raw.data[i + 1] = (g) ? g._[j] : red;
            this._raw.data[i + 2] = (b) ? b._[j] : red;
            
            // Alpha must be present, or "255" (no alpha) is used
            this._raw.data[i + 3] = (a) ? a._[j] : 255;
        }		
	};
	
    RawTexture.prototype.differenceOfGaussian = function() {
        
        // Selected these arbitrary, just to test what works.
        var a = this.gaussian(2, 2, 1);
        var b = this.gaussian(7, 7, 9);
        
        var source   = a._raw.data;
        var target   = b._raw.data;
        var channels = this._channels;
        
        // If the difference drops below zero, we can offset it. Probably best to normalize
        // the colors after the first DOG process?
        var offset   = 0;
        
        for(var i = 0; i < source.length; i += channels) {
            target[i + 0] = ClampByte(Math.abs(target[i + 0] - source[i + 0] + offset));
            target[i + 1] = ClampByte(Math.abs(target[i + 1] - source[i + 1] + offset));
            target[i + 2] = ClampByte(Math.abs(target[i + 2] - source[i + 2] + offset));
            
            target[i + 3] = 255;
        }
        
        //console.log(i);
        
        return b;
    };
    
    /// A not working edge detection method.
    RawTexture.prototype.canny = function(xKernel, yKernel) {
        NOTICE("RawTexture.canny doesn't work.");
        xKernel = xKernel || RawTexture.Matrices.SobelX;
        yKernel = yKernel || RawTexture.Matrices.SobelY;
        
        var gradients = this._gradient(xKernel, yKernel, 0);
        var width     = this.width;
        var height    = this.height;
        
        // The pixel range is clamped to an edge        
        function Index(x, y) {

            if(x < 0) {
                x = 0;
            }
            
            if(y < 0) {
                y = 0;
            }
            
            if(x > width - 1) {
                x = width - 1;
            }
            
            if(y > height - 1) {
                y = height - 1;
            }
            
            return y * width + x;
        }
        //     n
        //  nw   ne
        // w        e
        //  sw   se
        //     s
        
        
        var newData  = context.createImageData(width, height);
        
        var channels = this._channels;
        for(var j = 0, y = 0, x = 0, i = 0; j < gradients.length; ++j, i += channels) {
            
            // Correct alpha channel. (set visible)
            newData.data[i + 3] = 255;
            
            var directionsAll = [
                Index(x - 1, y),     // e
                Index(x + 1, y + 1), // ne
                Index(x,     y + 1), // n
                Index(x - 1, y + 1), // nw
                Index(x + 1, y - 1), // w
                Index(x,     y - 1), // sw
                Index(x - 1, y - 1), // s
                Index(x + 1, y)      // se
            ];
          
            var colors = [
                [255, 0, 0],
                [255, 255, 0],
                [0, 255, 0],
                [0, 255, 255],
                [0, 0, 255],
                [255, 0, 255],
                [255, 255, 255],
                [0, 0, 0]
            ];
            
            var gradient  = gradients[j];
            var angle     = gradient.angle();
            var n         = directionsAll[parseInt(Angle.ToAbsoluteRadians(angle) / (Math.PI/8))];
            var magnitude = gradient.magnitudeSQ();
            
            // TODO: Work on a copy of the image, otherwise hysteresis doesn't work anymore.
            if(gradients[n].magnitudeSQ() > magnitude) {
                // Current off.
                newData.data[i + 0] = 0;
                newData.data[i + 1] = 0;
                newData.data[i + 2] = 0;
                
                gradient.off = true;
                
            } else {
                // Current on
                
                if(gradient.off !== true) {
                    newData.data[i + 0] = 255;
                    newData.data[i + 1] = 0;
                    newData.data[i + 2] = 0;
                    gradient.off = false;
                } else {
                    newData.data[i + 0] = 0;
                    newData.data[i + 1] = 0;
                    newData.data[i + 2] = 0;
                }

                // Perps off
                gradients[n].off = true;
                newData.data[n * channels + 0] = 0;
                newData.data[n * channels + 1] = 0;
                newData.data[n * channels + 2] = 0;
            }
            
            // Counters to keep track of x / y pixel coordinates
            if(++x === width) {
                x = 0;
                ++y;
            }
        }
        
        ASSERT(newData.data.length == width * height * channels);
        
        console.log(newData);
        
        return new RawTexture(newData);
    };
    
    /// Create a copy of this canvas.
    ///
    RawTexture.prototype.clone = function() {
        
        // TODO: can we handle this more gracefully?
        if( ! this._isLoaded) {
            throw new Error("RawTexture::clone() Cannot clone a non-loaded RawTexture.");
        }
        
        var data = context.createImageData(this._raw.width, this._raw.height);
        
        // Copy all the bytes
        // todo: perhaps we can use data.data.set(this._raw.data)
        for(var i = 0; i < data.data.length; ++i) {
            data.data[i] = this._raw.data[i];
        }
        
        return new RawTexture(data);
    };
    
    /// Turn this image into a luminance representation. Leaves alpha
    /// channels untouched.
    ///
    /// Weights used per channel (Rec. 709):
    ///    luminance = 0.2126*r + 0.7152*g + 0.0722*b
    /// 
    /// @return The current texture in luminance format.
    RawTexture.prototype.luminance = function() {
        var data = this._raw.data;
        for(var i = 0, y; i < data.length; i += this._channels) {
            y = 0.2126 * data[i + 0] + 
                0.7152 * data[i + 1] + 
                0.0722 * data[i + 2];
             
            data[i + 0] = y;
            data[i + 1] = y;
            data[i + 2] = y;
            
            // Alpha is left as-is.
            //data[i + 3] = 1;
        }
        
        return this;
    };
    
    RawTexture.prototype.prewitt = function() {
        return this.gradientMagnitude(RawTexture.Matrices.PrewittX, RawTexture.Matrices.PrewittY);
    };
    
    RawTexture.prototype.sobel = function() {
        return this.gradientMagnitude(RawTexture.Matrices.SobelX, RawTexture.Matrices.SobelY);
    };
    
    RawTexture.prototype.robertsCross = function() {
        return this.gradientMagnitude(RawTexture.Matrices.RobertsCrossX, RawTexture.Matrices.RobertsCrossY);
    };
    
    RawTexture.prototype.scharr = function() {
        return this.gradientMagnitude(RawTexture.Matrices.ScharrX, RawTexture.Matrices.ScharrY);
    };
    
    RawTexture.prototype.invert = function() {
        var source    = this._raw.data;
        var target    = this._raw.data;
         
        for(var i = 0; i < target.length; i += this._channels) {
            target[i + 0] = 255 - source[i + 0];
            target[i + 1] = 255 - source[i + 1];
            target[i + 2] = 255 - source[i + 2];
            //target[i + 3] = 255 - source;
        }
        
        return this;
    };
    
    RawTexture.prototype.sepia = function(intensity, depth) {
        // Assume sensible default values
        intensity  = isNaN(intensity) ? 2 : intensity;
        depth      = isNaN(depth) ? 20 : depth;
        
        var source    = this._raw.data;
        var target    = this._raw.data;
    
        // Precompute normalisation term
        var oneOverTree = 1 / 3;
    
        for(var i = 0; i < target.length; i += this._channels) {
            var grey = (source[i + 0] + source[i + 1] + source[i + 2]) * oneOverTree;
            
            target[i + 0] = Math.min(grey + depth * 2, 255);
            target[i + 1] = Math.min(grey + depth, 255);
            target[i + 2] = Math.min(grey - intensity, 255);
        }
        
        return this;
    };
    
    /// Apply a gaussian filter (low-pass) to the current image
    /// 
    /// @param {x} the x direction.
    /// @param {y} the y direction.
    /// @param {sigma} optional standard deviation. Defaults to 2.
    /// @return the modified (blurred) image.
    RawTexture.prototype.gaussian = function(x, y, sigma) {
        
        // Create a kernel matrix
        var matrix = new (M(x, y))();
        
        // Default sigma
        sigma = isNaN(sigma) ? 2 : sigma;
        
        var hr  = (matrix.numrows - 1) * 0.5;
        var hc  = (matrix.numcolumns - 1) * 0.5;
        var sum = 0;
        var sigmaPrecomputed = 2 * sigma * sigma;
        
        for(var row = 0; row < matrix.numrows; ++row) {
            for(var col = 0; col < matrix.numcolumns; ++col) {
                
                // Center the kernel
                var r = row - hr;
                var c = col - hc;
              
                // Guassian distribution
                var g = Math.exp(-(r * r + c * c) / sigmaPrecomputed);
                
                // Accumulate for normalisaton term
                sum += g;
                
                matrix.set(row, col, g);
            }
        }
        
        // Normalize here, more efficient than inside the convolute method
        matrix.multiply(1 / sum);
      
        return this.convolute(matrix, false);
    };
    
    RawTexture.prototype._gradient = function(xKernel, yKernel, channel) {
        channel    = isNaN(channel) ? 0 : channel;
        
        // Convolution computions
        var xImage = this.convolute(xKernel);
        var yImage = this.convolute(yKernel);
        
        // Shorthand access
        var xData  = xImage._raw.data;
        var yData  = yImage._raw.data;
        var width  = xImage._raw.width;
        var height = xImage._raw.height;
        
        // Output array
        var gradients  = new Array(width * height);
        
        // Calculate gradient origentation
        for(var i = channel, j = 0; i < xData.length; i += this._channels, ++j) {
            // Encode the gradient as a vector.
            gradients[j] = new Vector2(xData[i], yData[i]);
        };
        
        return gradients;
    };
    
    /// Apply two convolution kernels and determine the magnitude
    /// of the resulting gradient.
    ///
    /// @param {x} first matrix kernel
    /// @param {y} second matrix kernel
    /// @see prewitt
    /// @see sobel
    /// @see robertsCross
    /// @see scharr
    RawTexture.prototype.gradientMagnitude = function(x, y) {
        
        // Apply the kernel to each texture
        var x = this.convolute(x);
        var y = this.convolute(y);
        
        // A new copy
        var newRaw    = context.getImageData(0, 0, this._raw.width, this._raw.height);
        var target    = newRaw.data;

        // We take the magnatude of the gradent
        for(var i = 0; i < target.length; i += this._channels) {
            target[i + 0] = Math.sqrt(Math.pow(x._raw.data[i + 0], 2) + Math.pow(y._raw.data[i + 0], 2));
            target[i + 1] = Math.sqrt(Math.pow(x._raw.data[i + 1], 2) + Math.pow(y._raw.data[i + 1], 2));
            target[i + 2] = Math.sqrt(Math.pow(x._raw.data[i + 2], 2) + Math.pow(y._raw.data[i + 2], 2));
        }
        
        return new RawTexture(newRaw, null);
    };
    
    /// Apply a convolution matrix to the image. The alpha channel is
    /// left untouched (for now, anyway).
    ///
    /// @param {matrix} The kernel.
    /// @param {doNormalize} Whether or not to normalize the result.
    /// @return A new RawTexture instance with the convolution matrix applied.
    RawTexture.prototype.convolute = function(matrix, doNormalize) {
        var newRaw    = context.getImageData(0, 0, this._raw.width, this._raw.height);
        var target    = newRaw.data;
        var source    = this._raw.data;
        var width     = this._raw.width;
        var height    = this._raw.height;
        var channels  = this._channels;
        var normalize = (doNormalize === true) ? (1 / matrix.num) : 1;
                
        var hc = parseInt(matrix.numcolumns * 0.5, 10);
        var hr = parseInt(matrix.numrows * 0.5, 10);

        // The pixel range is clamped to an edge        
        function Index(x, y) {
            if(x < 0) {
                x = 0;
            }
            
            if(y < 0) {
                y = 0;
            }
            
            if(x > width - 1) {
                x = width - 1;
            }
            
            if(y > height - 1) {
                y = height - 1;
            }
            
            return y * channels * width + x * channels;
        }
        
        // For each pixel
        for(var i = 0, x = 0, y = 0; i < source.length; i += channels) {
            
            var r = 0;
            var g = 0;
            var b = 0;
            //var a = 0;
            
            // Apply matrix
            for(var row = 0; row < matrix.numrows; ++row) {
                for(var col = 0; col < matrix.numcolumns; ++col) {
                    var weight = matrix.at(row, col);
                    
                    var px = x - hc + col;
                    var py = y - hr + row;
                    
                    var index = Index(px, py);
                    
                    r += source[index + 0] * weight;
                    g += source[index + 1] * weight;
                    b += source[index + 2] * weight;
                    //a += source[index + 3] * weight;
                }
            }
            
            if(doNormalize) {
                target[i + 0] = r * normalize;
                target[i + 1] = g * normalize;
                target[i + 2] = b * normalize;            
                //target[index + 3] = a * normalize;
            } else {
                target[i + 0] = r;
                target[i + 1] = g;
                target[i + 2] = b;  
                //target[index + 3] = a;
            }
            
            // Counters to keep track of x / y pixel coordinates
            if(++x === width) {
                x = 0;
                ++y;
            }
        }        
        
        // We already have a copy, so may as well return the copy.
        return new RawTexture(newRaw, null);
    };
    
    /// Private method to load the raw data.
    ///
    /// @todo We're using two layers with callbacks, that is quite fragile and
    /// counter-intuitive. Figure a system with less callbacks.
    RawTexture.prototype._getRawByUrl = function(url) {
        
        this._url = url;
        
        var texture = new Texture(url, function(texture) {
            
            // Use the helper canvas
            canvas.width  = texture._image.width;
            canvas.height = texture._image.height;
    
            // Draw (and thus decode into RGBA)
            context.drawImage(texture._image, 0, 0);
        
            // Retrieve the binary data
            var data = context.getImageData(0, 0, canvas.width, canvas.height);
            
            // Update internals
            this._raw      = data;
            this.width     = data.width;
            this.height    = data.height;
            this.hw        = data.width * 0.5;
            this.hh        = data.height * 0.5;
            this._isLoaded = true;
           
            // User specified callback.
            if(typeof this._rawCallback == "function") {
                this._rawCallback(this);
            }
        }.bind(this));
    };
    
    /// Apply a per-channel classification based on an
    /// optional threshold. The resulting image will have
    /// either 0 (off) or 254 (on) as value per channel per pixel.
    ///
    /// @param {threshold} optional threshold figure. Defaults to 128
    /// @return the modified image
    RawTexture.prototype.binary = function(threshold) {
        threshold = threshold || 128;
        
        for(var i = this._raw.data.length-1; i >= 0; --i) {
            if(this._raw.data[i] > threshold) {
                this._raw.data[i] = 254;
            } else {
                this._raw.data[i] = 0;
            }
        }
        
        return this;
    };
    
    /// Split this image into 4 matrices, one for each color channel.
    /// 
    /// @return An object with 4 matrices as properties (r, g, b, a)
    RawTexture.prototype.asMatrix = function() {

        var source    = this._raw.data;
        var width     = this._raw.width;
        var height    = this._raw.height;
    
        var r = new (M(height, width))();
        var g = new (M(height, width))();
        var b = new (M(height, width))();
        var a = new (M(height, width))();

        for(var i = 0, j = 0; i < source.length; i += this._channels, ++j) {
            r._[j] = source[i + 0];
            g._[j] = source[i + 1];
            b._[j] = source[i + 2];
            a._[j] = source[i + 3];
        };
        
        return {
            r: r,
            g: g,
            b: b,
            a: a
        };
    };
    
    return RawTexture;
});
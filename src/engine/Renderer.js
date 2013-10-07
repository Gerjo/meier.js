

/// Canvas wrapper. Lateron I'll add WebGL as a drop-in replacement.
function Renderer(container, width, height) {
    
    // Create canvas element:
    var canvas            = this.canvas   = document.createElement("canvas");
    var context           = this.context  = this.canvas.getContext("2d");
    this.width            = canvas.width  = width;
    this.height           = canvas.height = height;
    this.hw               = this.width * 0.5
    this.hh               = this.height * 0.5;
    
    canvas.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
    canvas.style.position = "absolute";
    
    container.appendChild(canvas);
}

/// Save the current rotation/translation state.
Renderer.prototype.save = function() {
    this.context.save();
};

/// Restore the previously saved state:
Renderer.prototype.restore = function() {
    this.context.restore();
};

/// Transparently clear the canvas:
Renderer.prototype.clear = function() {
    this.context.clearRect(0, 0, this.width, this.height);
};

/// Clear the canvas with a solid fill color:
Renderer.prototype.clearSolid = function(color) {
    this.context.fillStyle = color;
    this.context.fillRect(0, 0, this.width, this.height);    
};

/// Clear the canvas with a solid fill color:
Renderer.prototype.clearTexture = function(texture) {
    this.context.drawImage(
            texture.image,  // The image
            0,              // Source X
            0,              // Source Y
            texture.width,  // Source width
            texture.height, // Source height
            0,              // Target X
            0,              // Target Y
            this.width,     // Target width
            this.height     // Target height
    );    
};

/// Rotate any subsequent draw calls:
Renderer.prototype.rotate = function(radians) {
    this.context.rotate(radians);
};

/// Translate all subsequent draw calls:
Renderer.prototype.translate = function(x, y) {
    this.context.translate(x, y);
};

/// Draw a rectangle:
/// Accepts:
/// [Rectangle]
/// [Number, Number, Number, Number]
/// [Vector, Number, Number]
Renderer.prototype.rectangle = function(a, b, c, d) {
    if(a instanceof Rectangle) {
        this.context.rect(a.min.x, a.min.y, a.width(), a.height());
    
    } else if(a instanceof Vector) {
        this.context.rect(a.x, a.y, b, c);
    
    } else {
        this.context.rect(a, b, c, d);
    }
};

/// Draw a texture:
/// Accepts:
/// [Texture, Number, Number]
/// [Texture, Number, Number, Number, Number]
Renderer.prototype.texture = function(texture, x, y, width, height) {
    
    // No width given, draw as-is:
    if(isNaN(width)) {
        width = texture.width;
    }
    
    // No height given, draw as-is:
    if(isNaN(height)) {
        height = texture.height;
    }
    
    this.context.drawImage(
            texture.image,  // The image
            0,              // Source X
            0,              // Source Y
            texture.width,  // Source width
            texture.height, // Source height
            x,              // Target X
            y,              // Target Y
            width,          // Target width
            height          // Target height
    );    
};

/// Start a new set of drawing calls.
Renderer.prototype.begin = function() {
    this.context.beginPath();
};

/// Accepts:
/// [number, number, number]
/// [Vector, number]
/// [Disk]
Renderer.prototype.circle = function(a, b, c) {
    if(a instanceof Vector) {
        this.context.moveTo(a.x + b, a.y);
        this.context.arc(a.x, a.y, b, 0, 2 * Math.PI);
        
    } else if(a instanceof Disk) {
        this.context.moveTo(a.position.x + a.radius, a.position.y);
        this.context.arc(a.position.x, a.position.y, a.radius, 0, 2 * Math.PI);
        
    } else {
        this.context.moveTo(a + c, b);
        this.context.arc(a, b, c, 0, 2 * Math.PI);
    }
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
    if(a instanceof Vector) {
        this.context.arc(a.x, a.y, b, c, d);
    } else {
        this.context.arc(a, b, c, d, e);
    }
};

/// Accepts:
/// [LineSegment]
/// [Vector, Vector]
/// [Number, Number, Number, Number]
Renderer.prototype.line = function(a, b, c, d) {
    if(a instanceof LineSegment) {
        this.context.moveTo(a.a.x, a.a.y);
        this.context.lineTo(a.b.x, a.b.y);
    } else if(a instanceof Vector && b instanceof Vector) {
        this.context.moveTo(a.x, a.y);
        this.context.lineTo(b.x, b.y);
    } else {
        this.context.moveTo(a, b);
        this.context.lineTo(c, d);
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
    this.context.fillText(string, x, y);
};

/// Accepts: 
/// [Vector]
/// [Number, Number]
Renderer.prototype.vector = function(a, b) {
    this.context.moveTo(0, 0);
    
    if(a instanceof Vector) {
        this.context.lineTo(a.x, a.y);
    } else {
        this.context.lineTo(a, b);
    }
};

/// Accepts:
/// [Array of Vector]
/// NB: automatically closes the loop, if not closed.
Renderer.prototype.polygon = function(vertices) {
    
    this.context.moveTo(vertices[0].x, vertices[0].y);
    
    for(var i = 1; i < vertices.length; ++i) {
        this.context.lineTo(vertices[i].x, vertices[i].y);
    }
    
    // Close the polygon loop:
    if( ! vertices.first().equals(vertices.last())) {
        this.context.lineTo(vertices[0].x, vertices[0].y);
    }  
};

/// Fill all draw calls since begin() with a given color.
Renderer.prototype.fill = function(color) {
    this.context.fillStyle = color;
    this.context.fill();
};

/// Stroke the outline of all draw calls since begin() with a given color.
Renderer.prototype.stroke = function(color) {
    this.context.strokeStyle = color;
    this.context.stroke();
};

/// Accepts:
/// [LineSegment]
/// [Vector, Vector]
/// [Number, Number, Number, Number]
Renderer.prototype.arrow = function(a, b, c, d) {
    var fromX, fromY, toX, toY;
    
    if(a instanceof LineSegment) {
        fromX = a.a.x;
        fromY = a.a.y;
        toX   = a.b.x;
        toY   = a.b.y;
    
    } else if(a instanceof Vector && b instanceof Vector) {
        fromX = a.x;
        fromY = a.y;
        toX   = b.x;
        toY   = b.y;
        
    } else {
        fromX = a;
        fromY = b;
        toX   = c;
        toY   = d;
    }
    
    var headlen = 10;   // length of head in pixels
    var angle = Math.atan2(toY - fromY, toX - fromX);
    this.context.moveTo(fromX, fromY);
    this.context.lineTo(toX, toY);
    this.context.lineTo(
        toX - headlen * Math.cos(angle - Math.PI / 6),
        toY - headlen * Math.sin(angle - Math.PI / 6)
    );
    this.context.moveTo(toX, toY);
    this.context.lineTo(
        toX - headlen * Math.cos(angle + Math.PI / 6),
        toY - headlen * Math.sin(angle + Math.PI / 6)
    );
};



/// Canvas wrapper. Lateron I'll add WebGL as a drop-in replacement.
function Renderer(container, width, height) {
    
    // Create canvas element:
    var canvas            = this.canvas   = document.createElement("canvas");
    var context           = this.context  = this.canvas.getContext("2d");
    this.width            = canvas.width  = width;
    this.height           = canvas.height = height;
    canvas.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
    canvas.style.position = "absolute";
    
    container.appendChild(canvas);
}

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

/// Draw a texture:
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

Renderer.prototype.begin = function() {
    this.context.beginPath();
};

/// Accepts:
/// [number, number, number]
/// [Vector, number]
Renderer.prototype.circle = function(x, y, r) {
    if(x instanceof Vector) {
        this.context.arc(x.x, x.y, y, 0, 2 * Math.PI);
        
    } else {
        this.context.arc(x, y, r, 0, 2 * Math.PI);
    }
};

/// Accepts:
/// [LineSegment]
/// [Vector, Vector]
Renderer.prototype.linesegment = function(a, b) {
    if(a instanceof LineSegment) {
        this.context.moveTo(a.a.x, a.a.y);
        this.context.lineTo(a.b.x, a.b.y);
        
    } else if(a instanceof Vector) {
        this.context.moveTo(a.x, a.y);
        this.context.lineTo(b.x, b.y);
    }
};

Renderer.prototype.text = function(string, x, y, color, align, font) {
    
    if(!color) {
        color = "black";
    }
    
    if(!align) {
        align = "center";
    }
    
    if(!font) {
        font = "bold 14px monospace";
    }
    
    this.context.font      = font;
    this.context.fillStyle = color;
    this.context.textAlign = align;
    
    this.context.fillText(string, x, y);
};

Renderer.prototype.vector = function(vector) {
    this.context.moveTo(0, 0);
    this.context.lineTo(vector.x, vector.y);
};

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

Renderer.prototype.fill = function(color) {
    this.context.fillStyle = color;
    this.context.fill();
};

Renderer.prototype.stroke = function(color) {
    this.context.strokeStyle = color;
    this.context.stroke();
};

// Alias:
var Point = Vector;

function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.angleBetween = function(other) {
    
    var angle = Math.acos(
        this.dot(other) / Math.sqrt(this.lengthSQ() * other.lengthSQ())
    );
    
    if(-this.y * other.x + this.x * other.y < 0) {
        //Math.PI + Math.PI - angle;
        return -angle; // Nagative sigh.
    }
    
    return angle;
};

Vector.prototype.equals = function(other) {
    return this.x == other.x && this.y == other.y;
};

Vector.prototype.clone = function() {
    return new Vector(this.x, this.y);
};

Vector.prototype.addScalar = function(scalar) {
    this.x += scalar; 
    this.y += scalar;
    return this;
};

Vector.prototype.dot = function(o) {
    return this.x * o.x + this.y * o.y;
};


Vector.prototype.add = function(o) {
    this.x += o.x; 
    this.y += o.y;
    return this;
};

Vector.prototype.flip = function() {
    var x  = this.x
    this.x = this.y; 
    this.y = x;
    return this;
};

Vector.prototype.subtract = function(o) {
    this.x -= o.x; 
    this.y -= o.y;
    return this;
};

Vector.prototype.distance = function(o) {
    return Math.sqrt(Math.pow(this.x - o.x, 2) + Math.pow(this.y - o.y, 2));
};

Vector.prototype.distanceSQ = function(o) {
    return Math.pow(this.x - o.x, 2) + Math.pow(this.y - o.y, 2);
};

Vector.prototype.perp = function() {
    var tmp = -this.x;
    this.x = this.y;
    this.y = tmp;
    
    return this;
};

/// Cross product in 2D, ask Bojan.
///
/// Same as the determinant of a 2x2 matrix:
/// | x1 x2 |
/// | y1 y2 | = x1*y2 - x2*y1  
///
/// Parallel lines have a determinant/crossproduct of 0.
Vector.prototype.cross = function(other) {
    return this.x * other.y - this.y * other.x;
};

Vector.prototype.length = function(o) {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
};

Vector.prototype.lengthSQ = function(o) {
    return Math.pow(this.x, 2) + Math.pow(this.y, 2);
};

Vector.prototype.trim = function(length) {
    // TODO: do this without sqrt?
    
    // Divide by zero is OK. You should've checked
    // before trimming.
    var l = length / (Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)));
    
    this.x *= l;
    this.y *= l;
    
    return this;
};

Vector.prototype.scale = function(o) {
    this.x *= o.x; 
    this.y *= o.y;
    return this;
};

Vector.prototype.scaleScalar = function(scalar) {
    this.x *= scalar; 
    this.y *= scalar;
    return this;
};

Vector.prototype.normalize = function(o) {
    var len = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    
    // I'd rather have NaN than weird math.
    //if(len !== 0) {
        len = 1 / len;
        this.x *= len; 
        this.y *= len;
    //}
    
    return this;
};

/// Using one of the following:
/// a . b      |  a . b
/// -----  b   |  ----- b 
///  |a|       |  b . b
///
/// "other" (b) is more of a line through origin 
/// than vector with a given magnitude.
///
Vector.prototype.project = function(other) {
    var r = this.dot(other) / other.dot(other);
        
    return new Vector(
        r * other.x,
        r * other.y
    );
    
    /*
    
    var dot = this.dot(other);
    var l = this.lengthSQ();
    
    // Wut? this works? what?
    var tmp = l / dot;
    
    return new Vector(
        tmp * other.x,
        tmp * other.y
    );*/
};

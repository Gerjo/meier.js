
// Several aliases to make intents of algorithms more obvious.
// Box aligned to X & Y axis:
var AABoundingBox = Rectangle; 

///
/// Special note: min should always be less than max. Internal
/// algorithms are optimized for that assumption.
///
///
///
/// This is what a rectangle looks like:
/// +----------+
/// |          |
/// |          |
/// |          | 
/// +----------+
///
function Rectangle(a, b, c, d) {
    this.min = new Point(a, b);
    this.max = new Point(c, d);
}

Rectangle.prototype.clone = function() {
    return new Rectangle(this.min.x, this.min.y, this.max.x, this.max.y);
};

Rectangle.prototype.intersects = function(other) {
    return Intersection.Test.Rectangles(this, other);
};

Rectangle.prototype.containsPoint = function(point) {
    return this.min.x <= point.x && this.max.x >= point.x &&
           this.min.y <= point.y && this.max.y >= point.y;
};

Rectangle.prototype.containsX = function(x) {
    return this.min.x <= x && this.max.x >=x;
};

Rectangle.prototype.containsY = function(y) {
    return this.min.y <= y && this.max.y >= y;
};

Rectangle.prototype.center = function() {
    return new Point(
        this.min.x + (this.max.x - this.min.x) * 0.5,
        this.min.y + (this.max.y - this.min.y) * 0.5
    );
};

Rectangle.prototype.width = function() {
    return this.max.x - this.min.x;
};

Rectangle.prototype.height = function() {
    return this.max.y - this.min.y;
};

Rectangle.prototype.halfWidth = function() {
    return (this.max.x - this.min.x) * 0.5;
};

Rectangle.prototype.halfHeight = function() {
    return (this.max.y - this.min.y) * 0.5;
};

Rectangle.prototype.top = function() {
    return new LineSegment(
        this.min.x, this.max.x,
        this.min.y, this.min.y
    );
};

Rectangle.prototype.bottom = function() {
    return new LineSegment(
        this.min.x, this.max.x,
        this.max.y, this.max.y
    );
};

Rectangle.prototype.left = function() {
    return new LineSegment(
        this.min.x, this.min.x,
        this.min.y, this.max.y
    );
};

Rectangle.prototype.right = function() {
    return new LineSegment(
        this.max.x, this.max.x,
        this.min.y, this.max.y
    );
};

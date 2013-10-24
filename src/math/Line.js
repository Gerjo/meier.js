define(function(require) {
    var Vector = require("meier/math/Vector");
    var Point  = Vector;
    
    /// Accepts:
    /// [Vector, Vector]
    /// [number, number, number, number]
    function LineSegment(a, b, c, d) {
    
        if(a instanceof Vector) {
            this.a = a;
            this.b = b;
        } else {
            this.a = new Point(a, b);
            this.b = new Point(c, d);
        }
    }

    /// Compute the angle between two lines:
    LineSegment.prototype.angleBetween = function(other) {
        // TODO: can we optimize this?
        return this.direction().angleBetween(other.direction);
    };

    /// Compute the angle of direction:
    LineSegment.prototype.angle = function() {
        return this.direction().angle();
    };

    LineSegment.prototype.middle = function() {
        return new Vector(
            LerpFloat(this.a.x, this.b.x, 0.5),
            LerpFloat(this.a.y, this.b.y, 0.5)
        );
    };

    LineSegment.prototype.clone = function() {
        return new LineSegment(this.a.x, this.a.y, this.b.x, this.b.y);
    };

    LineSegment.prototype.direction = function() {
        return new Vector(
            this.b.x - this.a.x,
            this.b.y - this.a.y 
        );
    };

    /// Horizontal line's slope is 0
    /// Vertical line's slope is Infinity (that's what javscript comes up with)
    LineSegment.prototype.slope = function() {
        var d = this.direction();
        return d.y / d.x;
    };

    LineSegment.prototype.lengthSQ = function() {
        return Math.pow(this.b.x - this.a.x, 2) + Math.pow(this.b.y - this.a.y, 2);
    };

    LineSegment.prototype.length = function() {
        return Math.sqrt(Math.pow(this.b.x - this.a.x, 2) + Math.pow(this.b.y - this.a.y, 2));
    };

    LineSegment.prototype.project = function(axis) {
        return new LineSegment(
            this.a.project(axis),
            this.b.project(axis)
        );
    };

return LineSegment;

});

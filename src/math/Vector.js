/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {

    MeierVector.CreateAngular = function(rotation, radius) {
        radius = radius || 1;
    
        return new MeierVector(Math.cos(rotation) * radius,  Math.sin(rotation) * radius);
    }

    function MeierVector(x, y) {
        this.x = x;
        this.y = y;
    }

    /// Mostly used for serialisation, such as used by localStorage.
    MeierVector.prototype.toString = function() {
        return '{"x":' + this.x + ',"y":' + this.y + "}";
    };

    MeierVector.prototype.angleBetween = function(other) {
    
        var angle = Math.acos(
            this.dot(other) / Math.sqrt(this.lengthSQ() * other.lengthSQ())
        );
    
        if(-this.y * other.x + this.x * other.y < 0) {
            //Math.PI + Math.PI - angle;
            return -angle; // Negative sigh.
        }
    
        return angle;
    };

    MeierVector.prototype.angle = function() {
        return Math.atan2(this.y, this.x);
    }

    MeierVector.prototype.equals = function(other) {
        return this.x == other.x && this.y == other.y;
    };

    MeierVector.prototype.clone = function() {
        return new MeierVector(this.x, this.y);
    };

    MeierVector.prototype.addScalar = function(scalar) {
        this.x += scalar; 
        this.y += scalar;
        return this;
    };

    MeierVector.prototype.dot = function(o) {
        return this.x * o.x + this.y * o.y;
    };


    MeierVector.prototype.add = function(o) {
        this.x += o.x; 
        this.y += o.y;
        return this;
    };

    MeierVector.prototype.flip = function() {
        var x  = this.x
        this.x = this.y; 
        this.y = x;
        return this;
    };

    MeierVector.prototype.subtract = function(o) {
        this.x -= o.x; 
        this.y -= o.y;
        return this;
    };

    MeierVector.prototype.distance = function(o) {
        return Math.sqrt(Math.pow(this.x - o.x, 2) + Math.pow(this.y - o.y, 2));
    };

    MeierVector.prototype.distanceSQ = function(o) {
        return Math.pow(this.x - o.x, 2) + Math.pow(this.y - o.y, 2);
    };

    MeierVector.prototype.perp = function() {
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
    MeierVector.prototype.cross = function(other) {
        return this.x * other.y - this.y * other.x;
    };

    MeierVector.prototype.length = function(o) {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };

    MeierVector.prototype.lengthSQ = function(o) {
        return Math.pow(this.x, 2) + Math.pow(this.y, 2);
    };

    MeierVector.prototype.trim = function(length) {
        // TODO: do this without sqrt?
    
        // Division by zero is OK. You should've checked
        // before trimming.
        var l = length / (Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)));
    
        this.x *= l;
        this.y *= l;
    
        return this;
    };

    MeierVector.prototype.scale = function(o) {
        this.x *= o.x; 
        this.y *= o.y;
        return this;
    };

    MeierVector.prototype.scaleScalar = function(scalar) {
        this.x *= scalar; 
        this.y *= scalar;
        return this;
    };

    MeierVector.prototype.normalize = function(o) {
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
    /// than MeierVector with a given magnitude.
    ///
    MeierVector.prototype.project = function(other) {
        var r = this.dot(other) / other.dot(other);
        
        return new MeierVector(
            r * other.x,
            r * other.y
        );
    
        /*
    
        var dot = this.dot(other);
        var l = this.lengthSQ();
    
        // Wut? this works? what?
        var tmp = l / dot;
    
        return new MeierVector(
            tmp * other.x,
            tmp * other.y
        );*/
    };

    return MeierVector;
});

/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Vector = require("meier/math/Vec")(2);
    var Lerp   = require("meier/math/Lerp");
    var M22    = require("meier/math/Mat")(2, 2)
    /// Accepts:
    /// [Vector, Vector]
    /// [number, number, number, number]
    function MeierLineSegment(a, b, c, d) {
            
        if(a && a._) {
            this.a = a;
            this.b = b;
                        
        } else {
            this.a = new Vector(a, b);
            this.b = new Vector(c, d);
        }
    }

    /// Compute the angle between two lines:
    MeierLineSegment.prototype.angleBetween = function(other) {
        // TODO: can we optimize this?
        return this.direction().angleBetween(other.direction);
    };

    /// Compute the angle of direction:
    MeierLineSegment.prototype.angle = function() {
        return this.direction().angle();
    };

    MeierLineSegment.prototype.middle = function() {
        return new Vector(
            Lerp.Float(this.a.x, this.b.x, 0.5),
            Lerp.Float(this.a.y, this.b.y, 0.5)
        );
    };

    MeierLineSegment.prototype.clone = function() {
        return new MeierLineSegment(this.a.x, this.a.y, this.b.x, this.b.y);
    };

    MeierLineSegment.prototype.direction = function() {
        return new Vector(
            this.b.x - this.a.x,
            this.b.y - this.a.y 
        );
    };

    /// Horizontal line's slope is 0
    /// Vertical line's slope is Infinity (that's what javscript comes up with)
    MeierLineSegment.prototype.slope = function() {
        var d = this.direction();
        return d.y / d.x;
    };

    MeierLineSegment.prototype.lengthSQ = function() {
        return Math.pow(this.b.x - this.a.x, 2) + Math.pow(this.b.y - this.a.y, 2);
    };

    MeierLineSegment.prototype.length = function() {
        return Math.sqrt(Math.pow(this.b.x - this.a.x, 2) + Math.pow(this.b.y - this.a.y, 2));
    };

    MeierLineSegment.prototype.project = function(axis) {
        return new MeierLineSegment(
            this.a.project(axis),
            this.b.project(axis)
        );
    };
    
    MeierLineSegment.prototype.rotate = function(theta) {
        
        var m = new M22([
                Math.cos(theta), -Math.sin(theta), 
                Math.sin(theta),  Math.cos(theta)
        ]);
        
        return new MeierLineSegment(
            m.transform(this.a),
            m.transform(this.b)
        );
    };

    return MeierLineSegment;

});

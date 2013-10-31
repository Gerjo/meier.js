/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Vector = require("meier/math/Vector");
    var Round  = require("meier/math/Math").Round;
    
    /// 3x3 MeierMatrix for 2D vectors. Everything is as mutable
    /// as possible.
    /// 
    function MeierMatrix(array) { 
    
        if(array instanceof Array) {
            this[0] = array.splice(0, 3);
            this[1] = array.splice(0, 3);
            this[2] = array.splice(0, 3);
        } else {
            this[0] = [1, 0, 0];
            this[1] = [0, 1, 0];
            this[2] = [0, 0, 1];
        }
    
        // Adding a length property makes this object
        // behave as an array in loops.
        this.length = 3;
    }

    MeierMatrix.CreateIdentity = function() {
        return new MeierMatrix();
    };

    /// Acccepts:
    /// [number, number]
    /// [Vector]
    MeierMatrix.CreateTranslation = function(x, y) {
        if(x instanceof Vector) {
            return new MeierMatrix([
                1, 0, x.x,
                0, 1, x.y,
                0, 0, 1
            ]);
        }
    
        return new MeierMatrix([
            1, 0, x,
            0, 1, y,
            0, 0, 1
        ]);
    };

    MeierMatrix.CreateRotation = function(radians) {
        var m = new MeierMatrix();
    
        var c = Math.cos(radians);
        var s = Math.sin(radians);
    
        m[0][0] =  c;
        m[0][1] = -s;
        m[1][0] =  s;
        m[1][1] =  c;
    
        return m;
    };

    MeierMatrix.prototype.clone = function() {
        var m = new MeierMatrix();
    
        m[0] = this[0].clone();
        m[1] = this[1].clone();
        m[2] = this[2].clone();
    
        return m;
    };


    MeierMatrix.prototype.cofactors = function() {
        var m = new MeierMatrix();
    
        // 2x2 determinant:
        var determinant = function(a,b,c,d) {
            return a * d - b * c;
        };
    
        /// Signs:
        /// + - +
        /// - + -
        /// + - +
        
        // Directly compute the determinant of the minors:
        m[0][0] = determinant(this[1][1], this[1][2], this[2][1], this[2][2]);
        m[0][1] = -determinant(this[1][0], this[1][2], this[2][0], this[2][2]);
        m[0][2] = determinant(this[1][0], this[1][1], this[2][0], this[2][1]);

        m[1][0] = -determinant(this[0][1], this[0][2], this[2][1], this[2][2]);
        m[1][1] = determinant(this[0][0], this[0][2], this[2][0], this[2][2]);
        m[1][2] = -determinant(this[0][0], this[0][1], this[2][0], this[2][1]);
    
        m[2][0] = determinant(this[0][1], this[0][2], this[1][1], this[1][2]);
        m[2][1] = -determinant(this[0][0], this[0][2], this[1][0], this[1][2]);
        m[2][2] = determinant(this[0][0], this[0][1], this[1][0], this[1][1]);
    
        return m;
    };

    // Immutable, since it needs a tmp copy anyway.
    MeierMatrix.prototype.product = function(other) {
        var m = new MeierMatrix();
    
        var t = this;
        var o = other;
    
        // First row:
        m[0][0] = t[0][0] * o[0][0] + t[0][1] * o[1][0] + t[0][2] * o[2][0];
        m[0][1] = t[0][0] * o[0][1] + t[0][1] * o[1][1] + t[0][2] * o[2][1];
        m[0][2] = t[0][0] * o[0][2] + t[0][1] * o[1][2] + t[0][2] * o[2][2];
    
        // Second row:
        m[1][0] = t[1][0] * o[0][0] + t[1][1] * o[1][0] + t[1][2] * o[2][0];
        m[1][1] = t[1][0] * o[0][1] + t[1][1] * o[1][1] + t[1][2] * o[2][1];
        m[1][2] = t[1][0] * o[0][2] + t[1][1] * o[1][2] + t[1][2] * o[2][2];
    
        // Third row:
        m[2][0] = t[2][0] * o[0][0] + t[2][1] * o[1][0] + t[2][2] * o[2][0];
        m[2][1] = t[2][0] * o[0][1] + t[2][1] * o[1][1] + t[2][2] * o[2][1];
        m[2][2] = t[2][0] * o[0][2] + t[2][1] * o[1][2] + t[2][2] * o[2][2];
    
        return m;
    };

    // Helper for the forgetfull. New MeierMatrix!
    MeierMatrix.prototype.adjugate = function() {
        return this.cofactors().transpose();
    };

    MeierMatrix.prototype.multiply = function(scalar) {
    
        if(typeof scalar != 'number') {
            throw new Error("Can only multiply a MeierMatrix by a number. Did you mean to take the product?");
        }
    
        this[0][0] *= scalar;
        this[0][1] *= scalar;
        this[0][2] *= scalar;
        this[1][0] *= scalar;
        this[1][1] *= scalar;
        this[1][2] *= scalar;   
        this[2][0] *= scalar;
        this[2][1] *= scalar;
        this[2][2] *= scalar;
        return this;
    };

    MeierMatrix.prototype.transpose = function() {
    
        var toggle = function(a, aa, b, bb) {
            var tmp     = this[a][aa];
            this[a][aa] = this[b][bb];
            this[b][bb] = tmp;
        }.bind(this);
    
        toggle(0, 1, 1, 0);
        toggle(0, 2, 2, 0);
        toggle(1, 2, 2, 1);
    
        return this;
    };

    /// Note: this is a generic inverse. There might
    /// be better ways. E.g., for a rotation MeierMatrix simply
    /// flipping the angle will be fine.
    /// new MeierMatrix!
    MeierMatrix.prototype.inverse = function() {
    
        // Determinant of original MeierMatrix:
        var determinant = this.determinant();
    
        // Awwww... you've found a singularity.
        if(determinant === 0) {
            throw new Error("Cannot inverse a MeierMatrix with a determinant of 0.");
        }
    
    
        var adj = this.adjugate();

        adj.multiply(1 / determinant);
    
        return adj;
    };

    /// Special method for vectors only:
    MeierMatrix.prototype.transform = function(vector) {
        return new Vector(
            this[0][0] * vector.x + this[0][1] * vector.y + this[0][2],
            this[1][0] * vector.x + this[1][1] * vector.y + this[1][2]
        );
    };

    MeierMatrix.prototype.trace = function() {
        return this[0][0] + this[1][1] + this[2][2];
    };

    MeierMatrix.prototype.determinant = function() {
        return (this[0][0] * this[1][1] * this[2][2]) +
               (this[0][1] * this[1][2] * this[2][0]) +
               (this[0][2] * this[1][0] * this[2][1]) -
               (this[0][2] * this[1][1] * this[2][0]) -
               (this[0][1] * this[1][0] * this[2][2]) -
               (this[0][0] * this[1][2] * this[2][1]);
    };

    MeierMatrix.prototype.toString = function() {
        return JSON.stringify(this);
    };
    
    MeierMatrix.prototype.pretty = function() {
        var out = "", n, l = 8;
        
        for(var row = 0; row < this.length; ++row) {
            for(var col = 0; col < this[row].length; ++col) {
                n = Round(this[row][col], 3) + "";
                
                out += n;
                
                for(var i = n.length; i < l; ++i) {
                    out += " ";
                }
            }
            
            out += "\n";
        }
        
        return out;
    };
    
    return MeierMatrix;
});
/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Vector = require("meier/math/Vector");
    
    
    /// Attempt to automatically deduce which type
    /// to Lerp. Relies on ducktyping.
    function Lerp(a, b, t) {
        if(a._ && a.numrows) {
            return Lerp.Vector(a, b, t);
        
        } else if(typeof a == "number") {
            return Lerp.Float(a, b, t);
            
        } else if(a instanceof Array && a.length == 4) {
            return Lerp.Color(a, b, t);
        
        } else {
            throw new Error("Cannot deduce required LERP type.");
        }
    }
    
    /// Lerp numbers
    Lerp.Float = function (a, b, t) {
        return a * (1 - t) + b * t;
    };

    /// Lerp, with rounding.
    Lerp.Int = function (a, b, t) {
        return Math.round(a * (1 - t) + b * t);
    };

    /// Lerp an RGBA color. Colors are R, G, B, A arrays.
    Lerp.Color = function (a, b, t) {
        return "rgba(" + Lerp.Int(a[0],   b[0], t) + ", " +
                         Lerp.Int(a[1],   b[1], t) + ", " +
                         Lerp.Int(a[2],   b[2], t) + ", " +
                         Lerp.Float(a[3], b[3], t) + ")";
    };

    /// Lerp for vectors:
    Lerp.Vector = function(a, b, t) {
        return new Vector(
            a.x * (1 - t) + b.x * t,
            a.y * (1 - t) + b.y * t
        );
    };
    
    return Lerp;
});
/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    
    var MersenneTwister = require("meier/contrib/MersenneTwister");
    var Vector = require("meier/math/Vector");
    
    
    var mt = new MersenneTwister();
    
    function Random(min, max, asFloat) {
        if(asFloat === true) {
            return Random.FloatInRange(min, max);
        } else {
            
            if(min > max) {
                var tmp = max;
                max = min;
                min = tmp;
            }
            
            var range = max - min;
            
            var max   = Math.floor(Math.pow(2, 32) / range) * range;
            
            var n;
            
            while((n = mt.nextInteger()) > max);
            
            return n % range + min;
        }
    }
    
    Random.Seed = function(seed) {
        mt.setSeed(seed);
    };
    
    /// [0..1]
    Random.Float = function() {
        return mt.nextFloat();
    };
    
    Random.Integer = function() {
        return mt.nextInteger();
    };
    
    Random.Boolean = function() {
        return mt.nextBoolean();
    };
    
    /// Depricated. Use Random(min, max, true);
    Random.FloatInRange = function(min, max) {
        console.log("Warning:using severely deprecated method. Use FloatInRange(min, max, true); instead.");
        
        return mt.nextFloat() * (max - min) + min;
    };

    /// Depricated. Use Random(min, max);
    Random.IntegerInRange = function(min, max) {
        console.log("Warning:using severely deprecated method. Use IntegerInRange(min, max, true); instead.");
        
        return Math.round(mt.nextFloat() * (max - min) + min);
    };
    
    Random.Byte = function() {
        return Math.round(255 * mt.nextFloat());
    };
    
    /// Array of floating points
    Random.FloatArray = function(size) {
        var r = new Array(size);
        
        while(size--) {
            r[size] = mt.nextFloat();
        }
        
        return r;
    };
    
    /// Array of integers:
    Random.IntegerArray = function(size) {
        var r = new Array(size);
        
        while(size--) {
            r[size] = mt.nextInteger();
        }
        
        return r;
    };
    
    /// Array of booleans:
    Random.BooleanArray = function(size) {
        var r = new Array(size);
        
        while(size--) {
            r[size] = mt.nextBoolean();
        }
        
        return r;
    };
    
    Random.RangeArray = function(size, min, max) {
        var r = new Array(size);
        
        while(size--) {
            r[size] = mt.nextFloat() * (max - min) + min;
        }
        
        return r;
    };
    
    /// Returns a random vector distributed on a unit circle.
    Random.Vector = function() {
        var tan = mt.nextFloat() * Math.PI * 2;
        
        return new Vector(Math.cos(tan), Math.sin(tan));
    };
    
    
    return Random;
});

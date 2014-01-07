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
            return Random.IntegerInRange(min, max);
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
    
    /// Depricated.
    Random.Range = function(min, max) {
        console.log("Warning:using severely deprecated method. Use Random(min, max, true); instead.");
        return mt.nextFloat() * (max - min) + min;
    };
    
    /// Depricated. Use Random(min, max, true);
    Random.FloatInRange = function(min, max) {
        return mt.nextFloat() * (max - min) + min;
    };

    /// Depricated. Use Random(min, max);
    Random.IntegerInRange = function(min, max) {
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

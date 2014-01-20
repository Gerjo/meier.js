/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/


define(function(require) {
    var Vector = require("meier/math/Vector");

    /// Create a disk that represents a circumcircle running
    /// through the 3 given coordinates.
    ///
    Disk.CreateCircumcircle = function(a, b, c) {
        var disk = new Disk(0, 0, 0);
        
        var bPos = b.clone().subtract(a);
        var cPos = c.clone().subtract(a);
        var d    = 2 * (bPos.x * cPos.y - bPos.y * cPos.x);
                
        // Vertices are collinear, anything fits in the radius.
        if (Math.abs(d) < 0.000001) {
            disk.radius   = Number.MAX_VALUE;
            disk.radiusSQ = 0;
            
        } else {
            disk.position.x = a.x + (cPos.y * bPos.lengthSQ() - bPos.y * cPos.lengthSQ()) / d;
            disk.position.y = a.y + (bPos.x * cPos.lengthSQ() - cPos.x * bPos.lengthSQ()) / d;
            
            disk.radiusSQ = a.distanceSQ(disk.position);
            disk.radius   = Math.sqrt(disk.radiusSQ);    
        }
        
        return disk;
    };


    /// center [x, y] and radius [r]
    /// (x - a)^2 + (y - b)^2 = r^2
    function Disk(x, y, r) {
    
        if(x && (x.hasOwnProperty('x') || x._)) {
            this.position = x;
            this.radius   = y;
        } else {
            this.position = new Vector(x || 0, y || 0);
            this.radius   = r;
        }
    }

    Disk.prototype.clone = function() {
        return new Disk(this.position.x, this.position.y, this.radius);
    };
    
    Disk.prototype.signedDistance = function(other) {
        return Math.sqrt(Math.pow((other.x - this.position.x), 2) + Math.pow((other.y - this.position.y), 2)) - this.radius;
    };
    
    Disk.prototype.distance = function(other) {
        return Math.abs(Math.sqrt(Math.pow((other.x - this.position.x), 2) + Math.pow((other.y - this.position.y), 2)) - this.radius);
    };


    return Disk;
});
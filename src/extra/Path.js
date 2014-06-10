/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var LineSegment  = require("meier/math/Line");
    var Vector       = require("meier/math/Vec")(2);
    var Intersection = require("meier/math/Intersection");


    var self = {
        NearestAdvance: function(path, point, distance) {
            var bestIndex    = -1;
            var bestDistance = Infinity;

            var dist, p, best, segment;

            for(var i = 1; i < path.length; ++i) {
                segment = new LineSegment(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
                p    = Intersection.Nearest.PointOnLineSegment(point, segment);

                // TODO: replace pow with abs?
                dist = Math.pow(point.x - p.x, 2) + Math.pow(point.y - p.y, 2);

                if(dist < bestDistance) {
                    bestDistance = dist;
        
                    best       = p;
                    bestIndex  = i - 1;
                } else {
        
                    // Naive, assume a path like structure.
                    // NB: doesnt work. and I know why.
                    //break;
                }
            }
        
            if(bestIndex == -1) {
                //console.log("Will crash soon. bestIndex == -1, path length:", path.length);
                return path.first().clone();
            }

            var preAbove, preRight, postRight, postAbove;
            var dir, len;
            var tentative = new Vector(0, 0);
            var timeout   = 10; // Maximum look ahead.

            do {
                // More "distance" linear:
                dir = path[bestIndex + 1].clone().subtract(path[bestIndex]).trim(distance);
                tentative.x = best.x + dir.x;
                tentative.y = best.y + dir.y;

                // Positions:
                preAbove   = best.y > path[bestIndex + 1].y;
                preRight   = best.x > path[bestIndex + 1].x;
                postAbove  = tentative.y > path[bestIndex + 1].y;
                postRight  = tentative.x > path[bestIndex + 1].x;

                // Are we still good? NB.: this is cheaper than a on-line-segment test.
                if(preAbove == postAbove && preRight == postRight) {
                    return tentative;
                } else {
                    // How much have we traveled so-far?
                    len = path[bestIndex + 1].distance(best);
        
                    // Reduce distance remaining:
                    distance -= len;
        
                    // Continue from current end point:
                    best = path[bestIndex + 1];
        
                    // New end point.
                    bestIndex++;
        
                    if(bestIndex >= path.length - 1) {
                        return path[bestIndex].clone();
                    }
                }

            } while(--timeout > 0);

            console.log("error state");
            return best; // At least go somewhere...
        }
    };
    
    
    return self;
});
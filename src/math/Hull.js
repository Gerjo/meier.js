/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function() {
    var Vector = require("meier/math/Vector");
    
    return {
        /// Calculate the convex hull that wraps a bunch of coordinates. Used
        /// to find the convex bounding hull of a concave polygon. This 
        /// implementation isn't efficient, but easy to implement.
        ///
        /// @param {coordinates} a bunch of coordinates.
        /// @return The convex hull wrapping the given coordinates.
        GiftWrap: function(coordinates) {
            var r = [];


            // Minimal amount for the code not the crash.
            if(coordinates.length > 0) {

                // Find left most coordinate:
                var left = coordinates.reduce(function(previous, current) {
                    if(current.x < previous.x) {
                        return current;
                    }

                    return previous;
                }, coordinates.first());

                var pointOnHull = left, endpoint, timeout = 100; 

                do {
    
                    r.push(pointOnHull);
                    endpoint = coordinates.first();
    
                    for(var j = 0; j < coordinates.length; ++j) {
        
                        // This does the same as the inlined version. Basically uses the
                        // dot product of the perpendicular vector - or 2x2 determinant
                        // with each column vector repesenting the matrix bases.
                        //var d = endpoint.clone().subtract(r.last());
                        //var isLeft = coordinates[j].clone().subtract(endpoint).cross(d) > 0;
        
                        // The inlined version:
                        var isLeft = (
                            (endpoint.x - r.last().x) * (coordinates[j].y - r.last().y) - 
                            (coordinates[j].x - r.last().x) * (endpoint.y - r.last().y)
                        ) > 0;
        
                        if(endpoint.equals(pointOnHull) || isLeft) {
                            endpoint = coordinates[j];
                        }
                    }
    
                    pointOnHull = endpoint;

                } while( ! r.first().equals(endpoint) && --timeout > 0 );
            }

            return r;
        }
        
    }; // End return.
});
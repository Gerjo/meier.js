/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    
    var Vector2   = require("meier/math/Vec")(2);
    var Rectangle = require("meier/math/Rectangle");
    
    var self = {
        
        /// Compute a convex hull of the given coordinates. This method is future proof as
        /// it will always use the fastest available implementation. Currently it's not
		/// too fast.
        Convex: function(coordinates) {
            return self.GiftWrap(coordinates);
        },
        
        AxisAlignedBox: function(hull) {
            var min = new Vector2(Infinity, Infinity);
            var max = new Vector2(-Infinity, -Infinity);
            
            hull.forEach(function(coordinate) {
                if(coordinate.x > max.x) {
                    max.x = coordinate.x;
                }
                
                if(coordinate.x < min.x) {
                    min.x = coordinate.x;
                }
                
                if(coordinate.y > max.y) {
                    max.y = coordinate.y;
                }
                
                if(coordinate.y < min.y) {
                    min.y = coordinate.y;
                }
            });
            
            return new Rectangle(min, max);
        },
        
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

                var pointOnHull = left, endpoint, timeout = 10000; 

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
        
    }; // End self.
    
    return self;
});
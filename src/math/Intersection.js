/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Vector      = require("meier/math/Vec")(2);
    var Line        = require("meier/math/Line");
    var Rectangle   = require("meier/math/Rectangle");
    var Disk        = require("meier/math/Disk");
    var Polynomial  = require("meier/math/Polynomial");

    // Publicly exposed interface:
    var exposed = {
        // Test-only, returns booleans. Internal math may
        // be optimized.
        Test: {
            RectangleLineSegment: function (rectangle, segment) {
                return CohenSutherlandClipping(segment.a.x, segment.a.y, segment.b.x, segment.b.y, rectangle, true);
            },
        
            RectangleRay: function (rectangle, ray) { 
                return rectangleRay(rectangle, ray, true); 
            },
        
            Rectangles: rectanglesTest,
        
            Segments: function(segmentA, segmentB) {
                return false !== lineSegmentsInteresection(segmentA, segmentB);
            },
        
            SegmentLine: function(segment, line) {
                var t = lines(segment.a, segment.b, line.a, line.b);
            
            
                if(t === false) {
                    return false;
                }
            
                // Bit of a hack. If the infinite lines would intersect, let's test if the
                // point of intersection lies on the segment, too.
                return (
                    (t.y >= Math.min(segment.a.y, segment.b.y) && t.y <= Math.max(segment.a.y, segment.b.y))
                    &&
                    (t.x >= Math.min(segment.a.x, segment.b.x) && t.x <= Math.max(segment.a.x, segment.b.x))
                );
            },
        
            DiskLineSegment: function(disk, line) { 
                return diskLine(disk, line, true, true); 
            },
        
            DiskLine: function(disk, line) { 
                return diskLine(disk, line, true, false); 
            },
        
            Lines: function (lineA, lineB) {
                return false !== lines(lineA.a, lineA.b, lineB.a, lineB.b);
            },
            
            PointInObb: function(point, boxCenter, boxWidth, boxHeight, boxRotation) {
                return pointInObb(point, boxCenter, boxWidth, boxHeight, boxRotation);
            },
            
            PointInRectangle: function(point, rectangle) {
                // Uncertain about "rectangle.min".
                return pointInObb(point, rectangle.min, rectangle.width(), rectangle.height(), 0);
            },
            
            DiskRectangle: diskRectangle,
        },
    
        // Getters, returns data if available, else false.
        // Will be slower than or equal to a Test.
        Get: {
            RectangleRay: function (rectangle, ray) { 
                return rectangleRay(rectangle, ray, false); 
            },
        
            RectangleLineSegment: function (rectangle, lineSegment) { 
                return CohenSutherlandClipping(segment.a.x, segment.a.y, segment.b.x, segment.b.y, rectangle, false);
            },
        
            Rectangles: rectanglesIntersection,
        
            Segments: function(segmentA, segmentB) {
                return lineSegmentsInteresection(segmentA, segmentB);
            },
        
            SegmentLine: function(segment, line) {
                var t = lines(segment.a, segment.b, line.a, line.b);
           
                if( t !== false &&
                    (t.y >= Math.min(segment.a.y, segment.b.y) && t.y <= Math.max(segment.a.y, segment.b.y))
                    &&
                    (t.x >= Math.min(segment.a.x, segment.b.x) && t.x <= Math.max(segment.a.x, segment.b.x))
                ) {
                    return t;
                }
            
                return false;
            },
        
            Lines: function (lineA, lineB) {
                return lines(lineA.a, lineA.b, lineB.a, lineB.b);
            },
        
            DiskLineSegment: function(disk, line) { 
                return diskLine(disk, line, false, true); 
            },
        
            DiskLine: function(disk, line) { 
                return diskLine(disk, line, false, false); 
            },
            
            PointInObb: function(point, boxCenter, boxWidth, boxHeight, boxRotation) {
                if(true === pointInObb(point, boxCenter, boxWidth, boxHeight, boxRotation)) {
                    // What did you expect?
                    return point.clone();
                }
                
                return false;
            },
            
            PointInRectangle: function(point, rectangle) {
                // Uncertain about "rectangle.min".
                if(true == pointInObb(point, rectangle.min, rectangle.width(), rectangle.height(), 0)) {
                    return point.clone();
                }
                
                return false;
            },
        },
    
        // Nearest location between object and object.
        Nearest: {
            PointOnLineSegment: function(point, segment) {
                return SegmentNearestPoint(point, segment);
            },
        
            LineSegmentBetweenRectangles: NearestLineSegmentBetweenRectangles
        }
    };
    
    function diskRectangle(disk, rect) {
        
        var hw = rect.width() * 0.5;
        var hh = rect.height() * 0.5;
        
        var distance = new Vector(
            Math.abs(disk.position.x - (rect.min.x + hw)),
            Math.abs(disk.position.y - (rect.min.y + hh))
        );
        
        
        if(distance.x > hw + disk.radius || distance.y > hh + disk.radius) {
            return false;
        }
        
        if(distance.x <= hw || distance.y <= hh) {
            return true;
        }
        
        var sq = Math.pow(distance.x - hw, 2) + Math.pow(distance.y - hh, 2);
        
        return sq < Math.pow(disk.radius, 2);
    }
    
    function pointInObb(point, boxCenter, boxWidth, boxHeight, boxRotation) {
        // Precompute a few variables:
        var sin = Math.sin(boxRotation);
        var cos = Math.cos(boxRotation);
        var hh  = boxHeight * 0.5;
        var hw  = boxWidth * 0.5;
        var x   = point.x - boxCenter.x;
        var y   = point.y - boxCenter.y;
        
        // Rotate the point to box's frame (inlined 2x2 matrix):
        var lx = cos * x - sin * y;
        var ly = sin * x + cos * y;
        
        // Simple point in rectangle test.
        if(lx > -hw && lx < hw) {
            if(ly > -hh && ly < hh) {
                return true;
            }            
        }
        
        return false;
    }

    function lines(p1, d1, p2, d2) {
        // Calculate slope "a" in "y = a * x + b":
        var a_a = (d1.y - p1.y) / (d1.x - p1.x);
        var b_a = (d2.y - p2.y) / (d2.x - p2.x);

        // Using slope "a", calculate "b". This is eventually
        // the constant in "c = mx + ny":
        var a_c = a_a * p1.x - p1.y;
        var b_c = b_a * p2.x - p2.y;

        // Straight line early out:
        if(d1.x == p1.x) {
            // Perpendicular OR not
            var y = (b_a == 0) ? d2.y : b_a * d1.x - b_c;

            return new Vector(d1.x, y);
        }

        // Straight line early out:
        if(d2.x == p2.x) {
            // Perpendicular OR not
            var y = (a_a == 0) ? d1.y : a_a * d2.x - a_c;

            return new Vector(d2.x, y);
        }

        // They never meet :(
        if(a_a - b_a == 0) {
            return false;
        }

        // Elimination method applied:
        var x = (a_c - b_c) / (a_a - b_a);

        // Feed "x" back into "c = mx + ny" to find "y":
        var y = a_a * x - a_c;

        // Et voila.
        return new Vector(x, y);
    }

    /// Mostly taken from:
    /// http://stackoverflow.com/questions/1073336/circle-line-collision-detection
    /// solves the (x - a)^2 + (y - b)^2 = r^2 equation along with the 
    /// parametric representation of the given line.
    function diskLine(disk, line, testOnly, finite) {
        var dir = line.direction();
        var f   = line.a.clone().subtract(disk.position);
    
        var a = dir.dot(dir);
        var b = 2 * f.dot(dir);
        var c = f.dot(f) - Math.pow(disk.radius, 2);
    
        // Early out of infinite lines, test only. We don't need
        // to find roots, we just care if they exist.
        if(testOnly && ! finite) {
            // > 0, two real solutions
            // = 0, one real solution
            // < 0, complex numbers.
            return (Math.pow(b, 2) - 4 * a * c) >= 0;
        }
    
        var roots = Polynomial.SolveQuadratic(a, b, c);
    
        if(roots.length > 0) {
            // Tangent to count as secant. I doubt floating point
            // math is accurate enough for this anyway. Additionally
            // always returning two points should make code more 
            // predictable for the end-user.
            if(roots.length === 1) {
                roots[1] = roots[0];
            }
        
            if(testOnly) {
                if(finite) {
                    return (
                        (roots[0] >= 0 && roots[0] <= 1) || 
                        (roots[1] >= 0 && roots[1] <= 1)
                    );
                } else {
                    // Should never be reached due to early out.
                    // but just in case...
                    return true;
                }
            }
                    
            var r = [];
        
            for(var i = 0; i < 2; ++i) {
                if(!finite || roots[i] >= 0 && roots[i] <= 1) {
                    r.push(
                        new Vector(
                            dir.x * roots[i] + line.a.x,
                            dir.y * roots[i] + line.a.y
                        )
                    );
                }
            }
        
            return r.length > 0 ? r : false;
        }
    
        return false;
    }

    // Original by Bojan at Game Oven
    function lineSegmentsInteresection(p, q) {
        ////p, pr, q, qs)
    
        // Get R and S
        var r = p.direction(); // pr - p;
        var s = q.direction(); // qs - q;

        // Get the fake 2D cross product
        var rs = r.cross(s);
    
        if(Math.abs(rs) <= 0.0001) {
            return false;
        }
    
        // Get the params
        var qp = new Vector(q.a.x - p.a.x, q.a.y - p.a.y);
        var t = qp.cross(s) / rs;
        var u = qp.cross(r) / rs;

        // Check if the params are in the range
        if(t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            //console.log(rs, p.a.x + r.x * t);
            return r.scaleScalar(t).add(p.a);  //p + r * t;
        }
    
        return false;
    }

    function NearestLineSegmentBetweenRectangles(a, b) {    
        var min  = new Vector(0, 0);
        var max  = new Vector(0, 0);
        var pen  = new Vector(0, 0);
        var aRect, bRect;

        ['x', 'y'].forEach(function(axis) {
            aRect = b.min[axis] < a.min[axis] ? b : a;
            bRect = aRect == a ? b : a;

            min[axis] = aRect.max[axis];
            max[axis] = bRect.min[axis];
    
            pen[axis] = max[axis] - min[axis];
    
            if(pen[axis] <= 0) {
                min[axis] = max[axis] = Math.max(b.min[axis], a.min[axis]);
                pen[axis] = 0;
            }
    
        }.bind(this));

        // Special case: both axis overlap:
        if(pen.y === 0 && pen.x === 0) {
            return new Line(0, 0, 0, 0);
        }

        // Set the correct line, toggle to "rectA to rectB" not "min to max":
        if(b.min.y > a.min.y && b.min.x < a.min.x ||
           b.min.y < a.min.y && b.min.x > a.min.x) {
            var tmp = min.y;
            min.y   = max.y; 
            max.y   = tmp;
        }

        return new Line(min.x, min.y, max.x, max.y);
    }

    function SegmentNearestPoint(point, segment) {
        return (function (x, y, x1, y1, x2, y2) {
            var A = x - x1;
            var B = y - y1;
            var C = x2 - x1;
            var D = y2 - y1;

            var dot = A * C + B * D;
            var len_sq = C * C + D * D;
            var param = dot / len_sq;

            var xx, yy;

            if (param < 0 || (x1 == x2 && y1 == y2)) {
                xx = x1;
                yy = y1;
            }
            else if (param > 1) {
                xx = x2;
                yy = y2;
            }
            else {
                xx = x1 + param * C;
                yy = y1 + param * D;
            }
        
            return new Vector(xx, yy);
        
        } (point.x, point.y, segment.a.x, segment.a.y, segment.b.x, segment.b.y));
    }

    function rectanglesIntersection(a, b) {
        // TODO: look up that way to test an intersect at the same time.
        if(rectanglesTest(a, b)) {
            return new Rectangle(
                Math.max(a.min.x, b.min.x), Math.max(a.min.y, b.min.y),
                Math.min(a.max.x, b.max.x), Math.min(a.max.y, b.max.y)
            );
        }
    
        return false;
    }

    function rectanglesTest(a, b) {
        return a.min.x <= b.max.x &&
               b.min.x <= a.max.x &&
               a.min.y <= b.max.y &&
               b.min.y <= a.max.y ;
    }

    // https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm 
    function CohenSutherlandClipping(x0, y0, x1, y1, rectangle, testOnly) {

        var Sutherland     = {};
        Sutherland.INSIDE  = 0;
        Sutherland.LEFT    = 1 << 0;
        Sutherland.TOP     = 1 << 1;
        Sutherland.RIGHT   = 1 << 2;
        Sutherland.BOTTOM  = 1 << 3;
 

        var ComputeOutCode = function(x, y, rectangle) {
            var code = Sutherland.INSIDE;


            if (x < rectangle.min.x) {           // to the left of clip window
                code |= Sutherland.LEFT;
            } else if (x > rectangle.max.x) {    // to the right of clip window
                code |= Sutherland.RIGHT;
            }
        
            if (y < rectangle.min.y) {           // below the clip window
                code |= Sutherland.BOTTOM;
            } else if (y > rectangle.max.y) {    // above the clip window
                code |= Sutherland.TOP;
            }
        
            return code;
        }

   
        // compute outcodes for P0, P1, and whatever point lies outside the clip rectangle
        var outcode0 = ComputeOutCode(x0, y0, rectangle);
        var outcode1 = ComputeOutCode(x1, y1, rectangle);
        var accept   = false;

        for (;;) {
            if (!(outcode0 | outcode1)) { // Bitwise OR is 0. Trivially accept and get out of loop
                accept = true;
                break;
            
            } else if (outcode0 & outcode1) { // Bitwise AND is not 0. Trivially reject and get out of loop
                break;
            
            } else {
                // failed both tests, so calculate the line segment to clip
                // from an outside point to an intersection with clip edge
                var x, y;

                // At least one endpoint is outside the clip rectangle; pick it.
                var outcodeOut = outcode0 ? outcode0 : outcode1;

                // Now find the intersection point;
                // use formulas y = y0 + slope * (x - x0), x = x0 + (1 / slope) * (y - y0)
                if (outcodeOut & Sutherland.TOP) {           // point is above the clip rectangle
                    x = x0 + (x1 - x0) * (rectangle.max.y - y0) / (y1 - y0);
                    y = rectangle.max.y;
                } else if (outcodeOut & Sutherland.BOTTOM) { // point is below the clip rectangle
                    x = x0 + (x1 - x0) * (rectangle.min.y - y0) / (y1 - y0);
                    y = rectangle.min.y;
                } else if (outcodeOut & Sutherland.RIGHT) {  // point is to the right of clip rectangle
                    y = y0 + (y1 - y0) * (rectangle.max.x - x0) / (x1 - x0);
                    x = rectangle.max.x;
                } else if (outcodeOut & Sutherland.LEFT) {   // point is to the left of clip rectangle
                    y = y0 + (y1 - y0) * (rectangle.min.x - x0) / (x1 - x0);
                    x = rectangle.min.x;
                }

                // Now we move outside point to intersection point to clip
                // and get ready for next pass.
                if (outcodeOut == outcode0) {
                    x0 = x;
                    y0 = y;
                    outcode0 = ComputeOutCode(x0, y0, rectangle);
                } else {
                    x1 = x;
                    y1 = y;
                    outcode1 = ComputeOutCode(x1, y1, rectangle);
                }
            }
        }
    
        if (!accept) {
            return false;
        }
    
        if(testOnly) {
            return true;
        }
    
        return {
            "entry": new Vector(x0, y0),
            "exit": new Vector(x1, y1)
        };
    }


    // Implementation kindly taken from: 
    // http://www.siggraph.org/education/materials/HyperGraph/raytrace/rtinter3.htm
    function rectangleRay(rectangle, ray, testOnly) {

        var dir = ray.direction();//.normalize();
    
        //console.clear();
    
    
        // Horizontal parallel early out:
        if(dir.x === 0 && ! rectangle.containsX(ray.a.x)) {
            //console.log("Horizontal early out.");
            return false;
        
        // Vertical parallel early out:
        } else if(dir.y === 0 && ! rectangle.containsY(ray.a.y)) {
            //console.log("Vertical early out.");
            return false;
        }
    
        var Tnear = -Infinity;
        var Tfar  = Infinity;
        var T1, T2, oneOverDir, tmp;
    
        var r = ['x','y'].every(function(axis){
            oneOverDir = 1 / dir[axis];
            T1 = (rectangle.min[axis] - ray.a[axis]) * oneOverDir;
            T2 = (rectangle.max[axis] - ray.a[axis]) * oneOverDir;
    
            // origin is on the left side of the rectangle, flip!
            if(T1 > T2) {
                tmp = T1;
                T1 = T2;
                T2 = tmp;
            }
    
            if(T1 > Tnear ) { Tnear = T1; }
            if(T2 < Tfar ) {  Tfar  = T2; }
    
            if(Tnear > Tfar) {
                //console.log(axis + " box is missed, ",Tnear,">",Tfar);
                return false;
            }
    
            if(Tfar < 0) {
                //console.log(axis + " box is behind ray",Tfar,"< 0");
                return false;
            
            }
    
            //console.log(axis + " axis fits. Near: ", Tnear, "far:", Tfar);
        
            return true;
        });
    
        if(testOnly === true) {
            return r;
        }
    
        return {
            // Point of rectangle entry:
            "entry": new Vector(ray.a.x + dir.x * Tnear, ray.a.y + dir.y * Tnear),
        
            // Point of rectangle exit:
            "exit": new Vector(ray.a.x + dir.x * Tfar, ray.a.y + dir.y * Tfar)
        };
    }


    return exposed;
});
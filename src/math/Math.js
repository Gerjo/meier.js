define(function(require) {
    var Vector = require("meier/math/Vector");
    
    
    return {
        /// Approximation of sine function of an angle.
        /// @param {rads} some angle expressed in  [0, PI/4] radians.
        /// @return an approximation of sine.
        FastSin: function (rads) {
            return -0.41498e-8 + (1.000000515 + (-0.105463955e-4 + (-0.1665856017 + (-0.297181298e-3 +
                 (0.8894256955e-2 - 0.5282205803e-3 * rads) * rads) * rads) * rads) * rads) * rads;
        },

        /// Approximation of cosine function of an angle.
        /// @param {rads} some angle expressed in  [0, PI/4] radians.
        /// @return an approximation of cosine.
        FastCos: function (rads) {
            return 1.000000002 + (-0.2053e-6 + (-0.4999959817 + (-0.2922839e-4 + (0.4176577023e-1 + 
                 (-0.163891331e-3 - 0.1275240287e-2 * rads) * rads) * rads) * rads) * rads) * rads;
        },

        /// Round numbers to the specified precision. Halves 
        /// are rounded up. 
        ///
        /// @param {num} the to be rounded number.
        /// @param {precision} rounding precision. Accepts negative numbers.
        /// @return the rounded number.
        Round: function (num, precision) {
    
            if(precision > 0) {
                var exp = Math.pow(10, precision)
                return parseInt(num * exp + 0.5, 10) / exp;
    
            } else if(precision < 0) {
                var exp = Math.pow(10, -precision)
                return parseInt(num / exp + 0.5, 10) * exp;
            }
    
            return parseInt(num + 0.5);
        },

        /// Test if the argument is an integer. NaN and infinity
        /// are not considered integers.
        ///
        /// Examples:
        ///    IsInteger("456") === true
        ///    IsInteger(123) === true
        ///    IsInteger("foo") === false
        ///    IsInteger(infinity) === false
        ///
        /// @param {n} the value to test.
        /// @return boolean indicating whether the argument is integer.
        IsInteger: function (n) {
            return parseInt(n, 10) == n;
        },

        /// Find the greatest common divisor of two numbers.
        /// Also known as: GCD, GCF, HCD or HCF. Return values are 
        /// always positive, this is coherent with wolfram alpha.
        /// 
        /// Examples:
        ///    GCD(3, 6) === 3
        ///    GCD(-54, 549) === 9
        ///    GCD(-12, -6) === 6
        ///
        /// @param {m} The first number.
        /// @param {n} The second number.
        /// @return The highest common non-negative divisor.
        GCD: function (m, n) {
    
            if(m === 0) {
                return Math.abs(n);
            }
    
            if(n === 0) {
                return Math.abs(m);
            }
    
            if(IsInteger(m) &&  IsInteger(n)) {
        
                // For positive numbers only:
                if(m > 0 && n > 0) {
            
                    while(m != n) {
                        if(m > n) {
                            m = m - n;
                        } else {
                            n = n - m;
                        }
                    }
            
                    return m;
            
                // One of the numbers is negative, resort to modulo.
                } else {
        
                    // m shall be the lowest number.
                    if(n > m) {
                        var t = n;
                        n = m;
                        m = t;
                    }

                    for(var r = m % n; true; r = m % n) {    
                        if(r == 0) {
                            return Math.abs(n);
                        }
    
                        m = n;
                        n = r;
                    }
                }
            }
    
            // Input was not an integer number.
            return NaN;
        },

        /// Find the lowest common denominator, also known as
        /// least common denominator. (e.g., used for solving
        /// fraction addition or subtraction)
        ///
        /// Simple example:
        ///     LCD(135, 5) === 135
        ///
        /// Solving multiple:
        ///     LCD(3, LCD(25, 5)) === 75
        ///
        /// Functional approach solving multiple:
        ///    [3,25,5].reduce(LCD) === 75
        ///
        /// @param {a} The first number.
        /// @param {b} The second number.
        /// @return The lowest common non-negative denominator.
        LCD: function (a, b) {
            return Math.abs(a * b / GCD(a, b));
        },

        /// Determine if a number is inside a given range.
        ///
        /// @param The number to compare.
        /// @param The upper(or lower) bound.
        /// @param The upper(or lower) bound.
        ///
        /// @return boolean indicating if the number is in the given range.
        Between: function (num, a, b) {
            return (num > Math.min(a, b) && num < Math.max(a, b));
        },

        ToLetter: function (num) {
            // TODO: larger range.
            return String.fromCharCode(97 + num);
        },

        ToUpperLetter: function (num) {
            // TODO: larger range.
            return String.fromCharCode(65 + num);
        },

        /// Great for comparing floating point numbers:
        EpsilonEquals: function (value, test, epsilon) {
            return value > test - epsilon && value < test + epsilon;
        },

        /// Short-hand function for sorting numbers in ascending magnitude. 
        /// This is more expressive than inlining a function. The default
        /// sorting algorithm may no work as expected.
        ///
        /// [9, -9, 3, 2].sort(SortAscending) === [-9, 2, 3, 9]
        ///
        /// @param {a} The first number.
        /// @param {b} The second number.
        /// @return A number indicating the difference.
        /// @see SortDescending
        /// @see SortNatural
        SortAscending: function(a, b) {
            return a - b;
        },

        /// Short-hand function for sorting numbers in descending magnitude.
        ///
        /// @param {a} The first number.
        /// @param {b} The second number.
        /// @return A number indicating the difference.
        /// @see SortAscending
        /// @see SortNatural
        SortDescending: function (a, b) {
            return b - a;
        },

        /// Short-hand function to sort an array like a typical human would.
        /// There are varying implementations, use this - or build your own.
        ///
        /// Example results:
        ///     With natural sort:
        ///        img1.png 
        ///        img2.png
        ///        img10.png 
        ///        img12.png 
        ///     With default build-in sort:
        ///        img1.png 
        ///        img10.png 
        ///        img12.png 
        ///        img2.png
        ///
        /// @param {a} The first item.
        /// @param {b} The second item.
        /// @return A number indicating the difference.
        /// @see SortAscending
        /// @see SortDescending
        SortNatural: function (a, b) {
            return +/\d+/.exec(a)[0] > +/\d+/.exec(b)[0];
        },


        /// Map range A onto B at interval cu in [b1..b2]
        Map: function (a1, a2, b1, b2, cu) {
            var t = 1 / (b2 - b1) * cu;
            return a1 * (1 - t) + a2 * t;
        },

        /// Normalize a range into [0..1].
        /// Example: Normalized(0, 255, 128) yields 0.5
        Normalized: function(min, max, current) {
            var per =  1 / (max - min)
            return per * current;
        },



        /// Apply newton rapson iteration to approximate roots of a 
        /// polynomal.
        ///
        /// let g be f'
        ///
        /// Example: find the root of f(x) = x^4 + x
        /// Then we derrive f, which gives g(x) = 4 * x^3 + 1
        ///
        /// Note: this requires less iterations than Picard, but
        /// it may not be possible to find a derivative.
        ///
        NewtonRaphsonIteration: function(f, g, initial, steps) {
    
            var r = initial - f(initial) / g(initial);
    
            if(steps > 0) {
                return NewtonRaphsonIteration(f, g, r, steps - 1);
            }
    
            return r;
        },

        /// Apply picard iteration to approximate roots of a polynomal.
        /// let f be f(x) = y
        /// then change that into:
        /// let g be g(x) = x
        ///
        /// Example: find the root of f(x) = x^3 - 3x + 1
        /// then we use g(x) = (x^3 + 1) / 3 
        ///
        /// Note: we simply isolated x.
        ///
        PicardIteration: function(g, initial, steps) {
    
            var r = g(initial);
        
            if(steps > 0) {
                return PicardIteration(g, r, steps - 1);
            }
    
            return r;
        },
        
        /// Compute the factorial of a given number. Uses a switch case for
        /// 0 < n < 7, then resorts to a while loop. Granted javascript
        /// may be slow, if you must - inline your own factorial.
        Factorial: function(n) {
            // Precomputed :)
            switch(n) {
                case 0: return 1;
                case 1: return 1;
                case 2: return 2;
                case 3: return 6;
                case 4: return 24;
                case 5: return 120;
                case 6: return 720;
            }
    
            var r = 1;
    
            while( n-- > 1) {
                r *= n;
            }
    
            return r;
        },

        /// A half-baked implementation of Gauss-Jordan elemination.
        /// Untested with zero values, don't expect this to work. It
        /// serves as food for the brain to come up with something
        /// better.
        ///
        /// Input format: an array with the following significant indices:
        /// 0 1 2 |  9
        /// 3 4 5 | 10
        /// 6 7 8 | 11
        ///
        /// Output: an array containing the x, y and z values.
        GaussJordanElimination: function(a) {
            var r;
    
            // TODO: Account for zero values by swapping rows.
            // TODO: Some operations are redundant.
            // TODO: Arguments to accept matrices and such.
            // TODO: Use this to calculate the inverse of matrices
            // TODO: Use reduced row echelon to solve, rather than
            // full blown Gauss-Jordan.
    
            // first row 1 x x
            a[1] /= a[0];
            a[2] /= a[0];
            a[9] /= a[0];
            a[0] /= a[0];
    
            // second row 0 x x
            r = a[3] / a[0];
            a[3]  -= (r * a[0]);
            a[4]  -= (r * a[1]);
            a[5]  -= (r * a[2]);
            a[10] -= (r * a[9]);
    
            // third row 0 x x
            r =  a[6] / a[0];
            a[6]  -= (r * a[0]);
            a[7]  -= (r * a[1]);
            a[8]  -= (r * a[2]);
            a[11] -= (r * a[9]);

            // third row: 0 0 x
            r = -(a[7] / a[4]);
            a[6]  += (r * a[3]);
            a[7]  += (r * a[4]);
            a[8]  += (r * a[5]);
            a[11] += (r * a[10]);
    
            // Second row: 0 1 x
            a[3]  /= a[4];
            a[5]  /= a[4];
            a[10] /= a[4];
            a[4]  /= a[4];
    
            // Third row: 0 0 1
            a[6]  /= a[8];
            a[7]  /= a[8];
            a[11] /= a[8];
            a[8]  /= a[8];
    
            // First row 1 0 x
            r = -(a[1] / a[4]);
            a[0] += (r * a[3])
            a[1] += (r * a[4])
            a[2] += (r * a[5])
            a[9] += (r * a[10])
    
            // First row 1 0 0
            r = -(a[2] / a[8]);
            a[0] += (r * a[6])
            a[1] += (r * a[7])
            a[2] += (r * a[8])
            a[9] += (r * a[11])
    
            // Second row 0 1 0
            r = -(a[5] / a[8]);
            a[3]  += (r * a[6])
            a[4]  += (r * a[7])
            a[5]  += (r * a[8])
            a[10] += (r * a[11])
    
            return [
                a[9], a[10], a[11]
            ];
        },

        /// Calculate the convex hull that wraps a bunch of coordinates. Used
        /// to find the convex bounding hull of a concave polygon. This 
        /// implementation isn't efficient, but easy to implement.
        ///
        /// @param {coordinates} a bunch of coordinates.
        /// @return The convex hull wrapping the given coordinates.
        PolyonGiftWrap: function(coordinates) {
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
        },
        
    };// End return
}); // End define
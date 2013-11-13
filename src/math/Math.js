/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Vector = require("meier/math/Vector");
    
    return {
        
        /// Determine the sign of a number.
        ///
        ///   if(n < 0)  -1 
        ///   if(n == 0)  0 
        ///   if(n > 0)   1  
        ///
        /// Special behaviour: returns 0 for the NaN constant or anything
        /// else that's not a number. Though it's best not to rely on this.
        ///
        /// @param {n} the number.
        /// @returns the sign, either -1, 0 or 1.
        Sign: function(n) {
            return (n > 0) ? 1 : (n < 0) ? -1 : 0
        },
        
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

        /// Round numbers to the specified precision.
        ///
        /// @param {num} the to be rounded number.
        /// @param {precision} rounding precision. Accepts negative numbers.
        /// @return the rounded number.
        Round: function (num, precision) {
            
            if(precision > 0 && parseInt(num, 10) != num) {
                var exp = Math.pow(10, precision)
                return Math.round(num * exp) / exp;
    
            } else if(precision < 0) {
                var exp = Math.pow(10, -precision)
                return Math.round(num / exp) * exp;
            }
            
            return Math.round(num);
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
        /// 
        ///
        GaussJordanElimination: function(input, out) {
            
            if( ! input || ! input._) {
                throw new Error("GaussJordanElimination - argument is probably not a matrix.");
            }
            
            if(input.numrows !== input.numcolumns) {
                throw new Error("GaussJordanElimination - matrix is not square.");
            }
            
            /// A sort of macro to access indices.
            function At(row, column) {
                return row * input.numcolumns + column;
            }
            
            /// 
            function At2(row, column) {
                return row * out.numcolumns + column;
            }
            
            //var out = [1, 1, 1, 1];
            
            var matrix = input.clone();
            
            var size = matrix.numcolumns;
            var n, swapped = false;
            
            //console.log(matrix.wolfram());
            
            // Set pivots:
            for(var i = 0; i < size; ++i) {
                
                if(matrix.at(i, i) === 0) {
                    swapped = false;
                    for(var j = i + 1; j < size; ++j) {
                        if(matrix.at(j, i) != 0) {
                            matrix.swapRows(i, j);
                            out.swapRows(i, j);
                            
                            console.log("swap rows:", i, "and", j);
                            swapped = true;
                            break;
                        }
                    }
                    
                    if( ! swapped) {
                        console.log("Unable to find suitable pivot value. Rework logic!");
                    }
                }
            }
            
            
            //console.log("Initial:");
            //console.log(matrix.pretty());
            
            // Lower triangle:
            for(var it = 0; it < size; ++it) {
                for(var row = it + 1; row < size; ++row) {
                    var pivot = matrix._[At(it, it)];
                    var ratio = matrix._[At(row, it)] / pivot;
                
                    //console.log("\n pivot row[" + it + "] ratio: " + ratio);
                
                    if(ratio == 0) {
                        console.error("pivot ratio is zero");
                    }
                
                    for(var col = 0; col < size; ++col) {
                        matrix._[At(row, col)] -= (ratio * matrix._[At(it, col)]);
                        
                        if(col < out.numcolumns) {
                            var r = out._[At2(row, col)] - (ratio * out._[At2(it, col)]);
                        
                            //console.log(out._[At(row, col)] + " - " + out._[At(it, col)] + "*" + ratio + " = " + r);
                        
                            out._[At2(row, col)] = r;
                        }
                    }
                }
            }
            
            for(var row = 0; row < size; ++row) {
                var pivot = matrix.at(row, row);
                
                // Self-normalize:
                if(pivot != 1) {
                
                    for(var col = 0; col < size; ++col) {
                        matrix._[At(row, col)] /= pivot;
                        
                        if(col < out.numcolumns) {
                            out._[At2(row, col)] /= pivot;
                        }
                    }
                }
            }
            
            //console.log("Left Triangle:");
            //console.log(matrix.pretty());
            //console.log("right side:");
            //console.log(out.pretty());
            
            // We do a full elimination. Though for some cases we can back-substitute from here on.
            
            for(var it = size - 1; it > 0; --it) 
            {
                var pivot = matrix._[At(it, it)];
                
                for(var row = 0; row < it; ++row) {
                    var ratio = matrix._[At(row, it)] / pivot;
                    
                    if(ratio == 0) {
                        console.error("pivot ratio is zero");
                    }
                    
                    //console.log("pivot[row " + it + "] " + pivot + " ratio: " + ratio);
                    
                    for(var col = 0; col < size; ++col) {
                        matrix._[At(row, col)] -= (ratio * matrix._[At(it, col)]);
                        
                        if(col < out.numcolumns) {
                            var r = out._[At2(row, col)] - (ratio * out._[At2(it, col)]);

                            //console.log(row, col, out._[At(row, col)]);
                        
                            //console.log(out._[At(row, col)] + " - " + out._[At(it, col)] + "*" + ratio + " = " + r);
                        
                        
                            out._[At2(row, col)] = r;
                        }
                    }
                    
                }
                
                //break;
            }
            /*
            */
            
            //console.log("Left side: [reduced row echelon form]");
            //console.log(matrix.pretty());
            
            //console.log("Right side:");
            //console.log(out.pretty());
            
            //console.log("Actual inverse:");
            //console.log(input.inverse().pretty())
            //console.log("out determinant:", out.determinant());
            
            //console.log("Should be identity:");
            //console.log(out.product(input).pretty());
            
            return out;
        }
    };// End return
}); // End define
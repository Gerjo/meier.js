/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Vector = require("meier/math/Vector");
    var Vec2   = require("meier/math/Vec")(2);
    var Disk   = require("meier/math/Disk");
    var Random = require("meier/math/Random");
    
    /// Lookup table for the first 1000 primes.
    var primes = { 2: true, 3: true, 5: true, 7: true, 11: true, 13: true, 17: true, 19: true, 23: true, 29: true, 31: true, 37: true, 41: true, 43: true, 47: true, 53: true, 59: true, 61: true, 67: true, 71: true, 73: true, 79: true, 83: true, 89: true, 97: true, 101: true, 103: true, 107: true, 109: true, 113: true, 127: true, 131: true, 137: true, 139: true, 149: true, 151: true, 157: true, 163: true, 167: true, 173: true, 179: true, 181: true, 191: true, 193: true, 197: true, 199: true, 211: true, 223: true, 227: true, 229: true, 233: true, 239: true, 241: true, 251: true, 257: true, 263: true, 269: true, 271: true, 277: true, 281: true, 283: true, 293: true, 307: true, 311: true, 313: true, 317: true, 331: true, 337: true, 347: true, 349: true, 353: true, 359: true, 367: true, 373: true, 379: true, 383: true, 389: true, 397: true, 401: true, 409: true, 419: true, 421: true, 431: true, 433: true, 439: true, 443: true, 449: true, 457: true, 461: true, 463: true, 467: true, 479: true, 487: true, 491: true, 499: true, 503: true, 509: true, 521: true, 523: true, 541: true, 547: true, 557: true, 563: true, 569: true, 571: true, 577: true, 587: true, 593: true, 599: true, 601: true, 607: true, 613: true, 617: true, 619: true, 631: true, 641: true, 643: true, 647: true, 653: true, 659: true, 661: true, 673: true, 677: true, 683: true, 691: true, 701: true, 709: true, 719: true, 727: true, 733: true, 739: true, 743: true, 751: true, 757: true, 761: true, 769: true, 773: true, 787: true, 797: true, 809: true, 811: true, 821: true, 823: true, 827: true, 829: true, 839: true, 853: true, 857: true, 859: true, 863: true, 877: true, 881: true, 883: true, 887: true, 907: true, 911: true, 919: true, 929: true, 937: true, 941: true, 947: true, 953: true, 967: true, 971: true, 977: true, 983: true, 991: true, 997: true };
    
    var self = {
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

        /// Determine if the given number is a power of two.
        ///  More formally, determine if 'a' is an integer:
        ///     2^a == n
        ///
        /// @param {n} some number.
        /// @return a boolean indicating power of two status.
        IsPowerOfTwo: function(n) {
            return (n != 0) && ((n & (n - 1)) == 0);  
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
    
            var r = 720;
    
            while( n-- > 6) {
                r *= n + 1;
            }
        
            return r;
        },
        
        GaussJordanElimination: function(input, out) {
            return self._GaussJordanEliminationInternal(input, out, false);
        },

        /// A half-baked implementation of Gauss-Jordan elemination.
        /// 
        ///
        _GaussJordanEliminationInternal: function(input, out, lowerTriangleOnly) {
            
            lowerTriangleOnly = lowerTriangleOnly || false;
            
            if( ! input || ! input._) {
                throw new Error("GaussJordanElimination - argument is probably not a matrix.");
            }
            
            if(input.numrows !== input.numcolumns) {
                throw new Error("GaussJordanElimination - matrix is not square.");
            }
            
            if( ! out.numcolumns) {
                throw new Error(
                    "GaussJordanElimination - both arguments need to be a matrix."+
                    "Poorly enough, a vector is not a matrix."
                );
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
            
            var matrix = input;//.clone();
            
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
                            
                            //console.log("GaussJordanElimination: swap rows:", i, "and", j);
                            swapped = true;
                            break;
                        }
                    }
                    
                    if( ! swapped) {
                        console.log("GaussJordanElimination: Unable to find suitable pivot value. Rework logic!");
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
                        console.error("GaussJordanElimination - pivot ratio is zero");
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
            
            if( ! lowerTriangleOnly) {
                for(var it = size - 1; it > 0; --it) {
                    
                    var pivot = matrix._[At(it, it)];
                
                    for(var row = 0; row < it; ++row) {
                        var ratio = matrix._[At(row, it)] / pivot;
                    
                        if(ratio == 0) {
                            console.log(matrix.pretty());
                            console.error("GaussJordanElimination - pivot ratio is zero");
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
        },
        
        ClosestVector: function(v, array) {
            var best = array[0];
            var dist = Infinity;
            
            for(var i = 0; i < array.length; ++i) {
                var d = v.distanceSQ(array[i]);
                
                if(d < dist) {
                    best = array[i];
                    dist = d;
                }
            }
            
            return best;
        },
        
        FarthestVector: function(v, array) {
            var best = array[0];
            var dist = -Infinity;
            
            for(var i = 0; i < array.length; ++i) {
                var d = v.distanceSQ(array[i]);
                
                if(d > dist) {
                    best = array[i];
                    dist = d;
                }
            }
            
            return best;
        },
        
        /// Find the least squares circle. Equations taken from:
        /// http://www.dtcenter.org/met/users/docs/write_ups/circle_fit.pdf
        ///
        /// @param {coordinates} An array with 2D vectors.
        /// @return A disk according to the least squares criteria.
        /// @see {Polynomial.LeastSquares} For polynomial and linear least squares.
        LeastSquaresCircle: function(coordinates) {
            
            // Late loading to avoid circular dependancies.
            var M  = require("meier/math/Mat");
            
            // Avoid all math. Early out.
            if(coordinates.length === 1) {
                return new Disk(coordinates[0].clone(), 0);
            
            // I'm open for discussion on this one.
            } else if(coordinates.length === 0) {
                return new Disk(new Vector(0, 0), 0);
            
            // Special case for two coordinates.
            } else if(coordinates.length === 2) {
                var dx = (coordinates[0].x - coordinates[1].x) * 0.5;
                var dy = (coordinates[0].y - coordinates[1].y) * 0.5;
                
                // Point between two vectors
                var middle = new Vector(
                    coordinates[1].x + dx,
                    coordinates[1].y + dy
                );
                
                return new Disk(middle, Math.sqrt(dx*dx + dy*dy));
            }
        
            // Length
            var n = coordinates.length;
        
            // Sum coordinates, then average them.
            var avg = coordinates.reduce(function(p, c) {
                return p.add(c);
            }, new Vector(0, 0)).scaleScalar(1 / n);
        
            // Some accumulators
            var uu = 0;
            var uv = 0;
            var vv = 0;
            var vvv = 0;
            var uuu = 0;
            var uvv = 0;
            var uuv = 0;
        
            // Collect a bunch of squard distances.
            coordinates.forEach(function(c) {
                var u  = c.x - avg.x;
                var v  = c.y - avg.y;
            
                uu += u * u;
                vv += v * v;
                uv += u * v;
                vvv += v * v * v;
                uuu += u * u * u;
                uvv += u * v * v;
                uuv += u * u * v;
            });
        
        
            // Left side
            var l = new (M(2, 2))([
                uu, uv,
                uv, vv,  
            ]);
      
            // Right side
            var r = new (M(2, 1))([
                0.5 * (uuu + uvv), 
                0.5 * (vvv + uuv)
            ]);
        
            // Solve the augmented matrix. r will contain the solution,
            // and l should be an identity matrix.
            self.GaussJordanElimination(l, r);
        
            // Find the radius
            var alpha = Math.sqrt(
                Math.pow(r.at(0, 0), 2) + Math.pow(r.at(1, 0), 2) + ((uu + vv) / n)
            );
        
            // Move back to x/y coordinate frame
            var c = new Vector(
                r.at(0, 0) + avg.x,
                r.at(1, 0) + avg.y
            );
        
            return new Disk(c, alpha);
        }, 
        
        /// Determine if the given number is a prime number. Constant time lookup 
        /// for num <= 1000, otherwise trial division with some early-outs. 
        ///
        /// @param {num} A number of sorts.
        /// @return A boolean indicating if argument is a prime.
        IsPrime: function(num) {
            
            // Floats are never prime.
            if( ! self.IsInteger(num)) {
                return false;
            }
            
            // Lookup table for the first few primes
            if(num <= 1000) {
                return primes[num] === true;
            }
            
            if(num <= 1) {
               return false;
              
            } else if(num == 2) {     
               return true;
              
            // Even number are not prime.
            } else if(num % 2 == 0) {
               return false;
            
            // Trial division
            } else {

                // Adopted from:  http://www.cplusplus.com/forum/general/1125/
                var upper = parseInt(Math.sqrt(num) + 1);

                for(var divisor = 3; divisor <= upper; divisor += 2) {
                    if(num % divisor == 0) {
                        return false;
                    }
                }
               
                return true;
            }
        },
        
        /// Break the presented number into primes. If the given number is 
        /// a prime, an array containing said number is returned.
        ///
        /// @param {num} An integer to decomposite into primes.
        /// @return An array containing the smallest primes.
        PrimeFactors: function(num) {
            
            // Uncertain what the math rules are on this one.
            if( ! self.IsInteger(num)) {
                throw new Error("Factorize is only expected to work with integers.");
            }
            
            var result = [];
            var root = Math.sqrt(num);
            
            // Mostly from: http://www.coderenaissance.com/2011/06/find
            // ing-prime-factors-in-javascript.html
            var recurse = function(num) {
                var x = 2;
        
                // if not divisible by 2
                if(num % x) {
                     x = 3; // assign first odd
            
                     // iterate odds
                     while((num % x) && ((x = x + 2) < root)) {
                        ; // nop
                     }
                }
        
                //if no factor found then num is prime
                x = (x <= root) ? x : num;
        
                if(x != num && num > 0) {
                    recurse(num / x);
                }
       
                result.push(x);//push latest prime factor
            };

            recurse(num);
            
            return result;
        },
        
        /// Return the index of the maximum value. If the maximum is not
        /// unique, the first occurence is returned.
        ///
        /// @param {array} An array of numbers
        /// @param {getter} Optional property getter
        /// @return argument maximum
        /// @see {ItemGetter}
        ArgMax: function(array, getter) {
            var max = -1;
            var score = -Infinity;
            
            
            if(getter) {
                for(var i = array.length - 1; i >= 0; --i) {
                    var val = getter(array[i]);
                    
                    if(val >= score) {
                        max = i;
                        score = val;
                    }
                }
            } else {
                for(var i = array.length - 1; i >= 0; --i) {
                    if(array[i] >= score) {
                        max = i;
                        score = array[i];
                    }
                }
            }
            
            return max;
        },
        
        /// Return the index of the minimum value. If the minimum is not
        /// unique, the first occurence is returned.
        ///
        /// @param {array} An array of numbers
        /// @param {getter} Optional property getter
        /// @return argument minimum
        /// @see {ItemGetter}
        ArgMin: function(array, getter) {
            var max = -1;
            var score = Infinity;
            
            if(getter) {
                for(var i = array.length - 1; i >= 0; --i) {
                    var val = getter(array[i]);
                    
                    if(val <= score) {
                        max = i;
                        score = val;
                    }
                }
            } else {
                for(var i = array.length - 1; i >= 0; --i) {
                    if(array[i] <= score) {
                        max = i;
                        score = array[i];
                    }
                }
            }
            return max;
        },
        
        /// Python style argument getter.
        ///
        ///   Example usage:
        ///     // Some array with objects
        ///     var arr = [ {a: 10}, {a:23}, {a:22} ];
        ///   
        ///     // Retrieve the array index of greatest "a" property.
        ///     var max = math.ArgMax(arr, math.ItemGetter("a"));
        ///     console.log("Greatest: ", obj[max]);
        ///
        /// @param {name} property name or index number.
        /// @return A function retrieving the specified property.
        ItemGetter: function(name) {
            return function(obj) {
                return obj[name];
            }
        },
        
        CircleUniformProbability: function(candidate, neighbours, center) {
            if(neighbours.length == 0) {
                return 1;
            }
            
            // Optionally translate vectors to origin.
            if(center) {
                neighbours = neighbours.map(function(n){
                    return n.clone().subtract(center).normalize();
                });
            }

            var p = 1;
            var weight = 5; // low = any thing goes. High = very strict maximum spread.

            neighbours.forEach(function(v) {
                var d = v.angleBetween(candidate);

                var tmp = Math.pow(Math.abs(d / Math.PI), weight);
            
                p = Math.min(p, tmp);
            });
   
            return p;        
        },
        
        
        CircleUniformRandom: function(center, neighbours) {
            
            // Compute the angles.
            var angles = neighbours.map(function(n){
                return n.clone().subtract(center).normalize();
            });
    
            var candidate;
    
            var timeout = 1000; // Give up after n tries.
            do {
                // Sample uniform over the x-axis
                var angle = Random(0, Math.TwoPI, true);
                candidate = new Vec2(Math.cos(angle), Math.sin(angle));
                
                //console.log(angle);
    
                var p = self.CircleUniformProbability(candidate, angles);
    
            } while(Random(0, 100, true) > p * 100 && --timeout > 0);
    
            return candidate;
        },
		
		/// Determine if a number is even. Not quite the same
		/// as !IsEvent, odd/even numbers are only defined for
		/// integers. This method, and it's counter-part, return
		/// false for non-integers.
		IsOdd: function(number) {
			
			if(parseInt(number, 10) == number) {
				return number % 2 == 1;
			}
			
			// Only well defined for integers.
			return false;
		},
		
		/// Determine if a number is odd. Not quite the same
		/// as !IsOdd, odd/even numbers are only defined for
		/// integers. This method, and it's counter-part, return
		/// false for non-integers.
		IsEven: function(number) {
			
			if(parseInt(number, 10) == number) {
				return number % 2 == 0;
			}
			
			// Only well defined for integers.
			return false;
		},
		
		/// Return the first parameter. Useful as a quick drop in:
		///  
	    ///   Math.pow(a, 3)
		///    into
		///   Math.ident(a, 4)
		///
		/// @param arg Some value
		/// @return The specified argument arg
		/// @synonym Identity
		Ident: function(arg) {
			return arg;
		},
		
		/// Return the first parameter. Useful as a quick drop in:
		///  
	    ///   Math.pow(a, 3)
		///    into
		///   Math.Identity(a, 4)
		///
		/// @param arg Some value
		/// @return The specified argument arg
		/// @synonym Ident
		Identity: function(arg) {
			return arg;
		},
		
    }; // End var self = {}
    
    // Copy "normal" Math objects. This list is exported from my Chrome install at the time.
	// NB.: List is required because a for..in loop doesn't work.
    ["E", "LN10", "LN2", "LOG2E", "LOG10E", "PI", "SQRT1_2", "SQRT2", "random", "abs", "acos", "asin", "atan", "ceil", "cos", "exp", "floor", "log", "round", "sin", "sqrt", "tan", "atan2", "pow", "max", "min", "imul", "sign", "trunc", "sinh", "cosh", "tanh", "asinh", "acosh", "atanh", "log10", "log2", "hypot", "fround", "clz32", "cbrt", "log1p", "expm1", "ln", "QuarterPI", "TreeQuarterPI", "HalfPI", "TwoPI", "InverseQuarterPI", "InverseTreeQuarterPI", "InverseHalfPI", "InverseTwoPI", "InversePI", "hyp"].forEach(function(k) {
        
        // Name remains as-is (this can be a Math drop-in replacement.)
        self[k] = self[k] || Math[k];
        
        // Meier.js capitalizes static methods, duplicate this notation.
        self[k.ucFirst()] = self[k.ucFirst()] || Math[k];
    });
    
    
    return self;
    
}); // End define
/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Factorial   = require("meier/math/Math").Factorial;
    var GaussJordan = require("meier/math/Math").GaussJordanElimination;
    var V2          = require("meier/math/Vec")(2);
    
    
    // Dynamic matrix builder:
    var M          = require("meier/math/Mat");
    
    /// My polynomial wish-list
    function HornersMethod() {}
    function RegulaFalsi() { }
    function BasisSpline() {}
    
    var self = {
        /// Binomial coefficient:
        ///   k         k!
        ///  --- = -----------
        ///   n    n! (k - n)!
        ///
        /// @param d Available options?
        /// @param n Amount selected?
        /// @return float indicating the binomial coefficient
        BinomialCoefficient: function(d, n) {
            return Factorial(d) / (Factorial(d - n) * Factorial(n));
        },
    
        /// Calculate Bernstein basis polynomials.
        ///
        /// @param d Number of control points minus one.
        /// @param n Current control point. Works when n <= d
        /// @param x Time interval
        /// @return float indicating the bernstein basis value
        BernsteinBasis: function(d, n, x) {
    
            // Binomial coefficient:
            var b = self.BinomialCoefficient(d, n);

            // Bernstein polynomial:
            return b * Math.pow(x, n) * Math.pow(1 - x, d - n);
        },

        /// Calculate a point on a bézier curve. Works for any number of control
        /// points. Internaly uses Bernstein basis polynomals. If this is
        /// performance sensitive, (internally,) the bernstein basis polynomal
        /// computation may be cached.
        ///
        /// NB: a bézier curve is is simply a basis spline of the highest 
        /// possible degree. (where degree equals the number of control points)
        ///
        /// @param points A collection indicating the control points.
        /// @param delta Interval at which to calculate the point, ranges from 0 to 1.
        /// @return a point on a bézier curve.
        BezierInterpolation: function(points, delta) {
            if(points.length === 0) {
                throw new Error("Cannot calculate a bezier curve point without any control points.");
            }
    
            var result = new V2(0, 0);
    
            var n = points.length - 1;
            for(var i = 0, b; i <= n; ++i) {
                // TODO: We can cache the BernsteinBasis result.
                b = self.BernsteinBasis(n, i, delta);
        
                result.x += points[i].x * b;
                result.y += points[i].y * b;
            }
    
            return result;
        },

        /// Find a polynomial that runs through the given points. Internally
        /// uses Gauss-Jordan elimination. No back-substitution.
        ///
        PolynomialPath: function(points) {
            // Dynamic matrix builder, loaded "late" to avoid circular
            // dependancy.
            var M   = require("meier/math/Mat");
            
            var degree = points.length;
            
            // Matrices:
            var m = new (M(degree, degree))();
            var v = new (M(degree, 1))();
            
            for(var row = 0, p; row < degree; ++row) {
                p = points[row];
            
                // Known locations:
                v.set(row, 0, p.y);
            
                // Fill the augmented matrix:
                for(var col = 0; col < degree; ++col) {
                    m.set(row, col, Math.pow(p.x, col));
                }
            }
            
            // Solve system of linear equations:
            var r = GaussJordan(m, v);
            
            // Build JavaScript code that contains the polynomial:
            var fn = "return ";
            for(var i = 0, d; i < degree; ++i) {
                fn += r.at(i, 0) + " * Math.pow(x, " + i + ") + ";
            }
            fn = fn.trim(" + ") + ";";
        
            try{
                return new Function("x", fn);
            } catch(e) {
                console.error("Unable to create PolynomialPath. Code:");
                console.error(fn);
            }
            
            return null;
        },

        /// Find the lagrange polynomial that runs through all the given control points.
        /// http://mathworld.wolfram.com/LagrangeInterpolatingPolynomial.html
        ///
        /// Note: the control points do not indicate a local minimal or maxima of the
        /// created polynomial.
        ///
        Lagrange: function(points) {
            var p = [];

            // Create a polynomial for each point, when summed together
            // this forms the Lagrange polynomial:
            for(var i = 0; i < points.length; ++i) {
                (function(i) {
                    p[i] = function(x) {
                
                        var r =  points[i].y;
                
                        for(var j = 0; j < points.length; ++j) {
                            if(j === i) {
                                continue;
                            }
                    
                            r *= (x - points[j].x) / (points[i].x - points[j].x);
                        }
                
                        return r;
                    }
                }(i));
            }
    
            // Return function of x:
            return function(x) {
                var y = 0;
        
                // Sum all polynomials:
                for(var k = 0; k < p.length; ++k) {            
                    y += p[k](x);
                }
        
                return y;
            }
        },

        /// Find the root of a quadratic polynomial. Returns an
        /// array containing the available solutions. Interally
        /// uses the Quadratic formula.
        ///
        /// Solves 'x' in: ax^2 + bx + c = 0
        SolveQuadratic: function(a, b, c) {
            var discriminant = Math.pow(b, 2) - 4 * a * c;
    
            // One real solution:
            if(discriminant === 0) {
        
                return [
                    -b / (2 * a)
                ];
        
            // Two real solutions:
            } else if(discriminant > 0) {
                var root = Math.sqrt(discriminant);
        
                return [
                    (-b + root) / (2 * a),
                    (-b - root) / (2 * a) 
                ];
            }
    
            // Polynomial discriminant < 0, solutions are found 
            // in complex plane - I don't care.
            return [];
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
                return self.NewtonRaphsonIteration(f, g, r, steps - 1);
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
                return self.PicardIteration(g, r, steps - 1);
            }
    
            return r;
        },
        
        /// Find a linear regression using the least squares
        /// criterion. This seems to be used in fields that
        /// never use matrices, or before the "student" is 
        /// introduced to matrices.
        ///
        /// Yields b0 and b1 in:
        ///     y = b0 + b1 * x
        ///
        /// In case non array data is used, a custom getter must be
        /// supplied, e.g., for vectors use:
        ///
        ///     function(row) { return [row.x, row.y]; }
        ///
        ///
        /// @param {data} an array containing the data.
        /// @param {getter} an optional custom getter for row values.
        /// @return An array containing b0 and b1 and indices 
        ///         0 and 1, respectively.
        /// @see LeastSquares for non-linear regression.
        LeastSquaresLinearRegression: function(data, getter) {
            
            // Assign a default trivial case getter:
            if( ! getter) {
                getter = function(row) {
                    return row;
                };
            }
        
            var xy = 0;
            var x = 0, xsq = 0;
            var y = 0;
            var n = 0;
        
            data.forEach(function(pair) {
                pair = getter(pair, n);
            
                xsq += Math.pow(pair[0], 2);
                x   += pair[0];
                y   += pair[1];
                xy  += pair[0] * pair[1];
                ++n;
            });
        
            var b1 = (xy - x * y / n) / (xsq - Math.pow(x, 2) / n);
            var b0 = (y - b1 * x) / n;
        
            return [b0, b1];
        },
        
        /// Curve fitting using least squares, up to any degree.
        /// If you want a linear regression, use "LeastSquaresLinearRegression"
        /// instead, which is probably more efficient internally.
        ///
        /// @param degree The desired polynomial degree
        /// @param coordinates An array of 2d vectors.
        /// @return A matrix containing the polynomial coefficients.
        /// @see LeastSquaresLinearRegression for linear regression.
        LeastSquares: function(degree, coordinates) {
        
            if(degree < 0) {
                throw new Error("LeastSquares - cannot work with a degree less than 1. Given: " + degree);
            }
        
            // Augmented matrix (up to a given degree):
            var A = new (M(coordinates.length, degree))();
        
            // Solution vector:
            var B = new (M(coordinates.length, 1))();
        
            // Fill the augmented matrix:
            for(var row = 0, p; row < coordinates.length; ++row) {
                p = coordinates[row];
            
                // Known locations:
                B.set(row, 0, p.y);
            
                // x is raised to the polynomial power:
                for(var col = 0; col < degree; ++col) {
                    A.set(row, col, Math.pow(p.x, col));
                }
            }
        
            var At = A.transpose();
        
            // Since the matrices A and B are not compatiple in size, we 
            // multiply both sides by A's transpose, this is OK because both 
            // sides remain in balance. The resulting matrices can be used 
            // for Gaussian elemination. 
        
            var AtA = At.product(A);
            var AtB = At.product(B);
        
            // R will contain the polynomial coefficients.
            var R = GaussJordan(AtA, AtB);
        
            return R;
        }
    };
    
    return self;
});
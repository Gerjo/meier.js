define(function(require) {
    /// My polynomial wish-list
    function HornersMethod() {}
    function RegulaFalsi() { }
    function BasisSpline() {}
    
    return {
    
        /// Calculate Bernstein basis polynomials.
        ///
        /// @param d Number of control points minus one.
        /// @param n Current control point. Works when n <= d
        /// @param x Time interval
        /// @return float indicating the bernstein basis value
        BernsteinBasis: function(d, n, x) {
    
            // Binomial coefficient:
            var b = Factorial(d) / (Factorial(d - n) * Factorial(n));

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
    
            var result = new Vector(0, 0);
    
            var n = points.length - 1;
            for(var i = 0, b; i <= n; ++i) {
                // TODO: We can cache the BernsteinBasis result.
                b = BernsteinBasis(n, i, delta);
        
                result.x += points[i].x * b;
                result.y += points[i].y * b;
            }
    
            return result;
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
        
            // Two real solution:
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
    };
});
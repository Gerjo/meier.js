
/// Great for comparing floating point numbers:
function EpsilonEquals(value, test, epsilon) {
    return value > test - epsilon && value < test + epsilon;
}


/// Map range A onto B at interval cu in [b1..b2]
function Map(a1, a2, b1, b2, cu) {
    var t = 1 / (b2 - b1) * cu;
    return a1 * (1 - t) + a2 * t;
}

/// Lerp for floats:
function LerpFloat(a, b, t) {
    return a * (1 - t) + b * t;
}

/// Lerp, with rounding.
function LerpInt(a, b, t) {
    return Math.round(a * (1 - t) + b * t);
}

/// Lerp an RGBA color. Colors are R, G, B, A arrays.
function LerpColor(a, b, t) {
    return "rgba(" + LerpInt(a[0],   b[0], t) + ", " +
                     LerpInt(a[1],   b[1], t) + ", " +
                     LerpInt(a[2],   b[2], t) + ", " +
                     LerpFloat(a[3], b[3], t) + ")";
}

/// Normalize a range into [0..1].
/// Example: Normalized(0, 255, 128) yields 0.5
function Normalized(min, max, current) {
    var per =  1 / (max - min)
    return per * current;
}

/// From degrees to radians.
function ToRadians(degrees) {
    return degrees * Math.PI / 180;
}

/// From radians to degrees.
function ToDegrees(radians) {
    return 180 / Math.PI * radians;
}

/// Map a [0..PI, -PI..0] range to [0...2PI]
function ToAbsoluteRadians(a) {
    if(a < 0) {
        return Math.PI + (Math.PI + a);
    }
    
    return a;
}

/// Map [-nPI...nPI] to [0..PI, -PI..0] range
function ToRelativeRadians(a) {
    
    // Normalize to something positive:
    while(a < 0) {
        a += Math.TwoPI;
    }
    
    // Normalize to [0...2PI]:
    while(a >= Math.TwoPI) {
        a -= Math.TwoPI;
    }
    
    // Normalize [PI...2PI] to [-PI..0]
    if(a > Math.PI) {
        return (a - Math.PI) - Math.PI;
    }
    
    // Range good as-is.
    return a;
}

/// Radians to degrees and Math.round.
function ToDegreesRounded(radians) {
    return Math.round(180 / Math.PI * radians);
}

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
function NewtonRaphsonIteration(f, g, initial, steps) {
    
    var r = initial - f(initial) / g(initial);
    
    if(steps > 0) {
        return NewtonRaphsonIteration(f, g, r, steps - 1);
    }
    
    return r;
}

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
function PicardIteration(g, initial, steps) {
    
    var r = g(initial);
        
    if(steps > 0) {
        return PicardIteration(g, r, steps - 1);
    }
    
    return r;
}

/// Compute the factorial of a given number. Uses a switch case for
/// 0 < n < 7, then resorts to a while loop. Granted javascript
/// may be slow, if you must - inline your own factorial.
function Factorial(n) {
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
}

/// Calculate Bernstein basis polynomials.
///
/// @param d Number of control points minus one.
/// @param n Current control point. Works when n <= d
/// @param x Time interval
/// @return float indicating the bernstein basis value
function BernsteinBasis(d, n, x) {
    
    // Binomial coefficient:
    var b = Factorial(d) / (Factorial(d - n) * Factorial(n));

    // Bernstein polynomial:
    return b * Math.pow(x, n) * Math.pow(1 - x, d - n);
}

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
function BezierInterpolation(points, delta) {
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
}


/// Find the lagrange polynomial that runs through all the given control points.
/// http://mathworld.wolfram.com/LagrangeInterpolatingPolynomial.html
///
/// Note: the control points do not indicate a local minimal or maxima of the
/// created polynomial.
///
function LagrangePolynomial(points) {
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
}

/// Find the root of a quadratic polynomial. Returns an
/// array containing the available solutions. Interally
/// uses the Quadratic formula.
///
/// Solves 'x' in: ax^2 + bx + c = 0
function SolveQuadraticPolynomial(a, b, c) {
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
}

/// My polynomial wish-list
function HornersMethod() {}
function RegulaFalsi() { }
function BasisSpline() {}

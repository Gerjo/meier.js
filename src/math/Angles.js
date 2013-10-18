/// From degrees to radians.
function ToRadians(degrees) {
    return degrees * Math.PI / 180;
}

/// From radians to degrees.
function ToDegrees(radians) {
    return 180 / Math.PI * radians;
}

/// Radians to multiples of pi.
function ToPiMultiples(radians) {
    return radians / Math.PI;
}

/// Map a [0..PI, -PI..0] range to [0...2PI]
function ToAbsoluteRadians(a) {
    if(a < 0) {
        return Math.PI + (Math.PI + a);
    }
    
    return a;
}

function DeltaRelativeRadians(a, b) {
    var delta = b - a;
    return delta + ((delta > Math.PI) ? -Math.TwoPI : (delta < -Math.PI) ? Math.TwoPI : 0)
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


/// Determine if an angle lies between two other angles. This
/// assumes the angles are given in atan2 format.
///
/// @todo better efficency on the inner workings.
///
/// @param {angle} The angle to test for.
/// @param {a} The lower (or upper) bound
/// @param {b} The upper (or lower) bound
/// @return boolean indicating whether angle lies between angles.
function IsAngleInBetween(angle, a, b) {
    
    a     = Vector.CreateAngular(a);
    b     = Vector.CreateAngular(b);
    angle = Vector.CreateAngular(angle);
    
    return (
        Math.sgn(a.cross(angle)) != Math.sgn(b.cross(angle))
    );
}


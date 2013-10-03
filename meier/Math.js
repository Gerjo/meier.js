
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
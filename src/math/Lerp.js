define(function(require) {
    var Vector = require("meier/math/Vector");
    
    return {
        /// Lerp for floats:
        Float: function (a, b, t) {
            return a * (1 - t) + b * t;
        },

        /// Lerp, with rounding.
        Int: function (a, b, t) {
            return Math.round(a * (1 - t) + b * t);
        },

        /// Lerp an RGBA color. Colors are R, G, B, A arrays.
        Color: function (a, b, t) {
            return "rgba(" + LerpInt(a[0],   b[0], t) + ", " +
                             LerpInt(a[1],   b[1], t) + ", " +
                             LerpInt(a[2],   b[2], t) + ", " +
                             LerpFloat(a[3], b[3], t) + ")";
        },

        /// Lerp for vectors:
        Vector: function(a, b, t) {
            return new Vector(
                a.x * (1 - t) + b.x * t,
                a.y * (1 - t) + b.y * t
            );
        },
    }
});
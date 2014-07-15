define(function(require) {
    
    var Vector = require("meier/math/Vec")(2);
    var Colors = require("meier/engine/Colors");
    
    /// Class that represents an annulus.
    function Annulus(position, min, max) {
        
        // Center position
        this.position = position || new Vector(0, 0);
        
        // Inner radius
        this.min      = min || Infinity;
        
        // Outer radius
        this.max      = max || -Infinity;
        
        // Associate a visualisation color
        this.color    = Colors.black;
        
        // A identifier name
        this.name     = "Arbitrary Annulus";
    }
    
    /// Draw this annulus instance
    ///
    /// @param {renderer} A valid Renderer instance.
    Annulus.prototype.draw = function(renderer) {
        renderer.begin();
        renderer.circle(this.position, this.min + this.width * 0.5);
        renderer.stroke(Colors.Alpha(this.color, 0.3), this.width);
        
        renderer.begin();
        renderer.circle(this.position, 2);
        renderer.circle(this.position, this.min);
        renderer.circle(this.position, this.max);
        renderer.stroke(this.color);
    };
    
    /// A virtual property. The width is derived from the inner 
    /// and outer rings.
    Object.defineProperty(Annulus.prototype, "width", {
        get: function() { return this.max - this.min; },
    });
    
    return Annulus;
});
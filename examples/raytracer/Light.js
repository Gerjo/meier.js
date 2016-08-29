define(function(require) {
    var V3 = require("meier/math/Vec")(3);
    
    function Light(position) {
        this.position = position || new V3(0, 0, 0);
        
        // Percentage relative to other lights.
        this.energy = 100;
    }
    
    return Light;
});
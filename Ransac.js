define(function(require) {
    var Disk    = require("meier/math/Disk");
    var Vector  = require("meier/math/Vec")(2);
    var Annulus = require("./Annulus");
    
    /// Find an annulus using RANSAC.
    ///
    /// @param {coordinates} An array with 2d vectors.
    /// @param {k} Number of RANSAC iterations to run.
    /// @param {estimationModel} Model to use for determining annulus center;
    ///             0: Use the circumcircle of 3 random coordiates
    ///             1: Use the mean position 3 random coordiates
    /// @param {initialAnnulus} An optional initial annulus. E.g., refine a previous
    ///                         ransac iteration.
    /// @return The best found annulus within K iterations. If an initial annulus
    ///         is provided and no better annulus is found, the initial annulus 
    ///         is returned.
    function Ransac(coordinates, k, estimationModel, initialAnnulus) {  
        
        // Clamp k to a sensible range
        k = Math.max(1, k);
              
        // Initial annulus
        var bestAnnulus = initialAnnulus || null;
        var bestModel   = null;
        
        while(k-- > 0) {

            // Randomly shuffle all candidates
            var candidates = coordinates.clone().shuffle();
            
            // Pick initial coordinates
            var consensus = [candidates[0], candidates[1], candidates[2]];
    
            // Our model is a circle that runs through the initial 3 coordinates
            var model;
            
            // Find a circle that runs through the 3 coordinates, and use that as center
            if(estimationModel == 0) {
                 model = Disk.CreateCircumcircle(consensus[0], consensus[1], consensus[2]);
                 
            // Take the average position as the center
            } else if(estimationModel == 1) {
                var center = consensus.reduce(function(c, v) {
                    return c.add(v);
                }, new Vector(0, 0)).scaleScalar(1 / consensus.length);
                
                model = new Disk(center, 0);
            } else {
                throw new Error("Not a valid estimation model. Try '0' or '1'.");
            }
            
            
            // Initial annulus
            var annulus = new Annulus(model.position);
        
            // See how well the points fit the model
            for(var i = 0; i < candidates.length; ++i) {
                var distance = candidates[i].distance(model.position);
                
                // Test for a better outer radius
                if(distance > annulus.max) {
                    annulus.max = distance;
                }
                
                // Test for a better inner radius
                if(distance < annulus.min) {
                    annulus.min = distance;
                }
            }
            
            // Is the new better than the previous?
            if(bestAnnulus == null || annulus.width < bestAnnulus.width) {
                bestAnnulus  = annulus;
                bestModel    = model;
            }
        }
                
        // And the winner is...
        return bestAnnulus;
    };
    
    return Ransac;
});
define(function(require) {
    
    // TODO: for each font load the most sensible font per operating system.
    Fonts.Monospace = "monospace";
    
    function Fonts() {
        
    }
    
    
    var MeasurementCache = {};
    
    /// Attempt to determine a font's height and baseline. Measurements are
    /// cached internally, only the first call will be slow.
    ///
    ///     _____             -+ height   -+
    ///    / ____|             |           | drop (doesn't work)
    ///   | |  __  __ _        |          -+ -+
    ///   | | |_ |/ _` |       |              |
    ///   | |__| | (_| |       |              | baseheight (doesn't work)
    ///    \_____|\__, |       |  -+         -+
    ///            __/ |       |   | baseline
    ///           |___/       -+  -+
    ///
    /// @param {css} A style applied to css's font setting. Expected
    ///              format: "10px bold monospace"
    /// @return An object indicating the height and baseline of a font.
    Fonts.Measure = function(css) {
        
        if(css in MeasurementCache) {
            // Returns a reference, might be unexpected.
            return MeasurementCache[css];
        }
        
        var result = {
            "height":     0,
            "baseline":   0,
            //"baseheight": 0,
            //"drop":       0
        };
        
        var body    = document.getElementsByTagName("body")[0];
        var div     = document.createElement('div');
        var span    = document.createElement('span');
        var text    = document.createTextNode("PQqpFMW1|<>}{}");

        div.style.verticalAlign = "bottom";
        div.style.width         = "10px";
        div.style.display       = "inline-block";
        div.style.border        = "1px solid red";
        span.style.font         = css;

        span.appendChild(text);
        body.appendChild(span);
        body.appendChild(div);

        result.height           = div.offsetTop;

        div.style.verticalAlign = "baseline";
        result.baseline         = result.height - div.offsetTop;
        
        //div.style.verticalAlign = "text-top";
        //result.drop             = div.offsetTop;
        
        //result.baseheight = result.height - result.baseline - result.drop;
        
        //console.log(css, result.drop);
        
        // Store into cache
        MeasurementCache[css] = result;
                
        span.removeChild(text)
        body.removeChild(span);
        body.removeChild(div);
                
        return result;
    };
    
    return Fonts;
});
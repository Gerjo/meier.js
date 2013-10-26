define(function (require) {
    return function(from, to, width) {
        
        // All possible wrapping combinations:
        var segs = [
            [from, to],
            [from - width, to - width],
            [from + width, to + width],
        ];
        
        // Let's filter the invalid combinations:
        return segs.filter(function(segment) {
            // Trim to range:
            segment[0] = Math.max(segment[0], 0);
            segment[0] = Math.min(segment[0], width);
            segment[1] = Math.max(segment[1], 0);
            segment[1] = Math.min(segment[1], width);
            
            // End point is negative:
            if(segment[1] < 0) {
                return false;
            }
            
            // No length at all:
            if(segment[0] == segment[1] && segment[0] === 0) {
                return false;
            }
            
            // All good. Keep segment:
            return true;
        });
    } 
});
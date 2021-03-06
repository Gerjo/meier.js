/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/


define(function(require) {
    var Lerp = require("meier/math/Lerp");
    
    var htmlColors = {
        "aliceblue": "#F0F8FF",
        "lightsalmon": "#FFA07A",
        "antiquewhite": "#FAEBD7",
        "lightseagreen": "#20B2AA",
        "aqua": "#00FFFF",
        "lightskyblue": "#87CEFA",
        "aquamarine": "#7FFFD4",
        "lightslategray": "#778899",
        "azure": "#F0FFFF",
        "lightsteelblue": "#B0C4DE",
        "beige": "#F5F5DC",
        "lightyellow": "#FFFFE0",
        "bisque": "#FFE4C4",
        "lime": "#00FF00",
        "black": "#000000",
        "limegreen": "#32CD32",
        "blanchedalmond": "#FFEBCD",
        "linen": "#FAF0E6",
        "blue": "#0000FF",
        "magenta": "#FF00FF",
        "blueviolet": "#8A2BE2",
        "maroon": "#800000",
        "brown": "#A52A2A",
        "mediumaquamarine": "#66CDAA",
        "burlywood": "#DEB887",
        "mediumblue": "#0000CD",
        "cadetblue": "#5F9EA0",
        "mediumorchid": "#BA55D3",
        "chartreuse": "#7FFF00",
        "mediumpurple": "#9370DB",
        "chocolate": "#D2691E",
        "mediumseagreen": "#3CB371",
        "coral": "#FF7F50",
        "mediumslateblue": "#7B68EE",
        "cornflowerblue": "#6495ED",
        "mediumspringgreen": "#00FA9A",
        "cornsilk": "#FFF8DC",
        "mediumturquoise": "#48D1CC",
        "crimson": "#DC143C",
        "mediumvioletred": "#C71585",
        "cyan": "#00FFFF",
        "midnightblue": "#191970",
        "darkblue": "#00008B",
        "mintcream": "#F5FFFA",
        "darkcyan": "#008B8B",
        "mistyrose": "#FFE4E1",
        "darkgoldenrod": "#B8860B",
        "moccasin": "#FFE4B5",
        "darkgray": "#A9A9A9",
        "navajowhite": "#FFDEAD",
        "darkgreen": "#006400",
        "navy": "#000080",
        "darkkhaki": "#BDB76B",
        "oldlace": "#FDF5E6",
        "darkmagenta": "#8B008B",
        "olive": "#808000",
        "darkolivegreen": "#556B2F",
        "olivedrab": "#6B8E23",
        "darkorange": "#FF8C00",
        "orange": "#FFA500",
        "darkorchid": "#9932CC",
        "orangered": "#FF4500",
        "darkred": "#8B0000",
        "orchid": "#DA70D6",
        "darksalmon": "#E9967A",
        "palegoldenrod": "#EEE8AA",
        "darkseagreen": "#8FBC8F",
        "palegreen": "#98FB98",
        "darkslateblue": "#483D8B",
        "paleturquoise": "#AFEEEE",
        "darkslategray": "#2F4F4F",
        "palevioletred": "#DB7093",
        "darkturquoise": "#00CED1",
        "papayawhip": "#FFEFD5", // wut? "papayawhip"
        "darkviolet": "#9400D3",
        "peachpuff": "#FFDAB9",
        "deeppink": "#FF1493",
        "peru": "#CD853F",
        "deepskyblue": "#00BFFF",
        "pink": "#FFC0CB",
        "dimgray": "#696969",
        "plum": "#DDA0DD",
        "dodgerblue": "#1E90FF",
        "powderblue": "#B0E0E6",
        "firebrick": "#B22222",
        "purple": "#800080",
        "floralwhite": "#FFFAF0",
        "red": "#FF0000",
        "forestgreen": "#228B22",
        "rosybrown": "#BC8F8F",
        "fuchsia": "#FF00FF",
        "royalblue": "#4169E1",
        "gainsboro": "#DCDCDC",
        "saddlebrown": "#8B4513",
        "ghostwhite": "#F8F8FF", // Who on earth came up with this?
        "salmon": "#FA8072",
        "gold": "#FFD700",
        "sandybrown": "#F4A460",
        "goldenrod": "#DAA520",
        "seagreen": "#2E8B57",
        "gray": "#808080",
        "seashell": "#FFF5EE",
        "green": "#008000",
        "sienna": "#A0522D",
        "greenyellow": "#ADFF2F",
        "silver": "#C0C0C0",
        "honeydew": "#F0FFF0",
        "skyblue": "#87CEEB",
        "hotpink": "#FF69B4",
        "slateblue": "#6A5ACD",
        "indianred": "#CD5C5C",
        "slategray": "#708090",
        "indigo": "#4B0082",
        "snow": "#FFFAFA",
        "ivory": "#FFFFF0",
        "springgreen": "#00FF7F",
        "khaki": "#F0E68C",
        "steelblue": "#4682B4",
        "lavender": "#E6E6FA",
        "tan": "#D2B48C",
        "lavenderblush": "#FFF0F5",
        "teal": "#008080",
        "lawngreen": "#7CFC00",
        "thistle": "#D8BFD8",
        "lemonchiffon": "#FFFACD",
        "tomato": "#FF6347",
        "lightblue": "#ADD8E6",
        "turquoise": "#40E0D0",
        "lightcoral": "#F08080",
        "violet": "#EE82EE",
        "lightcyan": "#E0FFFF",
        "wheat": "#F5DEB3",
        "lightgoldenrodyellow": "#FAFAD2",
        "white": "#FFFFFF",
        "lightgreen": "#90EE90",
        "whitesmoke": "#F5F5F5",
        "lightgrey": "#D3D3D3",
        "yellow": "#FFFF00",
        "lightpink": "#FFB6C1",
        "yellowgreen": "#9ACD32"
    };
    

    var Colors = function() {
        // This could do something?
    };
    
    function HexToRGBA(hex) {
		
		/// RGBA 
		if(hex.length == 9) {
	        return "RGBA(" +
	            parseInt(hex.substring(1, 3), 16) + "," +
	            parseInt(hex.substring(3, 5), 16) + "," +
	            parseInt(hex.substring(5, 7), 16) + "," + 
		        (parseInt(hex.substring(7, 9), 16) / 256) + ")"; 
		
		// Intensity / gray-scale
		} else if(hex.length == 3) {
			var i = parseInt(hex.substring(1, 3), 16);
			
			return "RGBA(" + i + "," + i + "," + i + ", 1)";
		}
		
		/// RGB
        return "RGBA(" +
            parseInt(hex.substring(1, 3), 16) + "," +
            parseInt(hex.substring(3, 5), 16) + "," +
            parseInt(hex.substring(5, 7), 16) + ", 1)";
    }
	
    var allColors = [];
   
    // Loop and add colors. I didn't feel like doing this by hand.
    for(var k in htmlColors) {
        if(htmlColors.hasOwnProperty(k)) {
            var rgba = HexToRGBA(htmlColors[k]);
            
            // Lowercase, more pleasant to the eye?
            Colors[k] = rgba;
            
            // Uppercase version, matches all other enums in
            // meier.js
            Colors[k.toUpperCase()] = rgba;

            // First character upppercase.
            Colors[k.ucFirst()] = rgba;
            
            // We cannot efficiently pick a random property, so
            // stick them in an array as well. Random items from
            // an array is trivial and O(1)
            allColors.push(rgba);            
        }
    }

    Colors.Random = function(count) {
        if(arguments.length == 0) {
            return allColors.random();
        }
        
        var r = new Array(count);

        var lookup = {};
        
        while(count > 0) {
            var color = allColors.random();
            
            // Only unique colors are accepted.
            if(lookup[color] !== true) {
                lookup[color] = true;
                r[--count] = color;
            }
        }
        
        return r;
    };
	
    /// Determine if the given argument is a color.
    Colors.IsColor = function(color) {
        if(color.charAt(0) == "#") {
            return true;
            
        } if(color.startsWith("RGBA(") || color.startsWith("rgba(")) {
            return true;

        } if(color.startsWith("RGB(") || color.startsWith("rgb(")) {
            return true;
            
        } else if(Colors[color]) {
            return true;
        }
        
        return false;
    };

    /// Change the transparency of a color. Work in 
    /// progress. Behaviour may change.
    Colors.Alpha = function(color, alpha) {
        
        var rgba = false;
        
        // By hex
        if(color.charAt(0) == "#") {
            rgba = HexToRGBA(color);
            
        // By RGBA
        } else if(color.startsWith("RGBA(") || color.startsWith("rgba(")) {
			var prefix = color.substring(0, color.lastIndexOf(","));

			return prefix + "," + alpha + ")";

        // By RGB
        } else if(color.startsWith("RGB(") || color.startsWith("rgb(")) {
			
			var channels = color.substring(4, color.length - 1);
		
			return "rgba(" + channels + "," + alpha + ")";
            
        // By name
        } else {
            // Lookup without case transformation
            if(Colors[color]) {
                rgba = Colors[color];
                
            // Try with normalized case
            } else {
                rgba = Colors[color.toLowerCase()];
            }
        }
        
        if(!rgba) {
            throw new Error("Cannot change alpha, unknown color: " + color);
        }
        
        return rgba.substring(0, rgba.length - 2) + alpha + ")";
    };
    
    // Colors as used by R, these seem pleasant to the eye.
    var HeatColors = [
    "#e93f33","#e93f33","#eb5333","#ed6f33",
    "#ef8835","#f2a044","#f5b453","#f8c762",
    "#fbd870","#fee680",
    
    "#ccb826","#bdc421","#9cbb17","#7db30b",
    "#60ab01","#54a304","#4e9907","#4a9209",
    "#468909","#418111",
    
    "#504cfc","#474cfc","#454bfc","#5565fc",
    "#7192fc","#8db7fc","#aad4fd","#c6eafd",
    "#e3f7fe","#ffffff"
    ].reverse();
        
    
    Colors.HeatMap = function(min, max, current) {
        var index = Math.floor((current-min) / (max-min) * (HeatColors.length-1));
        
        return HeatColors[index];
    };
	
	Colors.RGBToXYZ = function(r, g, b) {
		UNTESTED("RGBToHSV");
		return [
			r * 0.4124 + g * 0.3576 + b * 0.1805,
			r * 0.2126 + g * 0.7152 + b * 0.0722,
			r * 0.0193 + g * 0.1192 + b * 0.9505
		];
	};
	
	Colors.XYZToCieLab = function(x, y, z) {
		UNTESTED("XYZToCieLab");
		
	    var var_X = x / 95.047;          //ref_X =  95.047   Observer= 2°, Illuminant= D65
	    var var_Y = y / 100.000;          //ref_Y = 100.000
	    var var_Z = z / 108.883;          //ref_Z = 108.883
    
	    if(var_X > 0.008856 ) {
	        var_X = Math.pow(var_X, 1.0/3.0);
	    } else {
	        var_X = ( 7.787 * var_X ) + ( 16.0 / 116.0 );
	    }
    
	    if( var_Y > 0.008856 ) {
	        var_Y = Math.pow(var_Y, 1.0/3.0);
	    } else {
	        var_Y = ( 7.787 * var_Y ) + ( 16.0 / 116.0 );
	    }
    
	    if( var_Z > 0.008856 ) {
	        var_Z = Math.pow(var_Z, 1.0/3.0);
	    } else {
	        var_Z = ( 7.787 * var_Z ) + ( 16.0 / 116.0 );
	    }
    
	    var r = [
	                (116.0 * var_Y ) - 16.0,
	                500.0 * ( var_X - var_Y ),
	                200.0 * ( var_Y - var_Z )
	             ];
    
	    // x = 0 to 9
	    // y = -39 to 41
	    // z = -14.242504 to 15.446088
    
	    return [
	        r[0] / 9.0,
	        (r[1] + 39.0) / 80.0,
	        (r[2] + 15.0) / 31.0
		];
	};
	
	Colors.RGBToHSV = function(r, g ,b) {
	    var out = [0, 0, 0];
    
	    //http://www.cs.rit.edu/~ncs/color/t_convert.html

	    var min = Math.min(r, Math.min(g, b));
	    var max = Math.max(r, Math.max(g, b));

	    out[2] = max;

	    var delta = max - min;
    
	    if(max != 0.0) {
	        out[1] = delta / max;		// s
	    } else {
	        // r = g = b = 0		// s = 0, v is undefined
	        out[1] = 0.0;
	        out[0] = 0.0;
	        return out;
	    }
    
	    //MEIER_ASSERT(delta != 0.0f, "it is white");
    
	    if(delta == 0.0) {
	        out[0] = 0.0;
	    } else if(r == max) {
	        out[0] = (g - b) / delta;		// between yellow & magenta
	    } else if(g == max) {
	        out[0] = 2 + (b - r) / delta;	// between cyan & yellow
	    } else {
	        out[0] = 4 + (r - g) / delta;	// between magenta & cyan
	    }
    
	    out[0] *= 60.0;				// degrees
	    if( out[0] < 0.0) {
	        out[0] += 360.0;
	    }
    
	    out[0] /= 360.0;
    
	    return out;
	};
	
	
	Colors.HSVToRGB = function(inh, ins, inv) {

	    //http://www.cs.rit.edu/~ncs/color/t_convert.html

	    if(s == 0.0) {
	        // achromatic (grey)
	        return [v, v, v];
	    }
    
	    var h = inh * Math.TwoPi; // sector 0 to 5
	    var i = Math.floor(h);
	    var f = h - i;			// factorial part of h
	    var p = inv * (1.0 - ins);
	    var q = inv * (1.0 - ins * f);
	    var t = inv * (1.0 - ins * (10 - f));
    
	    switch( i ) {
	        case 0:
	            return [inv, t, p];
	        case 1:
	            return [q, inv, p];
	        case 2:
				return [p, inv, t];
	        case 3:
				return [p, q, inv];
	        case 4:
				return [t, p, inv];
	            break;
	        default:		// case 5:
				return [inv, p, q];
	    }

	    return out;
	};
	
    
    return Colors;
});
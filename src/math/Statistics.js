Meier.Include("meier/math/Math.js");


/// Calculate the mean (average) of a collection.
function Mean(data) {
    return data.reduce(function (a, b) {
        return a + b;
    }) / data.length;;
}

function Sum(data) {
    return data.reduce(function(a, b) {
        return a + b;
    });
}

/// Find the mode(s) of a collection. Courtesy of:
/// http://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array
function Mode(array) {
        if (array.length == 0)
            return null;
        var modeMap = {},
            maxCount = 1, 
            modes = [array[0]];

        for(var i = 1; i < array.length; i++)
        {
            var el = array[i];

            if (modeMap[el] == null)
                modeMap[el] = 1;
            else
                modeMap[el]++;

            if (modeMap[el] > maxCount)
            {
                modes = [el];
                maxCount = modeMap[el];
            }
            else if (modeMap[el] == maxCount)
            {
                modes.push(el);
                maxCount = modeMap[el];
            }
        }

        return modes;
    }

/// Courtesy of: http://caseyjustus.com/finding-the-median-of-an-array-with-javascript
/// TODO: implement a o(n) for unsorted arrays (e.g., selection algorithm).
function Median(values) {
    
    values = values.clone();
    
    values.sort(function(a, b) { 
        return a - b; 
    });
 
    var half = Math.floor(values.length * 0.5);
 
    if(values.length % 2) {
        return values[half];
    } else {
        return (values[half - 1] + values[half]) * 0.5;
    }
}

function Range(data) {
    return Math.abs(Math.max.apply(null, data) - Math.min.apply(null, data));
}

function Variance(data) {
    var u     = Mean(data);
    var sigma = 0;
    var n     = data.length;
    
    data.forEach(function(x) {
        sigma += Math.pow(x - u, 2);
    });
        
    return sigma / n;
}

function StandardDeviation(data) {
    return Math.sqrt(Variance(data));
}

/// Determine the skew of a dataset.
/// return values:
///  -1 = left skew
///   0 = symmetric
///   1 = right skew
function Skew(data) {
    var u = Mean(data);
    var m = Median(data);
    
    if(u == m) {
        return 0;
    }
    
    return (u > m) ? 1 : -1;
}


/// Pick n items from a group of k. 
/// How many variations are possible?
function Combinations(n, k) {
    return Factorial(n) / (Factorial(k) * Factorial(n - k));
}

function RepeatingCombinations(n, k) {
    return Factorial(k + n - 1) / (Factorial(k) * Factorial(n - 1));
}

function Variations(n, k) {
    return Factorial(n) / Factorial(n - k);
}

function RepeatingVariations(n, k) {
    return Math.pow(n, k);
}

/// Determine the Chebyshev's inequality.
/// E.g., At least 75% of the measurements differ from the 
///       mean less than twice (k=2) the standard deviation
///
/// E.g., At least 89% of the measurements differ from the 
///       mean less than three times (k=3) the standard deviation
///
/// I'm unsure what use it has, since it's always true.
///
/// Test, this holds perfectly:
///       ChebyshevInequality(Random.IntegerArray(300), 2);
///       That is, 300 random integers are in twice the 
///       default deviation from the mean.
///
/// @param {data} array with numbers
/// @param {k} Amount of deviations from mean.
/// @return An object indicating the computed values, and a boolean
/// indicating whether the rule holds.
function ChebyshevInequality(data, k) {
    
    var s = StandardDeviation(data);
    var u = Mean(data);
    
    var rule = 1 - 1 / Math.pow(k, 2);
    
    // Setup a range:
    var min = u - (s * k);
    var max = u + (s * k);
    
    // Calculate how many numbers are in range:
    var r = data.reduce(function(a, b) {
        if(b > min && b < max) {
            return a + 1;
        }
        
        return a;
    }, 0) / data.length;
    
    return {
        "value"  : r * 100,
        "rule"   : rule * 100,
        "result" : r > rule
    }
}

/// Compute the percentile of a given number.
///    E.g., Percentile([0,1,2,3], 2) == 0.5
/// That means 50% of the number in the collection are 
/// less than 2.
function PercentileOf(data, number) {
    return data.reduce(function(a, b) {
        if(b < number) {
            return a + 1;
        }
        
        return a;
    }, 0) / data.length;
}

/// From percentile to a number
/// Percentile
/// ---------- * (n + 1)
///    100  
function PercentileReverse(data, percentile) {    
    data = data.clone().sort(function(a, b) {
        return a -b;
    });
    

    if(percentile == 1) {
        return data.last();
    }
    
    var index = percentile / 100 * (data.length + 1) - 1;
    var floor = Math.floor(index);
    
    var r = null;
    
    if(floor != index) {
        var ceil = floor + 1;
        
        //console.log(floor, ceil, data.length);
        
        if(ceil < data.length && floor >= 0) {
            // There are no floating point indices, so average it.
            // E.g., 5.2 is the average between index 5 and 6.
            return (data[floor] + data[floor + 1]) * 0.5;
        
        } else if(floor >= 0 && floor < data.length) {
            return data[floor];
        
        }
        
    } else if(index >= 0 && index < data.length) {
        return data[index];
    }
    
    // Percentile was not in a [0..100) range.
    return null;
}


/// Normalize a number using the standard deviation.
function StandardScore(data, number) {

    if(typeof number != "number") {
        return number;
    }
    
    var u = Mean(data);
    var s = StandardDeviation(data);
    
    return (number - u) / s;
}

/// Lookup the area under the bell curve of a normal distribution. 
/// Internally uses the classic lookup table, taling the first 3
/// significant digits into acocunt.
///
/// @todo evaluate functions that calculate the value rather than
/// perform lookup. If it's a curve, I'm sure we can find a
/// polynomial of sorts.
///
/// @param {value} a standard score.
/// @return the area under the curve.
function StandardNormalLookup(value) {
    
    // The curve is symmetric.
    value      = Math.abs(value);
    
    var row    = Math.round(value * 10);
    var column = Math.round(value * 100) - row * 10;

    var table = [
        [0.00000, 0.00399, 0.00798, 0.01197, 0.01595, 0.01994, 0.02392, 0.02790, 0.03188, 0.03586],
        [0.03983, 0.04380, 0.04776, 0.05172, 0.05567, 0.05962, 0.06356, 0.06749, 0.07142, 0.07535],
        [0.07926, 0.08317, 0.08706, 0.09095, 0.09483, 0.09871, 0.10257, 0.10642, 0.11026, 0.11409],
        [0.11791, 0.12172, 0.12552, 0.12930, 0.13307, 0.13683, 0.14058, 0.14431, 0.14803, 0.15173],
        [0.15542, 0.15910, 0.16276, 0.16640, 0.17003, 0.17364, 0.17724, 0.18082, 0.18439, 0.18793],
        [0.19146, 0.19497, 0.19847, 0.20194, 0.20540, 0.20884, 0.21226, 0.21566, 0.21904, 0.22240],
        [0.22575, 0.22907, 0.23237, 0.23565, 0.23891, 0.24215, 0.24537, 0.24857, 0.25175, 0.25490],
        [0.25804, 0.26115, 0.26424, 0.26730, 0.27035, 0.27337, 0.27637, 0.27935, 0.28230, 0.28524],
        [0.28814, 0.29103, 0.29389, 0.29673, 0.29955, 0.30234, 0.30511, 0.30785, 0.31057, 0.31327],
        [0.31594, 0.31859, 0.32121, 0.32381, 0.32639, 0.32894, 0.33147, 0.33398, 0.33646, 0.33891],
        [0.34134, 0.34375, 0.34614, 0.34849, 0.35083, 0.35314, 0.35543, 0.35769, 0.35993, 0.36214],
        [0.36433, 0.36650, 0.36864, 0.37076, 0.37286, 0.37493, 0.37698, 0.37900, 0.38100, 0.38298],
        [0.38493, 0.38686, 0.38877, 0.39065, 0.39251, 0.39435, 0.39617, 0.39796, 0.39973, 0.40147],
        [0.40320, 0.40490, 0.40658, 0.40824, 0.40988, 0.41149, 0.41308, 0.41466, 0.41621, 0.41774],
        [0.41924, 0.42073, 0.42220, 0.42364, 0.42507, 0.42647, 0.42785, 0.42922, 0.43056, 0.43189],
        [0.43319, 0.43448, 0.43574, 0.43699, 0.43822, 0.43943, 0.44062, 0.44179, 0.44295, 0.44408],
        [0.44520, 0.44630, 0.44738, 0.44845, 0.44950, 0.45053, 0.45154, 0.45254, 0.45352, 0.45449],
        [0.45543, 0.45637, 0.45728, 0.45818, 0.45907, 0.45994, 0.46080, 0.46164, 0.46246, 0.46327],
        [0.46407, 0.46485, 0.46562, 0.46638, 0.46712, 0.46784, 0.46856, 0.46926, 0.46995, 0.47062],
        [0.47128, 0.47193, 0.47257, 0.47320, 0.47381, 0.47441, 0.47500, 0.47558, 0.47615, 0.47670],
        [0.47725, 0.47778, 0.47831, 0.47882, 0.47932, 0.47982, 0.48030, 0.48077, 0.48124, 0.48169],
        [0.48214, 0.48257, 0.48300, 0.48341, 0.48382, 0.48422, 0.48461, 0.48500, 0.48537, 0.48574],
        [0.48610, 0.48645, 0.48679, 0.48713, 0.48745, 0.48778, 0.48809, 0.48840, 0.48870, 0.48899],
        [0.48928, 0.48956, 0.48983, 0.49010, 0.49036, 0.49061, 0.49086, 0.49111, 0.49134, 0.49158],
        [0.49180, 0.49202, 0.49224, 0.49245, 0.49266, 0.49286, 0.49305, 0.49324, 0.49343, 0.49361],
        [0.49379, 0.49396, 0.49413, 0.49430, 0.49446, 0.49461, 0.49477, 0.49492, 0.49506, 0.49520],
        [0.49534, 0.49547, 0.49560, 0.49573, 0.49585, 0.49598, 0.49609, 0.49621, 0.49632, 0.49643],
        [0.49653, 0.49664, 0.49674, 0.49683, 0.49693, 0.49702, 0.49711, 0.49720, 0.49728, 0.49736],
        [0.49744, 0.49752, 0.49760, 0.49767, 0.49774, 0.49781, 0.49788, 0.49795, 0.49801, 0.49807],
        [0.49813, 0.49819, 0.49825, 0.49831, 0.49836, 0.49841, 0.49846, 0.49851, 0.49856, 0.49861],
        [0.49865, 0.49869, 0.49874, 0.49878, 0.49882, 0.49886, 0.49889, 0.49893, 0.49896, 0.49900]
    ];
    
    // Range validation:
    if(table[row] !== undefined && table[row][column] !== undefined) {
        return table[row][column];
        
    // Error, standard score was out of range.
    } else {
        return null;
    }
}
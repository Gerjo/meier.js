/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/


/// Return random item from array:
Array.prototype.random = function() {
    throw new Error("Array::random() function has not been loaded yet.");
};

/// Array shuffling
Array.prototype.shuffle = function(){
    throw new Error("Array::shuffle() function has not been loaded yet.");
};

/// Assertion to be used for development only.
///
function ASSERT(statement) {
    if(statement !== true) {
    
        try {
            // Trigger an exception to retrieve a stack trace
            throw Error();
        } catch(e) {
            
            // Another try/catch clausule, the code is quite dodgy. This should
            // "solve" that until a better implementation is created.
            //try {
                var urlPattern = /(http|ftp|https):\/\/[\w-]+(:\d\d\d\d)*(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/
                
                var lines      = e.stack.split("\n");
                var line       = lines[3]; // "3" is a line offset number.
                    line       = line.trim(")");  
                    line       = line.replace(/^(.*)http/, "http");
                var args       = line.split(":")
                var lineNumber = args[3];
                var charNumber = args[4];
        
                
        
                // Trim trailing char/line numbers
                var regex = /:(\d)+$/;       
                var url   = line; 
                while(url.match(regex)) {
                    url = url.replace(/:(\d)+$/, "");
                }
        
                // Fetch the source code file
                var http = new XMLHttpRequest();
                http.open('GET', url, false); // Synchronized
                http.send(null);
        
                if(http.readyState === 4) {
                    var split = http.responseText.split("\n");
                
                    // Hopefully print the line containing the assertion
                    console.log(split[lineNumber-1].substring(charNumber-1), "at", line);
                }
             //} catch(e) {
                // The above code failed, quite possibly due to a poor implementation.
                // this is debug code only, so we should be OK.
                
                //console.log(e);
            //}
        }
    }
}

define(function(require) {
    
    // This might be future-awkward. This whole file is loaded 
    // before anything else, if this file includes other files
    // we may end up loading half the engine.
    var Random = require("meier/math/Random");
    
    /// Return random item from array:
    Array.prototype.random = function() {
        return this[Random(0, this.length-1)];
    };
    
    /// Array shuffling
    Array.prototype.shuffle = function(){
        var counter = this.length, temp, index;

        // While there are elements in the array
        while (counter-- > 0) {
            // Pick a random index
            index = Random(0, this.length-1);

            // And swap the last element with it
            temp          = this[counter];
            this[counter] = this[index];
            this[index]   = temp;
        }
    
        return this;
    };
    
});

Math.QuarterPI     = Math.PI / 4;
Math.TreeQuarterPI = Math.PI / 4 * 3;
Math.HalfPI        = Math.PI / 2;
Math.TwoPI         = Math.PI * 2;

// Internet Explorer 7:
if(typeof JSON == "undefined") {
    JSON = {};
}

// Internet Explorer 7:
if(typeof JSON.parse == "undefined") {
    JSON.parse = function(data) {
        // TODO: perhaps bundle an actual parser?
        return eval("(" + data + ")");
    } 
}


/// Parse JSON strings without silly exceptions that suggest
/// your code is broken due to the incorrect line-numbers.
///
/// @param {data} The JSON encoded string.
/// @param {reviver} If a function, prescribes how the value originally produced by parsing is transformed, before being returned.
/// @return An object or undefined if parsing failed.
JSON.tryParse = JSON.TryParse = function(data, reviver) {
    try {
        return JSON.parse(data, reviver);
    } catch(idontcareaboutexceptionshere) {
        return undefined;
    }
};

/// Retrieve last item of an array:
Array.prototype.last = function() {
    return this[this.length - 1];
};


/// Retrieve first item an an array:
Array.prototype.first = function() {
    return this[0];
};

// Create a range.
Array.Range = function(from, to) {
    var arr = new Array(to - from);
    for(var i = from; i < to; ++i) {
        arr[i] = i;
    }
    
    return arr;
};

/// Retrieve unique values from this array. Non javascript
/// primitives (number, string) should use a custom compare
/// function, else "references" are compared. Without the
/// custom compare, this runs in O(2n), else O(n^n).
///
/// @todo optimize internal workings.
Array.prototype.unique = function(compare) {
    
    var r = [];
    
    // User defined compare function:
    if(compare) {
        if(compare instanceof Function) {
            
            outer:
            for(var i = 0; i < this.length; ++i) {
                for(var j = 0; j < this.length; ++j) {
                    if(j != i && compare(this[i], this[j]) === true) {
                        continue outer;
                    }
                }
                
                r.push(this[i]);
            }
            
            
        } else {
            throw new Error("The given 'compare' is not a function.");
        }
        
    // Default compare, this shall only work for javascript primitives
    // or objects that tackfully overload the toString parameter. 
    } else {
        var dict = [];
        
        for(var i = 0; i < this.length; ++i) {
            if( ! dict[this[i]]) {
                dict[this[i]] = { c: 1, i: i };
            } else {
                dict[this[i]].c++;
            }
        }
        
        for(var k in dict) {
            if(dict.hasOwnProperty(k)) {
                if(dict[k].c === 1) {
                    r.push(this[dict[k].i]);
                }
            }
        }
    }
    
    
    return r;
};

/// Empty an array.
Array.prototype.clear = function() {
    this.length = 0;
};

/// Merge all internal array entries in the outer array.
/// In other words, it reduces a multidimensional array
/// into one dimension, recursively.
Array.prototype.flatten = function() {
 
    // Do it all inline, one does not care about the
    // order of elements.
    var n = [];
    for(var i = 0; i < this.length; ++i) {
        if(this[i] instanceof Array) {
            this.merge(this[i]);
            this[i--] = this.pop();
        }
    }
    
    return this;

};

/// Merge an array into this array without creating a
/// copy. Similar to .concat() but without the copy.
Array.prototype.merge = function(array) {
    if(array instanceof Array) {
        for(var i = 0; i < array.length; ++i) {
            this.push(array[i]);
        }
    } else {
        throw new Error("Argument is not an array.");
    }
    
    return this;
};

/// Filter combined with a map.
Array.prototype.filterMap = function(callback) {
    var r;
    for(var k in this) {
        if(parseInt(k, 10) == k) {
        //for(var i = 0, r; i < this.length; ++i) {
            r = callback(this[k]);
    
            if(r === undefined) {
                this.splice(k, 1);
            } else {
                this[k] = r;
            }
        }
    }

    return this;
};

/// Duplicate an array:
Array.prototype.clone = function() { 
    return this.slice(0); 
}

/// Kind of like reduce, without reducing.
///
Array.prototype.eachPair = function(callback, wraparound) {
    
    if(typeof wraparound != "boolean") {
        wraparound = true;
    }
    
    var len = (wraparound) ? this.length : this.length - 1;
    
    for(var i = 0, j; i < len; ++i) {
        j = (i === this.length - 1) ? 0 : i + 1;
                
        if(false === callback(this[i], this[j])) {
            return false;
        }
    }
    
    return true;
};

/// Determine if a string ends with the given suffix:
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

/// Determine if a string starts with the given prefix:
String.prototype.startsWith = function(suffix) {
    
    if(this.length < suffix.length) {
        return false;
    }
    
    for(var i = suffix.length - 1; i >= 0; --i) {
        if(this[i] != suffix[i]) {
            return false;
        }
    }
    
    return true;
};


String.prototype.trim = function(string) {
    if(typeof string == "undefined") {
        return this.replace(/^\s+|\s+$/g, '');
    }
    
    var r = this;
    
    while(r.endsWith(string)) {
        r = r.substr(0, r.length - string.length);
    }
    
    while(r.startsWith(string)) {
        r = r.substr(string.length);
    }
    
    return r;
};

/// Add support for context binding on older platforms e.g.: the ipad 1 or older ipods.
///
/// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
///
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}
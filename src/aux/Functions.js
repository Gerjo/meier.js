/// This file adds functionality to existing javascript classes.
/// 
/// 

Math.QuarterPI     = Math.PI / 4;
Math.TreeQuarterPI = Math.PI / 4 * 3;
Math.HalfPI        = Math.PI / 2;
Math.TwoPI         = Math.PI * 2;

Math.sgn = function(n) {
    return n >= 0 ? 1 : -1;
}

/// Retrieve last item of an array:
if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    };
}

/// Retrieve first item an an array:
if(!Array.prototype.first) {
    Array.prototype.first = function() {
        return this[0];
    };
}

/// Return random item from array:
if(!Array.prototype.random) {
    Array.prototype.random = function() {
        return this[Math.floor(Math.random() * this.length)];
    };
}

/// Merge all internal array entries in the outer array.
/// In other words, it reduces a multidimensional array
/// into one dimension, recursively.
Array.prototype.flatten = function() {
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
if(!Array.prototype.filterMap) {
    Array.prototype.filterMap = function(callback) {
    
        for(var i = 0, r; i < this.length; ++i) {
            r = callback(this[i]);
        
            if(r === undefined) {
                this.splice(i--, 1);
            } else {
                this[i] = r;
            }
        }
    
        return this;
    };
}

/// Duplicate an array:
if(!Array.prototype.clone) {
    Array.prototype.clone = function() { 
        return this.slice(0); 
    }
}


/// Determine if a string ends with the given suffix:
if(!String.prototype.endsWith) {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

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
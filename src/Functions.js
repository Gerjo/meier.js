/// This file adds functionality to existing javascript classes.
/// 
/// 

Math.TwoPI = Math.PI * 2;

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
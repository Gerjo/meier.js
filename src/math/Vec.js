define(function(require) {
    
    var Storage = Float32Array || Array;
    
    return function(rows) {
        
        Object.defineProperties(V.prototype, {
            "x": { get: function () { return this._[0]; }, set: function (v) { this._[0] = v; return this; } },
            "y": { get: function () { return this._[1]; }, set: function (v) { this._[2] = v; return this; } },
        });
        
        if(rows > 2) {
            Object.defineProperties(V.prototype, {
                "z": { get: function () { return this._[2]; }, set: function (v) { this._[2] = v; return this; } },
            });
        }
        
        function V(x, y, z) {
            this.numrows = rows;
            
            this._ = new Storage(this.numrows);
            this._[0] = x || 0;
            this._[1] = y || 0;
            
            if(this.numrows > 2) {
                this._[2] = z || 0;
            }
        }
        

        /// In case we have an instance, but we are unsure about the number
        /// of rows. This methods gives the type that one can instantiate.
        /// e.g., var typeclone = new vector.type();
        V.prototype.type = function() {
            return V;
        };
        
        V.prototype.clone = function() {
            var v = new V();
            
            for(var i = this.numrows - 1; i >= 0; --i) {
                v._[i] = this._[i];
            }
            
            return v;
        };
        
        V.prototype.lengthSQ = function() {
            var r = 0;
            
            for(var i = this.numrows - 1; i >= 0; --i) {
                r += this._[i] * this._[i];
            }
            
            return r;
        };
        
        V.prototype.length = function() {
            return Math.sqrt(this.lengthSQ());
        };
        
        V.prototype.normalize = function() {
            var l = 1 / this.length();
            
            for(var i = this.numrows - 1; i >= 0; --i) {
                this._[i] *= l;
            }
            
            return this;
        };
        
        V.prototype.dot = function(other) {
            var r = 0;
            
            if(this.numrows === other.numrows) {
                        
                for(var i = this.numrows - 1; i >= 0; --i) {
                    r += this._[i] * other._[i];
                }
                
            } else {
                throw new Error("Cannot dot. Vector row count does not match.");
            }
            
            return r;
        };
        
        return V;
    };
});
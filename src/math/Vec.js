define(function(require) {
    var Round = require("meier/math/Math").Round;
    
    var Storage = Float32Array || Array;
    
    return function(rows) {
        
        if(isNaN(rows) || typeof rows !== "number") {
            throw new Error("Cannot import vector. Invalid row size.");
        }
        
        if(rows < 2) {
            throw new Error("Vector row size smaller than 2 is not yet supported.");
        }
        
        Object.defineProperties(V.prototype, {
            "x": { get: function () { return this._[0]; }, set: function (v) { this._[0] = v; } },
            "y": { get: function () { return this._[1]; }, set: function (v) { this._[1] = v; } },
        });
        
        if(rows == 3) {
            Object.defineProperties(V.prototype, {
                "z": { get: function () { return this._[2]; }, set: function (v) { this._[2] = v; } },
            });
        }
        
        if(rows == 3) {
            Object.defineProperties(V.prototype, {
                "w": { get: function () { return this._[3]; }, set: function (v) { this._[3] = v; } },
            });
        }
        
        function V(x, y, z, w) {
            this.numrows = rows;
            
            this._ = new Storage(this.numrows);
            this._[0] = x || 0;
            this._[1] = y || 0;
            
            if(this.numrows == 3) {
                this._[2] = z || 0;
            }
            
            if(this.numrows == 4) {
                this._[3] = w || 0;
            }
        }
        
        V.prototype.clone = function() {
            var r = new V();
            
            for(var i = this.numrows - 1; i >= 0; --i) {
                r._[i] = this._[i];
            }
            
            return r;
        }
        
        V.prototype.equals = function(o) {
            
            if(o.numrows !== this.numrows) {
                return false;
            }
            
            for(var i = this.numrows - 1; i >= 0; --i) {
                if(this._[i] !== o._[i]) {
                    return false;
                }
            }
            
            return true;
        };

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
        
        ///////////////////////////////////////////////////////////////////////
        // CROSS PRODUCT specialisation:
        ///////////////////////////////////////////////////////////////////////
        if(rows == 2) {
            V.prototype.cross = function(o) {
                if(rows != o.numrows) {
                    throw new Error("Cannot cross. Row count does not match.");
                } 
                
                return this._[0] * o._[1] - this._[1] * o._[0];
            };
        } else if(rows == 3) {
            V.prototype.cross = function(o) {
                if(rows != o.numrows) {
                    throw new Error("Cannot cross. Row count does not match.");
                }
                
                return new V ( 
                    this._[1] * o._[2] - this._[2] * o._[1],
                    this._[2] * o._[0] - this._[0] * o._[2],
                    this._[0] * o._[1] - this._[1] * o._[0]
                );
            };
        } else {
            V.prototype.cross = function(o) {
                if(rows != o.numrows) {
                    throw new Error("Cannot cross. Row count does not match.");
                } 
                
                // TODO: once matrix determinant logic works, copy paste that.
                throw new Error("TODO: implement cross product for n > 3");
            };
        }
        
        V.prototype.pretty = function() {
            var out = "", n, l = 6, d = 2;
        
            for(var i = 0, n; i < this.numrows; ++i) {
                n = Round(this._[i], d) + "";
            
                out += n;
            
                for(var k = n.length; k < l; ++k) {
                    out += " ";
                }
            }
        
            return out;
        };
        
        V.prototype.wolfram = function() {
            var r = "{";
        
            for(var i = 0; i < this.numrows; ++i) {
                r += this._[i] + ", ";
            }
        
            r = r.trim(", ") + "}";
        
            return r;
        };
        
        return V;
    };
});
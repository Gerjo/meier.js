define(function(require) {
    var Round = function(num, precision) {
        if(precision > 0) {
            var exp = Math.pow(10, precision)
            return parseInt(num * exp + 0.5, 10) / exp;

        } else if(precision < 0) {
            var exp = Math.pow(10, -precision)
            return parseInt(num / exp + 0.5, 10) * exp;
        }

        return parseInt(num + 0.5);
    };
    
    var Storage = Float64Array;// || Array;
    
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
        
        V.prototype.distance = function(o) {
            return Math.sqrt(this.distanceSQ(o));
        };

        V.prototype.distanceSQ = function(o) {
            var r = 0;
            for(var i = this.numrows - 1; i >= 0; --i) {
                r += Math.pow(this._[i] - o._[i], 2);
            }
            
            return r;
        };
        
        ///////////////////////////////////////////////////
        // 2D only.
        ///////////////////////////////////////////////////
        if(rows === 2) {
            V.prototype.perp = function() {
                var tmp = -this._[0];
                this._[0] = this._[1];
                this._[1] = tmp;
                return this;
            };
            
            V.prototype.angle = function() {
                return Math.atan2(this._[1], this._[0]);
            };
            
            V.prototype.angleBetween = function(other) {
                
                var angle = Math.acos(
                    this.dot(other) / Math.sqrt(this.lengthSQ() * other.lengthSQ())
                );
    
                if(-this._[1] * other._[0] + this._[0] * other._[1] < 0) {
                    return -angle;
                }
    
                return angle;
            };
            
            V.CreateAngular = function(radians, radius) {
                radius = radius || 1;
                
                return new V(Math.cos(radians) * radius, Math.sin(radians) * radius);
            };
        }
        
        V.prototype.trim = function(length) {
            
            var l = length / this.length();
            
            for(var i = this.numrows - 1; i >= 0; --i) {
                this._[i] *= l;
            }
                        
            return this;
        }; 
        
        V.prototype.add = function(v) {
            for(var i = Math.min(this.numrows, v.numrows) - 1; i >= 0; --i) {
                this._[i] += v._[i];
            }
            return this;
        }; 
        
        V.prototype.addScalar = function(scalar) {
            for(var i = this.numrows - 1; i >= 0; --i) {
                this._[i] += scalar;
            }
            return this;
        }; 
        
        V.prototype.subtract = function(v) {
            for(var i = Math.min(this.numrows, v.numrows) - 1; i >= 0; --i) {
                this._[i] -= v._[i];
            }
            return this;
        };
        
        V.prototype.subtractScalar = function(scalar) {
            for(var i = this.numrows - 1; i >= 0; --i) {
                this._[i] -= scalar;
            }
            return this;
        }; 
        
        V.prototype.scale = function(v) {
            for(var i = Math.min(this.numrows, v.numrows) - 1; i >= 0; --i) {
                this._[i] *= v._[i];
            }            
            return this;
        };
        
        V.prototype.scaleScalar = function(v) {
            for(var i = this.numrows - 1; i >= 0; --i) {
                this._[i] *= v;
            }
            return this;
        };
        
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
                r += Math.pow(this._[i], 2);
            }
            
            return r;
        };
        
        V.prototype.length = function() {
            return Math.sqrt(this.lengthSQ());
        };
        
        V.prototype.normalize = function() {
            var l = this.length();
            
            if(l !== 0) {
                l = 1 / l;
                for(var i = this.numrows - 1; i >= 0; --i) {
                    this._[i] *= l;
                }
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
        
        V.prototype.wolfram.project = function(other) {
            throw new Error("TODO: implemented vector projection.");
            var r = this.dot(other) / other.dot(other);
        
            return new V(
                r * other.x,
                r * other.y
            );
        };
        
        return V;
    };
});
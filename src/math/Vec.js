/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013, 2016 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

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
        
        if(rows >= 3) {
            Object.defineProperties(V.prototype, {
                "z": { get: function () { return this._[2]; }, set: function (v) { this._[2] = v; } },
            });
        }
        
        if(rows >= 4) {
            Object.defineProperties(V.prototype, {
                "w": { get: function () { return this._[3]; }, set: function (v) { this._[3] = v; } },
            });
        }
        
        var CreateArray;
    
        // iPad 1 and IE < 10 support.
        // NB: enabled because it gives better overall performance.
        if(true || typeof Float64Array === "undefined") {
            
            // Loop unrolling experiment:
            var fn = "return [";
        
            for(var i = rows - 1; i >= 0; --i) {
                fn += "0,"
            }
       
            CreateArray = new Function(fn.trim(",") + "];");
        
        } else {
            CreateArray = function(size) {
                // Values are automatically initialized to "0".
                return new Float64Array(size);
            }
        }
        
        function V(x, y, z, w) {
            this.numrows = rows;
            
            this._ = CreateArray(this.numrows);
            this._[0] = x || 0;
            this._[1] = y || 0;
            
            // Fancy copy incase of more components
            if(arguments.length > 2) {
                for(var i = 2, max = Math.min(arguments.length, rows); i < max; ++i) {
                    this._[i] = arguments[i];
                }
            }
            
        }
        
        V.prototype.distance = V.prototype.distanceTo = function(o) {
            return Math.sqrt(this.distanceSq(o));
        };

        // Depricated use 'distanceSq'.
        V.prototype.distanceSQ = function(o) {
			DEPRICATED("V.prototype.distanceSQ", "Please use distanceSq");
			
            var r = 0;
            for(var i = this.numrows - 1; i >= 0; --i) {
                r += Math.pow(this._[i] - o._[i], 2);
            }
            
            return r;
        };
        
        // Better naming convention.
        V.prototype.distanceSq = V.prototype.distanceToSq = function(o) {
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
        
        V.prototype.trim = function(newLength) {
            
            var l = newLength / this.length();
            
            for(var i = this.numrows - 1; i >= 0; --i) {
                this._[i] *= l;
            }
                        
            return this;
        }; 
        
        // Flip the signs:
        V.prototype.flip = function() {
            for(var i = this.numrows - 1; i >= 0; --i) {
                this._[i] *= -1;
            }
            
            return this;
        };
        
        V.prototype.add = function(v) {
            for(var i = Math.min(this.numrows, v.numrows) - 1; i >= 0; --i) {
                this._[i] += v._[i];
            }
            return this;
        }; 
        
        /// Set a single component, or copy a vector into this vector.
        ///
        V.prototype.set = function(key, value) {
            
            // Set a single component at a given index
            if( ! isNaN(key)  ) {
                this._[key] = value;
            
            // Copy a whole vector into this vector.
            } else if(key.numrows) {
                for(var i = Math.min(this.numrows, key.numrows) - 1; i >= 0; --i) {
                    this._[i] = key._[i];
                }
            } else {
                throw new Error("Incorrect usage of vec::set");
            }
            
           
            return this;
        }; 
        
        V.prototype.addScaled = function(v, scalar) {
            for(var i = Math.min(this.numrows, v.numrows) - 1; i >= 0; --i) {
                this._[i] += v._[i] * scalar;
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
        
        V.prototype.direction = function(v) {
            var clone = this.clone();
            
            for(var i = Math.min(clone.numrows, v.numrows) - 1; i >= 0; --i) {
                clone._[i] -= v._[i];
            }
            
            return clone;
        };
        
        V.prototype.subtractScalar = function(scalar) {
            for(var i = this.numrows - 1; i >= 0; --i) {
                this._[i] -= scalar;
            }
            return this;
        }; 
        
        V.prototype.volume = function() {
            var volume = this._[0];
            
            for(var i = 1; i < this.numrows; ++i) {
                volume *= this._[i];
            }
            
            return volume;
        };
        
        // Synonym for 2D spaces.
        V.prototype.area = function() {
            return this.volume();
        };
        
        
        V.prototype.divide = function(v) {
            for(var i = Math.min(this.numrows, v.numrows) - 1; i >= 0; --i) {
                this._[i] /= v._[i];
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
        
        V.prototype.clamp = function(min, max) {
          
            for(var i = this.numrows - 1; i >= 0; --i) {
                if(this._[i] < min) {
                    this._[i] = min;
                }
                
                if(this._[i] > max) {
                    this._[i] = max;
                }
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
        
        /// Determine if the vector is a null vector, i.e., all components
        /// equal zero.
        V.prototype.isNull = V.prototype.isZero = function() {
          
            for(var i = this.numrows - 1; i >= 0; --i) {
                if(this._[i] !== 0) {
                    return false;
                }
            }
                        
            return true;
        }; 
        
		/// Component wise comparison, with an optional epsilon minimal 
		/// difference.
        V.prototype.equals = function(o, epsilon) {
            
            if(o.numrows !== this.numrows) {
                return false;
            }
            
			if(arguments.length > 1) {
	            for(var i = this.numrows - 1; i >= 0; --i) {
	                if(Math.abs(this._[i] - o._[i]) > epsilon) {
						//console.log(Math.abs(this._[i] - o._[i]));
	                    return false;
	                }
	            }
			} else {
	            for(var i = this.numrows - 1; i >= 0; --i) {
	                if(this._[i] !== o._[i]) {
	                    return false;
	                }
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
        
        V.prototype.at = function(i) {
            return this._[i];
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
        
        V.prototype.magnitudeSQ = function() {
            var r = 0;
            
            for(var i = this.numrows - 1; i >= 0; --i) {
                r += Math.pow(this._[i], 2);
            }
            
            return r;
        };
        
        V.prototype.magnitude = function() {
            return Math.sqrt(this.lengthSQ());
        };
        
        V.prototype.normalize = V.prototype.normalized = function() {
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
        
        // Take the lowest value between this and other.
        V.prototype.min = function(other) {
            for(var i = Math.min(this.numrows, v.numrows) - 1; i >= 0; --i) {
                if(this._[i] > v._[i]) {
                    this._[i] = v._[i];
                }
            }  
            
            return this;
        };
        
        // Take the highest value between this and other.
        V.prototype.max = function(other) {
            for(var i = Math.min(this.numrows, v.numrows) - 1; i >= 0; --i) {
                if(this._[i] < v._[i]) {
                    this._[i] = v._[i];
                }
            }  
            
            return this;
        };
        
        V.prototype.pretty = V.prototype.toPretty = function(digits) {
            var out = [];
            digits  = isNaN(digits) ? 4 : digits;
        
            for(var i = 0, n; i < this.numrows; ++i) {
                out.push(this._[i].toFixed(digits));
            }
        
            return out.join(", ");
        };
        
        V.prototype.wolfram = V.prototype.toWolfram = function() {
            var r = "{";
        
            for(var i = 0; i < this.numrows; ++i) {
                var padding = "";
                
                // Padding to account for missing "-" sign. Looks prettier
                // in the debug console. That's all.
                if(this._[i] >= 0) {
                    padding = " ";
                }
                
                r += padding + this._[i].toFixed(6) + ", ";
            }
        
            r = r.trim(", ") + " }";
        
            return r;
        };
		
        return V;
    };
});
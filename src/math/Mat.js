/// Future work: http://jsperf.com/code-generation-loop-unrolling
/// 50% speed bonus? woah!
///
define(function(require) {
    var Round = require("meier/math/Math").Round;
    
    var CreateArray;
    
    // iPad 1 and IE < 10 support.
    if(typeof Float64Array === "undefined") {
        CreateArray = function(size) {
            var arr = new Array(size);
            for(var i = size - 1; i >= 0; --i) {
                arr[i] = 0;
            }
            return arr;
        }
    } else {
        CreateArray = function(size) {
            return new Float64Array(size);
        }
    }
    
    var Builder = function(rows, columns) {
        columns = typeof columns === "undefined" ? rows : columns;
        
        if(isNaN(rows) || typeof rows !== "number") {
            throw new Error("Cannot import matrix. Invalid row size: " + rows);
        }
        
        if(isNaN(columns) || typeof columns !== "number") {
            throw new Error("Cannot import matrix. Invalid column size.: " + columns);
        }
        
        //if(rows < 2 || columns < 2) {
        //    throw new Error("Matrices smaller than 2x2 are not supported yet.");
        //}
        
        
        var isSquare = rows === columns;
        var length   = rows * columns;
        
        /// A sort of macro to access indices.
        function At(row, column) {
            return row * columns + column;
        }
        
        M.CreateIdentity = function() {
            var m = new M();
            
            // Load identity matrix. May fail on some sizes.
            for(var i = columns - 1; i >= 0; --i) {
                m._[At(i, i)] = 1;
            }
            
            return m;
        };
        
        M.CreateScale = function(s) {
            var m = new M();
            
            // Load identity matrix. May fail on some sizes.
            for(var i = columns - 1; i >= 0; --i) {
                m._[At(i, i)] = s;
            }
            
            return m;
        };
        
        M.CreatePerspectiveProjection = function(near, far, fieldOfView) {
            if(rows < 4 || rows < 4) {
                throw new Error("Perspective only available for [4x4] matrices.");
            }
            
            var fn = far - near;
            
            var a = far / fn;
            var b = a * near;//f * n / fn;
            var s = 1 / Math.tan(fieldOfView * 0.5)
            
            var m = new M([
                s,  0,  0,  0,    
                0,  s,  0,  0,
                0,  0, -a, -1,
                0,  0, -b,  0
            ]);
            
            return m;
        };
        
        /// Project on an axis.
        M.CreateAxisProjection = function(v) {
            
            if(v.numrows < rows || v.numrows < columns) {
                throw new Error("Vector[" + v.numrows + "] size doesn't fit in matrix[" +
                rows + "x" + columns + "] size.");
            }
            
            var w = v.clone().normalize();
            var m = new M();
            
            
            for(var i = 0; i < w.numrows; ++i) {
                for(var j = 0; j < w.numrows; ++j) {
                    m._[i * w.numrows + j] = w._[i] * w._[j];
                }
            }
            
            return m;
        }
        
        /// Z X Z rotation.
        M.CreateEulerAngles = function(precession, nutation, spin) {
            var m = new M();
            
            var a = Math.cos(precession);
            var b = Math.sin(precession);
            var c = Math.cos(nutation);
            var d = Math.sin(nutation);
            var e = Math.cos(spin);
            var f = Math.sin(spin);
            
            // First row:
            m._[At(0, 0)] =  a*e - f*b*c;
            m._[At(0, 1)] = -a*f - e*b*c
            m._[At(0, 2)] =  d*b;
            
            // Second row:
            m._[At(1, 0)] =  b*e + f*a*c;
            m._[At(1, 1)] = -b*f + e*a*c;
            m._[At(1, 2)] = -a*d;
            
            // Third row:
            m._[At(2, 0)] = f*d;
            m._[At(2, 1)] = e*d;
            m._[At(2, 2)] = c;
            
            return m;
        };
        
        M.CreateXoZ = function(angle) {
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);
            
            var m = new M();
            
            m._[At(0,0)] =  cos;
            m._[At(0,2)] =  sin;
            
            m._[At(1,1)] =  1;
            
            m._[At(2,0)] =  -sin;
            m._[At(2,2)] =   cos;
            
            return m;
        };
        
        M.CreateXoY = function(angle) {
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);
            
            var m = new M();
            
            m._[At(0,0)] =  cos;
            m._[At(0,1)] = -sin;
            m._[At(1,0)] =  sin;
            m._[At(1,1)] =  cos;
            m._[At(2,2)] =  1;
            
            return m;
        };
        
        M.CreateYoZ = function(angle) {
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);
            
            var m = new M();
            
            ///
            ///    cos -sin
            ///    sin cos
            
            m._[At(0,0)] =  1;
            m._[At(1,1)] =  cos;
            m._[At(1,2)] =  -sin;
            m._[At(2,1)] =  sin;
            m._[At(2,2)] =  cos;
            
            return m;
        };

        /// vers = 1 - cos(theta) or 1/2 sin(theta/2)^2
        /// U1U1 vers + cos    | U1U2 vers - sin U3 | U1U2 vers + sin U2
        /// U2U1 vers + sin U3 | U2U2 vers + cos    | U2U3 vers - sin U1
        /// U3U1 vers - sin U2 | U3U2 vers + sin U1 | U3U3 vers + cos
        ///
        M.CreateAngleAxisRotation = function(angle, axis) {
            if(rows < 3 || columns < 3) {
                throw new Error("Angle axis rotation is only available on 3x3 matrices or larger. Your matrix is: " + rows + "x" + columns);   
            }
            
            if(axis.numrows != 3) {
                throw new Error("Only works for an axis with 3 rows. Your vector has: " + axis.numrows + " rows.");
            }
            
            var u    = axis.clone().normalize();
            var sin  = Math.sin(angle);
            var cos  = Math.cos(angle);
            var vers = 1 - cos; // versine
            
            var m    = new M();
              
            // First column:
            m._[At(0,0)] = u._[0] * u._[0] * vers + cos;
            m._[At(1,0)] = u._[1] * u._[0] * vers + sin * u._[2];
            m._[At(2,0)] = u._[2] * u._[0] * vers - sin * u._[1];
               
            // Second column:
            m._[At(0,1)] = u._[0] * u._[1] * vers - sin * u._[2];
            m._[At(1,1)] = u._[1] * u._[1] * vers + cos;
            m._[At(2,1)] = u._[2] * u._[1] * vers + sin * u._[0];
               
            // Third column:
            m._[At(0,2)] = u._[0] * u._[2] * vers + sin * u._[1];
            m._[At(1,2)] = u._[1] * u._[2] * vers - sin * u._[0];
            m._[At(2,2)] = u._[2] * u._[2] * vers + cos;
            
            return m;
        };
        
        M.CreateTranslation = function(v) {
            
            if(v.numrows > rows) {
                throw new Error("Cannot create translation, too many rows in vector.");
            }
            
            var m = new M();
            
            
            for(var i = 0; i < v.numrows; ++i) {
                m._[At(i, i)]         = 1;
                m._[At(i, columns-1)] = v._[i];
            }
            
            for(var i = v.numrows - columns; i < columns; ++i) {
                m._[At(i, i)] = 1;
            }
            
            return m;
        };
        
        M.CreateEulerParametersTransform = function(theta, axis) {
            
            if(axis.numrows < 3) {
                throw new Error("CreateEulerParametersTransform the axis needs at least 3 components.");
            }
            
            var u = axis.clone().normalize();
            
            var e0 = Math.cos(theta / 2);
            var e1 = u._[0] * Math.sin(theta / 2);
            var e2 = u._[1] * Math.sin(theta / 2);
            var e3 = u._[2] * Math.sin(theta / 2);
            
            var m = new M();
            
            // First row
            m._[At(0,0)] = e0*e0 + e1*e1 - e2*e2 - e3*e3;
            m._[At(0,1)] = 2 * (e1*e2 - e0*e3);
            m._[At(0,2)] = 2 * (e0*e2 + e1*e3);
            
            // Second row
            m._[At(1,0)] = 2 * (e0*e3 + e1*e2);
            m._[At(1,1)] = e0*e0 - e1*e1 + e2*e2 - e3*e3;
            m._[At(1,2)] = 2 * (e2*e3 - e0*e1);
            
            // Third row
            m._[At(2,0)] = 2 * (e1*e3 - e0*e2);
            m._[At(2,1)] = 2 * (e0*e1 + e2*e3);
            m._[At(2,2)] = e0*e0 - e1*e1 - e2*e2 + e3*e3;

            return m;
        };
        
        function M(data) {
            this.numrows    = rows;
            this.numcolumns = columns;
            this.num        = rows * columns;
            
            // Hidden, indexing doesn't work as expected.
            this._ = CreateArray(length);
            
            if(data && data instanceof Array) {
                if(data.length == this.num) {
                    for(var i = this.num - 1; i >= 0; --i) {
                        this._[i] = data[i];
                    }
                } else {
                    throw new Error("Cannot use initial data. Array size doesn't match matrix size.");
                }
            }
        }
        
        // A class that knows its own anonymous "type"!
        M.prototype.type = function() {
            return M;
        };
        
        M.prototype.clone = function() {
            var m = new M();
            
            for(var i = this.num - 1; i >= 0; --i) {
                m._[i] = this._[i];
            }
            
            return m;
        };
        
        /////////////////////////////////////////////////////////////////////
        // DETERMINANT specialisation.
        /////////////////////////////////////////////////////////////////////
        if(isSquare && rows == 2) {
            M.prototype.determinant = function() {
                return this._[0] * this._[3] - this._[1] * this._[2]; 
            };
        } else if(isSquare && rows == 3) {
            M.prototype.determinant = function() {
                return (this._[At(0,0)] * this._[At(1,1)] * this._[At(2,2)]) +
                       (this._[At(0,1)] * this._[At(1,2)] * this._[At(2,0)]) +
                       (this._[At(0,2)] * this._[At(1,0)] * this._[At(2,1)]) -
                       (this._[At(0,2)] * this._[At(1,1)] * this._[At(2,0)]) -
                       (this._[At(0,1)] * this._[At(1,0)] * this._[At(2,2)]) -
                       (this._[At(0,0)] * this._[At(1,2)] * this._[At(2,1)]);
            };
        } else {
            M.prototype.determinant = function() {
                if(!isSquare) {
                    throw new Error("Matrix must be square for determinant.");
                }
                
                throw new Error("TODO: implement determinant.");
                
            };
        }
        
        /////////////////////////////////////////////////////////////////////
        // INVERSE specialisation.
        /////////////////////////////////////////////////////////////////////
        if(isSquare && rows == 2) {
            M.prototype.inverse = function() {
                var m = new M();
                var d = this.determinant();
                
                if(d == 0) {
                    console.error("Cannot inverse a matrix with determinant 0.");
                    
                    return m;
                }
                
                d = 1 / d;
                
                m._[0] = this._[3] * d;
                m._[3] = this._[0] * d;
                
                m._[1] = -this._[1] * d;
                m._[2] = -this._[2] * d;
                
                return m;
            };
        } else if(isSquare && rows == 3) {
            M.prototype.inverse = function() {
                var minors = new M();
                var det = this.determinant();
    
                // Awwww... you've found a singularity.
                if(det === 0) {
                    console.error("Cannot inverse a Matrix with a determinant of 0.");
                    return false;
                }
    
                // 2x2 determinant:
                var Determinant = function(a, b, c, d) {
                    return a * d - b * c;
                };
    
                /// Signs:
                /// + - +
                /// - + -
                /// + - +
        
                // Matrix of minors:
                minors._[At(0, 0)] = Determinant(this._[At(1,1)], this._[At(1,2)], this._[At(2,1)], this._[At(2,2)]);
                minors._[At(0, 1)] = -Determinant(this._[At(1,0)], this._[At(1,2)], this._[At(2,0)], this._[At(2,2)]);
                minors._[At(0, 2)] = Determinant(this._[At(1,0)], this._[At(1,1)], this._[At(2,0)], this._[At(2,1)]);

                minors._[At(1, 0)] = -Determinant(this._[At(0,1)], this._[At(0,2)], this._[At(2,1)], this._[At(2,2)]);
                minors._[At(1, 1)] = Determinant(this._[At(0,0)], this._[At(0,2)], this._[At(2,0)], this._[At(2,2)]);
                minors._[At(1, 2)] = -Determinant(this._[At(0,0)], this._[At(0,1)], this._[At(2,0)], this._[At(2,1)]);
    
                minors._[At(2, 0)] = Determinant(this._[At(0,1)], this._[At(0,2)], this._[At(1,1)], this._[At(1,2)]);
                minors._[At(2, 1)] = -Determinant(this._[At(0,0)], this._[At(0,2)], this._[At(1,0)], this._[At(1,2)]);
                minors._[At(2, 2)] = Determinant(this._[At(0,0)], this._[At(0,1)], this._[At(1,0)], this._[At(1,1)]);
                
                var adjugate = minors.transpose();
                
                
                adjugate.multiply(1 / det);
                
                return adjugate;
            };
            
        } else {
            M.prototype.inverse = function() {
                if(!isSquare) {
                    throw new Error("Matrix must be square for inverse.");
                }
                
                throw new Error("TODO: implement matrix inverse.");
                
            };
        }
        
        M.prototype.transpose = function() {
            // NB.: this might be complicated for the GC. Perhaps help 
            // by creating a cache? A builder builder, if you will.
            var m = new (Builder(this.numcolumns, this.numrows))();
            
            for(var i = 0; i < this.numcolumns; ++i) {
                for(var j = 0; j < this.numrows; ++j) {
                    m._[i * rows + j] = this._[At(j, i)];
                }
            }
            
            return m;
        };
        
        M.prototype.trace = function() {
            if( ! isSquare) {
                throw new Error("Trace is only defined for n*n square matrices.");
            }
            
            var r = 0;
            
            for(var i = this.numrows - 1; i > 0; --i) {
                r += this._[At(i, i)];
            }
            
            return r;
        };
        
        M.prototype.add = function(m) {
            if(this.numrows !== m.numrows && m.numrows !== this.numcolumns) {
                throw new Error("Cannot add, incorrect matrix sizes: [" + this.numrows + "x" + this.numcolumns + 
                "] and [" + m.numrows + "x" + m.numcolumns + "]");
            }
            
            // Works due to equal length
            for(var i = this.numrows * this.numcolumns - 1; i >= 0; --i) {
                this._[i] += m._[i];
            }
            
            return this;
        };
        
        M.prototype.product = function(o) {
            //if(this.numrows !== o.numcolumns) {
            if(this.numrows !== o.numrows && o.numrows !== this.numcolumns) {
                throw new Error("Cannot multiply, incorrect matrix sizes: [" + this.numrows + "x" + this.numcolumns + 
                "] and [" + o.numrows + "x" + o.numcolumns + "]");
            }
         
            var m = new (Builder(this.numrows, o.numcolumns))();

            for(var row = 0; row < m.numrows; ++row) {
                for(var col = 0; col < m.numcolumns; ++col) {
                    m._[row * m.numcolumns + col] = 0;
                    
                    for(var k = 0; k < this.numcolumns; ++k) {
                        m._[row * m.numcolumns + col] += (
                            this._[At(row, k)] * o.at(k, col)
                        );
                        
                        if(isNaN(m._[row * m.numcolumns + col])) {
                            console.log("Error: col:",col, "k:",k);
                        }
                        
                    }
                    
                }
            }
            
            return m;
        };
        
        M.prototype.multiply = function(number) {
            for(var row = 0; row < this.numrows; ++row) {
                for(var col = 0; col < this.numcolumns; ++col) {
                    this._[At(row, col)] *= number;
                }
            }
            
            return this;
        };
        
        /// Transform vectors for graphics purposes. Does probably 
        /// not do what you'd expect.
        ///
        M.prototype.transform = function(vector, verbose) {
            var r = new (vector.type())();
            
            // Multiply what we can:
            for(var i = 0; i < vector.numrows; ++i) {
                r._[i] = 0;
                
                for(var j = 0; j < vector.numrows; ++j) {
                    r._[i] += vector._[j] * this._[At(i, j)];
                }
            }
            
            // Pretend the given vector has some homogeneous coordinates.
            if(this.numcolumns > vector.numrows) {
                for(var i = vector.numrows; i < this.numcolumns; ++i) {
                    for(var j = 0; j < vector.numrows; ++j) {
                        r._[j] += this._[At(j, i)];
                    }
                }
                
            }
            
            // HACK!
            if(this.numrows === 4 && this.numcolumns === 4 && vector.numrows === 3) {
                var w = vector._[0] * this._[At(3, 0)] +
                        vector._[1] * this._[At(3, 1)] +
                        vector._[2] * this._[At(3, 2)] +
                                      this._[At(3, 3)]; 
                
                if(w != 1 && w != 0) {
                    r._[0] /= w;
                    r._[1] /= w;
                    r._[2] /= w;
                }
                
                if(verbose === true) {
                    console.log("Hack w:" + w);
                }
                
                //console.log("Hack w:" + w);
            }
            
            return r;
        };
        
        M.prototype.swapRows = function(i, j) {
            if(i == j) {
                return this;
            }
            
            for(var col = 0, tmp; col < this.numcolumns; ++col) {
                tmp = this._[At(i, col)];
                this._[At(i, col)] = this._[At(j, col)];
                this._[At(j, col)] = tmp;
            }
            
            return this;
        };
        
        M.prototype.index = function(row, column) {
            return At(row, column);
        };
        
        M.prototype.at = function(row, column) {
            return this._[At(row, column)];
        };
        
        M.prototype.get = function(row, column) {
            return this._[At(row, column)];
        };
        
        M.prototype.set = function(row, column, value) {
            this._[At(row, column)] = value;
            return this;
        };
        
    
        M.prototype.eachRow = function(column, callback) {
            for(var i = 0; i < this.numrows; ++i) {
                callback(this._[At(i, column)], i);
            }
            
            return this;
        };
        
        M.prototype.eachColumn = function(row, callback) {
            for(var i = 0; i < this.numcolumns; ++i) {
                callback(this._[At(row, i)], i);
            }
            
            return this;
        };
        
        M.prototype.pretty = function() {
            var out = "", n, l = 6, d = 2;
        
            for(var i = 0, n, j = 1; i < this.num; ++i, ++j) {
                n = Round(this._[i], d) + "";
            
                out += n;
            
                for(var k = n.length; k < l; ++k) {
                    out += " ";
                }
            
                if(j === this.numcolumns) {
                    out += "\n";
                    j = 0;
                }
            }
        
            return out;
        };
        
        M.prototype.wolfram = function() {
            var r = "{";
        
            for(var i = 0; i < this.numrows; ++i) {
                r += "{"
            
                for(var j = 0; j < this.numcolumns; ++j) {
                    r += this._[At(i, j)] + ", ";
                }
            
                r = r.trim(", ") + "},"
            }
        
            r = r.trim(",") + "}";
        
            return r;
        };
        
        return M;
    };
    
    return Builder;
    
});
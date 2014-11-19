/// Future work: http://jsperf.com/code-generation-loop-unrolling
/// 50% speed bonus? woah!
///
define(function(require) {
    var Round = require("meier/math/Math").Round;
    
    var CreateArray;
    
    // iPad 1 and IE < 10 support.
    if(true || typeof Float64Array === "undefined") {
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
        
        M.CreateHaar = function() {
            
            if(! isSquare) {
                // As far as I can tell, anyway.
                throw new Error("Haar transform is only well defined by square matrices.");
            }
            
            function Haar(n) {
                
                // Recursion end condition:
                if(n == 1) {
                    return Builder(1, 1).Create([1]);
                }
                
                // Recurse deeper for the top matrix:
                var top = Haar(n - 1).kronecker(Builder(1, 2).Create([1, 1]));
       
                // Make sure the bottom matrix grows at the same speed as the top matrix:
                var degree = Math.pow(2, n - 1) / 2;
            
                // Compute the bottom matrix:
                var bottom = Builder(degree, degree).
                    CreateIdentity().
                    multiply(Math.pow(2, (n - 1) / 2)).
                    kronecker(Builder(1, 2).Create([1, -1]));
                
                //console.log("n: " + n + ", columns: " + bottom.numcolumns);
                                    
                // Concatenate both matrices
                return top.appendBottom(bottom);
            }
  
            return Haar(rows + 1);
        };
        
        M.Create = function(array) {
            return new M(array);
        };
        
        M.CreateIdentity = function() {
            var m = new M();
            
            // Load identity matrix. May fail on some sizes.
            for(var i = columns - 1; i >= 0; --i) {
                m._[At(i, i)] = 1;
            }
            
            return m;
        };
        
        M.Make = function(type) {
            var m = new M();
            
            // All values to "zero" element.
            for(var i = length - 1; i >= 0; --i) {
                m._[i] = type.identity('+');
            }
            
            // Diagonals under multiplication
            for(var i = 0; i < Math.min(columns, rows); ++i) {
                m._[At(i, i)] = type.identity('*');
            }
            
            return m;
        };
        
        M.CreateScale = function(s) {
            var m = new M();
            
            // Set scaling diagonal
            for(var i = columns - 1; i >= 0; --i) {
                m._[At(i, i)] = s;
            }
            
            return m;
        };
        
        //M.CreatePerspectiveProjection = function(near, far, fieldOfView) {
        
        M.CreatePerspectiveProjection = function(fovy, aspect, nearZ, farZ) {
            if(rows < 4 || rows < 4) {
                throw new Error("Perspective only available for [4x4] matrices.");
            }
            
            return makePerspective(fovy, aspect, nearZ, farZ).transpose();
            
            function makePerspective(fieldOfViewInRadians, aspect, near, far) {
              var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
              var rangeInv = 1.0 / (near - far);

              return new M([
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (near + far) * rangeInv, -1,
                0, 0, near * far * rangeInv * 2, 0
              ]);
            };
            
            
            var cotan = 1.0 / Math.tan(fovy / 2.0);
    
                var m = new M([
                           cotan / aspect, 0.0, 0.0, 0.0,
                           0.0, cotan, 0.0, 0.0,
                           0.0, 0.0, (farZ + nearZ) / (nearZ - farZ), -1.0,
                           0.0, 0.0, (2.0 * farZ * nearZ) / (nearZ - farZ), 0.0
                ]);
                return m;
            
            /*
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
            */
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
            
            var m = M.CreateIdentity();
            
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
            
            var m = M.CreateIdentity();
            
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
            
            var m = M.CreateIdentity();
            
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
        
        /// Create a gaussian weighted kernel.
        M.CreateGaussian = function(sigma) {
        
            // Create a kernel matrix
            var matrix = new M();
        
            // Default sigma
            sigma = isNaN(sigma) ? 2 : sigma;
        
            var hr  = (matrix.numrows - 1) * 0.5;
            var hc  = (matrix.numcolumns - 1) * 0.5;
            var sum = 0;
            var sigmaPrecomputed = 2 * sigma * sigma;
        
            for(var row = 0; row < matrix.numrows; ++row) {
                for(var col = 0; col < matrix.numcolumns; ++col) {
                
                    // Center the kernel
                    var r = row - hr;
                    var c = col - hc;
              
                    // Guassian distribution
                    var g = Math.exp(-(r * r + c * c) / sigmaPrecomputed);
                
                    // Accumulate for normalisaton term
                    sum += g;
                
                    matrix.set(row, col, g);
                }
            }
        
            // Normalize here, more efficient than inside the convolute method
            return matrix.multiply(1 / sum);
        };
        
        function M(data) {
            this.numrows    = rows;
            this.numcolumns = columns;
            this.num        = rows * columns;
            
            // Hidden, indexing doesn't work as expected.
            
            if(data && data instanceof Array) {
                if(data.length == this.num) {
                    this._ = data;
                    //for(var i = this.num - 1; i >= 0; --i) {
                    //    this._[i] = data[i];
                    //}
                } else {
                    throw new Error("Cannot use initial data. Array size doesn't match matrix size.");
                }
            } else {
                // Zero initialize.
                this._ = CreateArray(length);
            }
        }
        
        M.prototype._MeierMathType = 2;
        
        // A class that knows its own anonymous "type"!
        M.prototype.type = function() {
            return M;
        };
        
        M.prototype.clone = function() {
            var m = new M();
            
            for(var i = this.num - 1; i >= 0; --i) {
                m._[i] = this._[i].clone();
            }
            
            return m;
        };
        
        /////////////////////////////////////////////////////////////////////
        // DETERMINANT specialisation.
        /////////////////////////////////////////////////////////////////////
        if(isSquare && rows == 2) {
            M.prototype.determinant = function() {
                return this._[0].clone().multiply(this._[3]).multiply(this._[1]).multiply(this._[2]); 
            };
        } else if(false && isSquare && rows == 3) {
            M.prototype.determinant = function() {
                return (
                        this._[At(0,0)].clone().multiply(this._[At(1,1)]).multiply(this._[At(2,2)])
                    .add( 
                        this._[At(0,1)].clone().multiply(this._[At(1,2)]).multiply(this._[At(2,0)]) 
                    )
                    .add( 
                        this._[At(0,2)].clone().multiply(this._[At(1,0)]).multiply(this._[At(2,1)]) 
                    )
                    .subtract( 
                        this._[At(0,2)].clone().multiply(this._[At(1,1)]).multiply(this._[At(2,0)]) 
                    )
                    .subtract( 
                        this._[At(0,1)].clone().multiply(this._[At(1,0)]).multiply(this._[At(2,2)]) 
                    )
                    .subtract( 
                        this._[At(0,0)].clone().multiply(this._[At(1,2)]).multiply(this._[At(2,1)]) 
                    )
                );
            };
        } else if(isSquare) {
            M.prototype.determinant = function() {
                
                function Solver(clone) {
                
                    var swap = 1;
                
                    // Logic copied from math/Math.GaussJordanElimination
                    for(var i = 0; i < rows; i++) {                    
                        var maxRow = i;
                        var maxVal = 0;
                    
                        // The highest value should be the pivot. This mostly works.
                        for(var j = i; j < rows; j++) {
                            var val = Math.abs(clone._[At(j, i)]);
                        
                            if(val > maxVal) {
                                maxVal = val;
                                maxRow = j;
                            }
                        }
                    
                        // Swapping rows requires a determinant sign change 
                        if(i != maxRow) {
                            clone.swapRows(i, maxRow);
                            swap *= -1;
                        }
                        
                        
                                        
                        for(var j = 0; j < rows; j++) {   
                            
                            console.log(clone.pretty());
                            
                                                 
                            // Low triangle only
                            if(j > i) {
                                var ratio = clone._[At(j,i)].clone().divide( clone._[At(i,i)] );

                                if(clone._[At(i,i)] == 0) {
                                    throw new Error("Error at row " + i + " when solving lower triangle.");
                                }

                                for(var k = 0; k < rows; k++) {
                                    clone._[At(j,k)] = clone._[At(j,k)].subtract( clone._[At(i,k)].clone().multiply(ratio) );
                                }
                            }
                        }
                    }
                    
                    console.log("triangle: swap(" + swap + ")");
                    console.log(clone.pretty());
                    
                    var det = clone.traceProduct().multiply( swap );
                    
                    return det;
                }                
                
                // Complex numbers
                if(this._[0]._MeierMathType == 1) {
                    
                    var c = this.clone();
                    
                    for(var i = 0; i < rows * columns; ++i) {
                        var t = c._[i].re;
                        c._[i].re = c._[i].im;
                        c._[i].im = t;
                    }
                    
                    return Solver(c);
                    
                    /*var re = M.Make(Number);
                    var im = M.Make(Number);
                    
                    for(var i = 0; i < rows * columns; ++i) {
                        re._[i] = this._[i].re;
                        im._[i] = this._[i].im;
                    }
                    
                    var reDet = Solver(re);
                    var imDet = Solver(im);
                    
                    // Clone instead of "new" - this way we don't need an include.
                    var complex = this._[0].clone();
                    
                    complex.re = reDet;
                    complex.im = imDet;
                    
                    return complex;*/
                    
                // Reals
                } else {
                    return Solver(this.clone());
                }
            };
        } else {
            M.prototype.determinant = function() {
                throw new Error("Matrix must be square for determinant.");
            }
        }
        
        if(isSquare) {
            M.prototype.adjugate = M.prototype.adjoint = function() {
                
                //  
                //  + - + -
                //  - + - +
                //  + - + -
                //  - + - +
                //
                
                var minors = this.minors().transpose();
                
                var checkerboard = 1;
                
                for(var i = 0, j = 0; i < minors._.length; ++i, ++j) {
                    
                    // Apply checkerboard pattern
                    minors._[i] *= checkerboard;
                                        
                    if(j < rows-1) {
                        checkerboard *= -1;        
                    } else {
                        j = -1;
                    }
                     
                }
                
                return minors;
            };
        } else {
            M.prototype.adjugate = M.prototype.adjoint = function() {
                throw new Error("Mat::adjugate / Mat::adjoint only available on square matrices");
            };
        }
        
        if(isSquare) {
            M.prototype.minors = function() {
                
                // To hold the solution
                var minors = this.clone();
                
                // To perform math on
                var tmp    = new (Builder(rows - 1, rows - 1));
                
                // For each row and column
                for(var row = 0; row < rows; ++row) {
                    for(var col = 0; col < columns; ++col) {
                        
                        // Create a submatrix
                        for(var a = 0, b = 0; a < rows; ++a) {
                            
                            if(a == row) {
                                continue;
                            }
                            
                            for(var c = 0, d = 0; c < columns; ++c) {
                                if(c != col) {
                                    
                                    tmp.set(b, d, this.at(a, c));
                                    
                                    ++d;
                                }
                            }
                            
                            b++;
                        }
                        
                        // Compute determinant of submatrix and store it.
                        minors.set(row, col, tmp.determinant());
                    }
                }
                
                return minors;
            };
        } else {
            M.prototype.minors = function() {
                throw new Error("Matrix must be square for minors.");
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
            
        } else if(isSquare) {
            M.prototype.inverse = function() {
                
                var adjugate = this.adjugate();
                var det = this.determinant();

                if(det == 0) {
                    throw new Error("Cannot inverse a singular matrix. The determinant is 0. (you probably don't have to invert it)");
                }
                
                return adjugate.multiply(1 / det);
                
               // throw new Error("TODO: implement matrix inverse.");
                
            };
        } else {
            M.prototype.inverse = function() {
                throw new Error("Matrix must be square for inverse.");
            };
        }
        
        M.prototype.transpose = function() {
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
                throw new Error("Mat::trace is only defined for n*n square matrices.");
            }
            
            var r = this._[0].identity('+');
            
            for(var i = this.numrows - 1; i >= 0; --i) {
                r = r.add(this._[At(i, i)]);
            }
            
            return r;
        };
        
        M.prototype.traceProduct = function() {
            if( ! isSquare) {
                throw new Error("Mat::traceProduct is only defined for n*n square matrices.");
            }
            
            
            var r = this._[0].clone();
            
            for(var i = this.numrows - 2; i >= 0; --i) {
                r = r.multiply(this._[At(i, i)]);
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
                this._[i] = this._[i].add(m._[i]);
            }
            
            return this;
        };
        
        M.prototype.subtract = function(m) {
            if(this.numrows !== m.numrows && m.numrows !== this.numcolumns) {
                throw new Error("Cannot subtract, incorrect matrix sizes: [" + this.numrows + "x" + this.numcolumns + 
                "] and [" + m.numrows + "x" + m.numcolumns + "]");
            }
            
            // Works due to equal length
            for(var i = this.numrows * this.numcolumns - 1; i >= 0; --i) {
                this._[i] = this._[i].subtract(m._[i]);
            }
            
            return this;
        };
        
        M.prototype.product = function(o) {
            
            if(this.numrows !== o.numrows && o.numrows !== this.numcolumns) {
                throw new Error("Cannot multiply, incorrect matrix sizes: [" + this.numrows + "x" + this.numcolumns + 
                "] and [" + o.numrows + "x" + o.numcolumns + "]");
            }
         
            var m = Builder(this.numrows, o.numcolumns).Make(this._[0]);
            
            for(var row = 0; row < m.numrows; ++row) {
                for(var col = 0; col < m.numcolumns; ++col) {
                    
                    m._[row * m.numcolumns + col] = this._[0].identity('+');
                    
                    for(var k = 0; k < this.numcolumns; ++k) {
                        
                        m._[row * m.numcolumns + col] += this._[At(row, k)] * o.at(k, col)
                                                
                        // Broken:
                        //m._[row * m.numcolumns + col].add (
                            //this._[At(row, k)].clone().multiply( o.at(k, col) )
                        //);
                    }
                }
            }
            
            return m;
        };
        
        M.prototype.multiply = function(number) {
            for(var row = 0; row < this.numrows; ++row) {
                for(var col = 0; col < this.numcolumns; ++col) {
                    this._[At(row, col)] = this._[At(row, col)].multiply(number);
                }
            }
            
            return this;
        };
        
        /// Change the size of this matrix. This is well defined for shrinking, growing
        /// may leave "undefined" values in your matrix.
        ///
        /// @param Number of rows
        /// @param Number of columns
        /// @return A copied matrix with altered dimensions.
        M.prototype.resize = function(rows, columns) {
            var m = new (Builder(rows, columns))();
           
            for(var row = 0; row < Math.min(this.numrows, rows); ++row) {
                for(var col = 0; col < Math.min(this.numcolumns, columns); ++col) {
                    m.set(row, col, this._[At(row, col)]);
                }
            }
                    
            return m;
        };
        
        /// Transform vectors for graphics purposes. Does probably 
        /// not do what you'd expect.
        ///
        M.prototype.transform = function(vector, verbose) {
            //NOTICE("Matrix.transform is deprecated.");
            
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
        
        /// Generate a tidy looking string representation of this matrix
        ///
        /// @param {precision} Optionally, the number of digits behind the comma.
        ///                    Defaults to 4.
        /// @return A string representing this matrix.
        M.prototype.pretty = function(precision) {
            precision = precision || 4;
            
            var out = [];
            var pad = 0;
        
            for(var col = 0; col < columns; ++col) {
                var max = 0;
                
                for(var row = 0; row < rows; ++row) {
                    var string = this.at(row, col).toFixed(precision) + " ";
                    
                    // Inverse logic to deal with NaN and infinity.
                    if( ! (this.at(row, col) < 0) ) {
                        string = " " + string;
                    }
                    
                    // First entry.
                    if(col == 0) {
                        out[row] = "";
                    }
                    
                    // Pad the string to match alignment.
                    while(out[row].length < pad) {
                        out[row] += " ";
                    }
                    
                    // Append the number.
                    out[row] += string;
                    
                    // Record longest strong for padding next time.
                    max = Math.max(max, out[row].length);
                
                }
                
                pad = max;
            }
        
            
            return out.join("\n");
        };
        
        /// Test if any matrix value is "undefined"
        M.prototype.hasUndefined = function() {
            
            for(var i = 0; i < this._.length; ++i) {
                if(this._[i] === undefined) {
                    return true;
                }
            }
            
            return false;
        };
        
        M.prototype.wolfram = function(digits) {
            var r = "{";
            
            digits = digits || 3;
        
            for(var i = 0; i < this.numrows; ++i) {
                r += "{"
            
                for(var j = 0; j < this.numcolumns; ++j) {
                    
                    if(this._[At(i, j)] == 0) {
                        r += this._[At(i, j)] + ", ";
                        
                    } else {
                        r += this._[At(i, j)].toFixed(digits) + ", ";
                        
                    }
                }
            
                r = r.trim(", ") + "},"
            }
        
            r = r.trim(",") + "}";
        
            return r;
        };
        
        M.prototype.toString = function() {
            return this.wolfram();
        };
        
        M.prototype.asArrays = function() {
            var array = [];
            
            for(var i = 0; i < columns; ++i) {
                array[i] = [];
                
                for(var j = 0; j < rows; ++j) {
                    array[i][j] = this._[At(i, j)];
                }
            }
            
            return array;
        };
        
        M.prototype.appendBottom = function(bottom) {
            var top = this;
            
            if(bottom.numcolumns != top.numcolumns) {
                throw new Error("Cannot append, number of columns does not equal.");
            }
            
            var m = Builder(top.numrows + bottom.numrows, bottom.numcolumns).Create();
            
            // Copy top
            for(var row = 0; row < top.numrows; ++row) {
                for(var col = 0; col < top.numcolumns; ++col) {
                    m.set(row, col, top.get(row, col));
                }
            }
            
            // Copy bottom
            for(var row = 0; row < bottom.numrows; ++row) {
                for(var col = 0; col < bottom.numcolumns; ++col) {
                    m.set(row + top.numrows, col, bottom.get(row, col));
                }
            }
            
            return m;
        };
        
        /// Compute the singular value decomposition. Code was taken from http://www.numericjs.com/
        /// License: https://github.com/sloisel/numeric/blob/master/license.txt
        /// 
        /// More information: http://www.cs.utexas.edu/users/inderjit/public_papers/HLA_SVD.pdf
        /// More information: http://www.ling.ohio-state.edu/~kbaker/pubs/Singular_Value_Decomposition_Tutorial.pdf
        ///
        M.prototype.svd = function() {
            /*
             Shanti Rao sent me this routine by private email. I had to modify it
             slightly to work on Arrays instead of using a Matrix object.
             It is apparently translated from http://stitchpanorama.sourceforge.net/Python/svd.py
             */
            var temp;
            //Compute the thin SVD from G. H. Golub and C. Reinsch, Numer. Math. 14, 403-420 (1970)
            var prec = 2.220446049250313e-16; //Math.pow(2,-52) // assumes double prec
            var tolerance = 1.e-64 / prec;
            var itmax = 50;
            var c = 0;
            var i = 0;
            var j = 0;
            var k = 0;
            var l = 0;

            var u = this.asArrays(); //numeric.clone(A);
            var m = u.length;

            var n = u[0].length;

            if (m < n) throw "Need more rows than columns"

            var e = new Array(n);
            var q = new Array(n);
            for (i = 0; i < n; i++) e[i] = q[i] = 0.0;

            var v = [];
            for (var i = 0; i < n; ++i) {
                v[i] = [];
                for (var j = 0; j < n; ++j) {
                    v[i][j] = 0;
                }
            }

            //var v = numeric.rep([n,n],0);
            //	v.zero();

            function pythag(a, b) {
                a = Math.abs(a)
                b = Math.abs(b)
                if (a > b)
                    return a * Math.sqrt(1.0 + (b * b / a / a))
                else if (b == 0.0)
                    return a
                return b * Math.sqrt(1.0 + (a * a / b / b))
            }

            //Householder's reduction to bidiagonal form
            var f = 0.0;
            var g = 0.0;
            var h = 0.0;
            var x = 0.0;
            var y = 0.0;
            var z = 0.0;
            var s = 0.0;

            for (i = 0; i < n; i++) {
                e[i] = g;
                s = 0.0;
                l = i + 1;
                for (j = i; j < m; j++)
                    s += (u[j][i] * u[j][i]);
                if (s <= tolerance)
                    g = 0.0;
                else {
                    f = u[i][i];
                    g = Math.sqrt(s);
                    if (f >= 0.0) g = -g;
                    h = f * g - s
                    u[i][i] = f - g;
                    for (j = l; j < n; j++) {
                        s = 0.0
                        for (k = i; k < m; k++)
                            s += u[k][i] * u[k][j]
                        f = s / h
                        for (k = i; k < m; k++)
                            u[k][j] += f * u[k][i]
                    }
                }
                q[i] = g
                s = 0.0
                for (j = l; j < n; j++)
                    s = s + u[i][j] * u[i][j]
                if (s <= tolerance)
                    g = 0.0
                else {
                    f = u[i][i + 1]
                    g = Math.sqrt(s)
                    if (f >= 0.0) g = -g
                    h = f * g - s
                    u[i][i + 1] = f - g;
                    for (j = l; j < n; j++) e[j] = u[i][j] / h
                    for (j = l; j < m; j++) {
                        s = 0.0
                        for (k = l; k < n; k++)
                            s += (u[j][k] * u[i][k])
                        for (k = l; k < n; k++)
                            u[j][k] += s * e[k]
                    }
                }
                y = Math.abs(q[i]) + Math.abs(e[i])
                if (y > x)
                    x = y
            }

            // accumulation of right hand gtransformations
            for (i = n - 1; i != -1; i += -1) {
                if (g != 0.0) {
                    h = g * u[i][i + 1]
                    for (j = l; j < n; j++)
                        v[j][i] = u[i][j] / h
                    for (j = l; j < n; j++) {
                        s = 0.0
                        for (k = l; k < n; k++)
                            s += u[i][k] * v[k][j]
                        for (k = l; k < n; k++)
                            v[k][j] += (s * v[k][i])
                    }
                }
                for (j = l; j < n; j++) {
                    v[i][j] = 0;
                    v[j][i] = 0;
                }
                v[i][i] = 1;
                g = e[i]
                l = i
            }

            // accumulation of left hand transformations
            for (i = n - 1; i != -1; i += -1) {
                l = i + 1
                g = q[i]
                for (j = l; j < n; j++)
                    u[i][j] = 0;
                if (g != 0.0) {
                    h = u[i][i] * g
                    for (j = l; j < n; j++) {
                        s = 0.0
                        for (k = l; k < m; k++) s += u[k][i] * u[k][j];
                        f = s / h
                        for (k = i; k < m; k++) u[k][j] += f * u[k][i];
                    }
                    for (j = i; j < m; j++) u[j][i] = u[j][i] / g;
                } else
                    for (j = i; j < m; j++) u[j][i] = 0;
                u[i][i] += 1;
            }

            // diagonalization of the bidiagonal form
            prec = prec * x
            for (k = n - 1; k != -1; k += -1) {
                for (var iteration = 0; iteration < itmax; iteration++) { // test f splitting
                    var test_convergence = false
                    for (l = k; l != -1; l += -1) {
                        if (Math.abs(e[l]) <= prec) {
                            test_convergence = true
                            break
                        }
                        if (Math.abs(q[l - 1]) <= prec)
                            break
                    }
                    if (!test_convergence) { // cancellation of e[l] if l>0
                        c = 0.0
                        s = 1.0
                        var l1 = l - 1
                        for (i = l; i < k + 1; i++) {
                            f = s * e[i]
                            e[i] = c * e[i]
                            if (Math.abs(f) <= prec)
                                break
                            g = q[i]
                            h = pythag(f, g)
                            q[i] = h
                            c = g / h
                            s = -f / h
                            for (j = 0; j < m; j++) {
                                y = u[j][l1]
                                z = u[j][i]
                                u[j][l1] = y * c + (z * s)
                                u[j][i] = -y * s + (z * c)
                            }
                        }
                    }
                    // test f convergence
                    z = q[k]
                    if (l == k) { //convergence
                        if (z < 0.0) { //q[k] is made non-negative
                            q[k] = -z
                            for (j = 0; j < n; j++)
                                v[j][k] = -v[j][k]
                        }
                        break //break out of iteration loop and move on to next k value
                    }
                    if (iteration >= itmax - 1)
                        throw 'Error: no convergence.'
                        // shift from bottom 2x2 minor
                    x = q[l]
                    y = q[k - 1]
                    g = e[k - 1]
                    h = e[k]
                    f = ((y - z) * (y + z) + (g - h) * (g + h)) / (2.0 * h * y)
                    g = pythag(f, 1.0)
                    if (f < 0.0)
                        f = ((x - z) * (x + z) + h * (y / (f - g) - h)) / x
                    else
                        f = ((x - z) * (x + z) + h * (y / (f + g) - h)) / x
                        // next QR transformation
                    c = 1.0
                    s = 1.0
                    for (i = l + 1; i < k + 1; i++) {
                        g = e[i]
                        y = q[i]
                        h = s * g
                        g = c * g
                        z = pythag(f, h)
                        e[i - 1] = z
                        c = f / z
                        s = h / z
                        f = x * c + g * s
                        g = -x * s + g * c
                        h = y * s
                        y = y * c
                        for (j = 0; j < n; j++) {
                            x = v[j][i - 1]
                            z = v[j][i]
                            v[j][i - 1] = x * c + z * s
                            v[j][i] = -x * s + z * c
                        }
                        z = pythag(f, h)
                        q[i - 1] = z
                        c = f / z
                        s = h / z
                        f = c * g + s * y
                        x = -s * g + c * y
                        for (j = 0; j < m; j++) {
                            y = u[j][i - 1]
                            z = u[j][i]
                            u[j][i - 1] = y * c + z * s
                            u[j][i] = -y * s + z * c
                        }
                    }
                    e[l] = 0.0
                    e[k] = f
                    q[k] = x
                }
            }

            //vt= transpose(v)
            //return (u,q,vt)
            for (i = 0; i < q.length; i++)
                if (q[i] < prec) q[i] = 0

            //sort eigenvalues	
            for (i = 0; i < n; i++) {
                //writeln(q)
                for (j = i - 1; j >= 0; j--) {
                    if (q[j] < q[i]) {
                        c = q[j]
                        q[j] = q[i]
                        q[i] = c
                        for (k = 0; k < u.length; k++) {
                            temp = u[k][i];
                            u[k][i] = u[k][j];
                            u[k][j] = temp;
                        }
                        for (k = 0; k < v.length; k++) {
                            temp = v[k][i];
                            v[k][i] = v[k][j];
                            v[k][j] = temp;
                        }
                        i = j
                    }
                }
            }

            return {
                u: Builder.fromArrays(u),
                s: Builder.diagonal(q),
                v: Builder.fromArrays(v)
            }
        }; // End prototype.svd = function() {} ...
        
        
        /// Compute the kronecker product.
        M.prototype.kronecker = function(b) {
            var a = this;
        
            var m = new (Builder(b.numrows * a.numrows, b.numcolumns * a.numcolumns))();
          
            for(var row = 0; row < a.numrows; ++row) {
                for(var col = 0; col < a.numcolumns; ++col) {
                    
                    // Offset in result
                    var x = row * b.numrows;
                    var y = col * b.numcolumns;
                    
                    for(var i = 0; i < b.numrows; ++i) {
                        for(var j = 0; j < b.numcolumns; ++j) {
                            var val = a.get(row, col).multiply(b.get(i, j));
                            
                            m.set(x + i, y + j, val);
                        }   
                    }
                }
            }
        
            return m;
        };
    
        /// Zoom in or out. Makes most sense if the matrix is an image.
        ///
        ///
        M.prototype.zoom = function(scale) {

            if(scale == 1) {
                return this.clone();
            }
            
            // Custom clamp function, avoid importing Math.js
            function Clamp(n, a, b) {
                if(n > b) {
                    return b;
                }
                
                if(n < a) {
                    return a;
                }
                
                return n;
            }
            
            function Bilinear(x, y, x1 ,x2, y1, y2, Q11, Q21, Q12, Q22) {
                var ans1 = (((x2 - x) * (y2 - y)) / ((x2 - x1) * (y2 - y1))) * Q11;
                var ans2 = (((x - x1) * (y2 - y)) / ((x2 - x1) * (y2 - y1))) * Q21;
                var ans3 = (((x2 - x) * (y - y1)) / ((x2 - x1) * (y2 - y1))) * Q12;
                var ans4 = (((x - x1) * (y - y1)) / ((x2 - x1) * (y2 - y1))) * Q22;
                
                return ans1 + ans2 + ans3 + ans4;
            };
            
            var target = new (Builder(Math.round(this.numrows * scale), Math.round(this.numcolumns * scale)))();
            
            // Downscaling using average of neighbours.
            if(scale < 1) {   
                for(var x = 0; x < this.numrows; ++x) {
                    for(var y = 0; y < this.numcolumns; ++y) {
                    
                        // Target:
                        var tx = Math.floor(x * scale);
                        var ty = Math.floor(y * scale);
                        var c  = target.get(tx, ty);
                    
                        // Squared term is required due to nested for-loop.
                        target.set(tx, ty, c + this.get(x, y) * Math.pow(scale, 2));
                    }
                }
            
            // Upscaling using bilinear sampling
            } else {
                for(var x = 0; x < this.numrows; ++x) {
                    for(var y = 0; y < this.numcolumns; ++y) {
                        
                        // Lookup corners:
                        var Q11 = this.get(Clamp(x + 0, 0, this.numrows - 1), Clamp(y + 0, 0, this.numcolumns - 1));
                        var Q21 = this.get(Clamp(x + 1, 0, this.numrows - 1), Clamp(y + 0, 0, this.numcolumns - 1));
                        var Q12 = this.get(Clamp(x + 1, 0, this.numrows - 1), Clamp(y + 1, 0, this.numcolumns - 1));
                        var Q22 = this.get(Clamp(x + 0, 0, this.numrows - 1), Clamp(y + 1, 0, this.numcolumns - 1));
                        
                        // Corner positions:
                        var x1 = 0 / (this.numrows - 1);
                        var x2 = 1 / (this.numrows - 1);
                        var y1 = 0 / (this.numcolumns - 1);
                        var y2 = 1 / (this.numcolumns - 1);
                        
                        
                        // Sample n times
                        for(var i = 0; i < scale; ++i) {
                            for(var j = 0; j < scale; ++j) {
                                
                                var c = Bilinear(
                                    i / (target.numrows - 1), 
                                    j / (target.numcolumns - 1),
                                    x1, x2, y1, y2, Q11, Q21, Q22, Q12
                                );
                                
                                target.set(x * scale + i, y * scale + j, c);    
                            }
                        }
                    }
                }
            }
            
            return target;
        };
        
        return M;
    };
    
    Builder.fromArrays = function(arrays) {
        
        if( ! (arrays instanceof Array && arrays.length > 0)) {
            throw new Error("Cannot create Matrix from array. Not enough dimensions given.");
        }
        
        if( ! (arrays[0] instanceof Array)) {
            arrays = [arrays];
        }
        
        var m = new (Builder(arrays.length, arrays[0].length))();
        
        for(var i = 0; i < arrays.length; ++i) {
            for(var j = 0; j < arrays[i].length; ++j) {
                m.set(i, j, arrays[i][j]);
            }
        }
        
        return m;
    };
    
    Builder.diagonal = function(entries) {
        var m = new (Builder(entries.length, entries.length))();
        
        for(var i = 0; i < entries.length; ++i) {
            m.set(i, i, entries[i]);
        }
        
        return m;
    };
    
    return Builder;
    
});
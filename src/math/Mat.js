/// Future work: http://jsperf.com/code-generation-loop-unrolling
/// 50% speed bonus? woah!
///
define(function(require) {
    var Round = require("meier/math/Math").Round;
    
    var Storage = Float32Array || Array;
    
    var Builder = function(rows, columns) {
        columns = typeof columns === "undefined" ? rows : columns;
        
        var isSquare = rows === columns;
        var length   = rows * columns;
        
        /// A sort of macro to access indices.
        function At(row, column) {
            return row * columns + column;
        }
        
        M.CreateIdentity = function(v) {
            var m = new M();
            
            // Load identity matrix. May fail on some sizes.
            for(var i = columns - 1; i >= 0; --i) {
                m._[At(i, i)] = 1;
            }
            
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
            /// cos -sin
            /// sin cos
            
            m._[At(0,0)] =  1;
            m._[At(1,1)] =  cos;
            m._[At(1,2)] =  sin;
            m._[At(2,1)] =  -sin;
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
            var vers = 1 - cos;
            
            var m    = new M();
              
            // First column:
            m._[At(0,0)] = u._[0] * u._[0] + cos;
            m._[At(1,0)] = u._[1] * u._[0] + sin * u._[2];
            m._[At(2,0)] = u._[2] * u._[0] - sin * u._[1];
               
            // Second column:
            m._[At(0,1)] = u._[1] * u._[0] - sin * u._[2];
            m._[At(1,1)] = u._[1] * u._[1] + cos;
            m._[At(2,1)] = u._[2] * u._[1] + sin * u._[0];
               
            // Third column:
            m._[At(0,2)] = u._[1] * u._[0] + sin * u._[1];
            m._[At(1,2)] = u._[2] * u._[1] - sin * u._[0];
            m._[At(2,2)] = u._[2] * u._[2] + cos;
            
            return m;
        };
        
        function M(data) {
            this.numrows    = rows;
            this.numcolumns = columns;
            this.num        = rows * columns;
            
            // Hidden, indexing doesn't work as expected.
            this._ = new Storage(length);
            
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
        
        M.prototype.product = function(o) {
            if(o.numcolumns !== this.numrows) {
                throw new Error("Cannot multiply, incorrect matrix sizes: [" + this.numrows + "x" + this.numcolumns + 
                "] and [" + o.numrows + "x" + o.numcolumns + "]");
            }
            
            var m = new (Builder(o.numcolumns, this.numrows))();
            
            for(var i = 0; i < m.numrows; ++i) {
                for(var j = 0; j < m.numcolumns; ++j) {
                    
                    m._[i * m.numcolumns + j] = 0; // for good measure.
                    
                    for(var k = 0; k < o.numrows; ++k) {
                        m._[i * m.numcolumns + j] += this._[At(i, k)] * o.at(k, j);
                    }
                }
            }
            
            return m;
        };
        
        M.prototype.transform = function(vector) {
            var r = new (vector.type())();
            
            
            for(var i = 0; i < vector.numrows; ++i) {
                r._[i] = 0;
                
                for(var j = 0; j < vector.numrows; ++j) {
                    r._[i] += vector._[j] * this._[At(i, j)];
                }
            }
            // TODO: hack transform.
            
            return r;
        };
        
        M.prototype.at = function(row, column) {
            return this._[At(row, column)];
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
                    r += this._[At(i, j)] + ",";
                }
            
                r = r.trim(",") + "},"
            }
        
            r = r.trim(",") + "}";
        
            return r;
        };
        
        return M;
    };
    
    return Builder;
    
});
define(function(require) {
    var Round = require("meier/math/Math").Round;
    
    var Storage = Float32Array || Array;
    
    return function(rows, columns) {
        columns = isNaN(columns) ? rows : columns;
        
        var isSquare = rows === columns;
        var length   = rows * columns;
        
        M.CreateIdentity = function(v) {
            return new M();
        };
        
        M.CreateProjection = function(v) {
            
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
        
        M.CreateAngleAxisRotation = function(angle, axis) {
            if(rows < 3 || columns < 3) {
                throw new Error("Angle axis rotation is only available on 3x3 matrices or larger.");   
            }
            
            var m = new M();
               
            // And then some ... ...
            
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
            } else {
                // Load identity matrix. May fail on some sizes.
                for(var i = this.numcolumns - 1; i >= 0; --i) {
                    this._[i + i * this.numcolumns] = 1;
                }
            }
            
        }
        
        M.prototype.pretty = function() {
            var out = "", n, l = 5, d = 2;
        
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
        
        return M;
    };
});
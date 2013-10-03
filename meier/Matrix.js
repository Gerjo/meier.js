/// 3x3 matrix for 2D vectors. Everything is as mutable
/// as possible.
/// 
function Matrix(array) { 
    
    if(array instanceof Array) {
        this[0] = array.splice(0, 3);
        this[1] = array.splice(0, 3);
        this[2] = array.splice(0, 3);
    } else {
        this[0] = [1, 0, 0];
        this[1] = [0, 1, 0];
        this[2] = [0, 0, 1];
    }
    
    // Adding a length property makes this object
    // behave as in array in loops.
    this.length = 3;
}

Matrix.CreateIdentity = function() {
    return new Matrix();
};

Matrix.CreateTranslation = function(x, y) {
    var m = new Matrix();
    m.translate(x, y);
    
    return m;
};

Matrix.CreateRotation = function(radians) {
    var m = new Matrix();
    
    var c = Math.cos(radians);
    var s = Math.sin(radians);
    
    m[0][0] =  c;
    m[0][1] = -s;
    m[1][0] =  s;
    m[1][1] =  c;
    
    return m;
};

Matrix.prototype.clone = function() {
    var m = new Matrix();
    
    m[0] = this[0].clone();
    m[1] = this[1].clone();
    m[2] = this[2].clone();
    
    return m;
};


Matrix.prototype.cofactors = function() {
    var m = new Matrix();
    
    // 2x2 determinant:
    var determinant = function(a,b,c,d) {
        return a * d - b * c;
    };
    
    /// Signs:
    /// + - +
    /// - + -
    /// + - +
        
    // Directly compute the determinant of the minors:
    m[0][0] = determinant(this[1][1], this[1][2], this[2][1], this[2][2]);
    m[0][1] = -determinant(this[1][0], this[1][2], this[2][0], this[2][2]);
    m[0][2] = determinant(this[1][0], this[1][1], this[2][0], this[2][1]);

    m[1][0] = -determinant(this[0][1], this[0][2], this[2][1], this[2][2]);
    m[1][1] = determinant(this[0][0], this[0][2], this[2][0], this[2][2]);
    m[1][2] = -determinant(this[0][0], this[0][1], this[2][0], this[2][1]);
    
    m[2][0] = determinant(this[0][1], this[0][2], this[1][1], this[1][2]);
    m[2][1] = -determinant(this[0][0], this[0][2], this[1][0], this[1][2]);
    m[2][2] = determinant(this[0][0], this[0][1], this[1][0], this[1][1]);
    
    return m;
};

// Immutable, since it needs a tmp copy anyway.
Matrix.prototype.product = function(other) {
    var m = new Matrix();
    
    var t = this;
    var o = other;
    
    // First row:
    m[0][0] = t[0][0] * o[0][0] + t[0][1] * o[1][0] + t[0][2] * o[2][0];
    m[0][1] = t[0][0] * o[0][1] + t[0][1] * o[1][1] + t[0][2] * o[2][1];
    m[0][2] = t[0][0] * o[0][2] + t[0][1] * o[1][2] + t[0][2] * o[2][2];
    
    // Second row:
    m[1][0] = t[1][0] * o[0][0] + t[1][1] * o[1][0] + t[1][2] * o[2][0];
    m[1][1] = t[1][0] * o[0][1] + t[1][1] * o[1][1] + t[1][2] * o[2][1];
    m[1][2] = t[1][0] * o[0][2] + t[1][1] * o[1][2] + t[1][2] * o[2][2];
    
    // Third row:
    m[2][0] = t[2][0] * o[0][0] + t[2][1] * o[1][0] + t[2][2] * o[2][0];
    m[2][1] = t[2][0] * o[0][1] + t[2][1] * o[1][1] + t[2][2] * o[2][1];
    m[2][2] = t[2][0] * o[0][2] + t[2][1] * o[1][2] + t[2][2] * o[2][2];
    
    return m;
};

// Helper for the forgetfull. New matrix!
Matrix.prototype.adjugate = function() {
    return this.cofactors().transpose();
};

Matrix.prototype.multiply = function(scalar) {
    
    if(typeof scalar != 'number') {
        throw new Error("Can only multiply a matrix by a number. Did you mean to take the product?");
    }
    
    this[0][0] *= scalar;
    this[0][1] *= scalar;
    this[0][2] *= scalar;
    this[1][0] *= scalar;
    this[1][1] *= scalar;
    this[1][2] *= scalar;   
    this[2][0] *= scalar;
    this[2][1] *= scalar;
    this[2][2] *= scalar;
    return this;
};

Matrix.prototype.transpose = function() {
    
    var toggle = function(a, aa, b, bb) {
        var tmp     = this[a][aa];
        this[a][aa] = this[b][bb];
        this[b][bb] = tmp;
    }.bind(this);
    
    toggle(0, 1, 1, 0);
    toggle(0, 2, 2, 0);
    toggle(1, 2, 2, 1);
    
    return this;
};

/// Note: this is a generic inverse. There might
/// be better ways. E.g., for a rotation matrix simply
/// flipping the angle will be fine.
/// new matrix!
Matrix.prototype.inverse = function() {
    
    // Determinant of original matrix:
    var determinant = this.determinant();
    
    // Awwww... you've found a singularity.
    if(determinant === 0) {
        throw new Error("Cannot inverse a matrix with a determinant of 0.");
    }
    
    
    var adj = this.adjugate();

    adj.multiply(1 / determinant);
    
    return adj;
};

/// Special method for vectors only:
Matrix.prototype.transform = function(vector) {
    return new Vector(
        this[0][0] * vector.x + this[0][1] * vector.y + this[0][2],
        this[1][0] * vector.x + this[1][1] * vector.y + this[1][2]
    );
};

Matrix.prototype.trace = function() {
    return this[0][0] + this[1][1] + this[2][2];
};

Matrix.prototype.determinant = function() {
    return (this[0][0] * this[1][1] * this[2][2]) +
           (this[0][1] * this[1][2] * this[2][0]) +
           (this[0][2] * this[1][0] * this[2][1]) -
           (this[0][2] * this[1][1] * this[2][0]) -
           (this[0][1] * this[1][0] * this[2][2]) -
           (this[0][0] * this[1][2] * this[2][1]);
};

Matrix.prototype.toString = function() {
    return this[0].join(", ") + "\n" + this[1].join(", ") + "\n" + this[2].join(", ");
};

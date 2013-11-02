define(function(require) {
    var Vector3 = require("meier/math/Vector3");
    var Matrix3 = require("meier/math/Matrix");
    
    function Matrix4(array) {
        if(array instanceof Array) {
            this[0] = array.splice(0, 4);
            this[1] = array.splice(0, 4);
            this[2] = array.splice(0, 4);
            this[3] = array.splice(0, 4);
        } else {
            this[0] = [1, 0, 0, 0];
            this[1] = [0, 1, 0, 0];
            this[2] = [0, 0, 1, 0];
            this[3] = [0, 0, 0, 1];
        }
    
        // Adding a length property makes this object
        // behave as an array in loops.
        this.length = 4;
    }
    
    Matrix4.prototype.transform = function(v) {
        var r = new Vector3(0, 0, 0);
        
        r.x = v.x * this[0][0] + v.y * this[0][1] + v.z * this[0][2];
        r.y = v.x * this[1][0] + v.y * this[1][1] + v.z * this[1][2];
        r.z = v.x * this[2][0] + v.y * this[2][1] + v.z * this[2][2];
        
        r.x += this[0][3];
        r.y += this[1][3];
        r.z += this[2][3];
        
        return r;
    };
    
    // Immutable, since it needs a tmp copy anyway.
    Matrix4.prototype.product = function(other) {
        var m = new Matrix4();
    
        var t = this;
        var o = other;
    
        // First row:
        m[0][0] = t[0][0] * o[0][0] + t[0][1] * o[1][0] + t[0][2] * o[2][0] + t[0][3] * o[3][0];
        m[0][1] = t[0][0] * o[0][1] + t[0][1] * o[1][1] + t[0][2] * o[2][1] + t[0][3] * o[3][1];
        m[0][2] = t[0][0] * o[0][2] + t[0][1] * o[1][2] + t[0][2] * o[2][2] + t[0][3] * o[3][2];
        m[0][3] = t[0][0] * o[0][3] + t[0][1] * o[1][3] + t[0][2] * o[2][3] + t[0][3] * o[3][3];
    
        // Second row:
        m[1][0] = t[1][0] * o[0][0] + t[1][1] * o[1][0] + t[1][2] * o[2][0] + t[1][3] * o[3][0];
        m[1][1] = t[1][0] * o[0][1] + t[1][1] * o[1][1] + t[1][2] * o[2][1] + t[1][3] * o[3][1];
        m[1][2] = t[1][0] * o[0][2] + t[1][1] * o[1][2] + t[1][2] * o[2][2] + t[1][3] * o[3][2];
        m[1][3] = t[1][0] * o[0][3] + t[1][1] * o[1][3] + t[1][2] * o[2][3] + t[1][3] * o[3][3];
    
        // Third row:
        m[2][0] = t[2][0] * o[0][0] + t[2][1] * o[1][0] + t[2][2] * o[2][0] + t[2][3] * o[3][0];
        m[2][1] = t[2][0] * o[0][1] + t[2][1] * o[1][1] + t[2][2] * o[2][1] + t[2][3] * o[3][1];
        m[2][2] = t[2][0] * o[0][2] + t[2][1] * o[1][2] + t[2][2] * o[2][2] + t[2][3] * o[3][2];
        m[2][3] = t[2][0] * o[0][3] + t[2][1] * o[1][3] + t[2][2] * o[2][3] + t[2][3] * o[3][3];
        
        // Fourth row:
        m[3][0] = t[3][0] * o[0][0] + t[3][1] * o[1][0] + t[3][2] * o[2][0] + t[3][3] * o[3][0];
        m[3][1] = t[3][0] * o[0][1] + t[3][1] * o[1][1] + t[3][2] * o[2][1] + t[3][3] * o[3][1];
        m[3][2] = t[3][0] * o[0][2] + t[3][1] * o[1][2] + t[3][2] * o[2][2] + t[3][3] * o[3][2];
        m[3][3] = t[3][0] * o[0][3] + t[3][1] * o[1][3] + t[3][2] * o[2][3] + t[3][3] * o[3][3];
    
        return m;
    };
    
    Matrix4.prototype.trace = function() {
        return this[0][0] + this[1][1] + this[2][2] + this[3][3];
    };
    
    Matrix4.prototype.toString = function() {
        return JSON.stringify(this);
    };
    
    Matrix4.prototype.pretty = function() {
        return Matrix3.prototype.pretty.call(this);
    };
    
    Matrix4.prototype.wolfram = function() {
        return Matrix3.prototype.wolfram.call(this);
    };
    
    return Matrix4;
});
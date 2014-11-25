define(function(require) {
    
    Number.Identity = Number.identity = function(operator) {
        switch(operator) {
        case '+':
        case '-':
            return 0;
            
        case '*':
        case '/':
        default:
            return 1;
        }
    };
    
    Number.prototype.identity = function(operator) {
        switch(operator) {
        case '+':
        case '-':
            return 0;
            
        case '*':
        case '/':
        default:
            return 1;
        }
    };
    
    Number.prototype.add = function(b) {
        
        switch(b._MeierMathType) {
        case 0:
            return this + b;
        default:
            // Defer to the other type (commutative)
            return b.add(this);
        }
    };
    
    Number.prototype.subtract = function(b) {
        return this.add(this.negate());
    };
    
    Number.prototype.multiply = function(b) {
        
        switch(b._MeierMathType) {
        case 0:
            return this * b;
        default:
            // Defer to the other type (commutative)
            return b.multiply(this);
        }
    };
    
    
    Number.prototype.divide = function(b) {
        
        switch(b._MeierMathType) {
        case 0:
            return this / b;
        default:
            // Defer to the other type (commutative)
            return b.divide(this);
        }
    };
    
    Number.prototype.power = function(n) {
        return Math.pow(this, n);
    };
    
    Number.prototype.abs = function() {
        return Math.abs(this);
    };
    
    Number.prototype.clone = function() {
        return this; // immutable types.
    };
    
    Number.prototype.negate = function() {
        return -this;
    };
    
    Number.prototype.magnitude = function() {
        return Math.abs(this);
    };
    
    return Number;
});
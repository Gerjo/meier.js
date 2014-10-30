define(function(require) {
    
    Complex.Identity = Complex.identity = function(operator) {
        switch(operator) {
        case '+':
        case '-':
            return new Complex(0, 0);
            
        case '*':
        case '/':
        default:
            return new Complex(1, 0);
        }
    };
    
    function Complex(re, im) {
        if(this.constructor != Complex) {
            return new Complex(re, im);
        }
        
        this.re = re || 0;
        this.im = im || 0;
        
        this._MeierMathType = 1;
    }

    Complex.prototype.identity = function(operator) {
        return Complex.Identity(operator);
    };
    
    Complex.prototype.add = function(b) {
        switch(b._MeierMathType) {
            case 0:
                this.re += b;
                break;
            case 1:
                this.re += b.re;
                this.im += b.im;
                break;
        }
        
        return this;
    };
    
    Complex.prototype.subtract = function(b) {
        switch(b._MeierMathType) {
            case 0:
                this.re -= b;
                break;
            case 1:
                this.re -= b.re;
                this.im -= b.im;
                break;
        }
        
        return this;
    };
    
    Complex.prototype.negate = function() {
        this.re *= -1;
        this.im *= -1;
        return this;
    };
    
    Complex.prototype.multiply = function(b) {
        var a = this;
        
        switch(b._MeierMathType) {
            case 0:
                this.re *= b;
            case 1:
                var re = a.re * b.re - a.im * b.im;
                this.im = a.re * b.im + a.im * b.re;
                this.re = re;
        }
        
        return this;
    };
    
    Complex.prototype.divide = function(b) {
        var a = this;
        
        var c = b.clone().conjugate();
        
        var u = a.clone().multiply(c);
        var v = b.clone().multiply(c);
        
        return new Complex(
            u.re / v.re, u.im / v.re
        );
    };
    
    Complex.prototype.abs = function() {
        return Math.sqrt(Math.pow(this.re, 2) + Math.pow(this.im, 2));
    };
    
    Complex.prototype.angle = function() {
        return Math.atan2(this.im, this.re);
    };
    
    Complex.prototype.conjugate = function() {
        this.re *= -1;
        
        return this;
    };
    
    Complex.prototype.power = function(n) {
        var theta = this.angle();
        var r     = Math.pow(this.abs(), n);
        
        // De Moivre's formula  
        this.re = r * Math.cos(theta * n);
        this.im = r * Math.sin(theta * n);
        return this;
    };

    Complex.prototype.clone = function() {
        return new Complex(this.re, this.im);
    };

    Complex.prototype.toFixed = function(digits) {
        var sign = this.im < 0 ? ' - ' : ' + i';
        
        return this.re.toFixed(digits) + sign + this.im.toFixed(digits);
    };

    return Complex;
});
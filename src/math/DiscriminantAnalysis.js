define(function(require) {
    var Vector = require("meier/math/Vec")(2);
    var M22    = require("meier/math/Mat")(2, 2);
    var M      = require("meier/math/Mat");
    var V      = require("meier/math/Vec");
    
    
    ///  
    ///  11 21 31 n1
    ///  12 22 32 n2
    ///  13 23 33 n3
    ///  1n 2n 3n nn
    var CovarianceMatrix = function(data, bar) {
        
        var cov = new (M(bar.numcolumns, bar.numcolumns))();
        
        // Accumulate deltas
        data.forEach(function(v) {
            for(var row = 0; row < cov.numrows; ++row) {
                var x = v.at(row) - bar.at(0, row);
                
                for(var col = row; col < cov.numcolumns; ++col) {
                    var y = v.at(col) - bar.at(0, col);
                    
                    cov._[cov.index(row, col)] += x * y;
                }
            }
        });
        
        // Unbiased average
        cov.multiply(1 / (data.length - 1));
        
        // Copy the upper triangle into the lower (mirror).
        for(var row = 0; row < cov.numrows; ++row) {
            for(var col = row + 1; col < cov.numcolumns; ++col) {
                cov.set(col, row, cov.get(row, col));
            }
        }
              
        return cov;
    }
    
    /// Create a matrix (column vector) of means
    var Mean = function(data) {
        
        // Column vector with averages // [x, y, ...]
        var res = new (M(1, data[0].numrows))(); 
        
        // For each data entry
        for(var i = 0; i < data.length; ++i) {
            
            // Accumulate each component
            for(var j = 0; j < data[i].numrows; ++j) {
                res._[res.index(0, j)] += data[i].at(j);
            }
        }
        
        // Average it out then return
        return res.multiply(1 / data.length);
    };
    
    /// Contemplate making matrix and vector compatible...
    var ToMatrix = function(vector) {
        var res = new (M(vector.numrows, 1))(); 
        
        for(var i = 0; i < vector.numrows; ++i) {
            res._[res.index(i, 0)] += vector.at(i);
        }
        
        return res;
    };
    
    
    var PrecomputeVars = function(data, total) {
        var mean = Mean(data);
        var a = {
            cov:   CovarianceMatrix(data, mean),
            n:     data1.length,
            mean:  mean
        };
        a.meanT   = a.mean.transpose();
        a.lnRatio      = Math.ln(a.n / total);
        a.covDet     = a.cov.determinant();
        a.covInverse = a.cov.inverse();

        return a;
    };
    
    var self = {
        
        Linear: function(data1, data2) {
            return self._InternalAnalysis(data1, data2, true);
        },
        
        Quadratic: function(data1, data2) {
            return self._InternalAnalysis(data1, data2, false);
        },
        
        ///
        ///
        ///
        _InternalAnalysis: function(data1, data2, doLinear) {
            
            var mean = Mean(data1);
            var a = {
                cov:   CovarianceMatrix(data1, mean),
                n:     data1.length,
                mean:  mean
            };
            
            mean = Mean(data2);
            var b = {
                cov:   CovarianceMatrix(data2, mean),
                n:     data2.length,
                mean:  mean
            };
            
            // Precompute some variables
            var total    = a.n + b.n;
            a.meanT      = a.mean.transpose();
            b.meanT      = b.mean.transpose();
            a.lnRatio    = Math.ln(a.n / total);
            b.lnRatio    = Math.ln(b.n / total);
            a.covDet     = a.cov.determinant();
            b.covDet     = b.cov.determinant();
            a.covInverse = a.cov.inverse();
            b.covInverse = b.cov.inverse();
            
            if(a.covDet == 0) {
                console.log("a.covDet == 0");
                console.log(a.cov.wolfram());
                console.log(data1);
            }
            
            if(b.covDet == 0) {
                console.log("b.covDet == 0");
            }
           
            // Estimate the common group-covariance matrix Σ by the
            // pooled (within-group) sample covariance matrix. In other 
            // words, a weighted average of covariance matrices.
            var pooled  = a.cov.clone().multiply(a.n/total).add(b.cov.clone().multiply(b.n/total));
            var pooledInverse = pooled.inverse();
            
            
            // Equal coverances
            var ldaPooledCov = function(d, m) {
                // Linear term
                var linear   = d.mean.product(pooledInverse).product(m).at(0, 0);
                
                // Constant term
                var constant = 0.5 * d.mean.product(pooledInverse).product(d.meanT).at(0, 0);
                
                // Bring it all together, yielding the odds for this class
                return linear - constant + d.lnRatio;
            };
            
            var lda = function(d, m) {
                var derp = d.mean.product(d.covInverse).product(d.meanT).get(0, 0);
                
                derp -= 2 * d.meanT.product(d.covInverse).product(m).get(0, 0);
                
                var r = Math.ln(d.covDet) - 2 * d.lnRatio + derp;
                
                return r;
            };
            
            
            var qda = function(d, m) {
                var delta = m.clone().subtract(d.mean);
                
                var derp = delta.transpose().product(d.covInverse).product(delta).get(0, 0);
                
                var r = Math.ln(d.covDet) - 2 * d.lnRatio + derp;
                
                return r;
            };
            
            var Classifier = function(vector) {
                
                var m = ToMatrix(vector);
           
                // Odds for class "a".
                var aOdds = ldaPooledCov(a, m);
                var bOdds = ldaPooledCov(b, m);
                
                // x > group "b"
                // x < group "a"
                // x = 0, your favourite tie breaker.
                
                //console.log(aOdds, bOdds);
                return aOdds - bOdds;
            };
            
            return Classifier;
        }
    };
    
    
    return self;
});

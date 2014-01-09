/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    
    // Include vector and matrix builders
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
    
    var self = {
        
        /// Obtain a linear discriminant model for classification.
        ///
        /// @param {data1} An array of vectors describing class 1.
        /// @param {data2} An array of vectors describing class 2.
        /// @return a function to classify data.
        Linear: function(data1, data2) {
            return self._InternalAnalysis(data1, data2, true);
        },
        
        /// Obtain a quadratic discriminant model for classification.
        /// Internally falls back to linear discriminant analysis when 
        /// too few data entries (n < 3) are given or the covariances 
        /// are equal.
        ///
        /// @param {data1} An array of vectors describing class 1.
        /// @param {data2} An array of vectors describing class 2.
        /// @return a function to classify data.
        Quadratic: function(data1, data2) {
            return self._InternalAnalysis(data1, data2, false);
        },
        
        /// Helper to handle LDA/QDA. Many internals are shared
        /// between the two.
        _InternalAnalysis: function(data1, data2, doLinear) {
            var a = { n: data1.length, data: data1 };
            var b = { n: data2.length, data: data2 };
            
            // The eventual classifier method.
            var classifier = null;
           
            if(data1.length === 0 || data2.length === 0) {
                
                // Special classifier if one or more sets is empty. If
                // one set is empty, assume the other class is valid. If 
                // both are empty, it will be a tie.
                classifier = function(d, m) {
                    return d.n == 0 ? 0 : -1;
                }
                
            } else {
            
                // Total number of training entries
                var total    = a.n + b.n;
                
                // Precompute some variables
                [a, b].forEach(function(d) {
                    d.mean     = Mean(d.data);
                    d.cov      = CovarianceMatrix(d.data, d.mean);
                    d.meanT    = d.mean.transpose();
                    d.lnRatio  = Math.ln(d.n / total);
                    d.covDet   = d.cov.determinant();
                    d.lnCovDet = Math.ln(d.covDet);
                    
                    // Will hold the constant term for each method
                    d.constant = 0;
                });
            
                // Equal covariance, rendering quadratic useless, and linear error-stricken.
                if(a.covDet == b.covDet) {
                
                    // Estimate the common group-covariance matrix Σ by the
                    // pooled (within-group) sample covariance matrix. In other 
                    // words, a weighted average of covariance matrices.
                    var pooled  = a.cov.clone().multiply(a.n/total).add(b.cov.clone().multiply(b.n/total));
                    
                    // This call may fail when pooled.det == 0
                    var pooledInverse = pooled.inverse();
                        
                    a.constant = 0.5 * a.mean.product(pooledInverse).product(a.meanT).at(0, 0) + a.lnRatio;
                    b.constant = 0.5 * b.mean.product(pooledInverse).product(b.meanT).at(0, 0) + b.lnRatio;
                        
                    // Equal coverances
                    classifier = function(d, m) {
                        // Linear term
                        var linear   = d.mean.product(pooledInverse).product(m).at(0, 0);
                
                        // Bring it all together, yielding the odds for this class
                        return linear - d.constant;
                    };
                
                } else {
                    // Pre compute inverse
                    a.covInverse = a.cov.inverse();
                    b.covInverse = b.cov.inverse();
                
                    if(doLinear === true) {
                        
                        a.constant = a.lnCovDet - 2 * a.lnRatio + a.mean.product(a.covInverse).product(a.meanT).get(0, 0);
                        b.constant = b.lnCovDet - 2 * b.lnRatio + b.mean.product(b.covInverse).product(b.meanT).get(0, 0);
                        
                        classifier = function(d, m) {
                            // Linear term
                            var linear = 2 * d.meanT.product(d.covInverse).product(m).get(0, 0);
                
                            return d.constant - linear;
                        };
                    } else {
                        a.constant = a.lnCovDet - 2 * a.lnRatio;
                        b.constant = b.lnCovDet - 2 * b.lnRatio;
                        
                        classifier = function(d, m) {
                            var delta    = m.clone().subtract(d.mean);
                            
                            // "delta" is used twice, making it quadratic.
                            var quadratic = delta.transpose().product(d.covInverse).product(delta).get(0, 0);
                
                            return d.constant + quadratic;
                        };
                    }
                } // End else a.cov == b.cov
            } // End else a.length === 0 or b.length === 0
            
            return function(vector) {
                // Vector to a column-filled-matrix
                var m = ToMatrix(vector);
           
                // Odds for each class
                var aOdds = classifier(a, m);
                var bOdds = classifier(b, m);
                
                // x > group "b"
                // x < group "a"
                // x = 0, your favourite tie breaker.
                
                //console.log(aOdds, bOdds);
                return aOdds - bOdds;
            };
        }
    };
    
    
    return self;
});

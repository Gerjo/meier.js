/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/


define(function(require) {
   
    /// TODO: the actual "k" bit from knn. Though I've never had success 
    /// with k > 1, so no rush.
    function KNN(train, entry, normalize) {
        var best  = Infinity;
        var classes = [];
        
        var minValues   = {};
        var maxValues   = {};
        
        
        // Normalize is great if not all numbers have an equal range.
        // It simply maps everything to [0, 1], thus each classifier
        // would count evenly when measuring the euclidian distance.
        if(normalize === true) {
            
            for(var k in train[0]) {
                minValues[k] = Infinity;
                maxValues[k] = -Infinity;
            }
            
            for(var i = 0; i < train.length; ++i) {
                for(var k in train[i]) {
                    if(train[i].hasOwnProperty(k)) {
                        if(train[i][k] > maxValues[k]) {
                            maxValues[k] = train[i][k];
                        }
                        
                        if(train[i][k] < minValues[k]) {
                            minValues[k] = train[i][k];
                        }
                    }
                }
            }
        }
        
        
        for(var i = 0; i < train.length; ++i) {
            
            var length = 0;
            var delta;
            
            for(var k in entry) {
                if(entry.hasOwnProperty(k)) {
                    
                    // Normalize by length, then euclidian distance
                    if(normalize === true) {
                        var n = maxValues[k] - minValues[k];
                        delta = (entry[k] / n) - (train[i][k] / n);
                        
                    // Simple euclidian distance
                    } else {
                        delta = (entry[k]) - train[i][k];
                    }
                    
                    length += delta * delta;
                }
            }
            
            if(length < best) {
                best  = length;
                classes = [train[i]];
                
            } else if(length === best) {
                // It's tie
                classes.push(train[i]);
            }
            
        }
        
        return {"distance": Math.sqrt(best), "classes": classes};
    }
    
    return KNN;
});
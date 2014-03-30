/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013-2014 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/


define(function(require) {
    
    var V3 = require("meier/math/Vec")(3);
    
    function Node(array, axis) {
                
               
                
        this.left  = new NullNode();
        this.right = new NullNode();
        this.axis  = axis;
        
        if(!array) {
            return;
        } 
        
        var axes = array[0].numrows;
        
        // Sort on axis
        array.sort(function(a, b) {
            return a.at(axis) - b.at(axis);
        });
        
    
        // Find pivot
        var middle = parseInt(array.length * 0.5);
        
        this.value = array[middle];
        
        
        console.log("Pivot index: " + middle + "/" + array.length + " value:" + this.value.wolfram());
        
        // Split the array at the middle.
        var left  = [], right = [];
        
        for(var i = 0; i < array.length; ++i) {
            if(i < middle) {
                left.push(array[i]);
            } else if(i > middle) {
                right.push(array[i]);
            }
        }
          
        if(left.length > 0) {
            this.left = new Node(left, (axis + 1) % axes);
        }
          
        if(right.length > 0) {
            this.right = new Node(right, (axis + 1) % axes);
        }
    }
    
    Node.prototype.nearest = function(requested, best) {
        
        var distance = requested.distanceSq(this.value);
        
        if(distance < best.distance) {
            best.distance = distance;
            best.value    = this.value;
            
            //console.log("  New best:", best.value.wolfram(), "[" + best.distance + "]");
        } else {
            //console.log("  Not best:", this.value.wolfram(), "[" + distance + "]");
        }
        
        if(requested.at(this.axis) > this.value.at(this.axis) ) {
            if(this.right) {
                this.right.nearest(requested, best);
            }
        } else {
            if(this.left) {
                this.left.nearest(requested, best);
            }
        }
        
        return best;
    };
    
    NullNode.prototype = new Node();
    function NullNode() {
        //Node.call(this);
        
        this.value = new V3(Infinity, Infinity, Infinity);
        this.left  = null;
        this.right = null;
    }
    
    function NNTree(array) {
        
        if(array.length > 0) {
            this._axes  = array[0].numrows;
            this._root = new Node(array, 0);
        } else {
            this._axes  = 0;
            this._root = null;
        }
    }
    
    NNTree.prototype.nearest = function(v) {
        if(this._root) {
            if(v.numrows != this._axes) {
                throw new Error("Incorrect number of axes in vector.");
            }
            
            return this._root.nearest(v, {
                value:    null,
                distance: Infinity
            }).value;
        }
        
        return null;
    };
    
    NNTree.prototype.inArray = function(array, search) {
        var best = {
            value:    null,
            distance: Infinity
        };
        
        var index   = 1;
        var axis    = 0;
        var axes    = 3; 
        var running = true;
        
        while(index <= array.length) {
            
            var tentative = array[index - 1];
          
            var distance  = tentative.distanceSq(search);
            
           
            if(distance < best.distance) {
                best.distance = distance;
                best.value    = tentative;
                
                //console.log("  ", index-1, "New best: " + best.value.wolfram(), "[" + best.distance + "]");
            } else {
                //console.log("  ", index-1, "Not best: " + tentative.wolfram(), "[" + distance + "]");
            }
        
            if(search.at(axis) > tentative.at(axis)) {
                index = index * 2 + 1;
            } else {
                index = index * 2;
            }
            
            axis = (axis + 1 ) % axes;
        }
        
        
        //if( ! (index < array.length)) { 
        //    console.log("out-of-bounds");
        //}
        
        return best.value;
    };
    
    NNTree.prototype.toArray = function() {
        var array = [];
        var queue = [this._root];
        
        var inf = this._root.value.clone();
        inf.x = Infinity;
        inf.y = Infinity;
        inf.z = Infinity;
        
        while(queue.length > 0) {
            var node = queue.shift();
            
            if(node.left) {
                queue.push(node.left);
            
                if(!node.right) {
                    //queue.push(inf);
                }
            }
        
            if(node.right) {
                queue.push(node.right);
            
                if(!node.left) {
                    //queue.push(inf);
                }
            } 
        
            array.push(node.value);
            
        }
        
        while(array.length > 0 && array.last().x == Infinity) {
            array.pop();
        }
        
        return array;
    };
    
    return NNTree;
});
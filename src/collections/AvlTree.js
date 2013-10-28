define(function(require) {
    
    
    
    function Node(tree, data, parent) {
        this.tree   = tree;
        this.data   = data;
        this.left   = null;
        this.right  = null;
        this.parent = parent || null;
        
        this.z      = 0;
    }
    
    Node.prototype.min = function() {
        var l = this;
        
        while(l.left != null) {
            l = l.left;
        }
        
        return l;
    };
    
    Node.prototype.max = function() {
        var l = this;
        
        while(l.right != null) {
            l = l.right;
        }
        
        return l;
    };
    
    Node.prototype.find = function(data) {
        var r = this.tree.cmp(this.data, data);
        
        if(r == 0) {
            return this.data;
        } else if(r < 0 && this.right != null) {
            return this.right.find(data);
        } else if(r > 0 && this.left != null) {
            return this.left.find(data);
        }
        
        return null;
    };
    
    Node.prototype.delete = function(data) {
        var r = this.tree.cmp(this.data, data);
        
        if(r == 0) {
            var data = this.data;
            
            // Leaf node:
            if( ! this.left && ! this.right) {
                
                if(this.parent) {
                    if(this.parent.left == this) {
                        this.parent.left = null;
                    } else if(this.parent.right == this) {
                        this.parent.right = null;
                    } else {
                        console.log("AvlTree[0] -> cannot delete. Parent doesn't know child.");
                    }
                
                    // Root-leaf deletion.
                } else {
                    this.tree.root = null;
                }
            
            // Two childen:
            } else if(this.left && this.right) {
                // in-order successor (lowest value of right sub tree, lowest of
                // the highest, if you will.)
                var bottom = this.right.min();
                
            
                // bottom is new current:
                this.data = bottom.data;
            
                if(bottom.parent.left == bottom) {
                    bottom.parent.left = null;
                } else if(bottom.parent.right == bottom) {
                    bottom.parent.right = null
                } else {
                    console.log("AvlTree[1] -> cannot delete. Parent doesn't know child.");
                }
                
            // Only a right child:
            } else if ( ! this.left) {
                this.right.parent = this.parent;
                
                if(this.parent.left == this) {
                    this.parent.left = this.right;
                } else if(this.parent.right == this) {
                    this.parent.right = this.right;
                } else{
                    console.log("AvlTree[2] -> cannot delete. Parent doesn't know child.");
                }
              
            // Only a left child:
             } else if ( ! this.right) {
                this.left.parent = this.parent;
            
                if(this.parent.left == this) {
                    this.parent.left = this.left;
                } else if(this.parent.right == this) {
                    this.parent.right = this.left;
                } else{
                    console.log("AvlTree[3] -> cannot delete. Parent doesn't know child.");
                }  
                
            } else {
                console.log("AvlTree -> unknown delete routine required. murphy.");
            }
                        
            return data;
        } else if(r < 0 && this.right != null) {
            return this.right.delete(data);
        } else if(r > 0 && this.left != null) {
            return this.left.delete(data);
        }
        
        return null;
    };
    
    Node.prototype.insert = function(data) {
        
        // Compare the items:
        var r = this.tree.cmp(this.data, data);
        
        // Tentative new z score:
        var z = 1;
        
        // Left insertion:
        if(r < 0) {
            if(this.right !== null) {
                z = 1 + this.right.insert(data);
            } else {
                this.right = new Node(this.tree, data, this);
            }
        
        // Right insertion:
        } else if(r > 0) {
            if(this.left !== null) {
                z = 1 + this.left.insert(data);
            } else {
                this.left = new Node(this.tree, data, this);
            }
            
        // Values must be unique.
        } else {
            console.log("error, non unique.");
        }
        
        // The other branch might be longer. Take the longest.
        this.z = Math.max(this.z, z);
        
        var l = (this.left  && this.left.z)  || -1;
        var r = (this.right && this.right.z) || -1;
        
        
        if( ! this.left && this.right && this.right.z > 0) {
            //console.log("(left) (noright) unbalanced after inserting: ", data, "this:", this.data);
            
            this.leftRotate();
        } 
        
        if( ! this.right && this.left && this.left.z > 0) {
            //console.log("(right) (noleft) unbalanced after inserting: ", data, "this:", this.data);
            
            this.rightRotate();
        }
        
        if(this.right && this.left && Math.abs(this.left.z - this.right.z) > 1) {
            if(this.right.z > this.left.z) {
                //console.log("(left) (both) unbalanced after inserting: ", data, "this:", this.data);
                this.leftRotate();
                
            } else {
                //console.log("(right) (both) unbalanced after inserting: ", data, "this:", this.data);
                this.rightRotate();
            }
        }
        
        return this.z;
    };
    
    Node.prototype.rightRotate = function() {
        var p = this.parent;
        var y = this;
        var x = y.left;
        var a = x.left;
        var c = y.right;
        var b = x.right;
        
        x.left  = a;
        x.right = y;
        y.right = c;
        y.left  = b;
        
        if(p) {
            if(p.left == this) {
                p.left = x; 
                x.parent = p;
                y.parent = x;
            } else if(p.right == this) {
                p.right = x; 
                
                x.parent = p;
                y.parent = x;
            } else {
                console.error("AvlTree -> Parent doesn't own this node? rotate broken. parent:", this.parent, "me:", this);
            }
        } else {
            y.parent = x;
            x.parent = null; // new tree _root.
            
            // This is a bit scary:
            this.tree._root = x;
            
            //console.log("rotation involved root.");
        }
        
        
        // Probably updating too many.
        y.update('y');
        y.right && y.right.update('y.r');
        x.update('x');
        x.parent && x.parent.update('y.p');
    };
    
    /// LeftRotate does the following:
    ///    FROM    --------->   TO
    ///
    ///      p         |         p
    ///      |         |         |
    ///      x         |         y
    ///    /  \        |       /  \ 
    ///   A    y       |      x   C
    ///       / \      |     / \
    ///      B   C     |    A   B
    ///                |                
    ///
    /// Note the order preserving property, e.g., C remains right
    /// of y; A remains left of y (etc). 
    ///
    /// A, B and C are subtrees. x, y and p are nodes.
    ///
    Node.prototype.leftRotate = function() {
        var p = this.parent;
        
        var x = this;
        var a = x.left;
        var y = x.right;
        var b = y.left;
        var c = y.right;
        
        y.left  = x;
        y.right = c;
        x.left  = a;
        x.right = b
        
        if(p) {
            if(p.left == this) {
                p.left = y; 
                y.parent = p;
                
                x.parent = y;
            } else if(p.right == this) {
                p.right = y; 
                
                y.parent = p;
                x.parent = y;
            } else {
                console.error("AvlTree -> Parent doesn't own this node? rotate broken. parent:", this.parent, "me:", this);
            }
        } else {
            x.parent = y;
            y.parent = null; // new tree _root.
            
            // This is a bit scary:
            this.tree._root = y;
            
            //console.log("rotation involved root.");
        }
        
        
        // Probably updating too many.
        x.update('x');
        y.right && y.right.update('y.r');
        y.update('y');
        y.parent && y.parent.update('y.p');
        
        //x.update();
        //y.update();
        //p && p.update();
    };
    
    Node.prototype.update = function(n) {
        this.z = -1; //Math.max(this.left && this.left.z || -1, this.right && this.right.z || -1) + 1;
        
        if(this.left && typeof this.left.z == "number") {
            this.z = this.left.z;
        }
        
        if(this.right && typeof this.right.z == "number" && this.right.z > this.z) {
            this.z = this.right.z;
        }
        
        this.z++;
        
        //console.log("updating ["+n+"]:", this.data, "to", this.z, ",",this.left && this.left.z, this.left && this.left.z);
        
        if(this.z < 0) {
            console.error("AvlTree -> z less than 0 after update. z:", this.z, "left",this.left,"right",this.right);
        }
        
    };

    Node.prototype.inorder = function(callback) {
        
        if(this.left) {
            if(this.left.inorder(callback) === false) {
                return false;
            }
        }
        
        if(callback(this.data) === false) {
            return false;
        }
        
        if(this.right) {
            if(this.right.inorder(callback) === false) {
                return false;
            }
        }
        
        // Continue with recursion.
        return true;
    };
    
    /// Debug representation.
    Node.prototype.toString = function() {
        var s = "{[" + this.z + "]";
        
        if(!this.left && !this.right) {
            s += this.data + "";
        } else {
            s +=  + this.data + ": ";
        }
        
        if(this.left) {
            s += "l" + this.left.toString();
        }
        
        if(this.left && this.right) {
            s += ", "
        }
        
        if(this.right) {
            s += "r" + this.right.toString();
        }
        
        return s + "}";
    };
    

    function Tree(compare) {
        if(compare) {
            if(typeof compare == "function") {
                this.cmp = compare;
            } else {
                throw new Error("Not a valid compare function: " + compare);
            }
        } else {
            this.cmp = function(a, b) { return a - b; }
        }
        
        this._root = null;
    }
    
    /// Find data in the tree. Searches using the earlier
    /// provided compare function.
    ///
    /// @param {data} the object  to search for.
    /// @return the data when found, else null.
    Tree.prototype.find = function(data) {
        if(this._root != null) {
            return this._root.find(data);
        } else {
            return null;
        }
    };
    
    /// Delete data from tree. Searches using the earlier
    /// provided compare function. Leaves the tree unbalanced.
    ///
    /// @todo re-balance on delete.
    ///
    /// @param {data} the object to delete
    /// @return the delete data when found, else null.
    Tree.prototype.delete = function(data) {
        if(this._root != null) {
            return this._root.delete(data);
        } else {
            return null;
        }
    };
    
    /// Insert data into the tree.
    Tree.prototype.insert = function(data) {
        if(this._root != null) {
            this._root.insert(data);
            
        // Trivial, this is the entry.
        } else {
            this._root = new Node(this, data);
        }
    };
    
    /// String representation of this object.
    Tree.prototype.toString = function() {
        return this._root && this._root.toString() || "{}";
    }
    
    /// Tranverse this tree in-order. Visits all items until the 
    /// callback returns false, or no more data entries are left.
    ///
    /// @param {callback} the callback function for each data entry.
    Tree.prototype.inorder = function(callback) {
        if(this._root) {
            this._root.inorder(callback);
        }
    };
    
    return Tree;
});
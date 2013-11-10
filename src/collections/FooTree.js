define(function(require) {
    
    
    function Tree(w, h) {
        this.root = new Node(0, 0, w, h);
    }
    
    Tree.prototype.draw = function(renderer) {
        this.root.draw(renderer);
        return this;
    };
    
    Tree.prototype.add = function(entity) {
        if(entity instanceof Array) {
            entity.forEach(this.root.add.bind(this.root));
        } else {
            this.root.add(entity);
        }
        return this;
    };
    
    Tree.prototype.clear = function() {
        this.root = new Node(this.root.x, this.root.y, this.root.w, this.root.h);
        
        //this.root.clear();
        return this;
    };
    
    Tree.prototype.getNodeAt = function(criterion, center) {
        return this.root.getNodeAt(criterion, center);
    };
    
    Tree.prototype.visit = function(criterion, callback) {
        
        var out = [];
    
        this.root.getAllNodes(out, criterion);
            
    
        for(var k = 0; k < out.length; ++k) {
            if( ! callback(out[k])) {
                return false;
            }
        }
    
        return true;
    };
    
    
    function Node(x, y, w, h) {
        this.x  = x;
        this.y  = y;
        this.w  = w;
        this.h  = h;
        this.hw = w * 0.5;
        this.hh = h * 0.5;
        this.flag     = 0;
        this.left     = null;
        this.right    = null;
        this.entities = [];
        this.hasDisbursed = false;
    }
    
    Node.prototype.disburse = function() {
        if(this.hasDisbursed === true) {
            return;
        }

        this.hasDisbursed = true;
    
        this.partition();
    
        if(this.isLeaf()) {
            console.log("Warning: potential partition fail");
            return;
        }
    
        for(var k = 0; k < this.entities.length; ++k) {
            this.left.add(this.entities[k]);
            this.right.add(this.entities[k]);
        }
    };
    
    /// Programmed for anything that has these properties:
    /// x, y, width, height
    ///
    Node.prototype.contains = function(entity) {
        var ehw = entity.width  * 0.5;
        var ehh = entity.height * 0.5;
        
      
        return (
            ((this.x - this.hw < entity.position.x - ehw && this.x + this.hw > entity.position.x - ehw)
            ||
            (this.x - this.hw < entity.position.x + ehw && this.x + this.hw > entity.position.x + ehw))
            &&
            ((this.y - this.hh < entity.position.y - ehh && this.y + this.hh > entity.position.y - ehh)
            ||
            (this.y - this.hh < entity.position.y + ehh && this.y + this.hh > entity.position.y + ehh))
        );
    };
    
    Node.prototype.containsPoint = function(point) {

        return (
            (this.x - this.hw < point.x && this.x + this.hw > point.x)
            &&
            (this.y - this.hh < point.y && this.y + this.hh > point.y)
        );
    };
    
    Node.prototype.intersectsRectangle = function(rectangle) {
        // TODO: write this.
        return true;
    };
    
    Node.prototype.clear = function() {
        if(this.length > 0) {
            this.entities.clear();
            this.flag        = 0;
            this.hasDisbured = false;
            
            if( ! this.isLeaf()) {
                this.left.clear();
                this.right.clear();
            }
        }
    };
    
    Node.prototype.add = function(entity) {
        
        if(this.contains(entity)) {
            this.entities.push(entity);
        }
    };
    
    Node.prototype.isLeaf = function() {
        return this.left == null;
    };
    
    Node.prototype.partition = function() {
        
        if(this.w < 10) {
            return;
        }
        
        if( ! this.isLeaf()) {
            return;
        }
        
        var hhh = this.hh * 0.5;
        var hhw = this.hw * 0.5;
        
        if(this.w > this.h) {
            this.left  = new Node(this.x - hhw, this.y, this.hw, this.h);
            this.right = new Node(this.x + hhw, this.y, this.hw, this.h);
            
        } else {
            this.left  = new Node(this.x, this.y - hhh, this.w, this.hh);
            this.right = new Node(this.x, this.y + hhh, this.w, this.hh);
        }
    };
    
    Node.prototype.getCriterionReponse = function(heuristic) {
        var width  = this.w;
        var height = this.h;

    
        var num = this.entities.length;
    
        if(num >= heuristic.minimalEntities && num <= heuristic.maximalEntities) {
            if(width >= heuristic.minimalSize && width <= heuristic.maximalSize) {
                // good numEntities and width are in range.
            
                // NOTE: untested (26th august)
                if(this.flag & heuristic.solid) {
                    return Criterion.Response.DISBURSE;
                }

                return Criterion.Response.PASS;
            } else if(width <= heuristic.minimalSize) {
                // numEntities is in range, but width is too much. However we cannot
                // disburse a small space. Deal with it:
                return Criterion.Response.FAIL;

            } else if(width <= 1) {
                throw new Error("Cannot partition width <= 1");
                return Criterion.Response.ERROR;

            } else {
                //System.out.println("Disburse: " + toString());
                return Criterion.Response.DISBURSE;
            }

        // Too many entities:
        } else if(num > heuristic.minimalEntities) {
            // We cannot subdivide "1". Spaces assume a pixel unit-type, there
            // is no such thing as a "0.5" pixel. For other units (seen with OpenGL)
            // this check may or may not make sense. For OpenGL, "1" could mean
            // "100 physical pixels".
            if(width <= 1) {
                if(num > heuristic.maximalEntities) {
                    return Criterion.Response.FAIL;
                }
            
                // NOTE: untested (26th august)
                if(this.flag & heuristic.solids) {
                    return Criterion.Response.DISBURSE;
                }

                // Cannot shrink. Deal with it.
                return Criterion.Response.PASS;
            } else {
                if(width > heuristic.minimalSize) {
                    return Criterion.Response.DISBURSE;
                } else {
                    return Criterion.Response.FAIL;
                }
            }

        // Too few entities, the heuristic doen't care - ignore this space.
        } else {
            return Criterion.Response.FAIL;
        }
    };
    
    Node.prototype.getNodeAt = function(criterion, center) {
        if(this.containsPoint(center)) {
            switch(this.getCriterionReponse(criterion)) {
                case Criterion.Response.PASS:
                    return this;
            
                case Criterion.Response.DISBURSE:
                    this.disburse();
                    if(this.isLeaf()) {
                        console.log(this);
                        throw new Error("Disburse failed.");
                    }
                
                    return this.left.getNodeAt(criterion, center) || this.right.getNodeAt(criterion, center);
                default:
                    throw new Error("Internal error: invalid Criterion response.");
            }
        }
        
        return null;
    };
    
    Node.prototype.getAllNodes = function(out, criterion) {
        var c = this.getCriterionReponse(criterion);
        switch(c) {
            case Criterion.Response.PASS:
                out.push(this);
                break;

            case Criterion.Response.DISBURSE:
                this.disburse();
        
                if(this.isLeaf()) {
                    console.log(this);
                    throw new Error("Disburse failed.");
                }

                this.left.getAllNodes(out, criterion);
                this.right.getAllNodes(out, criterion);
    
                break;
            default:
                throw new Error("Unacceptable error. Criterion response is unknown:" + c);
        }
    };
    
    Node.prototype.getNeighbours = function(out, node, criterion) {

        if(this.intersectsRectangle(node.rectangle)) {
            switch(this.getCriterionReponse(criterion)) {
                case Criterion.Response.PASS:
                    if(this != node) {
                        out.push(this);
                    }
                    break;
                case Criterion.Response.DISBURSE:
                    this.disburse();
                
                    if(this.isLeaf()) {
                        console.log(this);
                        throw new Error("Disburse failed.");
                    }
                
                    this.left.getNeighbours(out, node, criterion);
                    this.right.getNeighbours(out, node, criterion);

                    break;
            }
        }  
    };
    
    Node.prototype.draw = function(renderer) {
        renderer.rectangle(this.x, this.y, this.w, this.h);
        if(this.left) {
            this.left.draw(renderer);
        }
        
        if(this.right) {
            this.right.draw(renderer);
        }
        
    };
    
    function Criterion(minimalSize, maximalSize, minimalEntities, maximalEntities, permitDiagonal) {
        this.minimalSize     = minimalSize || 1;
        this.maximalSize     = maximalSize || 10;
        this.minimalEntities = minimalEntities || 0;
        this.maximalEntities = maximalEntities || 2;
        this.permitDiagonal  = permitDiagonal || false;
        this.solid           = 0;
    }

    // Enum with response types.
    Criterion.Response = {};
    Criterion.Response.FAIL     = 0;
    Criterion.Response.DISBURSE = 1;
    Criterion.Response.PASS     = 2;
    
    Tree.Node      = Node;
    Tree.Criterion = Criterion;
    
    return Tree;
});
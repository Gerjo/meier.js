define(function(require) {
    var Vector = require("meier/math/Vector");
    
    // My query-by-criterion-self-adjusting-tree.
    function Tree(w, h) {
        // Creation constructor:
        if(w && h) {
            this.root = new Node(0, 0, w, h);
    
        // Default constructor, in case of inheritance:
        } else {
            this.root = null;
        }
    }

    Tree.prototype.clear = function() {
        var w = this.root.rectangle.max.x - this.root.rectangle.min.x;
        var h = this.root.rectangle.max.y - this.root.rectangle.min.y;
   
        this.root.clear();
        //this.root = new Node(0, 0, w, h);
    };

    Tree.prototype.insert = function(actor) {
        this.root.insert(actor);
    };

    Tree.prototype.draw = function(context) {
        context.beginPath();
        context.fillStyle = "rgba(0, 0, 0, 0.1)";
        context.strokeStyle = "rgba(255, 0, 0, 0.1)";
        this.root.draw(context);
    };

    Tree.prototype.visit = function(criterion, callback) {
    
        var out = [];
    
        this.root.getAllSpaces(out, criterion);
    
        for(var k = 0; k < out.length; ++k) {
            if( ! callback(out[k])) {
                return false;
            }
        }
    
        return true;
    };

    /// Return actors that fit in a rectangle with a given tolerance. The
    /// tolerance will only make the search area larger - not smaller. If
    /// an actor is contained within the rectangle it shall always be
    /// returned, no matter the tolerance.
    Tree.prototype.getActorsFromRectangle = function(rectangle, tolerance) {
    
    
        if( ! tolerance) {
            // Determined by guessing.
            //tolerance = Math.max(rectangle.width() * 0.1, 10);
            tolerance = 10;
        }
    
        var out    = {
            actors: [],
            rectangles: [],
            lookup: []
        };
    
        this.root.getActorsFromRectangle(out, rectangle, tolerance);
    
        delete out.lookup;
    
        return out; // out.entities
    };

    Tree.prototype.getNodeAt = function(criterion, center) {
        return this.root.getNodeAt(criterion, center);
    };

    Tree.prototype.getNeighbours = function(node, criterion) {
        var out = [];
        this.root.getNeighbours(out, node, criterion);
        return out;
    };


    function Criterion( minimalSize, maximalSize, minimalEntities, maximalEntities, permitDiagonal) {
        this.minimalSize     = minimalSize || 1;
        this.maximalSize     = maximalSize || 10;
        this.minimalEntities = minimalEntities || 1;
        this.maximalEntities = maximalEntities || 2;
        this.permitDiagonal  = permitDiagonal || false;
        this.solid           = 0;
    }

    // Not so type safe enum.
    Criterion.Response = {};
    Criterion.Response.FAIL     = 0;
    Criterion.Response.DISBURSE = 1;
    Criterion.Response.PASS     = 2;


    Node.Counter = 0;

    function Node(x1, y1, x2, y2) {
        this.id        = Node.Counter++;
        this.rectangle = new Rectangle(x1, y1, x2, y2);
        this.flag      = 0;
        this.actors    = [];
    
        this.left  = null;
        this.right = null;
        this.hasDisbursed = false;
    }

    Node.prototype.getActorsFromRectangle = function(out, rectangle, tolerance) {
        var Intersects = Intersection.Test.Rectangles;

        // If this is empty, prune all children.
        if(this.actors.length === 0) {
            return;
        }

        // Future note: rather than recurse, if the entity count is small enough
        // it's more sensible to hit-test directly. Say, when n < 4 or along
        // those lines.

        if(this.rectangle.width() > tolerance || this.rectangle.height() > tolerance) {
            this.disburse();
        }

        // Has children, traverse when boundingbox fits:
        if( ! this.isLeaf()) {
        
            if(Intersects(rectangle, this.left.rectangle) === true) {
                this.left.getActorsFromRectangle(out, rectangle, tolerance);
            }
        
            if(Intersects(rectangle, this.right.rectangle) === true) {
                this.right.getActorsFromRectangle(out, rectangle, tolerance);
            }
    
        // Leaf node, push entities.  
        } else {
        
            for(var i = 0; i < this.actors.length; ++i) {
                if( ! out.lookup[this.actors[i].id] ) {
                    out.lookup[this.actors[i].id] = true;
                
                    out.actors.push(this.actors[i]);
                
                    //console.log("*");
                }
            }
        
            out.rectangles.push(this.rectangle);
        }
    };

    Node.prototype.getNodeAt = function(criterion, center) {
        if(this.rectangle.containsPoint(center)) {
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
            }
        }
    
        return null;
    };

    // TODO: Rename? Node / Space consistency...
    Node.prototype.getAllSpaces = function(out, criterion) {
        switch(this.getCriterionReponse(criterion)) {
            case Criterion.Response.PASS:
                out.push(this);
                break;

            case Criterion.Response.DISBURSE:
                this.disburse();
        
                if(this.isLeaf()) {
                    console.log(this);
                    throw new Error("Disburse failed.");
                }

                this.left.getAllSpaces(out, criterion);
                this.right.getAllSpaces(out, criterion);
    
                break;
        }
    };

    Node.prototype.disburse = function() {
        if(this.hasDisbursed === true) {
            //console.log("already disbursed. isLeaf:", this.isLeaf(), "disbursed?",this.hasDisbursed);
            return;
        }

        this.hasDisbursed = true;
    
        this.partition();
    
        // We might not able to partition at anytime. E.g., a
        // 0 volume space.
        if(this.isLeaf()) {
            console.log("Warning: potential partition fail");
            return;
        }
    
        for(var k = 0; k < this.actors.length; ++k) {
            this.left.insert(this.actors[k]);
            this.right.insert(this.actors[k]);
        }
    };

    Node.prototype.partition = function(depth) {
    
        if( ! this.isLeaf()) {
            //console.log(this);
            //throw new Error("cannot partition non leaf");
            return;
        }
    
        var w = this.rectangle.max.x - this.rectangle.min.x;
        var h = this.rectangle.max.y - this.rectangle.min.y;

        var hw = w * 0.5;
        var hh = h * 0.5;
    
        var x = this.rectangle.min.x;
        var y = this.rectangle.min.y
   
        var x2 = this.rectangle.max.x;
        var y2 = this.rectangle.max.y;
    
        if(w > h) {
            this.left  = new Node(x, y, x2 - hw, y2);
            this.right = new Node(x + hw, y, x2, y2);
        } else {
            this.left  = new Node(x, y, x2, y + hh);
            this.right = new Node(x, y + hh, x2, y2);
        }
    };

    Node.prototype.isLeaf = function() {
        // TODO: inline.
        return !( this.left && this.right );
    };

    Node.prototype.insert = function(actor) {
        if(this.rectangle.intersects(actor.rectangle)) {
            this.flag |= actor.type;        
            this.actors.push(actor);
        }
    };

    Node.prototype.clear = function() {
        if(this.actors.length <= 0) {
            return;
        }
    
        this.flags  = 0;
        this.actors = [];
    
        this.hasDisbursed = false;
    
        this.left  && this.left.clear();
        this.right && this.right.clear();
    };

    Node.prototype.draw = function(context) {
    
        context.fillRect(
            this.rectangle.min.x, 
            this.rectangle.min.y, 
            this.rectangle.max.x - this.rectangle.min.x, 
            this.rectangle.max.y - this.rectangle.min.y);
    
        if(this.actors.length > 0) {
            context.strokeRect(
            this.rectangle.min.x, 
            this.rectangle.min.y, 
            this.rectangle.max.x - this.rectangle.min.x, 
            this.rectangle.max.y - this.rectangle.min.y);
        }
    
        this.left  && this.left.draw(context);
        this.right && this.right.draw(context);
    };

    Node.prototype.visit = function(criteron, callback) {
    
        return true;
    };

    Node.prototype.getCriterionReponse = function(heuristic) {
        var width  = this.rectangle.max.x - this.rectangle.min.x;
        var height = this.rectangle.max.y - this.rectangle.min.y;

    
        var num = this.actors.length;
    
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

    Node.prototype.getNeighbours = function(out, node, criterion) {
        // TODO: use intersection.
        if(this.rectangle.intersects(node.rectangle)) {
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
    
    return Tree;
});
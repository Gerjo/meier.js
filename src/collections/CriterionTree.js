/// rectangle circle
/// 
///
///
define(function(require) {
    
    var Intersection = require("meier/math/Intersection");
    var Rectangle    = require("meier/math/Rectangle");
    var Heap         = require("meier/collections/Heap");
    var LineSegment  = require("meier/math/Line");
    var Vector       = require("meier/math/Vec")(2);
    
    // Tmp include:
    //var Types        = {}; Types.SOLID = 2;
 
    
    var NodeIdCounter = 0;
    
    function Tree(w, h) {
        if(w && h) {
            this.root = new Node(0, 0, w, h);
        } else {
            this.root = null;
        }
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
    
    Tree.prototype.getNeighbours = function(criterion, node) {
        var out = [];
        this.root.getNeighbours(out, criterion, node);
        return out;
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
    
    Tree.prototype.canSeePoint = function(actor, point, isSolid, renderer) {
        
        var ehw = actor.width * 0.5;
        var ehh = actor.height * 0.5;
        
        var volume = new Rectangle(
            Math.min(actor.position.x - ehw, point.x),
            Math.min(actor.position.y - ehh, point.y),
            Math.max(actor.position.x + ehw, point.x),
            Math.max(actor.position.y + ehh, point.y)
        );
    
        var c        = actor.position;
        var viewline = new LineSegment(c.x, c.y, point.x, point.y);
    
        // TODO: performance tweak "width".
        var out      = this.getActorsFromRectangle(volume, 10);
        var actors   = out.actors;
    
        
        for(var i = 0; i < actors.length; ++i) {
        
            // TODO: proper solid flag.
            // if(true || actors[i].type & solid) {
            
                if(renderer) {
                    renderer.begin();
                    renderer.line(viewline.a, viewline.b);
                    renderer.rectangle(volume);
                    renderer.fill("red");
                }
            
            // Custom see-through callback function.
            if(isSolid(actors[i])) {
            
                // Test against self:
                if(actors[i] != actor) {
                    var actorRect = actors[i].rectangle();
                    
                    // Coarse view testing:
                    if(Intersection.Test.Rectangles(actorRect, volume)) { 
                        // Accurate view testing.
                        if(Intersection.Test.RectangleLineSegment(
                            actorRect, viewline
                        ) === true) {
                            return false;
                        }
                    }
                }
            }
        }

        return true;
    };
    
    Tree.prototype.findPath = function(a, b, context) {
        //console.clear();
        function h(nodeA, nodeB) {
            return (
                Math.abs(nodeA.x - nodeB.x)
                +
                Math.abs(nodeA.y - nodeB.y)
            );
        }
    
        var c = new Tree.Criterion();
        c.minimalSize     = 1;
        c.maximalSize     = 10;
        c.minimalEntities = 0;
        c.maximalEntities = 0;
        //c.solid           = Types.SOLID;
    
        var start = this.getNodeAt(c, a);
        var end   = this.getNodeAt(c, b);
    
        // Try again, this time permit other entities present.
        // in the odd event we get stuck in a wall.
        if( ! start ) {
            var cPermissive = new Tree.Criterion();
            c.minimalSize     = 10;
            c.maximalSize     = 30;
            c.minimalEntities = 1;
            c.maximalEntities = 10;
            //c.solid = Types.SOLID;
        
            start = this.getNodeAt(c, a);
        }
    
        if( ! start || ! end) {
            //console.log("Start or end unavailable. Start:" + start + " end:" + end);
            return false;
        }
    
        // Heap kindly taken from: https://github.com/qiao/PathFinding.js
        var open = new Heap(function (a, b) {
            return (lookup[a.id].f - lookup[b.id].f);
        });
    
        var current, neighbours, neighbour, i, tentative;
        var lookup = [];
    
        open.push(start);
        lookup[start.id] = {};
        lookup[start.id].h = h(start, end);
        lookup[start.id].g = 0; // Step score.
        lookup[start.id].f = lookup[start.id].h + lookup[start.id].g; // Sort score.
        lookup[start.id].p = null; // terminate!
        lookup[start.id].o = true;
    
        for(var t = 3000; t > 0 && ! open.empty(); --t) {
            current = open.pop();
            lookup[current.id].o = false;
        
            if(current == end) {
                //console.log("Route found! [good news]");
                break;
            }
        
            neighbours = this.getNeighbours(c, current);
            
            //console.log(open.size());
        
            for(i = 0; i < neighbours.length; ++i) {
                neighbour = neighbours[i];
            
                tentative = {};
                tentative.h = h(neighbour, end);
            
                // TODO: a nicer step score? manhatten doesn't take 
                // diagonal into account.
                tentative.g = lookup[current.id].g + h(current, neighbour);
            
                tentative.f = tentative.g  + tentative.h * 1.1;
                tentative.p = current;
            
            
                if( ! lookup[neighbour.id] ) {
                    tentative.o = true;
                    lookup[neighbour.id] = tentative;
                
                    open.push(neighbour);
                } else {
                    if(lookup[neighbour.id].f > tentative.f) {
                        lookup[neighbour.id] = tentative;
                    
                        // Additional test. This entry might've been popped before.
                        if(tentative.o === true) { 
                            open.updateItem(neighbour);
                        }
                    }
                }
            }
        }
    
        if(current == end) {
            var route = [], c;
            var node = current;
        
            // Linkedlist unrolling:
            while(node) {
                c = new Vector(node.x, node.y);
                route.push(c); 
                node = lookup[node.id].p;
            }
        
            // New start:
            route.pop();
            route.push(a.clone());
        
            route = route.reverse();
        
            // new end:
            route.pop();
            route.push(b.clone());
        
            //console.log("found. splendid");
        
            return route;    
        }
    
        //console.log("Goal was not found.");
        return false;
    };
    
    function Node(x, y, w, h) {
        this.id = ++NodeIdCounter;
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
        
        this._rect = null;
    }
    
    Node.prototype.rectangle = function() {
        return this._rect || (this._rect = new Rectangle(this.x - this.hw, this.y - this.hh, this.x + this.hw, this.y + this.hh));
    };
    
    Node.prototype.getActorsFromRectangle = function(out, rectangle, tolerance) {
        var Intersects = Intersection.Test.Rectangles;

        // If this is empty, prune all children.
        if(this.entities.length === 0) {
            return;
        }

        // Future note: rather than recurse, if the entity count is small enough
        // it's more sensible to hit-test directly. Say, when n < 4 or along
        // those lines.

        if(this.w > tolerance || this.h > tolerance) {
            this.disburse();
        }

        // Has children, traverse when boundingbox fits:
        if( ! this.isLeaf()) {
            
            if(Intersects(rectangle, this.left.rectangle()) === true) {
                this.left.getActorsFromRectangle(out, rectangle, tolerance);
            }
        
            if(Intersects(rectangle, this.right.rectangle()) === true) {
                this.right.getActorsFromRectangle(out, rectangle, tolerance);
            }
    
        // Leaf node, push entities.  
        } else {
        
            for(var i = 0; i < this.entities.length; ++i) {
                if( ! out.lookup[this.entities[i].hash] ) {
                    out.lookup[this.entities[i].hash] = true;
                    out.actors.push(this.entities[i]);
                }
            }
        
            out.rectangles.push(this.rectangle);
        }
    };
    
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
        
        // TODO: inline this memory waste.
        var a = new Rectangle(this.x - this.hw, this.y - this.hh, this.x + this.hw, this.y + this.hh);
        var b = new Rectangle(entity.position.x - ehw, entity.position.y - ehh, entity.position.x + ehw, entity.position.y + ehh);
        
        return Intersection.Test.Rectangles(a, b);
    };
    
    Node.prototype.containsPoint = function(point) {

        return (
            (this.x - this.hw < point.x && this.x + this.hw > point.x)
            &&
            (this.y - this.hh < point.y && this.y + this.hh > point.y)
        );
    };
    
    Node.prototype.intersects = function(node) {
        
        if(node === this) {
            //console.log("Potential error, self intersection test.");
            //return true;
        }
                
        return (
            ((this.x - this.hw <= node.x - node.hw && this.x + this.hw >= node.x - node.hw)
            ||
            (this.x - this.hw <= node.x + node.hw && this.x + this.hw >= node.x + node.hw))
            &&
            ((this.y - this.hh <= node.y - node.hh && this.y + this.hh >= node.y - node.hh)
            ||
            (this.y - this.hh <= node.y + node.hh && this.y + this.hh >= node.y + node.hh))
        ) ||
        // Not quite required unless the criterion varies from the one used to
        // obtain "node". TODO: inside test?
        (
            ((node.x - node.hw <= this.x - this.hw && node.x + node.hw >= this.x - this.hw)
            ||
            (node.x - node.hw <= this.x + this.hw && node.x + node.hw >= this.x + this.hw))
            &&
            ((node.y - node.hh <= this.y - this.hh && node.y + node.hh >= this.y - this.hh)
            ||
            (node.y - node.hh <= this.y + this.hh && node.y + node.hh >= this.y + this.hh))
        );      
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
            this.flag |= entity.type;
            this.entities.push(entity);
        }
    };
    
    Node.prototype.isLeaf = function() {
        return this.left == null;
    };
    
    Node.prototype.partition = function() {
        
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
                //if(this.flag & heuristic.solid) {
                //    return Criterion.Response.DISBURSE;
                //}

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
                //if(this.flag & heuristic.solids) {
                //    return Criterion.Response.DISBURSE;
                //}

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
        }
    };
    
    Node.prototype.getNeighbours = function(out, criterion, node) {

        if(this.intersects(node)) {
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
                
                    this.left.getNeighbours(out, criterion, node);
                    this.right.getNeighbours(out, criterion, node);
                    
                    break;
            }
        }  
    };
    
    Node.prototype.draw = function(renderer) {
        renderer.rectangle(Math.round(this.x), Math.round(this.y), Math.round(this.w), Math.round(this.h));
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
        this.minimalEntities = minimalEntities || 2;
        this.maximalEntities = maximalEntities || 20;
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
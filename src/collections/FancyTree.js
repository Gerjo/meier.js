define(function(require){
    var Intersection = require("meier/math/Intersection");
    var Heap         = require("meier/collections/Heap");
    var Tree         = require("meier/collections/CriterionTree");
    var Rectangle    = require("meier/math/Rectangle");
    var LineSegment  = require("meier/math/Line");
    var Vector       = require("meier/math/vec")(2);
    
    MyTree.prototype = new Tree();

    // My tree enriched with pathfinding and line of sight tools.
    function MyTree(width, height) {
        Tree.apply(this, arguments);
    }

    MyTree.prototype.canSeePoint = function(actor, point, solid, context) {
        var volume = new Rectangle(
            Math.min(actor.rectangle.min.x, point.x),
            Math.min(actor.rectangle.min.y, point.y),
            Math.max(actor.rectangle.max.x, point.x),
            Math.max(actor.rectangle.max.y, point.y)
        );
    
        var c        = actor.rectangle.center();
        var viewline = new LineSegment(c.x, c.y, point.x, point.y);
    
        // TODO: performance tweak "width".
        var out      = this.getActorsFromRectangle(volume, 10);
        var actors   = out.actors;
    
        
        for(var i = 0; i < actors.length; ++i) {
        
            // Cannot see through walls and such:
            if(actors[i].type & solid) {
            
                // Test against self:
                if(actors[i] != actor) {
                    // Coarse view testing:
                    if(Intersection.Test.Rectangles(actors[i].rectangle, volume)) { 
                        // Accurate view testing.
                        if(Intersection.Test.RectangleLineSegment(
                            actors[i].rectangle, viewline
                        ) === true) {
                            return false;
                        }
                    }
                }
            }
        }
    
        /*context.beginPath();
        context.fillStyle = "rgba(0, 0, 255, 0.1)";
        context.fillRect(
            volume.min.x, 
            volume.min.y, 
            volume.width(), 
            volume.height());
        context.fill();*/
    
        if(context) {
            context.beginPath();
            context.strokeStyle = "rgba(0,0,255,0.6)";
            context.moveTo(viewline.a.x, viewline.a.y);
            context.lineTo(viewline.b.x, viewline.b.y);
            context.stroke();
        }
    
        return true;
    };


    MyTree.prototype.canSeeActor = function(actorA, actorB, solid) {
    
        return false;
    };


    MyTree.prototype.findPath = function(a, b, context) {
    
        function h(nodeA, nodeB) {
            return (
                Math.abs(nodeA.x - nodeB.x)
                +
                Math.abs(nodeA.y - nodeB.y)
            );
        }
    
        var c = new Tree.Criterion();
        c.minimalSize     = 1;
        c.maximalSize     = 5;
        c.minimalEntities = 0;
        c.maximalEntities = 0;
    
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
            
            //console.log("Neighbours found:" + neighbours.length + " in open: " + open.size());
        
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
                    
                        // Additional test.This entry might've been popped before.
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
        
            return route;    
        }
    
        //console.log("Goal was not found.");
        return false;
    };
    
    MyTree.Node = Tree.Node;
    MyTree.Criterion = Tree.Criterion;
    
    return MyTree;
    
});

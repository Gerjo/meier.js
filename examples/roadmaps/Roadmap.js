define(function(require){
    var Game      = require("meier/engine/Game");
    var Rectangle = require("meier/math/Rectangle");
    var Random    = require("meier/math/Random");
    var Vec2      = require("meier/math/Vec")(2);
    var Test      = require("meier/math/Intersection").Test;
    var Segment   = require("meier/math/Line");
    var Renderer  = require("meier/engine/Renderer");
    var dat       = require("meier/contrib/datgui");
    var Math      = require("meier/math/Math");
    
    
    var Settings = {
        UseHeuristic1: document.location.href.indexOf("heuristic1") !== -1,
        UseHeuristic2: document.location.href.indexOf("heuristic2") !== -1,
        UseRejection: document.location.href.indexOf("rejectionsampling") !== -1
    };
    
    Roadmap.prototype = new Game();
    
    function RandomRectangle() {
        var p = new Vec2(Random(-300, 300), Random(-150, 150));
        var o = new Vec2(Random(10, 100), Random(10, 100));
        
        return new Rectangle(p, o.add(p));
    }

    function Roadmap(container) {        
        Game.call(this, container);
        
        // Seperate renderer, drawing should only occur once.
        this.myrenderer = new Renderer(container, this.width, this.height);
        
        // Center the canvas.
        this.myrenderer.translate(this.hw, -this.hh);
        
        this.nRectangles = 20;
        this.nInitialWaypoints = 20;
        this.seed = 28;
        
        
        this.gui = new dat.GUI();
        this.gui.width = 300;
        
        this.gui.add(this, 'seed', 0, 100).step(1).name("Random seed").
        onChange(this.init.bind(this));
        
        this.gui.add(this, 'nRectangles', 0, 100).step(1).name("Buildings").
        onChange(this.init.bind(this));
        
        this.gui.add(this, 'nInitialWaypoints', 1, 50).step(1).name("Initial nodes").
        onChange(this.init.bind(this));
        
        if(Settings.UseHeuristic1) {
            this.minEdges   = 4;
            this.edgeSpread = 150;
            
            this.gui.add(this, 'minEdges', 1, 8).step(1).name("Min edges").
            onChange(this.init.bind(this));
        
            this.gui.add(this, 'edgeSpread', 1, 300).step(1).name("Random spread").
            onChange(this.init.bind(this));
        }
        
        if(Settings.UseHeuristic2) {
            this.maxEdges = 6;
            this.gui.add(this, 'maxEdges', 1, 10).step(1).name("Max edges").
            onChange(this.init.bind(this));            
        }
        
        if(Settings.UseRejection) {
            this.gui.add(Settings, 'UseRejection').name("Use Rejection Sampling").
            onChange(this.init.bind(this));            }
        
        this.init();
    }
    
    function Waypoint(position) {
        this.position  = position;
        this.edges     = [];
    }
    
    function Edge(a, b) {
        this.a = a;
        this.b = b;
    }
    
    Roadmap.prototype.init = function() {
        this.rectangles = [];
        this.waypoints  = [];
        
        // Generate "procedural" level
        Random.Seed(this.seed);
        for(var i = 0; i < this.nRectangles; ++i) {
            this.rectangles.push(RandomRectangle());
        }
        
        // Initial waypoints
        Random.Seed(this.seed + 10000);
        for(var timeout = 0; this.waypoints.length < this.nInitialWaypoints && timeout < 10000; ++timeout) {
            
            var position = new Vec2(Random(-300, 300), Random(-150, 150));
            
            // Assure sample falls in free space
            var isFreeSpace = this.rectangles.every(function(r) {
                return ! r.containsPoint(position);
            });
            
            if( isFreeSpace) {
                this.waypoints.push(new Waypoint(position));
            }
        }
        
        // Waypoint visibility line segments. ('local planner')
        for(var k = 0; k < this.waypoints.length; ++k) {
            var a = this.waypoints[k];
            for(var l = k + 1; l < this.waypoints.length; ++l) {
                var b = this.waypoints[l];
                
                
                var segment = new Segment(a.position, b.position);
                
                var isFreeSpace = this.rectangles.every(function(r) {
                    return ! Test.RectangleLineSegment(r, segment);
                });
                
                if(isFreeSpace) {
                    var edge = new Edge(a, b);
                    a.edges.push(edge);
                    b.edges.push(edge);
                }
                
            }        
        }
        
        
        // Add extra random samples near waypoints with a low edge count.
        if(Settings.UseHeuristic1) {
            Random.Seed(this.seed + 1000000);
            
            var minEdges   = this.minEdges;
            var spread     = this.edgeSpread;
            
            //this.waypoints.forEach(function(waypoint) {
            
            for(var i = 0; i < this.waypoints.length; ++i) {
                var waypoint = this.waypoints[i];
                
                var neighbours = [];
                
                if(Settings.UseRejection) {
                    // Gather neighbours:
                    neighbours = waypoint.edges.map(function(edge) {
                        return (edge.a == waypoint) ? edge.b.position : edge.a.position;
                    });
                }
                
                // Add waypoints until enough are added, or a
                // timeout is reached.
                for(var timeout = 80; waypoint.edges.length < minEdges && timeout > 0; --timeout){ 
                    var position;
                    
                    if(Settings.UseRejection) {
                        var candidate = Math.CircleUniformRandom(waypoint.position, neighbours);
                        
                        position = candidate.scaleScalar(Random(5, spread, true)).add(waypoint.position);
                        
                        // Add as neighbour, even if it lies in a wall.
                        neighbours.push(position);
                        
                    } else {
                        var offset   = new Vec2(Random(-spread, spread), Random(-spread, spread));
                        position = offset.add(waypoint.position);
                    }
                    
                    // Make sure sample falls inside the game world.
                    if(position.x < -this.hw || position.x > this.hw || position.y < -this.hh || position.y > this.hh) {
                        continue;
                    }
                    
                    // Is this a free space?
                    var isFreeSpace = this.rectangles.every(function(r) {
                        return ! r.containsPoint(position);
                    });
                    
                    if(isFreeSpace) {
                        var newWaypoint = new Waypoint(position);
                        
                        this.waypoints.forEach(function(existingWaypoint) {
                            var segment = new Segment(newWaypoint.position, existingWaypoint.position);
                            
                            var isFreeSpace = this.rectangles.every(function(r) {
                                return ! Test.RectangleLineSegment(r, segment);
                            });
                            
                            if(isFreeSpace) {
                                var edge = new Edge(newWaypoint, existingWaypoint);
                                
                                newWaypoint.edges.push(edge);
                                existingWaypoint.edges.push(edge);
                            }
                            
                        }.bind(this));
                        
                        this.waypoints.push(newWaypoint);
                    }
                }
                
            }
            
        }
        
        if(Settings.UseHeuristic2) {
            var max = this.maxEdges;
            
            for(var i = 0; i < this.waypoints.length; ++i) {
                var waypoint = this.waypoints[i];
                
                // Is limit exceeded?
                if(waypoint.edges.length > max) {
                    
                    // Find neighbour who also exceeds the limit.
                    for(var j = 0; j < waypoint.edges.length; ++j) {
                        var neighbour = waypoint.edges[j].a;
                        
                        if(neighbour == waypoint) {
                            // Use the other side of the edge.
                            neighbour = waypoint.edges[j].b;
                        }
                        
                        if(neighbour.edges.length > max) {
                            neighbour.edges.remove(waypoint.edges[j]);
                            waypoint.edges.remove(waypoint.edges[j]);
                        }
                        
                    }                    
                }
                
            }
        }
        
        // Trigger redraw on local canvas.
        this.mydraw(this.myrenderer);
    }
    
    
    Roadmap.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
        var node = this.input;
        
        var isFreeSpace = this.rectangles.every(function(r) {
            return ! r.containsPoint(node);
        });
    };
    
    Roadmap.prototype.mydraw = function(renderer) {
        renderer.clear();
        
        
        this.rectangles.forEach(function(r){
            renderer.begin();
            renderer.rectangle(r);
            renderer.fill("red");
            renderer.stroke("black", 2);
        });
        
        renderer.begin();
        this.waypoints.forEach(function(waypoint) {
            waypoint.edges.forEach(function(edge) {
                // Edges are directional. This simple
                // test will only draw an edge once.
                if(edge.a == waypoint) {
                    renderer.line(edge.a.position, edge.b.position);
                }
            });
        });
        renderer.stroke("gray", 3);
        
        
        
        renderer.begin();
        this.waypoints.forEach(function(p) {
            renderer.rectangle(p.position.x, p.position.y, 5, 5);
        });
        renderer.fill("blue");
    };
    
    Roadmap.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);

    };
    
    return Roadmap;
});
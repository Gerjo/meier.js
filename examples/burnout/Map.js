define(function(require) {
    var Entity   = require("meier/engine/Entity");
    var V2       = require("meier/math/Vec")(2);
    var Input    = require("meier/engine/Input");
    var Color    = require("meier/aux/Colors");
    var Keys     = require("meier/engine/Key");
    var Nearest  = require("meier/math/Intersection").Nearest;;
    var M        = require("meier/math/Math");;
    
    
    var Waypoint = require("./Waypoint");
    var Road     = require("./Road");
    
    Map.prototype = new Entity();
    function Map() {
        Entity.call(this, 0, 0);
        
        this.waypoints = [];
        this.roads     = [];
        
        this.enableEvent(Input.LEFT_DOWN, Input.LEFT_UP, Input.RIGHT_DOWN, Input.RIGHT_UP, Input.KEY_DOWN);
        
        this.mouseLeftDown  = false;
        this.mouseRightDown = false;
        
        // Waypoint currently selected for editing
        this.selected = null;
        
        this.load();
    }
    
    Map.prototype.deleteWaypoint = function(waypoint) {
        this.waypoints = this.waypoints.filter(function(w) {
            return ! w.equals(waypoint);
        });
        
        this.roads = this.roads.filter(function(r) {
            return ! (r.from.id == waypoint.id || r.to.id == waypoint.id);
        });
    };
    
    Map.prototype.onKeyDown = function(input, key) {
        
        if(key == Keys.D) {
            
            if( ! this.mouseRightDown && ! this.mouseLeftDown && ! this.selected) {
                var waypoint = this.findSelected(this.toLocal(this.input));
                
                if(waypoint) {
                    this.deleteWaypoint(waypoint);
                }
                
            }
            
            this.save();
        }
        
        return false;
    };
    
    Map.prototype.findSelected = function(point) {
        return this.waypoints.find(function(p) {
            return p.contains(point);
        });
    };
    
    Map.prototype.findSelectedRoad = function(point, exclude) {
        var bestPoint = null;
        var bestD = Infinity;
        var bestRoad = null;
        exclude = exclude || [];
        
        for(var i = 0; i < this.roads.length; ++i) {
            var road = this.roads[i];
            var p    = Nearest.PointOnLineSegment(point, road.segment());
            var d    = p.distanceSq(point);
         
            if(d < bestD) {
                if( ! exclude.find(function(a) { return a.equals(road); })) {
                    bestD     = d;
                    bestPoint = p;
                    bestRoad  = road;
                }
            }
        }
        
        return bestRoad;
    };
    
    Map.prototype.onAdd = function(game) {
        this.width  = game.width;
        this.height = game.height;
    };
    
    Map.prototype.onRightUp = function(input) {
        var local = this.toLocal(input);
        
        if(this.selected) {
            if(this.mouseRightDown) {
                var hover = this.findSelected(local);
                
                if(hover) {
                    var candidate = new Road(this.selected, hover);
                    
                    var isUnique = this.roads.every(function(road) {
                        return ! road.equals(candidate);
                    });
                    
                    if(isUnique){
                        this.roads.push(candidate);
                    }
                }
            }
        }
        
        // Disable any mouse state
        this.mouseRightDown = false;
        this.selected       = null;
        this.save();
    };
    
    Map.prototype.onRightDown = function(input) {
        // Find selected waypoint
        this.selected       = this.findSelected(this.toLocal(this.input));
        this.mouseRightDown = true;
        return false;
    };
    
    Map.prototype.onLeftDown = function(input) {

        // Find selected waypoint
        if( ! (this.selected = this.findSelected(this.toLocal(this.input)))) {
            this.waypoints.push(this.selected = new Waypoint(input.x, input.y));
        }
        
        this.mouseLeftDown = true;
        return false;
    };
    
    Map.prototype.onLeftUp = function(input) {

        this.mouseLeftDown = false;
        this.selected      = null;
        this.save();
        
        return false;
    };
    
    Map.prototype.update = function(dt) {
        var local = this.toLocal(this.input);
        
        if(this.selected) {
            if(this.mouseLeftDown) {
                this.selected.x = local.x;
                this.selected.y = local.y;
            }
        }
        
        // Edit waypoints
        this.waypoints.forEach(function(p) {
            if(p.contains(local)) {
                this.input.cursor(Input.Cursor.MOVE);
            }
        }.bind(this));
    };
    
    Map.prototype.draw = function(renderer) {
        Entity.prototype.draw.call(this, renderer);
        var local = this.toLocal(this.input);
        
        
        if(this.selected) {
            if(this.mouseRightDown) {
                renderer.begin();
                renderer.line(this.selected, local);
                renderer.stroke("black", 2);
            }
        }
        
        
        // Draw each waypoint
        renderer.begin();
        this.waypoints.forEach(function(p) {
            renderer.circle(p.x, p.y, 10);
            
            renderer.text(p.id, p.x, p.y, "black", "center", "middle");
            
            if(p.contains(local)) {
                renderer.text("hi", local.x, local.y, "black", "left", "bottom");
            }
        });
        renderer.stroke("red");
        
        
        var selectedRoad = this.findSelectedRoad(local);
        
        // Draw each road
        this.roads.forEach(function(road) {
            
            var color = selectedRoad.equals(road) ? Color.GREEN : Color.BLACK;
            
            renderer.begin();
            renderer.line(road.from, road.to);
            renderer.stroke(Color.Alpha(color, 0.2), 22);
        });
    };
    
    Map.prototype.load = function() {
        var object = localStorage.getItem("map");
        
        if(object && (object = JSON.TryParse(object))) {
            
            if(object.waypoints) {
                
                // Recreate all waypoints
                var waypoints = this.waypoints = object.waypoints.map(function(o) {
                    var w = new Waypoint(o.x, o.y);
        
                    w.id  = o.id;
        
                    return w;
                });
                
                // Recreate all roads
                var roads = this.roads = object.roads.map(function(o) {
                    var road = new Road(
                        waypoints.find(function(r) { return r.id == o.from; }),
                        waypoints.find(function(r) { return r.id == o.to; })
                    );
        
                    road.lanes  = o.lanes;
                    
                    // Subscribe the road to a waypoint
                    road.from.roads.push(road);
                    road.to.roads.push(road);
        
                    return road;
                });
                
                
                console.log("Restored " + this.waypoints.length + " waypoints.");
                console.log("Restored " + this.roads.length + " roads.");
            }
            
        }
        
    };
    
    Map.prototype.save = function() {
        
        // Serialise to generic object type
        var object = {
            "waypoints": this.waypoints.map(function(w) {
                return w.toObject(); 
            }),
            
            "roads": this.roads.map(function(r) {
                return r.toObject(); 
            })
        };
        
        localStorage.setItem("map", JSON.stringify(object));
    };
    
    
    Map.prototype.getAttractionCandidates = function(currentLocation, desiredDirection, renderer) {
        var candidates = [];
        var interval   = 20;  // Distance
        var lookahead  = 10;  // Number of steps.
        
        // Nearest road.
        var road = this.findSelectedRoad(currentLocation);
        
        var direction = road.segment().direction().normalize();
    
        var sign = M.Sign(desiredDirection.dot(direction));
    
        direction.scaleScalar(sign);
    
        // TODO: flip direction based on desiredDirection? i.e., always
        // advance
    
        var point = currentLocation.clone();
        for(var i = 0; i < lookahead; ++i) {
            var color = Color.RED;
            
            //
            candidate = Nearest.PointOnLineSegment(point, road.segment());
            
            var intersection = null;
            
            if(candidate.equals(road.to)) {
                intersection = road.to.roads;
            } else if(candidate.equals(road.from)) {
                intersection = road.from.roads;
            }
            
            // Reached an intersection, find the next road.
            if(intersection) {
                var winner = intersection.find(function(tentativeRoad) {
                    return ! tentativeRoad.equals(road);
                });
                
                road      = winner;
                point     = candidate;
                var newDirection = road.segment().direction().normalize();
                
                //sign = M.Sign(direction.dot(newDirection));
                
                //if(renderer)
                //    console.log("Turning. At " + point.wolfram());
                
                direction = newDirection.scaleScalar(sign);
                
                color = Color.GREEN;
                
                if(renderer) {
                    renderer.begin();
                    renderer.circle(candidate, 10);
                    renderer.fill(color);
                    
                    renderer.begin();
                    renderer.arrow(point, direction.clone().scaleScalar(30).add(point));
                    renderer.stroke(Color.Purple);
                    
                }
            }
            
            // Assign candidate to collection
            candidates[i] = candidate;
            
            // Advance to the next sample location
            point.addScaled(direction, interval);
            
            if(renderer) {
                renderer.begin();
                renderer.circle(candidate, 4);
                renderer.fill(color);
                
            }
        }
    
        return candidates;
    };
    
    
    return Map;
    
});
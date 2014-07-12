define(function(require) {
    var Entity   = require("meier/engine/Entity");
    var V2       = require("meier/math/Vec")(2);
    var Input    = require("meier/engine/Input");
    var Color    = require("meier/aux/Colors");
    var Keys     = require("meier/engine/Key");
    var Nearest  = require("meier/math/Intersection").Nearest;
    var M        = require("meier/math/Math");
    var Texture  = require("meier/engine/Texture");
    
    
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
        
        this.background = new Texture("map.png");
    }
    
    Map.prototype.deleteWaypoint = function(waypoint) {
        this.waypoints = this.waypoints.filter(function(w) {
            return ! w.equals(waypoint);
        });
        
        this.roads = this.roads.filter(function(r) {
            return ! (r.a.id == waypoint.id || r.b.id == waypoint.id);
        });
    };
    
    Map.prototype.deleteRoad = function(road) {
        this.waypoints.forEach(function(w) {
            w.roads = w.roads.filter(function(r) {
                var found = r.equals(road);
                
                if(found) {
                    console.log("remove");
                }
                
                return ! found;
            });
        });
        
        this.roads = this.roads.filter(function(r) {
            var found = r.equals(road);
            
            if(found) {
                console.log("be gone");
            }
            
            return ! found;
        });
        
    };
    
    
    Map.prototype.onKeyDown = function(input, key) {
        
        if(key == Keys.D) {
            
            if( ! this.mouseRightDown && ! this.mouseLeftDown && ! this.selected) {
                var local = this.toLocal(this.input);
                
                var waypoint = this.findSelected(local);
                
                if(waypoint) {
                    this.deleteWaypoint(waypoint);
                } else {
                    var road = this.findSelectedRoad(local);
                    
                    if(road) {
                        this.deleteRoad(road);
                    }
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
    
    Map.prototype.findSelectedRoad = function(point) {
        var bestPoint = null;
        var bestD = Infinity;
        var bestRoad = null;
        
        for(var i = 0; i < this.roads.length; ++i) {
            var road = this.roads[i];
            var p    = Nearest.PointOnLineSegment(point, road.segment());
            var d    = p.distanceSq(point);
         
            if(d < bestD) {
                bestD     = d;
                bestPoint = p;
                bestRoad  = road;
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
        
        renderer.texture(this.background);
        
        Entity.prototype.draw.call(this, renderer);
        var local = this.toLocal(this.input);
        
        
        if(this.selected) {
            if(this.mouseRightDown) {
                renderer.begin();
                renderer.line(this.selected, local);
                renderer.stroke("yellow", 2);
            }
        }
        
        
        // Draw each waypoint
        renderer.begin();
        this.waypoints.forEach(function(p) {
            renderer.circle(p.x, p.y, 5);
            
            //renderer.text(p.id, p.x, p.y, "white", "center", "middle");
            
            if(p.contains(local)) {
                //renderer.text("hi", local.x, local.y, "black", "left", "bottom");
            }
        });
        renderer.fill("red");
        
        
        var selectedRoad = this.findSelectedRoad(local);
        
        // Draw each road
        this.roads.forEach(function(road) {
            
            var color = Color.RED;//selectedRoad.equals(road) ? Color.RED : Color.YELLOW;
            
            renderer.begin();
            renderer.arrow(road.a, road.b);
            renderer.stroke(color, 1);
        });
    };
    
    Map.prototype.load = function() {
        var object = localStorage.getItem("map");
        
        if(object && (object = JSON.TryParse(object))) {
            
            if(object.waypoints) {
                
                // Recreate all waypoints
                var waypoints = this.waypoints = object.waypoints.map(function(o) {
                    return Waypoint.fromObject(o);
                });
                
                // Recreate all roads
                var roads = this.roads = object.roads.map(function(o) {
                    var road = new Road(
                        waypoints.find(function(r) { return r.id == o.from; }),
                        waypoints.find(function(r) { return r.id == o.to; })
                    );
        
                    road.lanes  = o.lanes;
                    
                    // Subscribe the road to a waypoint
                    road.a.roads.push(road);
                    road.b.roads.push(road);
        
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
    
    return Map;
    
});
define(function(require) {
    var Entity    = require("meier/engine/Entity");
    var V2        = require("meier/math/Vec")(2);
    var Lerp      = require("meier/math/Lerp");
    var Texture   = require("meier/engine/Texture");
    var Nearest   = require("meier/math/Intersection").Nearest;
    var Random    = require("meier/math/Random");
    
    Vehicle.prototype = new Entity();
    function Vehicle(x, y) {
        Entity.call(this, x, y, 10, 10);
        
        this.direction  = new V2(1, 1).normalize();
        this.momentum   = 1; // no used
        this.maxSteerAngle = 0.049;
        this.maxSpeed   = 10;
        this.speed      = Random(10, 15) * 8;
        this.lookAhead  = 45;
        this.viewRange  = 40;

        this.road       = null;
        this.nextRoad   = null;
        
        this.target     = new V2(10, 1);
        
        this.background = new Texture("vehicle.png");
        
        // Initial seed for distance traveled. We cannot assume all cars started at
        // the same point in time.
        this.distanceTraveled = Random(0, 100, true);
    }
    
    Vehicle.prototype.update = function(dt) {
        this.dt = dt;
        
        // Update some properties to match the GUI
        this.maxSteerAngle = this.game.maxSteerAngle;
        this.lookAhead     = this.game.lookAhead;
        this.viewRange     = this.game.viewRange;
    };
    
    Vehicle.prototype.computeNextRoad = function() {
        //.shuffle()
        
        // Find the first road that is not the current road
        return this.road.b.roads.find(function(road) {
            return ! road.equals(this.road) && ! road.b.equals(this.road.b);
        }.bind(this));
    };

    Vehicle.prototype.draw = function(renderer) {
        var dt = this.dt;
        renderer.texture(this.background);
        
        var run, timeout = 10;

        if( ! this.road) {
            this.road = this.game.map.findSelectedRoad(this.position);
            this.nextRoad = this.computeNextRoad();
        }

        // Current road.
        var currentRoad      = this.road;
        var targetRoad       = currentRoad;
        
        // Nearest to current.      
        var nearestCurrent   = Nearest.PointOnLineSegment(this.position, currentRoad);
        
        var nearestNext = Nearest.PointOnLineSegment(this.position, this.nextRoad);
        
        if(nearestCurrent.distance(this.position) > nearestNext.distance(this.position)) {
            this.road      = this.nextRoad;
            this.nextRoad  = this.computeNextRoad();
            nearestCurrent = nearestNext;
        }
        
        var target = nearestCurrent;
        var ahead  = this.lookAhead;
        
        do {
            run = false;
            
            var direction = targetRoad.direction().normalize();
        
            target        = target.clone().addScaled(direction, ahead);
        
        
            // Attraction point does not lie on the current segment.
            if( ! (target.x > Math.min(targetRoad.b.x, targetRoad.a.x) && target.x <= Math.max(targetRoad.b.x, targetRoad.a.x))) {
                if( ! (target.y > Math.min(targetRoad.b.y, targetRoad.a.y) && target.y <= Math.max(targetRoad.b.y, targetRoad.a.y))) {

                    // Find the successor road
                    var tentativeNextRoad = this.nextRoad;
                
                    ASSERT( ! tentativeNextRoad.equals(this.road));

                    // Found one. Halt looping.
                    targetRoad = tentativeNextRoad;
                    
                    var dist = nearestCurrent.distance(targetRoad.a)
                    
                    // Reduce lookahead (May be buggy with road.magnitude < this.lookahead)
                    // in such event this.nextRoad must be updated.
                    ahead -= dist;
                    
                    // Jump to the far edge.
                    target = targetRoad.a;
                  
                    run = true;
                }
            }
            
        
        } while(run && --timeout > 0);
        
        if(nearestCurrent.equals(currentRoad.b)) {
            console.log("switching lanes");
            this.road = this.nextRoad;
            this.nextRoad = this.computeNextRoad();
        }
        
        if(timeout <= 0) {
            console.log("Vehicle::update timeout");
        }
        
        var perp = target.direction(nearestCurrent).perp().normalize();
        
        var offset = perp.scaleScalar(Math.sin(this.distanceTraveled / 50) * 3);
        
        
        // Direction does not imply speed. Normalize.
        var dir       = target.clone().add(offset).direction(this.position).normalize();

        dir.add(this.getSteering());
        
        // Angles for maximum steering (Fake nonholonomic constraints)
        var currentAngle = this.direction.angle();
        var deltaAngle   = this.direction.angleBetween(dir);
        
        // Clamp steering angle
        if(Math.abs(deltaAngle) > this.maxSteerAngle) {
            var angle = deltaAngle > 0 ? this.maxSteerAngle : -this.maxSteerAngle;
            
            // Create a dampened direction
            dir = V2.CreateAngular(currentAngle + angle);
        }
        
        var start = this.position.clone();
        
        // Scale the speed with the GUI
        var speed = this.game.speed * this.speed;
                
        // Semi implicit euler without acceleration?
        this.position.addScaled(this.direction, speed * dt * 0.5);
        this.position.addScaled(dir, speed * dt * 0.5);
       
        this.direction = dir;
        
        this.distanceTraveled += this.position.distance(start);
                
        if(this.game.showDebug) {
            renderer.begin();
            renderer.circle(this.toLocal(nearestCurrent), 2);
            renderer.fill("blue");        

            renderer.begin();
            renderer.circle(this.toLocal(target), 2);
            renderer.fill("hotpink");        

            

            renderer.begin();
            renderer.circle(0, 0, this.viewRange);
            renderer.stroke("rgba(255, 255, 255, 0.1)");
        }
        
        
        // For animation purposes.
        this.rotation = dir.angle();
    };

    Vehicle.prototype.getSteering = function() {
        var force = new V2(0, 0);

        this.game.getVehiclesInRange(this).forEach(function(vehicle) {
            if(vehicle != this) {
                var distance = vehicle.position.distance(this.position);
                var direction = vehicle.position.direction(this.position).normalize().flip();

                if(distance < this.viewRange * 2) {
                    var s = 10;

                    //var s = 1 / (1 + Math.exp(distance)) * 10;

                    force.addScaled(
                        direction,
                        1 / distance * s
                    );
                }

            }
        }.bind(this));

        return force;
    }
    
    return Vehicle;
});
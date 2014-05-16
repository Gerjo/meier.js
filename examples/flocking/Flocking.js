define(function(require) {
    var Line    = require("meier/math/Line");
    var Game    = require("meier/engine/Game");
    var Vector  = require("meier/math/Vec")(2);
    var dat     = require("meier/contrib/datgui");
    var Random  = require("meier/math/Random");
    
    var Boid    = require("./Boid");
    
    Flocking.prototype = new Game();
    function Flocking(x, y, w, h) {
        Game.call(this, x, y, w, h);
        this.setFps(60);
        
        this.seperationWeight = 1; 0.3;
        this.cohesionWeight   = 1;
        this.alignmentWeight  = 1; 0.3;
        this.viewRadius       = 150; 
        this.speed            = 1; 
        this.full360view      = true;
        this.mouseRepel       = 1;
        this.numEntities      = 10;
        this.mouseRadius      = 50;
        
        this.add(new Boid(-100, 10));
        this.add(new Boid(100, 0));
        this.add(new Boid(-200, -100));
        this.add(new Boid(0, 20));
        this.add(new Boid(200, -20));
        
        this.gui = new dat.GUI();
        this.gui.width = 300;
        
    	this.gui.add(this, 'numEntities', 1, 50, 0.01);
    	this.gui.add(this, 'seperationWeight', 0, 2, 0.01);
    	this.gui.add(this, 'cohesionWeight', 0, 2, 0.01);
    	this.gui.add(this, 'alignmentWeight', 0, 2, 0.01);
        this.gui.add(this, 'mouseRepel', -2, 2, 0.01);
    	this.gui.add(this, 'viewRadius', 0, this.hw);
    	this.gui.add(this, 'mouseRadius', 0, this.hw);
    	this.gui.add(this, 'full360view', 0, 1);
    	this.gui.add(this, 'speed', 0, 10);
        
        
        this.lines = [];
    }
    
    Flocking.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        this.lines.forEach(function(line) {
            renderer.begin();
            renderer.arrow(line);
            renderer.stroke("black");
        });
        
        this.lines.clear();
        
        renderer.begin();
        renderer.circle(this.input, this.mouseRadius);
        renderer.fill("rgba(255,0,0,0.2)");
        
    };
    
    Flocking.prototype.update = function(dt) {
        
        Game.prototype.update.call(this, dt);
        
        var c = this._entities.length;
        while(c > this.numEntities) {
            this._entities[--c].destroy();
        }
        
        while(c < this.numEntities -1) {
            this.add(new Boid(Random.Range(-this.hw, this.hw), Random.Range(-this.hh, this.hh)));
            ++c;
        }
        
        
        //this._entities[0].velocity = this.input.clone().subtract(this._entities[0].position);
        
        var count, self, separation, velocity, position;
        
        var range = Math.pow(this.viewRadius, 2);
        
        for(var i = 0; i < this._entities.length; ++i) {
            
            self        = this._entities[i];
            velocity    = new Vector(0, 0);
            separation  = new Vector(0, 0);
            position    = new Vector(0, 0);
            count       = 0;//this._entities.length - 1;
        
            this._entities.forEach(function(entity) {
                if(entity !== self) {
                    if(entity.position.distanceSQ(self.position) < range) {
                        
                        //var dot = self.velocity.clone().normalize().dot(entity.velocity.clone().normalize());
                        
                        var dot = self.velocity.dot(entity.position.clone().subtract(self.position));
                        
                        //console.log(dot, this.viewAngle);
                        if ( this.full360view || dot >= 0){///} this.viewAngle) {
                            velocity.add(entity.velocity);
                            position.add(entity.position);
                    
                            separation.x += self.position.x - entity.position.x;
                            separation.y += self.position.y - entity.position.y;
                    
                            ++count;
                            
                            this.lines.push(new Line(self.position, entity.position));
                        }
                    }
                }
            }.bind(this));
        
            var result = new Vector(0, 0);
        
            if(count > 0) {
            
        
                // [alignment] Average velocity:
                velocity.scaleScalar(1 / count).normalize();
                result.add(velocity.scaleScalar(this.alignmentWeight * 10));
            
                // [cohesion] Steer to same position:
                position.scaleScalar(1 / count);
                position.subtract(self.position);
                position.normalize();
                result.add(position.scaleScalar(this.cohesionWeight * 10));
                //console.log(position.x);
            
                // [seperation] Move away from eachother:
                separation.scaleScalar(1 / count).normalize();
                result.add(separation.scaleScalar(this.seperationWeight * 10));
            }
            
            var diff = this.input.clone().subtract(self.position);
            
            if(diff.lengthSQ() < Math.pow(this.mouseRadius, 2)) {
                result.add(diff.scaleScalar(this.mouseRepel * -2));  
                
                this.lines.push(new Line(this.input, self.position));
            }
            
            //result.normalize();        
            
            self.velocity.add(result.scaleScalar(0.05));
            
            if(self.velocity.length() > 100) {
                self.velocity.trim(100);
            }            
        }
                
        
    };
    
    
    return Flocking;
});
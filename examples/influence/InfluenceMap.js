define(function(require) {
    var Entity = require("meier/engine/Entity");
    var Input  = require("meier/engine/Input");
    
    function State(x, y, w, h, index) {
        this.accumulators = [];
        this.neighbours = [];
        
        this.i = index;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        
        this.a = 0;
        
        this.update = function(dt) {
            
            this.a *= 0.9;
            
            if(this.a < 0) {
                this.a = 0;
            } else if(this.a > 1) {
                this.a = 1;
            }
            
            if(this.a > 0.001) {
                this.neighbours.forEach(function(state) {
                
                    if(state.a < this.a) {
                        state.a += this.a * 0.1;
                    
                        if(state.a > 1) {
                            state.a = 1;
                        }
                    
                        if(state.a < 0) {
                            state.a = 0;
                        }                    
                    }
                
                    if(isNaN(this.a)) {
                        debugger;
                    }
                
                }.bind(this));
            }
        };
    }
    
    
    InfluenceApp.prototype = new Entity();
    function InfluenceApp(resolution) {
        Entity.call(this, 0, 0);
        
        // Tiles...
        this.states = [];
        
        this.xRes = resolution || 25;
        this.yRes = resolution || 15;
        
        this.enableEvent(Input.LEFT_DOWN, Input.LEFT_UP);
        
        this.isMouseDown = false;
        
        
        this.dt = 1/60;
    }
    
    InfluenceApp.prototype.onLeftUp = function(input) {
        this.isMouseDown = false;
    };
    
    InfluenceApp.prototype.onLeftDown = function(input) {
        this.isMouseDown = true;
    };
    
    // Actual constructor.
    InfluenceApp.prototype.onAdd = function(game) {
        // Fit the worlds/screen.
        this.width  = game.width;
        this.height = game.height;
        
        // Number of tiles:
        this.xStep = this.width  / this.xRes;
        this.yStep = this.height / this.yRes;
    
        
        var x, y;
    
        var hw = this.xStep * 0.5
        var hh = this.yStep * 0.5;
    
        // Initialize:
        for(y = -this.game.hh + hh; y <= this.game.hh; y += this.yStep) {
            for(x = -this.game.hw + hw; x <= this.game.hw; x += this.xStep) {
                this.states.push(
                    new State(
                        x,
                        y, 
                        this.xStep, 
                        this.yStep, 
                        this.states.length
                    )
                );
            }
        }
        
        // Neighbours:
        for(y = 0; y < this.yRes; ++y) {
            for(x = 0; x < this.xRes; ++x) {            
                // Offsets and crude bounds checking. TODO: refurbish this one liner madness.
                indices = [
                    y > 0               ? ((y - 1) * this.xRes + x) : -1,  // north
                    y < this.yRes - 1   ? ((y + 1) * this.xRes + x) : -1,  // south
                    x > 0               ? ((y * this.xRes) + x - 1) : -1,  // west
                    x < this.xRes - 1   ? (y * this.xRes) + x + 1   : -1   // east 
                ].forEach(function(index) {
                    if(index > 0){
                        n = this.states[index]; // neighbour
                        c = this.states[y * this.xRes + x]; // Current
                    
                        // TODO: line of sight test.
                    
                        this.states[y * this.xRes + x].neighbours.push(n);
                    }
                }.bind(this));
            }
        }
    };
    
    InfluenceApp.prototype.get = function(x, y) {
    
        // Bring to non-negative coordinates, account for center
        // offset, too.
        x += this.game.hw - this.xStep * 0.5;
        y += this.game.hh - this.yStep * 0.5;
        
        
        var offset = Math.round(x / this.xStep);
        offset += Math.round(y / this.yStep) * this.xRes;
    
        // Range clamp:
        if(offset < 0) {
            offset = 0;
        }
    
        if(offset > this.states.length - 1) {
            offset = this.states.length - 1;
        }

        // Always return something.
        return this.states[offset];
    };
    
    InfluenceApp.prototype.update = function(dt) {
        this.dt = dt;
        
        if(this.isMouseDown) {
            var state = this.get(this.input.x, this.input.y);
            state.a += 1;
        }
        
        //this.states.forEach(function(state) {
        //    state.update(dt);
        //});
    };
    
    InfluenceApp.prototype.draw = function(renderer) {
        // Draw each node.
        
        this.states.forEach(function(state) {
            
            state.update(this.dt);
            
            var a = state.a;
            
            if(a < 0.001) {
                a = 0;
            } else if(a > 1) {
                a = 1;
            }
            
            renderer.begin();
            renderer.rectangle(state.x, state.y, state.w, state.h)
            renderer.fill("rgba(255, 0, 0, " + a + ")");
            renderer.stroke("red");
            
        });
        
    };
    
    return InfluenceApp;
    
});
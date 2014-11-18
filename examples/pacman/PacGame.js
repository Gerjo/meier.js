define(function(require){
    var Game   = require("meier/engine/Game");
    var V2     = require("meier/math/Vec")(2);
    var Timer  = require("meier/extra/Timer");
    var math   = require("meier/math/Math");
    
    var Level  = require("./Map");
    var World  = require("./World");
    var Ghost  = require("./Ghost");
    var Player = require("./Player");

    PacGame.prototype = new Game();
    
    function PacGame(container) {        
        Game.call(this, container);
        this.setFps(60);
        this.add(this.world = new World());

        this.ticks = 1;
        this.ticker = new Timer(500); // ms

        this.world.load(Level);

        this.world.add(this.player = new Player(this.world.start, this.world));

        this.ghosts = [];
        for(var i = 0; i < 3; ++i) {
            this.ghosts.push(this.world.add(new Ghost(this.world.spawns[i % 3], this.world)));
        }
        
        
        this.ghosts.last().color = "red";
    }
    
    PacGame.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
        // ai logic runs periodically.
        if(this.ticker.expired()) {
            ++this.ticks;
            
            this.ghosts.forEach(function(ghost) {
                ghost.reason()
            });
        }
        
    };
    
    PacGame.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);

        var terms = this.ghosts.last().brain.terms(this.ghosts.last());

        for(var k in terms) {
            if(terms.hasOwnProperty(k)) {
                this.log(k, terms[k].toFixed(4));
            }
        }
    }
    
    return PacGame;
});
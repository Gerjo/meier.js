define(function(require){
    var Game = require("meier/engine/Game");
    var V2   = require("meier/math/Vec")(2);
    
    var Level  = require("./Map");
    var World  = require("./World");
    var Ghost  = require("./Ghost");
    var Player = require("./Player");

    PacGame.prototype = new Game();
    
    function PacGame(container) {        
        Game.call(this, container);

        this.add(this.world = new World());

        this.world.load(Level);

        this.world.add(new Player(this.world.start, this.world));

        this.world.add(new Ghost(this.world.spawns[0], this.world));
        //this.world.add(new Ghost(this.world.spawns[1], this.world));
        //this.world.add(new Ghost(this.world.spawns[2], this.world));
    }
    
    PacGame.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    PacGame.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);

        var a = this.world.atPosition(this.input);
        var b = this.world.atPosition(new V2(0, 20));

        if(a) {
            renderer.text(a.id, this.input.x, this.input.y, "black", "center", "bottom");

            this.world.path(a, b, renderer);

        }
    }
    
    return PacGame;
});
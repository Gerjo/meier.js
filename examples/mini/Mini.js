define(function(require){
    var Game    = require("meier/engine/Game");
    var Matrix  = require("meier/math/Mat");
    var RawTexture = require("meier/engine/RawTexture");
    var Texture = require("meier/engine/Texture");
    var Sprite  = require("meier/prefab/Sprite");
    var Random = require("meier/math/Random");
    var dat    = require("meier/contrib/datgui");
    
    Mini.prototype = new Game();
    
    function Mini(container) {        
        Game.call(this, container);
        this.setAutoClear(false);
        
        this.tetri = [];
        
        Array.Range(0, 15 + 1).forEach(function(n) {
            new RawTexture("peoples/" + n + ".png", function(texture) {
                var grey = texture.asMatrix().a.zoom(this.scale);
                this.tetri.push({ matrix: grey, image: "peoples/" + n + ".png", count:0 });
            }.bind(this));
        }.bind(this));
    
        this.showTetris = true;
        this.tmpScale = 2;
        this.scale = 1/this.tmpScale;
        this.noise = 500;

        this.gui = new dat.GUI();
        this.gui.width = 300;
        
        this.gui.add(this, "tmpScale", 1, 10).step(1).name("Tetris scale").onChange(this.restart.bind(this));
        this.gui.add(this, "noise", 1, 10000).name("Noise").onChange(this.restart.bind(this));
        this.gui.add(this, "showTetris").name("Show Tetris");

        this.restart();
    }
    
    Mini.prototype.restart = function() {

        this.scale = 1 / this.tmpScale;

        this.world = Matrix(Math.round(this.height * this.scale), Math.round(this.width * this.scale)).Create();
        
        for(var i = 0; i < this.noise; ++i) {
            this.world.set(Random(0, this.world.numrows), Random(0, this.world.numcolumns), 200);
        }
        
        
        this.lastRow = this.world.numrows - 1;
        
        for(var i = 0; i < this._entities.length; ++i) {
            this._entities[i].destroy();
        }
    };
    
    Mini.prototype.place = function() {
        var ON   = 245;
        var USED = 100;
        var OFF  = 0;
        
        var best = -Infinity;
        var bCol = 0, bRow = 0;
        
        // Star
        for(var row = this.lastRow; row >= 0; --row) {
            
            var streak = 0;
            var sCol, sRow;
            
            for(var col = 0; col < this.world.numcolumns; ++col) {
                
                var on = this.world.get(row, col) < USED;
                
                if(on) {
                    // Starting a new streak
                    if(streak == 0) {
                        sCol = col;
                        sRow = row;
                    }
                    
                    ++streak;
                }
                
                if( ! on || col == this.world.numcolumns - 1) {
                    
                    // End a streak.
                    if(streak > 0) {
                        
                        if(streak > best) {
                            best = streak;
                            bCol = sCol;
                            bRow = sRow;
                        }
                        
                        // Restart streak
                        streak = 0;
                    }
                }
            }
            
            // Found slot with 3 spaces. Halt.
            if(best >= 3) {
                break;
            }
        }
        
        this.lastRow = row;
        
        if(best > 0) {
            
            
            var placed = ! this.tetri.shuffle().every(function(tetri) {
                var block = tetri.matrix;
                var image = tetri.image;
                
                var fits = true;
            
                outer:
                for(var row = block.numrows - 1; row >= 0; --row) {
                    for(var col = 0; col < block.numcolumns; ++col) {
                
                        // Block is on.
                        if(block.get(row, col) >= ON) {
                        
                            // World is on, too
                            if(this.world.get(bRow - block.numrows + row + 1, bCol + col) >= USED) {
                                fits = false;
                                break outer;
                            }       
                        }
                    }
                }
            
                if(fits) {
                    //console.log("Fits: " + bCol + "," + bRow);
                
                    this.add(new Sprite(bCol / this.scale - this.hw, ((bRow / this.scale) - this.hh) * -1, image));
                
                    //console.log(this.last().position.x, this.last().position.y);
                
                    // Brick fits, color!
                    for(var row = block.numrows - 1; row >= 0; --row) {
                        for(var col = 0; col < block.numcolumns; ++col) {
                            if(block.get(row, col) >= ON) {
                                this.world.set(bRow - block.numrows + row + 1, bCol + col, ON);
                            }
                        }
                    }
                    
                    return false;
                } 
                
                return true;
            
            }.bind(this));
            
            if( ! placed) {
                this.world.set(bRow, bCol, USED);
            }
        }
        
    };
    
    Mini.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
        for(var i = 0; i < 50; ++i) {
            this.place();
        }
    };
    
    Mini.prototype.draw = function(renderer) {
        renderer.clearSolid("#a99163");
        
        if(this.showTetris) {
            var tex = RawTexture.FromMatrix(this.world.clone());
            renderer.texture(tex);
        }
        
        Game.prototype.draw.call(this, renderer);
        
        //this.tetri.forEach(function(tetris) {
        //    renderer.texture(tetris.image);
        //});
        
        
    };
    
    return Mini;
});
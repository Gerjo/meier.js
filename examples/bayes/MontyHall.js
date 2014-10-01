
define(function(require){
    var Game    = require("meier/engine/Game");
    var Random  = require("meier/math/Random");
    var Sprite  = require("meier/prefab/Sprite");
    var Entity  = require("meier/engine/Entity");
    var Texture = require("meier/engine/Texture");
    var Input   = require("meier/engine/Input");
    var Timer   = require("meier/extra/Timer");
    
    
    MontyHall.prototype = new Game();
    
    MontyHall.State = { Count: 0 };
    MontyHall.State.Initial           = ++MontyHall.State.Count;
    MontyHall.State.PrePickDoor       = ++MontyHall.State.Count;
    MontyHall.State.PickDoor          = ++MontyHall.State.Count;
    MontyHall.State.PreSystemOpenDoor = ++MontyHall.State.Count;
    MontyHall.State.SystemOpenDoor    = ++MontyHall.State.Count;
    
    MontyHall.State.PreConfirmation   = ++MontyHall.State.Count;
    MontyHall.State.Confirmation      = ++MontyHall.State.Count;
    MontyHall.State.PostConfirmation  = ++MontyHall.State.Count;
    MontyHall.State.Result            = ++MontyHall.State.Count;
    MontyHall.State.PostResult        = ++MontyHall.State.Count;
    
    
    function Door() {
        return Random(0, 2);
    }
    
    function MontyHall(container) {        
        Game.call(this, container);
        
        this.logger.showInternals(false);
        this.setAutoClear(false);
        this.setHighFps(60);
        
        this.background = new Texture("backdrop.png");
        
        this.add(this.stage = new Sprite("stage.png"));
        
        this.garages = [0,1,2].map(function(i) {
            var entity = new Entity();
            
            entity.garage = entity.add(new Sprite("garage.png"));
            entity.tux    = entity.add(new Sprite("tux.png").hide());
            entity.door   = entity.add(new Sprite("door.png"));
            entity.cross  = entity.add(new Sprite("cross.png").fade(-10));
            entity.check  = entity.add(new Sprite("check.png").fade(-10));
            entity.light  = entity.add(new Sprite("light.png").fade(-10));
            
            entity.tux.position.y = -30;
            entity.door.position.y = entity.cross.position.y = -10;
            return entity;
        });
        
        this.garages.forEach(this.add.bind(this));
        
        this.text = ["Loading...", ""];
        
        this.state = MontyHall.State.Initial;   
        
        this.timer = new Timer();    
        
        this.player = -1; 
        this.prize  = -1;
        this.host   = -1;
        this.second = -1;
        
        this.penguins = [];
        
        
        /*setInterval(function() {

            var s = 0.5;
            var w = 90 * s;
            
            this.penguins.push(this.add(new Sprite("tux.png")));
            this.penguins.last().position.y = -this.hh + w * 0.5 + Math.sin(this.penguins.length * 3) * 10;
            
            this.penguins.last().position.x = -this.hw + this.penguins.length * w;
            this.penguins.last().scale = s;
            
        }.bind(this), 500);*/
    }
    
    MontyHall.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
        var input = this.input;
        
        // Position the garages
        this.garages.forEach(function(garage, i) {
            var sign = i - 1;
            garage.position.x = garage.garage.width * (sign * 1.1);
            
            garage.garage.position.y = -5;
        });
        
        // Position the stage underneath the garage doors.
        this.stage.position.y = this.garages.first().bottom() - 60;
        
        
        switch(this.state) {
        case MontyHall.State.PrePickDoor:            
            // Determine door with the prize
            var prize = this.prize = Door();
            
            // Show the penguin
            this.garages[prize].tux.show();
            
            // Update the GUI text
            this.text[0] = "Pick a door.";
            this.text[1] = "Find the penguin, win the penguin.";
            
            // Proceed to next state.
            this.state = MontyHall.State.PickDoor;
            break;
            
        case MontyHall.State.PickDoor:
            
            // Glowing light and cursor
            this.garages.forEach(function(garage, i) {
                if(garage.first().contains(input)) {
                    
                    
                    input.cursor(Input.Cursor.FINGER);
                    
                    if(input.isLeftDown()) {
                        this.state = MontyHall.State.PreSystemOpenDoor;
                        
                        this.player = i;
                        
                        garage.light.fade(-3);
                        garage.cross.fade(3);
                    } else {
                        garage.light.fade(+5);
                    }
                    
                } else {
                    garage.light.fade(-3);
                }
            }.bind(this));
        
            break;
        case MontyHall.State.PreSystemOpenDoor:
            this.text[0] = "The host opens door...";
            this.text[1] = "";
            this.timer = new Timer(300);
            
            this.state = MontyHall.State.SystemOpenDoor;
            break;
        case MontyHall.State.SystemOpenDoor:
            
            if(this.timer.expired()) {
                
                while((this.host = Door()) == this.player || this.host == this.prize );
                
                this.garages[this.host].door.slideTop(-100);
                
                this.state = MontyHall.State.PreConfirmation;
                
                this.timer = new Timer(1000);
            }
            
            break;
            
        case MontyHall.State.PreConfirmation:
            if(this.timer.expired()) {
                this.text[0] = "... would you like to change your choice?";
                this.text[1] = "Pick a door.";
                
                this.garages.forEach(function(garage, i) {
                    if(i != this.player && i != this.host) {
                        garage.check.fade(5);
                    }
                }.bind(this));
                
                this.state = MontyHall.State.Confirmation;
            }
            break;
        case MontyHall.State.Confirmation:
            
            this.garages.forEach(function(garage, i) {
                if(garage.first().contains(input) && i != this.host) {
                    garage.light.fade(+5);
                
                    input.cursor(Input.Cursor.FINGER);
                
                    if(input.isLeftDown()) {                    
                        this.second = i;
                        
                        garage.door.slideTop(-100);
                        
                        this.timer = new Timer(1000);
                        
                        this.state = MontyHall.State.PostConfirmation;
                        
                        this.garages.forEach(function(g) {
                            g.cross.fade(-5);
                            g.check.fade(-5);
                        });
                        
                    }
                
                } else {
                    garage.light.fade(-3);
                }
            }.bind(this));
            break;
            
        case MontyHall.State.PostConfirmation:
            
            if(this.timer.expired()) {
                
                if(this.prize == this.second) {
                    this.text[0] = "SWEET! You won a penguin.";
                } else {
                    this.text[0] = "Empty. Nothingness. Void. MEH.";
                }
                
                this.text[1] = "Click anywhere.";
                
                this.state = MontyHall.State.Result;
            }
            
            break;
        case MontyHall.State.Result:
            if(this.input.isLeftDown()) {
                
                // Loop back to the beginning
                this.state = MontyHall.State.PostResult;
                
                this.garages.forEach(function(g) {
                    g.cross.fade(-5);
                    g.check.fade(-5);
                    g.light.fade(-5);
                    g.tux.hide();
                    g.door.slideTop(100);
                });
            }
            
            break;
        case MontyHall.State.PostResult:
            
            var isAnimating = this.garages.some(function(g) {
                return g.door.isSliding();
            });
                        
            if( ! isAnimating) {
                this.state = MontyHall.State.PrePickDoor;
            }
            
            break;
        default:
            this.state = MontyHall.State.PrePickDoor;
            break;
        }
        
    };
    
    MontyHall.prototype.draw = function(renderer) {
        renderer.clearTexture(this.background, true);
        
        Game.prototype.draw.call(this, renderer);
        
        renderer.text(
            this.text[0], 0, this.garages.first().top() + 100, 
            "white", "center", "center", "24px monospace"
        );
        
        renderer.text(
            this.text[1], 0, this.garages.first().top() + 80, 
            "white", "center", "center", "15px monospace"
        );
        
    };
    
    return MontyHall;
});

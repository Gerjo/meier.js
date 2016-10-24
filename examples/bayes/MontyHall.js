
define(function(require){
    var Game    = require("meier/engine/Game");
    var Random  = require("meier/math/Random");
    var Vector2 = require("meier/math/Vec")(2);
    var Sprite  = require("meier/prefab/Sprite");
    var Entity  = require("meier/engine/Entity");
    var Texture = require("meier/engine/Texture");
    var Input   = require("meier/engine/Input");
    var Timer   = require("meier/extra/Timer");
    
	// Or all at the same time?
	TODO("Add automatic mode. With 3 tactics. stand/switch/randomize.");
    
    MontyHall.prototype = new Game();
    
	TODO("Enum MontyHall state.")
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
        return Random(0, 3);
    }
    
    function MontyHall(container) {        
        Game.call(this, container);
        
        this.n = [];
        
        this.logger.showInternals(false);
        this.setAutoClear(false);
        this.setHighFps(60);
        
        this.speed = 1.0;
        this.games = 0;
        
        this.background = new Texture("backdrop.png");
        
        this.add(this.stage = new Sprite("stage.png"));
        
        this.penguinTitles = [
            "Counting starts at index 1",
            "a penguin with a blue hat",
            "a karate penguin",
            "an ancient pharaoh penguin",
            "a construction worker penguin",
            "a penguin that carries a wheel",
            "an old wizard penguin",
            "a penguin on-top-a-cloud",
            "a sprite penguin",
            "an e-book scholar penguin",
            "a maya penguin",
            "a sophisticated librarian penguin",
            "a useless drunk penguin",
            "an esteemed gentleman penguin",
            "a penguin artist of sorts",
            "a semi transparent penguin",
            "a village people sailor penguin",
            "a christmas themed penguin",
            "a penguin that will love you forever",
            "some sort of lifeguard penguin",
            "a penguin with a cake",
            "a barbecue chef penguin",
            "a bunny penguin",
            "a pilot penguin"
        ];
        
        this.garages = [0,1,2].map(function(i) {
            var entity = new Entity();
            
            entity.garage = entity.add(new Sprite("garage.png"));
            entity.tux    = entity.add(new Sprite("tuxies/1.png").hide());
            entity.door   = entity.add(new Sprite("door.png"));
            entity.cross  = entity.add(new Sprite("cross.png").fade(-10));
            entity.check  = entity.add(new Sprite("check.png").fade(-10));
            entity.light  = entity.add(new Sprite("light.png").fade(-10));
            
            entity.tux.position.y = -10;
            entity.door.position.y = entity.cross.position.y = -10;
            return entity;
        });
        
        this.garages.forEach(this.add.bind(this));
        
        this.text = ["Loading...", ""];
        
        this.state = MontyHall.State.Initial;   
        
        this.timer = new Timer();    
        
        this.penguinID = -1;
        this.player = -1; 
        this.prize  = -1;
        this.host   = -1;
        this.second = -1;
        
        this.win  = 0;
        this.lost = 0;
        
        this.penguins = [];
        this.animate  = [];
    }
    
    MontyHall.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
       
        
        if(! this.penguins.empty() && this.penguins.last().isVisible()) {
            var s = 1;
            var w = 90 * s;
            
            var target = new Vector2(
                (this.penguins.length * w * 0.5) % (this.width - w) - this.hw + w * 0.5,
                -this.hh + w + Math.sin(this.penguins.length * 3) * 10
            );
            
            var delta = this.penguins.last().position.direction(target);
            
            this.penguins.last().position.addScaled(delta, -0.1);
        }
        
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
            
            this.penguinID = Random(1, 23);
            
            // Generate random penguin and show it
            this.garages[prize].tux.setUrl("tuxies/" + this.penguinID + ".png").show();
            
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
                        
                        garage.light.fade(-3 * this.speed);
                        garage.cross.fade(+3 * this.speed);
                    } else {
                        garage.light.fade(+5 * this.speed);
                    }
                    
                } else {
                    garage.light.fade(-3 * this.speed);
                }
            }.bind(this));
        
            break;
        case MontyHall.State.PreSystemOpenDoor:
            this.text[0] = "The host opens door...";
            this.text[1] = "";
            this.timer = new Timer(300 / this.speed);
            
            this.state = MontyHall.State.SystemOpenDoor;
            break;
        case MontyHall.State.SystemOpenDoor:
            
            if(this.timer.expired()) {
                
                while((this.host = Door()) == this.player || this.host == this.prize );
                
                this.garages[this.host].door.slideTop(-100 * this.speed);
                
                this.state = MontyHall.State.PreConfirmation;
                
                this.timer = new Timer(1000 / this.speed);
            }
            
            break;
            
        case MontyHall.State.PreConfirmation:
            if(this.timer.expired()) {
                this.text[0] = "... would you like to change your choice?";
                this.text[1] = "Pick a door.";
                
                this.garages.forEach(function(garage, i) {
                    if(i != this.player && i != this.host) {
                        garage.check.fade(+5 * this.speed);
                    }
                }.bind(this));
                
                this.state = MontyHall.State.Confirmation;
            }
            break;
        case MontyHall.State.Confirmation:
            
            this.garages.forEach(function(garage, i) {
                if(garage.first().contains(input) && i != this.host) {
                    garage.light.fade(+5 * this.speed);
                
                    input.cursor(Input.Cursor.FINGER);
                
                    if(input.isLeftDown()) {                    
                        this.second = i;
                        
                        garage.door.slideTop(-100 * this.speed);
                        
                        this.timer = new Timer(1000 / this.speed);
                        
                        this.state = MontyHall.State.PostConfirmation;
                        
                        this.garages.forEach(function(g) {
                            g.cross.fade(-5 * this.speed);
                            g.check.fade(-5 * this.speed);
                        }.bind(this));
                    }
                
                } else {
                    garage.light.fade(-3 * this.speed);
                }
            }.bind(this));
            break;
            
        case MontyHall.State.PostConfirmation:
            
            if(this.timer.expired()) {
                
                if(this.prize == this.second) {
                    this.text[0] = "SWEET! You won " + this.penguinTitles[this.penguinID] + ".";
                    ++this.win;
                    
                } else {
                    this.text[0] = "Empty. Nothingness. Void. MEH.";
                    ++this.lost;
                }
                
                this.text[1] = "Click anywhere.";
                
                this.state = MontyHall.State.Result;
                
                ++this.games;
                
                this.speed = Math.log(this.games + 2);
        
                console.log("Set game speed to: " + this.speed.toFixed(2));
        
                
            }
            
            break;
        case MontyHall.State.Result:
            
            if(this.input.isLeftDown()) {
                
                // Loop back to the beginning
                this.state = MontyHall.State.PostResult;
                
                // Penguin animation
                if(this.prize == this.second) {
                    var clone = this.garages[this.prize].tux.clone();
                
                    this.penguins.push(this.add(clone));
                    this.penguins.last().position = this.garages[this.prize].tux.toWorld();
                }
                
                
                this.garages.forEach(function(g) {
                    g.cross.fade(-5 * this.speed);
                    g.check.fade(-5 * this.speed);
                    g.light.fade(-5 * this.speed);
                    g.tux.hide();
                    g.door.slideTop(100 * this.speed);
                }.bind(this));
                
                
                
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
        
        if(this.win + this.lost > 0) {
            renderer.text(
                "Penguins won: " + this.win + ", success rate: " + (100 * this.win / (this.win + this.lost)).toFixed(0) + "%.", 0, this.stage.bottom() - 30, 
                "white", "center", "center", "15px monospace"
            );
        }
    };
    
    return MontyHall;
});


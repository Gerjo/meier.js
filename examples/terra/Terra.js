define(function(require) {
    var Input     = require("meier/engine/Input");
    var Game      = require("meier/engine/Game");
    var Entity    = require("meier/engine/Entity");
    var Sprite    = require("meier/prefab/Sprite");
    var SpriteSet = require("meier/prefab/SpriteSet");
    
    var Part      = require("./Part");
    var Elements  = require("./Elements");
    
    
    Terra.prototype = new Game();
    function Terra(container) {
        Game.call(this, container);
        this.setFps(60);
        
        // One container for all entities:
        this.add(this.world = new Entity(0, 0, this.width, this.height));
        
        this.attempts = 0; // Every 3rd attempt applies a penalty.
        
        this.relic    = new Sprite("images/relic.png");
        this.kruis    = new Sprite("images/kruis.png");
        this.glow     = new Sprite("images/glow.png");
        this.clouds   = new Sprite("images/clouds.png");
        this.bluering = new Sprite("images/bluering.png");
        this.elements = new Elements();
        
        this.world.add(this.relic);
        this.world.add(this.bluering);
        this.world.add(this.clouds);
        
        this.winimage = new Sprite("images/youwon.png");
        this.winimage.opacity = 0;
        this.add(this.winimage);
        
        // Score bits and land:
        this.parts = [
            new Part(0),    // aarde
            new Part(1),    // savannah
            new Part(2),    // deadish
            new Part(3)     // flourishing
        ];
        
        this.sequence = [
            "lucht",    // lucht
            "maan",     // maan
            "regen",    // regen
            "zon",      // zon
        ];
        
        this.parts.forEach(this.world.add.bind(this.world));
        this.world.add(this.elements);    
        
        this.world.add(this.glow); this.glow.fade(-1);
        this.world.add(this.kruis);
        
        // Go to rotation:
        this.target = 0;
        
        // Home position (incase of peek-ahead)
        this.home   = 0;
                
        // User pressed button.
        this.lockmovement = false;
        
        // Rotate the wholelot:
        this.winAnimation = false;
        
        this.buttons = [
            new Sprite("images/point_right.png"),
            new Sprite("images/point_left.png")
        ];
        
        this.buttons[0].position.y = this.buttons[1].position.y = -250;
        this.buttons[0].position.x = 280;
        this.buttons[1].position.x = -this.buttons[0].position.x;
        this.buttons[0].scale = this.buttons[1].scale = 0.8;
        
        this.buttons[0].onLeftDown = this.ccw.bind(this);
        this.buttons[1].onLeftDown = this.cw.bind(this);
        this.buttons[0].enableEvent(Input.LEFT_DOWN);
        this.buttons[1].enableEvent(Input.LEFT_DOWN);
        
        this.buttons.forEach(this.world.add.bind(this.world));
        this.input.subscribe(Input.MOUSE_MOVE, this.onMouseMove.bind(this));
        
        this.add(this.audio = new SpriteSet(-this.hw + 35, this.hh - 28, "images/speaker.png", "images/speaker-off.png"));
        this.audio.scale = 0.8;
        this.audio.onLeftDown = this.audioToggle.bind(this);
        this.audio.enableEvent(Input.LEFT_DOWN);
        this.enableAudio = true;
        
        // actionname -> methodname
        
        this.gainRelation = {
            "lucht": "lucht", "zon": "zon", "regen": "regen", "maan": "maan"
        };
        
        this.loseRelation = {
            "lucht": "regen", "zon": "lucht", "regen": "zon", "maan": "maan"
        };
        
        this.winimage.onLeftDown = this.restart.bind(this);
        this.winimage.enableEvent(Input.LEFT_DOWN);
    }
    
    Terra.prototype.restart = function() {
        this.winimage.fade(-2);
        this.winAnimation = false;
        
        this.kruis.rotation = 0;
        this.home     = 0;
        this.target   = 0;
        this.attempts = 0;
        
        this.parts.forEach(function(part, i) {
            part.restart();
        });
        
        // Do not propegate event:
        return false;
    };

    Terra.prototype.audioToggle = function() {
        
        // We will disable:
        if(this.enableAudio) {
            this.audio.opacity = 0.5;
            this.audio.showOnly(1);
        // We will enable:
        } else {
            this.audio.opacity = 1;
            this.audio.showOnly(0);
        }
        
        this.enableAudio = ! this.enableAudio;
    };
    
    Terra.prototype.onMouseMove = function(input) {
        
        if(this.winAnimation) {
            return;
        }
        
        var lookAheadRange =  Math.PI / 8;
        var sequence;
        
        if( ! this.lockmovement) {
            
            // Look ahead functionality:
            if(this.buttons[0].containsPoint(input)) {
                this.target = this.home + lookAheadRange;
                this.input.cursor(Input.Cursor.FINGER);
                
                
                sequence = this.sequence.clone();
                sequence.unshift(sequence.pop());
                sequence.unshift(sequence.pop());
                sequence.unshift(sequence.pop());
                sequence.unshift(sequence.pop());
                
                this.parts.forEach(function(part, i) {

                    part.showPreview(this.gainRelation[sequence[i]]);
                    
                    if(this.attempts % 3 == 2) {
                        part.showPenalty(this.loseRelation[sequence[i]]);
                    }

                }.bind(this));
                
                
                
            } else if(this.buttons[1].containsPoint(input)) {
                this.target = this.home - lookAheadRange;
                this.input.cursor(Input.Cursor.FINGER);
                
                
                sequence = this.sequence.clone();
                sequence.push(sequence.shift());
                sequence.push(sequence.shift());
                
                this.parts.forEach(function(part, i) {

                    part.showPreview(this.gainRelation[sequence[i]]);
                    
                    if(this.attempts % 3 == 2) {
                        part.showPenalty(this.loseRelation[sequence[i]]);
                    }

                }.bind(this));
                
            } else {
                this.target = this.home;
                this.input.cursor(Input.Cursor.DEFAULT);
                
                this.parts.forEach(function(part) {
                    part.hidePreview();
                });
            }
        }
    };
    
    Terra.prototype.ccw = function() {
        if( ! this.lockmovement) {
            this.home += Math.PI / 2;
            this.target = this.home;
        
            this.lockmovement = true;
            
            this.sequence.unshift(this.sequence.pop());
        }
    };
    
    Terra.prototype.cw = function() {
        if( ! this.lockmovement) {
            this.home -= Math.PI / 2;
            this.target = this.home;
        
            this.lockmovement = true;
            
            this.sequence.push(this.sequence.shift());
        }
    };
    
    Terra.prototype.applyScore = function() {
        
        var min = Infinity;
        
        this.parts.forEach(function(part) {
            var id = part.id;
            
            part.hidePreview();
            
            var gain = this.sequence[id];
            
            (part[this.gainRelation[gain]])(1);
            
            if(this.attempts % 3 == 2) {
                (part[this.loseRelation[gain]])(-1);
            }
               
            // Lowest score of all lowest scores:
            min = Math.min(min, Math.min.apply(null, part.scores));
            
        }.bind(this));
        
        // Win condition:
        if(min == 3) {
            this.winAnimation = true;
            this.winimage.fade(0.5);
        }
        
        // Proceed to the next attempt:
        ++this.attempts;
        
        // Glow to signify a penalty round:
        if(this.attempts % 3 == 2) {
            this.glow.glow(2);
        } else {
            this.glow.fade(-1);
        }
    };
    
    Terra.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
                
        // Cloud animation:
        this.clouds.rotation += dt * 0.1;
        
        if( ! this.winAnimation) {
            
            if(this.target != this.rotation) {
                var dampening = 1;
            
                if(this.lockmovement) {
                    dampening = 4;
                }
                
                var velocity = (this.target - this.elements.rotation) * dt * dampening;
                // TODO: minimal velocity?
                this.elements.rotation += velocity;
            }
        
            if( this.lockmovement ) {
                if(Math.abs(this.target - this.elements.rotation) < Math.PI / 100) {
                    this.lockmovement = false;
                    this.applyScore();
                }
            }
        } else {
            // Hide the glow:
            this.glow.fade(-1);
            
            // Rotate some of the world:
            this.elements.rotation += dt;
            this.kruis.rotation    += dt;
            
            this.parts.forEach(function(part) {
                part.terrain.rotation = this.kruis.rotation;
            }.bind(this));
        }
        
        // Different z-index, but rotate together:
        this.bluering.rotation = this.elements.rotation;
        this.glow.rotation = this.kruis.rotation;
    };
    
    return Terra;
});
define(function(require) {
    var Game         = require("meier/engine/Game");
    var Input        = require("meier/engine/Input");
    var Sprite       = require("meier/prefab/Sprite");
    var Vector       = require("meier/math/Vec")(2);
    
    RegressionApp.prototype = new Game();
    function RegressionApp(container) {
        Game.call(this, container);
        this.log.right().top();
        
        this.images   = [];
        this.gamepads = [];
        
        // Handle events
        this.input.gamepads.onConnect = function(gamepad) {
            console.log("Gamepad " + gamepad.index() + " connected.");
        };
        
        this.input.gamepads.onDisconnect = function(gamepad) {
            console.log("Gamepad " + gamepad.index() + " disconnected.");
        };
                
        for(var i = -1; i <= 1; i += 2) {  
            for(var j = -1; j <= 1; j += 2) {
           
                // Image from: http://www.vecteezy.com/random-objects/56334-game-controller-vector
                var gamepad = new Sprite("gamepad.png");
           
                gamepad.position.x = this.hw * 0.5 * i;
                gamepad.position.y = this.hh * 0.5 * j * -1;
           
                this.images.push(gamepad);
           
                this.add(gamepad);
            }
        }
        
        // Acquire the gamepads. Doesn't matter if they are connected or not.
        for(var i = 0; i < 4; ++i) {
            this.gamepads.push(this.input.gamepads.get(i));
        }
        
        
        this.buttonPositions = {
            "y" : new Vector(95, 75),
            "x" : new Vector(70, 50),
            "b" : new Vector(120, 50),
            "a" : new Vector(95, 25),

            "select" : new Vector(-35, 50),
            "start" :  new Vector(35, 50),
            
            "top":     new Vector(-50, 10),
            "bottom":  new Vector(-50, -20),
            
            "left":    new Vector(-65, -5),
            "right":   new Vector(-35, -5),
            
            "leftDown":  new Vector(-97, 51),
            "rightDown": new Vector(46, -7),
            
            "leftShoulder":  new Vector(-97, 110),
            "rightShoulder": new Vector(97, 110),
        }; 
        
        this.triggers = {
            "leftTrigger":  new Vector(-97, 110),
            "rightTrigger": new Vector(97, 110),
        };
    }
   
    
    RegressionApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        var radius = 20;
        
        this.gamepads.forEach(function(gamepad, i) {
            var image = this.images[i];
            
            var oldLeft = this.buttonPositions["leftDown"].clone();
            var rightLeft = this.buttonPositions["rightDown"].clone();
            
            // Adjust the joystick position
            this.buttonPositions["leftDown"].add(gamepad.leftJoystick().scaleScalar(radius));
            this.buttonPositions["rightDown"].add(gamepad.rightJoystick().scaleScalar(radius));
            
            for(var k in this.buttonPositions) {
                if(this.buttonPositions.hasOwnProperty(k)) {
                    
                    var position = this.buttonPositions[k];
                    renderer.begin();
                    renderer.circle(image.position.clone().add(position), 10);
                    
                    if(gamepad[k]()) {
                        renderer.fill("purple");
                        renderer.stroke("yellow");
                    } else {
                        renderer.fill("rgba(255, 0, 0, 0.3)");
                        renderer.stroke("rgba(255, 0, 0, 0)");
                    }
                }
            }
            
            // Restore the old position again
            this.buttonPositions["leftDown"] = oldLeft;
            this.buttonPositions["rightDown"] = rightLeft;
            
            for(var k in this.triggers) {
                if(this.triggers.hasOwnProperty(k)) {
                    var value = gamepad[k]();
                    var pos = this.triggers[k].clone().add(image.position);
                    
                    var end = new Vector(0, 1).trim(value * 100 + 1).add(pos);
                    
                    renderer.begin();
                    renderer.arrow(pos, end);
                    renderer.stroke("red", 1);
                }
            }
            
            if(gamepad.connected()) {
                text = "Connected";
            } else {
                text = "Not connected";
            }
            
            renderer.text("#" + gamepad.index() + " " + text, image.position.x, image.position.y - 100);
            
            
        }.bind(this));
    };
    
    RegressionApp.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
    };
    
    
    return RegressionApp;
});
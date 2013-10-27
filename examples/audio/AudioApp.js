define(function(require) {
    var Game  = require("meier/engine/Game");
    var Sound = require("meier/engine/Sound");
    var Rand  = require("meier/math/Random");
    var Input = require("meier/engine/Input");
    var Timer = require("meier/aux/Timer");
    var Pad   = require("./Pad");
    
    AudioApp.prototype = new Game();
    function AudioApp(container) {
        Game.call(this, container);
        
        this.setFps(60);
        
        var files = [
            //["sounds/piano-gg.ogg", "gg",   ],    
            ["sounds/piano-a.ogg",  "a"],
            ["sounds/piano-b.ogg",  "b"],
            //["sounds/piano-bb.ogg", "bb",   ],
            ["sounds/piano-c.ogg",  "c"],
            //["sounds/piano-cc.ogg", "cc",   ],
            ["sounds/piano-d.ogg",  "d"],
            ["sounds/piano-e.ogg",  "e"],
            //["sounds/piano-eb.ogg", "eb",   ],
            ["sounds/piano-f.ogg",  "f"],
            //["sounds/piano-ff.ogg", "ff",   ],
            ["sounds/piano-g.ogg",  "g"]
        ];
        
        var width  = this.width / files.length;
        var height = this.height / files.length;
        
        this.pads = [];
        
        for(var row = 0; row < files.length; ++row) {
            for(var i = 0; i < files.length; ++i) {
                
                var x = i * width - this.hw + width * 0.5;
                var y = this.hh - row * height;
                var h = this.height - 10;
                var file = files[(i + row) % files.length][0];
                
                var pad = new Pad(
                        x, 
                        y - h * 0.5, 
                        width, 
                        h, 
                        file, // src
                        files[(i + row) % files.length][1], // name
                        files[(i + row) % files.length][2]  // color
                );
                
                this.add(pad);
                
                if(!this.pads[file]) {
                    this.pads[file] = [];
                }
                
                this.pads[file].push(pad);
            }
        }
        
        this.colorize();
        this.colorize();
        
        this.colorTimer = new Timer(3000);
    }
    
    AudioApp.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
        if(this.colorTimer.expired()) {
            this.colorize();
        }
        
    };
    
    AudioApp.prototype.colorize = function() {
        function RandomColor() {
            return [
                Rand.Byte(),
                Rand.Byte(),
                Rand.Byte(),
                0.3
            ];
            //return "RGBA(" + Rand.Byte() + "," + Rand.Byte() + "," + Rand.Byte() + ",0.3)";
        }
        
        
        for(var k in this.pads) {
            if(this.pads.hasOwnProperty(k)) {
                var color = RandomColor();
            
                this.pads[k].forEach(function(pad) {
                    pad.fadeTo(color);
                });
            }
        }
    };
    
    return AudioApp;
});
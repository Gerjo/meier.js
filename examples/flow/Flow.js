define(function(require){
    var Game   = require("meier/engine/Game");
    var Input  = require("meier/engine/Input");
    var Colors = require("meier/aux/Colors");
    var Input  = require("meier/engine/Input");
    var dat    = require("meier/contrib/datgui");
    var Field  = require("./Field");
    
    Flow.prototype = new Game();
    function Flow(container) {        
        Game.call(this, container);

        this.leftDown = false;
        this.active   = 0;
        this.weight0  = this.weight1 = this.weight2 = 0.30;
        
        
        var storage  = JSON.TryParse(localStorage.getItem("flowfields"));
        var tileSize = (storage && storage.size) || 10;
                
        this.fields   = [
            new Field(Colors.Red, tileSize),
            new Field(Colors.Green, tileSize),
            new Field(Colors.Blue, tileSize)
        ];
    
    
        this.fields.forEach(function(field, i) {
            this.add(field);
            
            field.load((storage && storage.fields && storage.fields[i]) || []);
            
        }.bind(this));
       
        
        
        this.input.subscribe(Input.MOUSE_MOVE, this.onMouseMove.bind(this));
        this.input.subscribe(Input.LEFT_DOWN, this.onLeftDown.bind(this));
        this.input.subscribe(Input.LEFT_UP, this.onLeftUp.bind(this));
        

        this.gui = new dat.GUI();
        this.gui.width = 300;
        
        var folder = this.gui.addFolder("Guidance Field Visibility");
    	folder.add(this, "enableField1").name('Guidance field #1');
    	folder.add(this, "enableField2").name('Guidance field #2');
    	folder.add(this, "enableField3").name('Guidance field #3');
    	folder.add(this, "enableFields").name('All guidance fields');
        
        folder = this.gui.addFolder("Guidance Field Weights");
    	folder.add(this, "weight0", 0, 1).step(0.01).name('Weight #1');
    	folder.add(this, "weight1", 0, 1).step(0.01).name('Weight #2');
    	folder.add(this, "weight2", 0, 1).step(0.01).name('Weight #3');
    }
    
    Flow.prototype.enableField1 = function() {
        this.showFieds(0);
    }; 
    
    Flow.prototype.enableField2 = function() {
        this.showFieds(1);
    };
    
    Flow.prototype.enableField3 = function() {
        this.showFieds(2);
    };
    
    Flow.prototype.enableFields = function() {
        this.showFieds(0, 1, 2);
    };
    
    Flow.prototype.onLeftDown = function(input) {
        this.leftDown = true;
    };
    
    Flow.prototype.onLeftUp = function(input) {
        this.leftDown = false;
        
        this.save();
    };
    
    Flow.prototype.onMouseMove = function(input) {
        if(this.leftDown) {
            if(this.active !== -1) {
                this.fields[this.active].onMouseDrag(input);
            }
        }
    };
    
    Flow.prototype.showFieds = function(a, b, c/*etc*/) {
        var args = Array.prototype.slice.call(arguments);
        
        for(var i = 0; i < this.fields.length; ++i) {
            if(args.indexOf(i) !== -1) {
                this.fields[i].visible = true;
                this.active            = i;
            } else {
                this.fields[i].visible = false;
            }
        }
        
        // Multiple enabled, ergo disable all
        if(args.length > 1) {
            this.active = -1;
        }
    }
    
    Flow.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
    };
    
    Flow.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);

        this.log("Active", (this.active+1) + "/" + this.fields.length);
    }
    
    Flow.prototype.save = function(renderer) {
        
        var json = {
            fields: [],
            size: this.fields[0].size
            
        };
        
        this.fields.forEach(function(field) {
            json.fields.push(field.toArray());
        });
        
        localStorage.setItem("flowfields", JSON.stringify(json))
    }
    
    return Flow;
});
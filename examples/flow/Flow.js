define(function(require){
    var Game   = require("meier/engine/Game");
    var Input  = require("meier/engine/Input");
<<<<<<< HEAD
    var Color  = require("meier/aux/Colors");
    var V2     = require("meier/math/Vec")(2);
=======
    var Colors = require("meier/engine/Colors");
>>>>>>> origin/broken
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
        var tileSize = (storage && storage.size) || 30;
                
        this.fields   = [
            new Field(Color.Red,   tileSize, this.width, this.height),
            new Field(Color.Green, tileSize, this.width, this.height),
            new Field(Color.Blue,  tileSize, this.width, this.height)
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
        
        this.gui.add(this, "createNavigationField").name("Compute Nav Field")
        this.gui.add(this, "toggle").name("Toggle Nav Field")
        
        var folder = this.gui.addFolder("Guidance Field Visibility");
    	folder.add(this, "enableField1").name('Guidance field #1');
    	folder.add(this, "enableField2").name('Guidance field #2');
    	folder.add(this, "enableField3").name('Guidance field #3');
    	folder.add(this, "enableFields").name('Show all');
    	folder.add(this, "enableField0").name('Hide all');
        
        //folder = this.gui.addFolder("Guidance Field Weights");
    	//folder.add(this, "weight0", 0, 1).step(0.01).name('Weight #1');
    	//folder.add(this, "weight1", 0, 1).step(0.01).name('Weight #2');
    	//folder.add(this, "weight2", 0, 1).step(0.01).name('Weight #3');
        this.gui.add(this, "reset").name("Reset")
        
        
        this.createNavigationField();
    }
    
    Flow.prototype.toggle = function() {
        if(this.navigation) {
            this.navigation.visible = !this.navigation.visible;
        }
    };
    
    Flow.prototype.reset = function() {
        localStorage.setItem("flowfields", "");
        window.location.reload();
    };
    
    Flow.prototype.createNavigationField = function(renderer) {
        
        // Remove any existing navigation field
        var isVisible = this.navigation && this.navigation.visible;
        this.navigation && this.navigation.destroy();
        
        // Copy the properties from an existing guidance field
        var navigation = this.navigation = new Field(Color.Purple, this.fields[0].size, this.fields[0].width, this.fields[0].height);
        var fields     = this.fields;
        
        // Enable additional debug rendering
        navigation.isNavigation = true;
        navigation.visible = isVisible;
        
        // Union all guidance fields into one tentative navigation field
        navigation.buckets.forEach(function(column, x) {
            column.forEach(function(bucket, y) {
                fields.forEach(function(field) {
                    bucket.v.addScaled(field.buckets[x][y].v, 1.0);
                });
            });
        });
        
        function IsTraversable(v) {
            // Trivial world bounds checking
            return v.x >= 0 && v.y >= 0 && v.x < navigation.buckets.length && v.y < navigation.buckets[v.x].length;
        }
        
        function GetNeighbours(v) {
            
            // Four cardinal directions
            var candidates = [
                new V2(v.x + 1, v.y + 0),
                new V2(v.x - 1, v.y + 0),
                new V2(v.x + 0, v.y + 1),
                new V2(v.x + 0, v.y - 1)
            ];
            
            return candidates.filter(IsTraversable);
        }
        
        var sink = new V2(4, 4);
        
        var queue = []; 
        
        queue.push(sink);
        
        var n = 0;
        function Dijkstra() {
            var current    = queue.shift();
            var neighbours = GetNeighbours(current);
            
            neighbours.forEach(function(n, i) {
                // Merge into queue
                queue.push(n);
                
                var cost = 1;
                
                n.p = current;           // Back pointer
                n.c = current.c + cost;  // Increment the cost
                ++n.steps;               // Counter for number of visits
            });
            
            // Mark current
            navigation.atIndex(current).fill = "red";
            
            // Mark neighbours
            neighbours.forEach(function(n) {
                navigation.atIndex(n).fill = "yellow";
            });
                        
            // Recursion overflow protection.
            if(n-- < 0) {
                queue.clear();
                return;
            }
            
            // Halt recursion, no more entries available
            if(queue.empty()) {
                console.log("queue empty");
                return;
            }
            
            // Recursion.
            //Dijkstra();
        }
        
        Dijkstra();
        
        this.add(navigation);
    };
    
    Flow.prototype.enableField0 = function() {
        this.showFieds();
    }; 
    
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
        
        this.createNavigationField(renderer);
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
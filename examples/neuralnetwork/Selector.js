define(function(require) {
    var Input     = require("meier/engine/Input");
    var Entity    = require("meier/engine/Entity");
    var Rectangle = require("meier/math/Rectangle");
    var Contains  = require("meier/math/Intersection").PointInRectangle;
    var Letter    = require("meier/math/Math").ToUpperLetter;


    Box.prototype = new Entity();
    function Box(x, y, w, h) {
        Entity.call(this, x, y, w, h);
    }
    
    Box.prototype.draw = function(renderer) {
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.fill(this.fill);
        renderer.stroke(this.stroke, this.border || 1);
        
        renderer.text(Letter(this.id), 0, 0, "black", "center", "middle");
    };


    Selector.prototype = new Entity();
    function Selector(x, y, w, h) {
        Entity.call(this, x, y, w, h);
        
        this.padding = 10; 
        this.rects   = [];
        
        var rectHeight = h - this.padding * 2;
        
        this.stroke = [
            "rgba(255, 0, 0, 1)",
            "rgba(255, 255, 0, 1)",
            "rgba(0, 255, 255, 1)",
            "rgba(0, 255, 0, 1)",
            "rgba(0, 0, 255, 1)",
            "rgba(255, 0, 255, 1)"
        ];
        
        this.fill = this.stroke.map(function(color) {
            return color.substr(0, color.length - 2) + "0.4)";
        });
        
        var rectX = -50;
        for(var i = 0; i < this.numOfClasses(); ++i) {
            var box = new Box(rectX, 0, rectHeight, rectHeight);
            
            box.stroke = this.stroke[i];
            box.fill   = this.fill[i];
            box.id     = i;
            
            rectX += this.padding + rectHeight;
            
            this.add(box);
        }
        
        this.active = box; // The last box is selected per default.
        
        this.enableEvent(Input.LEFT_DOWN, Input.MOUSE_MOVE);
    }
    
    Selector.prototype.idToColor = function(id) {
        
        if(! this.fill[id]) {
            throw new Error("Not a valid id: " + id);
        }
        
        return this.fill[id] || "black";
    };
    
    Selector.prototype.numOfClasses = function() {
        return 5; // Eventually this could be variable.
    };
    
    Selector.prototype.onLeftDown = function(input) {
        var local = this.toLocal(input);
        
        var propegateEvent = true;
        
        // Determine if a box was clicked
        this._entities.forEach(function(entity) {
            if(entity.containsPoint(local)) {
                this.active    = entity;
                propegateEvent = false;
            }
        }.bind(this));
        
        return propegateEvent;
    };
    
    Selector.prototype.onMouseMove = function(input) {
        
    };
    
    Selector.prototype.draw = function(renderer) {
        Entity.prototype.draw.call(this, renderer);
        
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.fill("rgba(0, 0, 0, 0.2)");
        renderer.stroke("black");
        
        renderer.text("Select color: ", this.width * -0.5 + this.padding, 0, "black", "left", "middle");
        
        // Hack, draw it a few times to it appears "bold".
        for(var i = 0; i < 5; ++i) { 
            this.active._draw(renderer);
        }
    };
    
    
    return Selector;
});
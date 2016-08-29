define(function(require) {

    var Input  = require("meier/engine/Input");
    var Keys   = require("meier/engine/Key");
    var Entity = require("meier/engine/Entity");
    var V2     = require("meier/math/Vec")(2);
    var V3     = require("meier/math/Vec")(3);
    var M44    = require("meier/math/Mat")(4, 4);
    
    
    Camera.prototype = new Entity();
    function Camera() {
        Entity.call(this);
        
        this._lockmouse   = true;
        
        this._mouse       = new V2(0, 0);
        this.rotation     = M44.CreateIdentity();
        this._moveSpeed   = 8;
        this._mouseSpeed  = 0.1;
        
        this.orientation  = new V3(-1.71, 0.07, 0);
        this.translation  = new V3(26, -0.5, -2.1);
        this._dt          = 1/16;
    }
    
    /// Called when added to a Game instance
    Camera.prototype.onAdd = function(game) {
        // Register for events
        this.game.input.subscribe(Input.MOUSE_MOVE, this.onMouseMove.bind(this));
        this.game.input.subscribe(Input.KEY_DOWN, this.onKeyDown.bind(this));          
    };
    
    /// Toggle mouse state.
    Camera.prototype.toggleMouse = function() {
        this._lockmouse = ! this._lockmouse;
    };
    
    /// Called when a key is pressed.
    Camera.prototype.onKeyDown = function(input, key) {
        
        // Change mouse state when L is pressed.
        if(key == Keys.L) {
            this._lockmouse = ! this._lockmouse;
            
            // Copy the mouse location
            this._mouse = input.clone();
            
            return true;
        }
        
        return false;
    };
    
    /// Primary update loop.
    Camera.prototype.update = function(dt) {
        this._dt = dt;
        
        var direction = new V3(
            this.input.isKeyDown(Keys.A) + 0 - this.input.isKeyDown(Keys.D), 
            this.input.isKeyDown(Keys.F) + 0 - this.input.isKeyDown(Keys.R), 
            this.input.isKeyDown(Keys.S) + 0 - this.input.isKeyDown(Keys.W)
        );
        
        // Rotate the movement to match the camera's orientation
        this.translation.add(this.rotation.transform(direction.scaleScalar(dt * this._moveSpeed)));
        
        // Renew internal rotation matrix.
        this.rotation = M44.CreateXoZ(-this.orientation.x).
                        product(M44.CreateYoZ(this.orientation.y)).
                        product(M44.CreateXoY(this.orientation.z));
              
        // Statistical and debug reporting          
        this.game.log("Orientation", this.orientation.x.toFixed(2) + ", " + this.orientation.y.toFixed(2) + ", " + this.orientation.z.toFixed(2));      
        this.game.log("Translation", this.translation.x.toFixed(2) + ", " + this.translation.y.toFixed(2) + ", " + this.translation.z.toFixed(2));      
        this.game.log("Mouse Lock (L)", (this._lockmouse ? "on":"off") + "");
    };
    
    /// Asynchronously called when the mouse is moved.
    Camera.prototype.onMouseMove = function(mouse) {
        if( ! this._lockmouse) {
            var delta = this._mouse.clone().subtract(mouse);
        
            // Do not move the mouse the first time. Avoid a sudden jump.
            if(this._mouse.x != 0 && this._mouse.x != 0) {
                this.orientation.add(delta.scaleScalar(this._mouseSpeed * this._dt));
            }
        
            this._mouse   = mouse.clone();
        }
    };
    
    return Camera;
});
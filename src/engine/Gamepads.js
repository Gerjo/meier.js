/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

/// An implementation of how gamepad in code ought to work
define(function(require) {
    var Vector = require("meier/math/Vec")(2);
    
    /// Threshold for "0" on a joystick axis. There is quite some noise.
    var JOYEPSILON = 0.17;
    
    function Controller(index, hub) {
        this._index = index;
        this._hub  = hub;
        
        // Per default not connected.
        this._isConnected = false;
        
        if( ! this._hub._gamepads[this._index]) {
            throw new Error("Gamepad at index " + this._index + " not available.");
        }
        
        var parent = this;
        
        this.previous = {};
        this.previous.a = function() { return 1 === hub._previous[index].buttons[0]; };
    }
    
    Controller.prototype.connected = function() {
        return this._isConnected;
    };
    
    Controller.prototype.index = function() {
        return this._index;
    };
    /// Current state:
    Controller.prototype.a = function() { return 1 === this._hub._gamepads[this._index].buttons[0]; };
    Controller.prototype.b = function() { return 1 === this._hub._gamepads[this._index].buttons[1]; };
    Controller.prototype.x = function() { return 1 === this._hub._gamepads[this._index].buttons[2]; };
    Controller.prototype.y = function() { return 1 === this._hub._gamepads[this._index].buttons[3]; };
    
    Controller.prototype.select = function() { return 1 === this._hub._gamepads[this._index].buttons[8]; };
    Controller.prototype.start  = function() { return 1 === this._hub._gamepads[this._index].buttons[9]; };
    
    Controller.prototype.leftDown  = function() { return 1 === this._hub._gamepads[this._index].buttons[10]; };
    Controller.prototype.rightDown = function() { return 1 === this._hub._gamepads[this._index].buttons[11]; };
    
    Controller.prototype.top    = function() { return 1 === this._hub._gamepads[this._index].buttons[12]; };
    Controller.prototype.bottom = function() { return 1 === this._hub._gamepads[this._index].buttons[13]; };
    Controller.prototype.left   = function() { return 1 === this._hub._gamepads[this._index].buttons[14]; };
    Controller.prototype.right  = function() { return 1 === this._hub._gamepads[this._index].buttons[15]; };
    
    Controller.prototype.leftShoulder  = function() { return 1 === this._hub._gamepads[this._index].buttons[4]; };
    Controller.prototype.rightShoulder = function() { return 1 === this._hub._gamepads[this._index].buttons[5]; };
    Controller.prototype.leftTrigger  = function() { return this._hub._gamepads[this._index].buttons[6]; };
    Controller.prototype.rightTrigger = function() { return this._hub._gamepads[this._index].buttons[7]; };
    
    Controller.prototype.leftJoystick  = function() {
        return new Vector(
            Math.abs(this._hub._gamepads[this._index].axes[0]) > JOYEPSILON ? this._hub._gamepads[this._index].axes[0] : 0,
            Math.abs(this._hub._gamepads[this._index].axes[1]) > JOYEPSILON ? -this._hub._gamepads[this._index].axes[1] : 0    
        ); 
    };
    
    Controller.prototype.rightJoystick  = function() { 
        return new Vector(
            Math.abs(this._hub._gamepads[this._index].axes[2]) > JOYEPSILON ? this._hub._gamepads[this._index].axes[2] : 0,
            Math.abs(this._hub._gamepads[this._index].axes[3]) > JOYEPSILON ? -this._hub._gamepads[this._index].axes[3] : 0    
        ); 
    };
    
    
    /// Current state:
    Controller.prototype.a = function() { return 1 === this._hub._gamepads[this._index].buttons[0]; };
    Controller.prototype.b = function() { return 1 === this._hub._gamepads[this._index].buttons[1]; };
    Controller.prototype.x = function() { return 1 === this._hub._gamepads[this._index].buttons[2]; };
    Controller.prototype.y = function() { return 1 === this._hub._gamepads[this._index].buttons[3]; };
    
    Controller.prototype.select = function() { return 1 === this._hub._gamepads[this._index].buttons[8]; };
    Controller.prototype.start  = function() { return 1 === this._hub._gamepads[this._index].buttons[9]; };
    
    Controller.prototype.leftDown  = function() { return 1 === this._hub._gamepads[this._index].buttons[10]; };
    Controller.prototype.rightDown = function() { return 1 === this._hub._gamepads[this._index].buttons[11]; };
    
    Controller.prototype.top    = function() { return 1 === this._hub._gamepads[this._index].buttons[12]; };
    Controller.prototype.bottom = function() { return 1 === this._hub._gamepads[this._index].buttons[13]; };
    Controller.prototype.left   = function() { return 1 === this._hub._gamepads[this._index].buttons[14]; };
    Controller.prototype.right  = function() { return 1 === this._hub._gamepads[this._index].buttons[15]; };
    
    Controller.prototype.leftShoulder  = function() { return 1 === this._hub._gamepads[this._index].buttons[4]; };
    Controller.prototype.rightShoulder = function() { return 1 === this._hub._gamepads[this._index].buttons[5]; };
    Controller.prototype.leftTrigger  = function() { return this._hub._gamepads[this._index].buttons[6]; };
    Controller.prototype.rightTrigger = function() { return this._hub._gamepads[this._index].buttons[7]; };
    
    // Null object pattern, I suppose? The idea is that the end user doesn't
    // have to test if the controller is connected. It simply returns false
    // for all buttons and exis.
    function DummyInternalController() {
        this.axes    = [0, 0, 0, 0];
        this.buttons = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        
        this.isDummy = "101";
    }
    
    function Gamepad(input) {
        this._input = input;
        
        this._detected    = [];
        this._gamepads    = [];
        this._previous    = []; // Previous gamepad state.
        this._controllers = [];
        
        this._dummy = new DummyInternalController();
        
        for(var i = 0; i < 4; ++i) {
            
            // Placeholder "empty" controller. Better than
            // continiously testing if controllers are connected.
            this._gamepads.push(this._dummy);
            this._previous.push(this._dummy);
            
            // Nothing detected per default:
            this._detected.push(false);
            this._controllers.push(new Controller(i, this));
        }
        
        this._numberConnected = 0;
        
        this.hasSupport = (window.navigator.webkitGamepads || window.navigator.webkitGetGamepads);
    }
    
    /// Shorthand method.
    Gamepad.prototype.get = function(index) {
        return this.getController(index);
    };
    
    Gamepad.prototype.getController = function(index) {
        
        if(index < 0 || index > this._controllers.length) {
            throw new Error("getController, index out of range. Given: " + index);
        }
        
        return this._controllers[index];
    };
    
    Gamepad.prototype.onConnect = function(controller) {
        console.log("Unoverloaded method: controller " + controller.index + " connected.");
    };
    
    Gamepad.prototype.onDisconnect = function(controller) {
        console.log("Unoverloaded method: controller " + controller.index + " disconnected.");
    };
    
    Gamepad.prototype.count = function() {
        return this._numberConnected;
    };
    
    Gamepad.prototype.update = function(dt) {
        
        // Not all browsers are blessed with gamepad support.
        if( ! this.hasSupport) {
            return;
        }
        
        // Re-acquire gamepad state:
        var pads = window.navigator.webkitGamepads || window.navigator.webkitGetGamepads();
        
        this._numberConnected = 0;
        
        // Determine state changes:
        for(var i = 0; i < 4; ++i) {
            
            if(pads[i]) {
                
                // Previous state
                this._previous[i] = this._gamepads[i];
         
                // New state
                this._gamepads[i] = pads[i];
                
                if(this._detected[i] === false) {
                    this._detected[i] = true;
                    this._controllers[i]._isConnected = true;  
                    // Call user defined event:
                    this.onConnect(this._controllers[i]);
                }
            
            } else if( ! pads[i] && this._detected[i] === true) {
                this._detected[i] = false;
                this._controllers[i]._isConnected = false;
                
                // Assign a dummy gamepad
                this._previous[i] = this._dummy;
                this._gamepads[i] = this._dummy;
                
                // Call user defined event
                this.onDisconnect(this._controllers[i]);                
            }
            
            if(pads[i]) {
                ++this._numberConnected;
            }
        }
    };
    
    return Gamepad;
});
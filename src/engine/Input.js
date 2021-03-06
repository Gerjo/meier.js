/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
    var Vector  = require("meier/math/Vec")(2);
    var Key     = require("meier/engine/Key");
    var Gamepads = require("meier/engine/Gamepads");

	TODO("Input.Events to use ENUM");
    Input.Events       = {};
    Input.Events.COUNT = 0;

    // Simulated on tablets.
    Input.LEFT_CLICK  = Input.Events.LEFT_CLICK  = Input.Events.COUNT++;
    Input.LEFT_DOWN   = Input.Events.LEFT_DOWN   = Input.Events.COUNT++;
    Input.LEFT_UP     = Input.Events.LEFT_UP     = Input.Events.COUNT++; 
    Input.MOUSE_MOVE  = Input.Events.MOUSE_MOVE  = Input.Events.COUNT++;
	TODO("Input.MOUSE_ENTER and Input.MOUSE_LEAVE events.");
	
    // Computers only:
    Input.RIGHT_DOWN  = Input.Events.RIGHT_DOWN  = Input.Events.COUNT++;
    Input.RIGHT_UP    = Input.Events.RIGHT_UP    = Input.Events.COUNT++;
    Input.RIGHT_CLICK = Input.Events.RIGHT_CLICK = Input.Events.COUNT++;
    Input.KEY_DOWN    = Input.Events.KEY_DOWN    = Input.Events.COUNT++;
    Input.KEY_UP      = Input.Events.KEY_UP      = Input.Events.COUNT++;

    // Tablets only.
    Input.DOUBLE_TAP  = Input.Events.DOUBLE_TAP  = Input.Events.COUNT++;
	
	function EventIdToDebugName(event) {
		
		for(var k in Input.Events) {
			if(Input.Events.hasOwnProperty(k)) {
				if(Input.Events[k] == event) {
					return k;
				}
			}
		}
		
		return "unknown";
	}

	TODO("Input.Cursor to use ENUM");
    Input.Cursor     = {};
    Input.Cursor.FINGER = "pointer";
    Input.Cursor.DEFAULT = "default";
    Input.Cursor.CROSSHAIR = "crosshair";
    
    Input.Cursor.POINTER = "pointer";
    Input.Cursor.AUTO = "auto";
    Input.Cursor.ALL_SCROLL = "all-scroll";
    Input.Cursor.HELP = "help";
    Input.Cursor.INHERIT = "inherit";
    Input.Cursor.MOVE = "move";
    Input.Cursor.PROGRESS = "progress";
    Input.Cursor.TEXT = "text";
    Input.Cursor.VERTICAL_TEXT = "vertical-text";
    Input.Cursor.WAIT = "wait";
    Input.Cursor.NO_DROP = "no-drop";
    Input.Cursor.NOT_ALLOWED = "not-allowed";
    Input.Cursor.E_RESIZE = "e-resize";
    Input.Cursor.N_RESIZE = "n-resize";
    Input.Cursor.S_RESIZE = "s-resize";
    Input.Cursor.W_RESIZE = "w-resize";
    Input.Cursor.COL_RESIZE = "col-resize";
    Input.Cursor.ROW_RESIZE = "row-resize";
    Input.Cursor.NE_RESIZE = "ne-resize";
    Input.Cursor.NW_RESIZE = "nw-resize";
    Input.Cursor.SE_RESIZE = "se-resize";
    Input.Cursor.SW_RESIZE = "sw-resize";


    function PriorityCallback(priority, callback, eventtype) {
        this.priority  = priority;
        this.callback  = callback;
        this.eventtype = eventtype;
    }

    Input.prototype = new Vector();
    function Input(container, width, height, isTablet) {
        
        // Always center the initial mouse position.
        Vector.call(this, 0, 0);

        this.isTablet     = isTablet;
        this._container   = container;
        this._size        = new Vector(width, height);
        this._keystates   = {};
        this._mouseStates = {};
    
        this.gamepads   = new Gamepads(this);
        
        var body = document.getElementsByTagName("body")[0];
        
        
        // The "body" element cannot capture keystrokes. Use "document" instead.
        var eventContainer = (container.parentNode == body) ? document : container;
        
        //console.log(container.parentNode, body, container.parentNode == body);
        
        // Intialize empty listeners:
        this.listeners = [];
        for(var i = 0; i < Input.Events.COUNT; ++i) {
            this.listeners[i] = [];
        }
        
        // Tested on ipad 1
        if(this.isTablet) {
            var lastTap   = new Vector(Infinity, Infinity);
            var doubleTapDelay  = 200;
        
            var clickTimeoutID  = 0;
            
            
            container.addEventListener('touchstart', function(event) {
                
                event.preventDefault();
                
                // Trigger a move event. Allows the user to
                // update any mouse positions prior to the 
                // button event.
                if(this.updatePosition(event) === true) {
                    this.trigger(Input.Events.MOUSE_MOVE, event);            
                }
                
                this.trigger(Input.Events.LEFT_DOWN, event);
            
                return false;
            }.bind(this), false);
        
            container.addEventListener('touchmove', function(event) {
                event.preventDefault();
            
                if(this.updatePosition(event) === true) {
                    this.trigger(Input.Events.MOUSE_MOVE, event);            
                }
            
                this.trigger(Input.Events.MOUSE_MOVE, event);
            
                return false;
            }.bind(this), false);
        
            container.addEventListener('touchend', function(event) {
                event.preventDefault();
            
                // Double tap requires a small sleep. Only sleep when there are
                // actual double tab listeners.
                if(this.listeners[Input.Events.DOUBLE_TAP].length > 0) {
                    this.trigger(Input.Events.LEFT_UP, event);
            
                    if(clickTimeoutID != 0) {
                        this.updatePosition(event);
                        this.trigger(Input.Events.DOUBLE_TAP, event, lastTap);
                
                        clearTimeout(timeoutID);
                        clickTimeoutID = 0;
                    } else {
                
                        // Schedule timer:
                        clickTimeoutID = setTimeout(function() {
                            this.trigger(Input.Events.LEFT_CLICK, event);
                
                            // Event played, clear ID:
                            clickTimeoutID = 0;
                        }.bind(this), doubleTapDelay);
                    }
            
                    // Update last location:
                    lastTap.x = this._[0];
                    lastTap.y = this._[1];
                
                } else {
                    // No double-tap listeres, trigger event right away.
                    this.trigger(Input.Events.LEFT_CLICK, event);
                    this.trigger(Input.Events.LEFT_UP, event);
                }
            
                return false;
            }.bind(this), false);
    
    
            // Don't go to the desktop section.
            return;
        }
    
        // For IE? http://www.java2s.com/Tutorial/JavaScript/0280__Document/documentcaptureEvents.htm
        if(document.layers) {
            document.captureEvents(Event.MOUSEDOWN | Event.CLICK);
            //document.captureEvents(Event.MOUSEDOWN | Event.CLICK | Event.KEYDOWN | Event.KEYPRESS | Event.KEYUP);
        }
    
        // Browser sensitive logic. May need a rework.
        document.onmousemove = function(event) {
            event = event || window.event;
            if(this.updatePosition(event) === true) {
                this.trigger(Input.Events.MOUSE_MOVE, event);            
            }
        }.bind(this);    
            
        container.onclick = function(event) {
            event = event || window.event;
            if(event.which === 3) {
                this.trigger(Input.Events.RIGHT_CLICK, event);
            } else if(event.which === 1) {
                this.trigger(Input.Events.LEFT_CLICK, event);
            }
        }.bind(this);
    
    
        // Called on mouse down!
        container.oncontextmenu = function(event) {
            event = event || window.event;
            event.preventDefault();       
            return false;
        }.bind(this);
    
        container.onmousedown = function(event) {
            event = event || window.event;
            if(event.which === 3) {
                this.trigger(Input.Events.RIGHT_DOWN, event);
            } else if(event.which === 1) {
                this.trigger(Input.Events.LEFT_DOWN, event);
            }
            
            this._mouseStates[event.which] = true;
            
        }.bind(this);
    
        container.onmouseup = function(event) {
            event = event || window.event;
            if(event.which === 3) {
                this.trigger(Input.Events.RIGHT_UP, event);
            
                this.trigger(Input.Events.RIGHT_CLICK, event);
            
            } else if(event.which === 1) {
                this.trigger(Input.Events.LEFT_UP, event);
            }
            
            this._mouseStates[event.which] = false;
        }.bind(this);
        
		// Capturing on body level solves "focus" issues.
		var body = document.getElementsByTagName("body")[0];
		
        body.onkeydown = function(event) {
            event = event || window.event;
			            
            // GUI components take priority.
            if(event.srcElement && event.srcElement.nodeName.toLowerCase() == "input") {
                return true;
            } else if(event.target && event.target.nodeName.toLowerCase() == "input") {
                return true;
            }
            
            this._keystates[event.keyCode] = true;
            this.triggerKeyboard(Input.Events.KEY_DOWN, event);

            // This may block all other HTML inputfields.
            event.preventDefault();
        }.bind(this);
    
        body.onkeyup = function(event) {
            event = event || window.event;
           
            // GUI components take priority.
            if(event.srcElement && event.srcElement.nodeName.toLowerCase() == "input") {
                return true;
            } else if(event.target && event.target.nodeName.toLowerCase() == "input") {
                return true;
            }
           
            this._keystates[event.keyCode] = false;
            this.triggerKeyboard(Input.Events.KEY_UP, event);
            
            // This may block all other HTML inputfields.
            event.preventDefault();
        }.bind(this);
    }

    Input.prototype.update = function(dt) {
        // The gamepad does some polling.
        this.gamepads.update(dt);
        
        // Restore default cursor, it's up to the application
        // to repeatedly set a different state.
        this.cursor(Input.Cursor.DEFAULT);
    };

    Input.prototype.isLeftDown = function() {
        return this._mouseStates[1] === true;
    };
    
    Input.prototype.isRightDown = function() {
        return this._mouseStates[3] === true;
    };

    Input.prototype.cursor = function(cursortype) {
        this._container.style.cursor = cursortype;
    };

    Input.prototype.updatePosition = function(event) {
		
		var left = this._container.offsetLeft;
		var top  = this._container.offsetTop;
		
		
		// Compute absolute offset. 'offsetLeft' property is computed to the nearest
		// absolute parent. This logic finds those parents and adds their offset.
		// TODO: contemplate if this should be run just once.
		for(var node = this._container.parentNode; node; node = node.parentNode) {

			// Early out. Anything higher than body doesn't have sensible computed style.
			if(node.nodeName == "BODY") {
				break;
			}
			
			// Access style as defined in external CSS files.
			var style = window.getComputedStyle(node);
			
			if(node.style && style.position == "absolute") {
				//console.log("Adding: " + left + " + " + node.offsetLeft + " = " + (left + node.offsetLeft));	

				left += node.offsetLeft;
				top  += node.offsetTop;
			}
		}
		
        var x = 0, y = 0;
	
        // Chrome:
        if(event.x) {
            x = event.x - left + window.pageXOffset;
            y = event.y - top  + window.pageYOffset;
    
        // Firefox:
        } else if(event.pageX) {
            x = event.pageX - left;
            y = event.pageY - top;
    
	    // Internet Explorer:
        } else if(event.clientX) {
            x = event.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft) - left;
            y = event.clientY + (document.body.scrollTop || document.documentElement.scrollTop) - top;
    
        // Android 2.3 browser:
        } else if(event.changedTouches && event.changedTouches[0] && event.changedTouches[0].pageX) {
            x = event.changedTouches[0].pageX - left;
            y = event.changedTouches[0].pageY - top;
    
        // Either an error, or a coordinate was 0, which evaluates to false.
        } else {
            //alert("Input::updatePosition Unable to determine X and Y coordinates.");
            //console.error("Input::updatePosition Unable to determine X and Y coordinates.");
        }
        
		// Align click nicer with cursor.
        x -= 2;
        y -= 2;
    
        // Only count inside world bounds:
        if(x >= 0 && y >= 0 && x <= this._size.x && y <= this._size.y) {
        
            // Transform to screen coordinates:
            this._[0] = Math.round(x - this._size.x * 0.5);
            this._[1] = Math.round((this._size.y * 0.5) - y);
    
            // Trigger MOUSE_MOVE event, click is onscreen.
            return true;
        }
        
        // Don't trigger MOUSE_MOVE event, click coordinate is off screen.
        return false;
    };

    Input.prototype.trigger = function(eventtype, event, location) {
        this.listeners[eventtype].every(function (priorityCallback) {
            return false !== priorityCallback.callback(this);
        }.bind(this));
    };


	TODO("Use event.code instead of event.keyCode for cross platform support");
    Input.prototype.triggerKeyboard = function(eventtype, event) {
        this.listeners[eventtype].every(function (priorityCallback) {
            
            // Returns a known key, or creates a new one.
            var key = Key.fromCode(event.keyCode);
            
            // We're not passing "event" itself as it may contain
            // browser specific-data that we don't want people to 
            // use.
            return priorityCallback.callback(
                this,
                key,
				{
					// Wrap in custom object. 
					ctrlKey:  event.ctrlKey,
					metaKey:  event.metaKey,
					shiftKey: event.shiftKey
					
				}
            );
        }.bind(this));
    };

    // Retrieve the current highest priority of an eventtype:
    Input.prototype.highest = function(eventtype) {
    
        if(this.listeners[eventtype].length === 0) {
            return 0;
        }
		
		// Increment previous highest priority.
        return this.listeners[eventtype][0].priority + 1;
    };

    /// Event type, see enum {Mouse.Events}.
    /// Call back, return false to halt event bubble, e.g., menu blocks game.
    /// priority, higher gets called first. Defaults to highest.
    Input.prototype.subscribe = function(eventtype, callback, priority) {
    
        if(eventtype > Input.Events.COUNT || eventtype < 0 || eventtype === null || eventtype === undefined) {
            throw new Error("Unknown mouse event.");
        }

        priority = priority || this.highest(eventtype);
    
        var callbackBundle = new PriorityCallback(priority, callback, eventtype);
        
        this.listeners[eventtype].push(callbackBundle);
    
        // Re-sort, descending:
        this.listeners[eventtype].sort(function (a, b) {
            return b.priority - a.priority;
        });
    
        return callbackBundle;
    };
    
    /// Untested...
    Input.prototype.unsubscribe = function(callbackBundle) {
        
        if(callbackBundle.eventtype > Input.Events.COUNT) {
            throw new Error("Cannot unsubscribe unknown event: " + callbackBundle + " are you using a handle? (callbackbundle)");
        }
    
        var removed = 0;
    
        this.listeners[callbackBundle.eventtype] = this.listeners[callbackBundle.eventtype].filter(function(listener) {
            if(listener == callbackBundle) {
                ++removed;
                return false;
            }
                
            return true;
        });

        //console.log("Removed ", removed, "event listeners.");
        
        return (removed > 0);
    };
    
    Input.prototype.countListeners = function() {
        return this.listeners.reduce(function(sum, item) {
            return sum + item.length;
        }, 0);
    };


    /// Determine if a key is down. While this may work, you
    /// risk missing events as you can only sample as frequently
    /// as your FPS allows. Use events instead - and never
    /// miss a key event.
    Input.prototype.isKeyDown = function(key) {

        // Assume the string hash representation of a key is used.
        if(typeof key === "string") {
            // Find the key by it's string hash representation:
            var k = Key._lookupString[key];
            
            // It's found!
            if(k instanceof Key) {
                key = k;
            } else {
                // Invalid key, mostlikely.
                return false;
            }
        }

        if(this._keystates[key.code] === true) {
            return true;
        }
        
        return false;

    };

    return Input;
});
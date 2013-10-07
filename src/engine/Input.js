

Input.Events = {};
Input.Events.COUNT = 0;

// Simulated on tablets.
Input.Events.LEFT_CLICK  = Input.Events.COUNT++;
Input.Events.LEFT_DOWN   = Input.Events.COUNT++;
Input.Events.LEFT_UP     = Input.Events.COUNT++; 
Input.Events.MOUSE_MOVE  = Input.Events.COUNT++;

// Computers only:
Input.Events.RIGHT_DOWN  = Input.Events.COUNT++;
Input.Events.RIGHT_UP    = Input.Events.COUNT++;
Input.Events.RIGHT_CLICK = Input.Events.COUNT++;

// Tablets only.
Input.Events.DOUBLE_TAP = Input.Events.COUNT++;


function PriorityCallback(priority, callback) {
    this.priority = priority;
    this.callback = callback;
}

Input.prototype = new Point();
function Input(container, width, height, isTablet) {
    Point.call(this, width * 0.5, height * 0.5);
    
    this.isTablet  = isTablet;
    this.container = container;
    this.size      = new Size(width, height);
    
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
        
        container.ontouchstart = function(event) {
            event.preventDefault();
            
            this.updatePosition(event);
            
            this.trigger(Input.Events.LEFT_DOWN, event);
            
            return false;
        }.bind(this);
        
        container.ontouchmove = function(event) {
            event.preventDefault();
            
            if(this.updatePosition(event) === true) {
                this.trigger(Input.Events.MOUSE_MOVE, event);            
            }
            
            this.trigger(Input.Events.MOUSE_MOVE, event);
            
            return false;
        }.bind(this)
        
        container.ontouchend = function(event) {
            event.preventDefault();
            
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
            lastTap.x = this.x;
            lastTap.y = this.y;
            
            return false;
        }.bind(this);
    
    
        // Don't go to the desktop section.
        return;
    }
    
    // For IE?
    if(document.layers) {
        document.captureEvents(Event.MOUSEDOWN || Event.CLICK);
    }
    
    // Browser sensitive logic. May need a rework.
    document.onmousemove = function(event) {
        if(this.updatePosition(event) === true) {
            this.trigger(Input.Events.MOUSE_MOVE, event);            
        }
    }.bind(this);    
    
    container.onclick = function(event) {
        if(event.which === 3) {
            this.trigger(Input.Events.RIGHT_CLICK, event);
        } else if(event.which === 1) {
            this.trigger(Input.Events.LEFT_CLICK, event);
        }
    }.bind(this);
    
    
    // Called on mouse down!
    container.oncontextmenu = function(event) {
        event.preventDefault();       
        return false;
    }.bind(this);
    
    container.onmousedown = function(event) {
        if(event.which === 3) {
            this.trigger(Input.Events.RIGHT_DOWN, event);
        } else if(event.which === 1) {
            this.trigger(Input.Events.LEFT_DOWN, event);
        }
    }.bind(this);
    
    container.onmouseup = function(event) {
        if(event.which === 3) {
            this.trigger(Input.Events.RIGHT_UP, event);
            
            this.trigger(Input.Events.RIGHT_CLICK, event);
            
        } else if(event.which === 1) {
            this.trigger(Input.Events.LEFT_UP, event);
        }
    }.bind(this);
}

Input.prototype.updatePosition = function(event) {
    var x, y;
   
    // Chrome:
    if(event.x) {
        x = event.x - this.container.offsetLeft + window.pageXOffset;
        y = event.y - this.container.offsetTop  + window.pageYOffset;
    
    // Firefox:
    } else if(event.pageX) {
        x = event.pageX - this.container.offsetLeft;
        y = event.pageY - this.container.offsetTop;
    
    // Internet Explorer: (untested!)
    } else if(event.clientX) {
        x = event.clientX + document.body.scrollLeft - this.container.offsetLeft;
        y = event.clientY + document.body.scrollTop - this.container.offsetTop;
    } 
    
    // Only count inside world bounds:
    if(x >= 0 && y >= 0 && x <= this.size.w && y <= this.size.h) {
        
        // Transform to screen coordinates:
        this.x = x - this.size.w * 0.5;
        this.y = (this.size.h * 0.5) - y;
    
        // Trigger MOUSE_MOVE event:
        return true;
    }
        
    // Don't trigger MOUSE_MOVE event:
    return false;
};

Input.prototype.trigger = function(eventtype, event, location) {
    
    // Produces a fair amount of spam in the console:
    /*if(eventtype != Input.Events.MOUSE_MOVE) {
        for(var k in Input.Events) {
            if(Input.Events[k] == eventtype) {
                console.log("Triggering: " + this.listeners[eventtype].length  + " x [" + k + "]");
                break;
            }
        }
    }*/
    
    this.listeners[eventtype].every(function (priorityCallback) {
        return priorityCallback.callback(location || this);
    }.bind(this));
};

// Retrieve the current highest priority of an eventtype:
Input.prototype.highest = function(eventtype) {
    
    if(this.listeners[eventtype].length === 0) {
        return 0;
    }
    
    return this.listeners[eventtype][this.listeners[eventtype].length - 1].priority;
};

/// Event type, see enum {Input.Events}.
/// Call back, return false to halt event bubble, e.g., menu blocks game.
/// priority, higher gets called first. Defaults to highest.
Input.prototype.subscribe = function(eventtype, callback, priority) {
    
    if(isNaN(eventtype) || eventtype > Input.Events.COUNT) {
        throw new Error("Unknown mouse event. Have a look at the Input.Events enum.");
    }
    
    priority = priority || this.highest(eventtype);
    
    
    this.listeners[eventtype].push(new PriorityCallback(priority, callback));
    
    // Re-sort, descending:
    this.listeners[eventtype].sort(function (a, b) {
        return b.priority - a.priority;
    });
    
};
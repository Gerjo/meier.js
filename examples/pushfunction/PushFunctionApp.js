PushFunctionApp.prototype = new Game();

function PushFunctionApp(container) {    
    // Call super class' constructor:
    Game.apply(this, arguments);
    
    this.stats.show(true);
    this.stats.setColor("black");
    this.setFps(30);
    
    // To contain all polygon coordinates:
    this.coordinates = [];
    

    // Center-of-mass:
    this.center = new Point(150, 0);
    
    // Some initial coordinates:
    this.coordinates.push(
        new Point(-50, -30).add(this.center),
        new Point(50, -35).add(this.center),
        new Point(40, 40).add(this.center),
        new Point(-40, 40).add(this.center)
    );


    // The generated confex full:
    this.hull = [];

    // Radius of a coordinate:
    this.radius = 3;
    
    // Edit radius could be larger/smaller.
    this.editRadius = this.radius * 1;
    
    // Radius of center-of-mass:
    this.massRadius = 5;
    
    // The push function, will be automatically generated.
    this.p = null;

    // The center-of-mass and mouse are identical. Used
    // by drag-drop logic.
    this.trackMouse = false;

    // Place or delete coordinates, event driven:
    this.input.subscribe(Input.Events.LEFT_CLICK, function(mouse) {
        
        // Not allowed to place vertices under center-of-mass:
        if(this.input.distance(this.center) < this.massRadius * 2) {
            return true;
        }
        
        // Remove coordinates under the mouse:
        var r = this.coordinates.filter(function(coordinate) {
            return this.input.distance(coordinate) > this.editRadius * 2;
        }.bind(this));
        
        // Something was removed, update the coordinates.
        if(r.length != this.coordinates.length) {
            this.coordinates = r;
            
        // Nothing removed, place a new coordinate:
        } else {
            this.coordinates.push(mouse.clone());
        }
        
        this.updateInternals();
        
    }.bind(this));
    
    this.input.subscribe(Input.Events.LEFT_DOWN, function(mouse) {
        this.trackMouse = true;
    }.bind(this));
    
    this.input.subscribe(Input.Events.LEFT_UP, function(mouse) {
        this.trackMouse = false;
    }.bind(this));
    
    this.input.subscribe(Input.Events.MOUSE_MOVE, function(mouse) {
        if(this.trackMouse) {
            this.center = mouse.clone();
            this.updateInternals();
        }
    }.bind(this));
    
    // Initial internals:
    this.updateInternals();    
    
}

PushFunctionApp.prototype.updateInternals = function() {
    // Find a new convex hull:
    this.hull = PolyonGiftWrap(this.coordinates);
    
    // The push function expect all vertices relative to
    // the center-of-mass. We counter translate in order
    // todo so.
    var adjusted = this.hull.map(function(coordinate) {
        return coordinate.clone().subtract(this.center);
    }.bind(this));
    
    // A new push function:
    this.f = CreatePushFunction(adjusted);
};

PushFunctionApp.prototype.draw = function(renderer) {
    renderer.clear();
    
    var smallfont = "10px monospace";
    
    // Let's use HTML for this.
    //renderer.text("Realtime push function calculator.", -this.hw, this.hh, "black", "left", "top");
    renderer.text(" - Click anywhere to place or delete vertices;", -this.hw, this.hh - 10, "black", "left", "top", smallfont);
    renderer.text(" - Drop-and-drop the center-of-mass.", -this.hw, this.hh - 30, "black", "left", "top", smallfont);
    
    if(this.f.isDegenerate === true) {
        renderer.text("Something broke internally.", this.hw - 10, -this.hh + 40, "red", "right", "bottom", smallfont);
        renderer.text("Floating point math fail or a weird center-of-mass.", this.hw - 10, -this.hh + 25, "red", "right", "bottom", smallfont);
        renderer.text("Sorry.", this.hw - 10, -this.hh + 10, "red", "right", "bottom", smallfont);
    }
    
    // Each coordinate:
    this.coordinates.forEach(function(coordinate) {
        var color  = "black";
        
        // Indicate the mouse is hovering the coordinate:
        if(this.input.distance(coordinate) < this.editRadius * 2) {
            color = "red";
        }
        
        renderer.begin();
        renderer.circle(coordinate, this.radius);
        renderer.fill(color);
        
    }.bind(this));
    
    // A tooltip, of sorts:
    if(this.input.distance(this.center) < this.massRadius * 2 && !this.trackMouse) {
        renderer.text("Drag me!", this.center.x, this.center.y);
    }
    
    
    // Convex hull:
    renderer.begin();
    renderer.polygon(this.hull);
    renderer.stroke("rgba(0, 0, 0, 0.5)");
    renderer.fill("rgba(0, 0, 0, 0.3)");
    
    // Center-of-mass:
    renderer.begin();
    renderer.circle(this.center, this.massRadius);
    renderer.text("center-of-mass", this.center.x, this.center.y + 10, "black", "center", "bottom", "9px monospace");
    renderer.fill("black");
    renderer.stroke("red", 2);
    
    
    // Translate the whole canvas, the function is always
    // drawn from the origin.
    renderer.save();
    renderer.translate(-370, -270);
    this.drawPushFunction(renderer);
    renderer.restore();
};

PushFunctionApp.prototype.drawPushFunction = function(renderer) {

    var s = 40;
    var thickness = 4;
    
    renderer.begin();
    renderer.rectangle(-35, 30 + s * Math.TwoPI, s * Math.TwoPI + 60, s * Math.TwoPI + 60);
    renderer.fill("rgba(0, 0, 0, 0.1)");
    
    renderer.text("Push function visualized", s * Math.PI, s * Math.TwoPI + 10, "black", "center", "bottom");

    // Diagonal line:
    renderer.begin();
    renderer.dashed(0, 0, Math.TwoPI * s, Math.TwoPI * s, 4);
    renderer.stroke("grey", 2);

    for(var i = 0; i < this.f.bounds.length; ++i) {
        var a = this.f.bounds[i].a;
        var b = this.f.bounds[i].b;
        var n = this.f.bounds[i].n;
        var la = DeltaRelativeRadians(this.f.bounds[i].n, this.f.bounds[i].a);
        var lb = DeltaRelativeRadians(this.f.bounds[i].n, this.f.bounds[i].b);

        var x = n * s;
        var y = i * 10;
    
        var y = ToAbsoluteRadians(n) * s;
    
        
        var line = new Line(
            Math.min(x, x + s * la, x + s * lb), y, Math.max(x, x + s * la, x + s * lb), y
        );
    
        renderer.begin().line(
            Math.max(0, line.a.x),
            line.a.y,
            Math.max(0, line.b.x),
            line.b.y
        ).stroke("black", thickness);
    
        if(line.a.x > 0) {
            renderer.begin();
            renderer.dashed(line.a.x, 0, line.a.x, Math.TwoPI * s, 10);
            renderer.stroke("rgba(0,0,0,0.4)");
        } else {
            renderer.begin();
            renderer.dashed(Math.TwoPI * s + line.a.x, 0, Math.TwoPI * s + line.a.x, Math.TwoPI * s, 10);
            renderer.stroke("rgba(0,0,0,0.4)");
        
            // vert line
            /*renderer.begin();
            renderer.dashed(  0, 
                            Math.TwoPI * s + line.a.x, 
                            Math.TwoPI * s + line.a.x,
                            Math.TwoPI * s + line.a.x
                            );
            renderer.stroke("grey");*/
        }
    
        // vert line
        /*renderer.begin();
        renderer.dashed(  0, 
                        Math.max(0, line.b.x), 
                        Math.max(0, line.b.x),
                        Math.max(0, line.b.x)
                        );
        renderer.stroke("grey)");*/
    
        // Both bounds off-screen:    
        if(line.a.x < 0 && line.b.x < 0) {    
            renderer.begin().line(
                Math.TwoPI * s + line.b.x,
                line.a.y,
                Math.TwoPI * s + line.a.x,
                line.b.y
            ).stroke("black", thickness);
        
        // One end off-screen:
        } else if(line.a.x < 0) {
            renderer.begin().line(
                Math.TwoPI * s,
                line.a.y,
                Math.TwoPI * s + line.a.x,
                line.b.y
            ).stroke("black", thickness);
        } 
    }

    // Axis
    renderer.begin();
    renderer.line(0, 0, Math.TwoPI * s, 0);
    renderer.line(0, 0, 0,  Math.TwoPI * s);
    renderer.stroke("black", 3);

    // Labels for x-axis:
    renderer.text("0π", 0, 0, "black", "left", "top");
    renderer.text("1π", Math.PI * s, 0, "black", "center", "top");
    renderer.text("2π", Math.TwoPI * s, 0, "black", "right", "top");

    // Labels for y-axis:
    renderer.text("0π", -5, 0, "black", "right", "bottom");
    renderer.text("1π", -5, Math.PI * s, "black", "right", "middle");
    renderer.text("2π", -5, Math.TwoPI * s, "black", "right", "middle");
    
    // Label the axis:
    renderer.text("p(θ)", 5, Math.TwoPI * s + 18, "black", "right", "middle")
    renderer.text("θ", Math.TwoPI * s + 18, 0, "black", "right", "top")
};


PushFunctionApp.prototype.update = function(dt) {
    
};

PushFunctionApp.prototype = new Game();

function PushFunctionApp(container) {    
    // Call super class' constructor:
    Game.apply(this, arguments);
    
    this.stats.show(true);
    this.stats.setColor("black");
    this.setFps(30);
    
    // To contain all polygon coordinates:
    this.coordinates = [];
    
    // Some initial coordinates:
    this.coordinates.push(
        new Point(0, 0),
        new Point(10, 10),
        new Point(-10, 10)
    );

    // The generated confex full:
    this.hull = [];

    // Radius of a coordinate:
    this.radius = 3;
    this.editRadius = this.radius * 1;

    // Place or delete coordinates, event driven:
    this.input.subscribe(Input.Events.LEFT_CLICK, function(mouse) {
        
        var r = this.coordinates.filter(function(coordinate) {
            return this.input.distance(coordinate) > this.editRadius * 2;
        }.bind(this));
        
        // Some thing was removed:
        if(r.length != this.coordinates.length) {
            this.coordinates = r;
            
        // Noting removed, place a coordinate:
        } else {
            this.coordinates.push(mouse.clone());
        }
        
        // Update the hull accordingly:
        this.hull = PolyonGiftWrap(this.coordinates);
        
    }.bind(this));
    
    // Initial hull:
    this.hull = PolyonGiftWrap(this.coordinates);
}





PushFunctionApp.prototype.draw = function(renderer) {
    renderer.clear();
    
    this.coordinates.forEach(function(coordinate) {
        var color  = "black";
        
        if(this.input.distance(coordinate) < this.editRadius * 2) {
            color = "red";
        }
        
        renderer.begin();
        renderer.circle(coordinate, this.radius);
        renderer.fill(color);
        
    }.bind(this));
    
    renderer.begin();
    renderer.polygon(this.hull);
    renderer.stroke("rgba(0, 0, 0, 0.5)");
    renderer.fill("rgba(0, 0, 0, 0.3)");
    
};


PushFunctionApp.prototype.update = function(dt) {
    
};


HelloWorld.prototype = new Game();

function HelloWorld(container) {
    // Call super class' constructor:
    Game.apply(this, arguments);
    
    this.stats.show(true);
    this.stats.setColor("white");
    this.setFps(30);
    
    // Game objects, entities, gameentities, components
    // actors, sprites, composites, objects, ...
    // pick your name.
    this.actors = [];
    
    this.actors.push(new Actor(this));
    
    this.background = new Texture("hdpattern.jpg");
}

HelloWorld.prototype.update = function(dt) {
    
    // Update loop:
    for(var i = 0; i < this.actors.length; ++i) {
        this.actors[i].update(dt);
    }
    
};

HelloWorld.prototype.draw = function(renderer) {
    
    // Fill background with texture:
    renderer.clearTexture(this.background);

    // Render loop:
    for(var i = 0; i < this.actors.length; ++i) {
        this.actors[i].draw(renderer);
    }
    
};


////////////////////////////////
function Actor(game) {
    
    // Default constructor, do nothing.
    if( ! game) {
        return;
    }
    
    this.game     = game;
    this.rotation = 0;
    this.width    = 100;
    this.height   = 100;
    this.position = new Point(100, 100);
    this.burger   = new Texture("burger.png");
    this.fries    = new Texture("fries.png"); 
    
    this.sometext = "nomnomnom";
    this.type     = 0;
        
    game.input.subscribe(Input.Events.LEFT_CLICK, function (input) {
        
        // This is a click anywhere on the screen, make sure it's
        // on this entity too: (we could take rotation into)
        // account as well)
        
        if(input.x > this.position.x && input.y > this.position.y &&
            input.x < this.position.x + this.width && 
            input.y < this.position.y + this.height
        ) {            
            this.type = 1 - this.type;
            
        }
                
    }.bind(this));
    
    game.input.subscribe(Input.Events.MOUSE_MOVE, function (input) {
        this.sometext = input.x + "x" + input.y;   
    }.bind(this));
}

Actor.prototype.update = function(dt) {
    this.position.x += 5 * dt;
    this.rotation += 0.5 * dt;
};

Actor.prototype.draw = function(renderer) {
    var hh = this.height * 0.5;
    var hw = this.width * 0.5;
    
    var texture;
    
    // Determine what we are:
    if(this.type == 1) {
        this.game.stats.log("Type", "Burger");
        texture = this.burger;
    } else {
        this.game.stats.log("Type", "Fries");
        texture = this.fries;
    }
    
    
    // Rotate about center, this is a bit involved:
    renderer.translate(this.position.x + hw, this.position.y + hh);
    renderer.rotate(this.rotation);
    
    renderer.texture(texture, this.width * -0.5, this.height * -0.5, this.width, this.height);
    renderer.text(this.sometext, 0, 0);
    
    // Restore the canvas:
    renderer.rotate(-this.rotation);
    renderer.translate(-(this.position.x + hh), -(this.position.y + hw));
};
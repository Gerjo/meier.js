
function Gunner(game)
{
	this.game = game;
	this.texture = new Texture("images/gunner.png");
	this.speed = 300;
	
	this.position = new Vector(0,0);
	this.rotation = Math.PI;
	this.movement = new Vector(0,0);
	this.keyState = {};

	this.addInputEvents();
	
}

Gunner.prototype.addInputEvents = function() {
	
	this.game.input.subscribe(Input.Events.LEFT_DOWN,
		function(keycode, character) { 
			var projectile = new Projectile(this.position, -this.rotation);
			this.game.projectiles.push(projectile);
		}.bind(this)
	);
	
	this.game.input.subscribe(Input.Events.KEY_DOWN,
		function(keycode, character) { 
			this.keyState[character.toUpperCase()] = true;
		}.bind(this)
	);
	
	this.game.input.subscribe(Input.Events.KEY_UP,
		function(keycode, character) { 
			this.keyState[character.toUpperCase()] = false;
		}.bind(this)
	);
}

Gunner.prototype.update = function(dt)
{
	this.movement.x = 0;
	this.movement.y = 0;
	if(this.keyState.W) this.movement.y = this.speed;
	if(this.keyState.S) this.movement.y = -this.speed;
	if(this.keyState.A) this.movement.x = -this.speed;
	if(this.keyState.D) this.movement.x = this.speed;
	
	this.position.add(this.movement.scaleScalar(dt));
	
	//rotate gunner
	var angle = this.game.input.clone().subtract(this.position).angle() - Math.HalfPI;
	this.rotation = -angle;
};

Gunner.prototype.draw = function(r)
{
    r.save();
    
    // Transformation calls:
    r.translate(this.position.x, this.position.y);
    r.rotate(this.rotation);
    
    // Draw calls:
    //r.texture(texture, this.width * -0.5, this.height * 0.5, this.width, this.height);
    r.texture(this.texture, 0, 0);
	
    // Restore the translation/rotation of the canvas:
    r.restore();
};
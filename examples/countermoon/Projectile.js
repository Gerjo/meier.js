
function Projectile(position, angle) {
    
    this.position = position.clone();
    this.velocity = Vector.CreateAngular(angle + Math.HalfPI).scaleScalar(3);
    
    this.timer = new Stopwatch();
}

Projectile.prototype.isAlive = function() {
    return this.timer.peek() < 3000;
};

Projectile.prototype.update = function(dt) {
    
    this.position.add(this.velocity);
    
};

Projectile.prototype.draw = function(r) {
    
    r.begin();
    r.circle(this.position,10);
    r.fill("hotpink");
    
};
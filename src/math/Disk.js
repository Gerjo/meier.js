
/// center [x, y] and radius [r]
/// (x - a)^2 + (y - b)^2 = r^2
function Disk(x, y, r) {
    
    if(x instanceof Vector) {
        this.position = x.clone();
        this.radius   = y;
    } else {
        this.position = new Vector(x, y);
        this.radius   = r;
    }
}
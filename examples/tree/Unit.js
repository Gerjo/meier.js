define(function(require) {
    var Entity = require("meier/engine/Entity");
    
    Unit.prototype = new Entity();
    function Unit(x, y) {
        Entity.call(this, x, y, 10, 10);
    }
    
    Unit.prototype.update = function(dt) {
        this.position = this.input.clone();
    };
    
    Unit.prototype.draw = function(renderer) {
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.fill("black");
    };
    
    return Unit;
});
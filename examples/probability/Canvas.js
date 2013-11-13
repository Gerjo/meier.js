define(function(require) {
    var Entity = require("meier/engine/Entity");
    var Random = require("meier/math/Random");
    
    Canvas.prototype = new Entity();
    
    function Canvas(x, y, w, h, context) {
        Entity.call(this, x, y, w, h);

        this.image = context.createImageData(this.width, this.height);
        
        
        for(var i = 0; i < this.image.data.length; i += 4) {
            this.image.data[i + 0] = 0;
            this.image.data[i + 1] = 0;
            this.image.data[i + 2] = 0;
            this.image.data[i + 3] = 0;
        }
        
        this.sum   = 0;
        this.count = 0;
    }
    
    Canvas.prototype.pixel = function(num) {
        this.sum += num;
        ++this.count;
        
        var i = num * 4;
        this.image.data[i + 0] = 0;
        this.image.data[i + 1] = 0;
        this.image.data[i + 2] = 0;
        this.image.data[i + 3] = 255;
        
        //console.log(num);
    };
    
    Canvas.prototype.update = function(dt) {
        for(var i = 0, f; i < 100; ++i) {
            f = Math.random() + Math.random() - Math.random();// / Math.random();
            
            this.pixel(Math.round(f * this.width * this.height));
            //this.pixel(Math.round(Random.Range(0, this.width * this.height)));
        }
    };
    
    Canvas.prototype.draw = function(renderer) {
        renderer.context.putImageData(this.image, 
            this.game.hw + this.position.x - this.width * 0.5, 
            this.game.hh + this.position.y - this.height * 0.5
        );
    };
    
    return Canvas;
});
define(function(require) {
    var Entity = require("meier/engine/Entity");
    var Sprite = require("meier/prefab/Sprite");
    
    Elements.prototype = new Entity();
    function Elements() {
        Entity.call(this);
        
        this.maan  = new Sprite("images/element_maan.png");
        this.regen = new Sprite("images/element_regen.png");
        this.zon   = new Sprite("images/element_zon.png");
        this.lucht = new Sprite("images/element_lucht.png");
        
        this.maan.position.x = -150;
        this.maan.position.y = 100;
        
        this.regen.position.x = -102;
        this.regen.position.y = -152;
        
        this.zon.position.x = 150;
        this.zon.position.y = -100;
        
        this.lucht.position.x = 100;
        this.lucht.position.y = 150;
        
        this.elements = [
            this.maan,
            this.regen,
            this.zon,
            this.lucht
        ];
        
        this.elements.forEach(this.add.bind(this));
        
        this.rotationOffset = Math.PI / 3;
        
        this.rotation = 0;
    }
    
    Elements.prototype.draw = function(renderer) {
        
        // Moon's shadow:
        renderer.rotate(Math.PI);
        renderer.begin();
        renderer.arc(0, 0, 191, -Math.PI/2, 0);
        renderer.context.lineTo(0, 0);
        renderer.fill("rgba(0, 0, 0, 0.8)");
        renderer.rotate(-Math.PI);
        
        renderer.rotate(this.rotationOffset);
        Entity.prototype.draw.call(this, renderer);
        renderer.rotate(-this.rotationOffset);
        
    };
    
    return Elements;
});
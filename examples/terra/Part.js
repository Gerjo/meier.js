define(function(require) {
    
    var Entity = require("meier/engine/Entity");
    var Sprite = require("meier/prefab/Sprite");
    
    
    Part.prototype = new Entity();
    function Part(id) {
        Entity.call(this);
        
        this.id = id;
        
        this.rotation = id * Math.PI / 2;
        
        this.add(this.terrain = new Entity());
        
        this.terrains = [
            new Sprite("images/deadish.png"),    // 0
            new Sprite("images/savannah.png"),   // 1
            new Sprite("images/aarde.png"),      // 2
            new Sprite("images/flourishing.png") // 3
        ];
        
        this.terrains.forEach(function(terrain) {
            terrain.position.x = -160/2;
            terrain.position.y = 150/2;
            terrain.visible    = true;
            terrain.fade(-1);
            this.terrain.add(terrain);
        }.bind(this));
        
        
        this.images = [
            [new Sprite("images/regen_1.png"), new Sprite("images/regen_2.png"), new Sprite("images/regen_3.png"), new Sprite("images/regen_4.png")],
            [new Sprite("images/lucht_1.png"), new Sprite("images/lucht_2.png"), new Sprite("images/lucht_3.png"), new Sprite("images/lucht_4.png")],
            [new Sprite("images/zon_1.png"), new Sprite("images/zon_2.png"), new Sprite("images/zon_3.png"), new Sprite("images/zon_4.png")]
        ];
        
        // Default initial scores:
        this.scores = [
            1,
            1,
            1
        ];
        
        // Some hardcoded positioning:
        this.images.forEach(function(images, i) {
            
            images.forEach(function(sprite) {
                sprite.rotation = Math.PI / 2;
                sprite.position.x = 325 / -2;
                sprite.position.y = 325 / 2;
                sprite.scale = 0.7;
            
                // Images aren't quite aligned.
                if(i === 0) {
                    sprite.position.x += 25;
                    sprite.position.y += 0;
                } else if(i === 1) {
                    sprite.position.x += 15;
                    sprite.position.y += -10;
                } else if(i === 2) {
                    sprite.position.x += 0;
                    sprite.position.y += -15;
                }
                
                this.add(sprite);
                
            }.bind(this));
            
        }.bind(this));
    }
    
    Part.prototype.update = function(dt) {
        Entity.prototype.update.call(this, dt);

        // Show correct score images:
        this.images.forEach(function(images, i) {
            images.forEach(function(image, j) {
                
                if(j == this.scores[i]) {
                    image.fade(1);
                    
                } else {
                    // Only fade out if score is greater. This avoids
                    // a "flashing" animation.
                    if(j > this.scores[i]) {
                        image.fade(-1);
                    }
                }
                
            }.bind(this));
        }.bind(this));
        
        // Lowest common score:
        var min = Math.min.apply(null, this.scores);
        
        // Show correct landscape for the lowest common score:
        this.terrains.forEach(function(terrain, i) {
            if(i == min) {
                //terrain.visible = true;
                terrain.fade(1);
            } else {
                //terrain.visible = false;
                terrain.fade(-1);
            }
        });
        
    };
    
    Part.prototype.zon = function(change) {
        this.scores[2] += change;
        
        this.scores[2] = Math.max(0, this.scores[2]);
        this.scores[2] = Math.min(3, this.scores[2]);
    };
    
    Part.prototype.regen = function(change) {
        this.scores[0] += change;
        
        this.scores[0] = Math.max(0, this.scores[0]);
        this.scores[0] = Math.min(3, this.scores[0]);
    };
    
    Part.prototype.lucht = function(change) {
        this.scores[1] += change;
        
        this.scores[1] = Math.max(0, this.scores[1]);
        this.scores[1] = Math.min(3, this.scores[1]);
    };
    
    return Part;
    
});
define(function(require) {
    var Entity     = require("meier/engine/Entity");
    var Texture    = require("meier/engine/Texture");
    var Vector     = require("meier/math/Vector");
    var Input      = require("meier/engine/Input");
    
    Item.prototype = new Entity();
    
    Item.Type = {};
    Item.Type.COUNT = 0;
    
    Item.Type.Head = Item.Type.COUNT++;
    Item.Type.Face = Item.Type.COUNT++;
    Item.Type.Body = Item.Type.COUNT++;
    Item.Type.Gloves = Item.Type.COUNT++;
    Item.Type.Pants = Item.Type.COUNT++;
    Item.Type.Shoes = Item.Type.COUNT++;
    
    function Item(name, itemType, x, y, game)
    {
        // Call super class constructor:
        Entity.call(this, x, y, 80, 80);
        
        this.name = name;
        
        this.lockPosition = new Vector(0,0);
        
        switch(itemType)
        {
        case Item.Type.Head: this.lockPosition = new Vector(0, 100); break;
        case Item.Type.Face: this.lockPosition = new Vector(0, 90); break;
        case Item.Type.Body: this.lockPosition = new Vector(0, 20); break;
        case Item.Type.Gloves: this.lockPosition = new Vector(0, 10); break;
        case Item.Type.Pants: this.lockPosition = new Vector(0, -40); break;
        case Item.Type.Shoes: this.lockPosition = new Vector(0, -80); break;
        }
        
        this.enableEvent(
            Input.LEFT_DOWN,
            Input.LEFT_UP
        );
        
        this.isBeingDragged = false;
        
        this.itemType = itemType;
        
        console.log(this.itemType);
        
    }
    
    Item.prototype.update = function(dt)
    {
        if(this.isBeingDragged)
        {
            this.position = this.input.clone();
        }
    };
    
    Item.prototype.onLeftDown = function()
    {
        this.isBeingDragged = true;
        
        //makes sure we don't roll over to other objects
        return false;
    };
    
    Item.prototype.onLeftUp = function()
    {
        
        if(this.isBeingDragged == true)
        {
            if(this.game.puppet.containsPoint(this.game.input))
            {
                this.position = this.lockPosition;
            }
        
            this.isBeingDragged = false;
        }
        
    };
    
    Item.prototype.draw = function(renderer) 
    {
        
        renderer.begin();
        renderer.rectangle(0, 0, this.width, this.height);
        renderer.fill('red');
        
    };
    
    return Item;
    
});
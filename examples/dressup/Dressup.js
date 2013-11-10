define(function(require){
    var Game        = require("meier/engine/Game");
    var Puppet      = require("./Puppet");
    var Item        = require("./Item");
    
    Dressup.prototype = new Game();

    function Dressup(container) 
    {
    	//inherit everything that game is.
    	Game.call(this, container);
        this.setFps(60);
        
        //
        this.puppet = new Puppet(this);
        this.add(this.puppet);
        
	    //
        this.item1 = new Item("Hat", Item.Type.Head, -100, 100, this);
        this.add(this.item1);
        
        this.item2 = new Item("Shoe", Item.Type.Shoes, -100, 0, this);
        this.add(this.item2);
        
        this.item3 = new Item("Pants", Item.Type.Pants, -100, -100, this);
        this.add(this.item3);
    }
    
    return Dressup;
});
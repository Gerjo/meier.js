define(function(require) {
    var Game  = require("meier/engine/Game");
    
    
    
    return function() {
        new Game(document.body);
        
        console.log("INT IS NWEW");
    };
});

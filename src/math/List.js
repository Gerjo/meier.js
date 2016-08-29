define(function(require) {
    
    
    List.prototype = new Array();
    function List() {
        
        if(this == window) {
            return new List();
        }
        
        Array.call(this);
    }
    
    return List;
});
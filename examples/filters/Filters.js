define(function(require){
    var Game       = require("meier/engine/Game");
    var RawTexture = require("meier/engine/RawTexture");
    var dat        = require("meier/contrib/datgui");
    
    Filters.prototype = new Game();
    
    function Filters(container) {        
        Game.call(this, container);

        this.original = new RawTexture("./lenna.png");
        this.texture  = this.original;

        
        this.filters = {
            "Original":    [false, RawTexture.Matrices.Original],
            "EdgeDetect1": [false, RawTexture.Matrices.EdgeDetect1],
            "EdgeDetect2": [false, RawTexture.Matrices.EdgeDetect2],
            "EdgeDetect3": [false, RawTexture.Matrices.EdgeDetect3],
            "Sharpen":     [false, RawTexture.Matrices.Sharpen],
            "Blur1":       [true, RawTexture.Matrices.Blur1],
            "Blur2":       [true, RawTexture.Matrices.Blur2]
        };
        
        var names = Object.keys(this.filters);
        
        this.currentFilter = names.first();
        
        this.gui = new dat.GUI();
        this.gui.add(this, "currentFilter", names).name("Filter").onChange(this.onChange.bind(this));
    }
    
    Filters.prototype.onChange = function(key) {
        var doNormalize = this.filters[key][0];
        var matrix      = this.filters[key][1];
        
        this.texture    = this.original.convolute(matrix, doNormalize);
        
    };
    
    Filters.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        if(this.texture) {
            renderer.texture(this.texture);
        }
    }
    
    return Filters;
});
define(function(require){
    var Game = require("meier/engine/Game");
    var M    = require("meier/math/Mat");
    var RawTexture = require("meier/engine/RawTexture");
    var dat        = require("meier/contrib/datgui");

    Svd.prototype = new Game();
    
    
    function Svd(container) {        
        Game.call(this, container);
        
        this.logger.showInternals(false).bottom();
        
        /*var a = new (M(2, 2))([1, 1, 1.4142, -1.4142]);
        var b = new (M(1, 2))([1, 1]);
        
        console.log(a.kronecker(b).pretty());
        */
        
        /*console.log(
        
            M(2,4).CreateIdentity().
            appendBottom(M(2,4).CreateIdentity())
            .pretty()
        );*/
        
        //console.log("Final: \n" + M(8, 8).CreateHaar().pretty());
        
        
        this.images = [
            "lenna_small.png",
            "testbeeld_small.png",
            "niko_small.png",
            "bikesgray_small.jpg",
            "flag_small.png",
            "pink_small.png"
        ];
        
        this.image = this.images.first();
        
        this.svd_k = 20;
        
        this.gui = new dat.GUI();
        this.gui.width = 300;
        this.gui.add(this, "image", this.images).name("Image").onChange(this.onChange.bind(this));
        
        this.gui.add(this, "svd_k", 1, 256).step(1).name("SVD K-value").onChange(this.onChange.bind(this));
       
        // Trigger initial drawing.
        this.onChange();
    }
    
    Svd.prototype.onChange = function() {
        this.texture = new RawTexture(this.image, function(texture) {
             
                
            var degree = Math.ln(256) / Math.ln(2);
                   
            var grey = texture.luminance().asMatrix().r;
            var haar = M(degree, degree).CreateHaar();
            
            this.texture = RawTexture.fromMatrix(
                grey.product(haar)
            );
            
            console.log(grey.numrows);
            /*
                   
            // SVK code:
            var grey = texture.luminance().asMatrix().r;
            
            var k = this.svd_k;
            
            var m = grey.svd();
          
            var u = m.u.resize(m.u.numcolumns, k);
            var s = m.s.resize(k, k);
            var v = m.v.resize(m.v.numcolumns, k);
                
            var floats = u.num + s.num + v.num;
            this.log("SVD", "Result: " + (floats * 4).pretty() + " bytes. Original: " + (grey.num*4).pretty() + " bytes. " + (100 - 100*floats/grey.num).toFixed(0) + "% reduction.");
          
            var img = u.product(s).product(v.transpose());
            
            this.texture = RawTexture.fromMatrix(img);
            */
        }.bind(this));
    };
    
    Svd.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    Svd.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        if(this.texture) {
            renderer.texture(this.texture);
        }
    };
    
    return Svd;
});


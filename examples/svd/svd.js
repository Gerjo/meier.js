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
        this.cutoff = 50;
        
        this.gui = new dat.GUI();
        this.gui.width = 300;
        this.gui.add(this, "image", this.images).name("Image").onChange(this.onChange.bind(this));
        
        this.gui.add(this, "svd_k", 1, 256).step(1).name("SVD K-value").onChange(this.onChange.bind(this));
        this.gui.add(this, "cutoff", 1, 256).step(1).name("Haar cut-off").onChange(this.onChange.bind(this));
       
        // Trigger initial drawing.
        this.onChange();
    }
    
    Svd.prototype.onChange = function() {
        this.texture = new RawTexture(this.image, function(texture) {
            
            /*
            var m = texture.luminance().asMatrix().r;
     
            var scale = Math.sqrt(2);
            
            var H = function(width, height, inverse) {
                for(var row = 0; row < height; ++row) {    
                    for(var col = 0; col < width; ++col) {
                        var a = m.get(row, col);
                        var b = m.get(row, col + width);
                
                        if(inverse === true) {
                            m.set(row, col, (a + b) / 2 * scale);
                            m.set(row, col + width, (a - b) / 2 * scale);
                        } else {
                            m.set(row, col, (a + b) / scale);
                            m.set(row, col + width, (a - b) / scale);
                        }
                    }
                }
            }.bind(this);
            
            var V = function(width, height, inverse) {
                for(var col = 0; col < width; ++col) {
                    for(var row = 0; row < height; ++row) {    
                    
                        var a = m.get(row, col);
                        var b = m.get(row + height, col);
                
                        if(inverse === true) {
                            m.set(row, col, (a + b) / 2 * scale);
                            m.set(row + height, col, (a - b) / 2 * scale);
                        } else {
                            m.set(row, col, (a + b) / scale);
                            m.set(row + height, col, (a - b) / scale);
                        }
                    }
                }
            }.bind(this);
            
            var width  = m.numrows;
            var height = m.numrows;
            
            while(height >= 4 && width >= 4) {
                
                H(width * 0.5, height);
                V(width, height * 0.5);
                                
                width *= 0.5;
                height *= 0.5;
                
                console.log("a " + width);
            }
            
            for(var col = 0; col < m.numrows; ++col) {
                for(var row = 0; row < m.numrows; ++row) {    
                    if(Math.abs(m.get(row, col)) < this.cutoff) {
                       //m.set(row, col, 0);
                    }
                }
            }
            
            width  = 1;m.numrows;
            height = 1;m.numrows;
            while(height < m.numrows-128) {
                
                V(width*2, height * 2, true);
                
                H(width * 2, height, true);
                
                width  *= 2;
                height *= 2;
                
                console.log("b" + width);
            }
            
            this.texture = RawTexture.fromMatrix(m);
                
            //var degree = Math.ln(256) / Math.ln(2);
                   
            //var grey = texture.luminance().asMatrix().r;
            //var haar = M(degree, degree).CreateHaar();
            
            //this.texture = RawTexture.fromMatrix(
            //    grey.product(haar)
            //);
            
            //console.log(grey.numrows);
            */
                   
            // SVD code:
            var grey = texture.clone().luminance().asMatrix().r;
            
            var k = this.svd_k;
            
            var m = grey.svd();
          
            var u = m.u.resize(m.u.numcolumns, k);
            var s = m.s.resize(k, k);
            var v = m.v.resize(m.v.numcolumns, k);
                
            var floats = u.num + s.num + v.num;
            this.log("SVD", "Result: " + (floats * 4).pretty() + " bytes. Original: " + (grey.num*4).pretty() + " bytes. " + (100 - 100*floats/grey.num).toFixed(0) + "% reduction.");
          
            var img = u.product(s).product(v.transpose());
            
            this.texture = RawTexture.fromMatrix(grey);
            
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


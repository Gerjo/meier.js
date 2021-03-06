define(function(require){
    var Game       = require("meier/engine/Game");
    var RawTexture = require("meier/engine/RawTexture");
    var dat        = require("meier/contrib/datgui");
    var M          = require("meier/math/Mat");
    
    Filters.prototype = new Game();
    
    function Filters(container) {        
        Game.call(this, container);

        this.texture  = null;

        this.images = [
            "lenna.png",
            "testbeeld.png",
            "niko.png",
            "bikesgray.jpg"
        ];

        
        this.filters = {
            "None": function(texture) {
                return texture;
            },
            "Luminance": function(texture) {
                return texture.luminance();
            },
            "Sepia": function(texture) {
                return texture.sepia();
            },
            "Invert": function(texture) {
                return texture.invert();
            },
            "Sobel": function(texture) {
                return texture.sobel();
            },
            "Prewitt": function(texture) {
                return texture.prewitt();
            },
            "RobertsCross": function(texture) {
                return texture.robertsCross();
            },
            "Scharr": function(texture) {
                return texture.scharr();
            },
            "EdgeDetect1": function(texture) {
                return texture.convolute(RawTexture.Matrices.EdgeDetect1, false);
            },
            "EdgeDetect2": function(texture) {
                return texture.convolute(RawTexture.Matrices.EdgeDetect2, false);
            },
            "EdgeDetect3": function(texture) {
                return texture.convolute(RawTexture.Matrices.EdgeDetect3, false);
            },
            "Sharpen": function(texture) {
                return texture.convolute(RawTexture.Matrices.Sharpen, false);
            },
            "Blur1": function(texture) {
                return texture.convolute(RawTexture.Matrices.Blur1, true);
            },
            "Blur2": function(texture) {
                return texture.convolute(RawTexture.Matrices.Blur2, true);
            },
            "Gaussian 5x5 s:2": function(texture) {
                return texture.gaussian(5, 5, 2);
            },
            "Gaussian 15x15 s:20": function(texture) {
                return texture.gaussian(15, 15, 20);
            },
            "Gaussian 10x1 s:20": function(texture) {
                return texture.gaussian(10, 1, 20);
            },
            "Canny [WIP]": function(texture) {
                return texture.canny();
            },
            "Diff Of Gaussian": function(texture) {
                return texture.differenceOfGaussian();
            },
            "Binary": function(texture) {
                return texture.binary();
            },
            "Inflection": function(texture) {
                return texture.inflection(1);
            },
            "Erode": function(texture) {
				
				var kernel = new (M(3, 3))([
					1, 1, 1,
					1, 1, 1,
					1, 1, 1
				]);
				
				var colors = texture.asMatrix();
				
				colors.r = colors.r.erode(kernel);
				colors.g = colors.g.erode(kernel);
				colors.b = colors.b.erode(kernel);
				
                return RawTexture.FromMatrix(colors.r, colors.g, colors.b);
            },
            "dilate": function(texture) {
				
				var kernel = new (M(3, 3))([
					1, 1, 1,
					1, 1, 1,
					1, 1, 1
				]);
				
				var colors = texture.asMatrix();
				
				colors.r = colors.r.dilate(kernel);
				colors.g = colors.g.dilate(kernel);
				colors.b = colors.b.dilate(kernel);
				
                return RawTexture.FromMatrix(colors.r, colors.g, colors.b);
            },
        };
        
        // Defaults
        this.filter1 = Object.keys(this.filters).last();
        this.filter2 = Object.keys(this.filters).first();
        this.filter3 = Object.keys(this.filters).first();
        this.filter4 = Object.keys(this.filters).first();
        this.filter5 = Object.keys(this.filters).first();
        this.filter6 = Object.keys(this.filters).first();
        this.image   = this.images.first();
        
        // Interface
        this.gui = new dat.GUI();
        this.gui.width = 300;
        this.gui.add(this, "image", this.images).name("Image").onChange(this.onChange.bind(this));
        this.gui.add(this, "filter1", Object.keys(this.filters)).name("Filter 1").onChange(this.onChange.bind(this));
        this.gui.add(this, "filter2", Object.keys(this.filters)).name("Filter 2").onChange(this.onChange.bind(this));
        this.gui.add(this, "filter3", Object.keys(this.filters)).name("Filter 3").onChange(this.onChange.bind(this));
        this.gui.add(this, "filter4", Object.keys(this.filters)).name("Filter 4").onChange(this.onChange.bind(this));
        this.gui.add(this, "filter5", Object.keys(this.filters)).name("Filter 5").onChange(this.onChange.bind(this));
        this.gui.add(this, "filter6", Object.keys(this.filters)).name("Filter 6").onChange(this.onChange.bind(this));
    
        // Apply initial filters
        this.onChange();
    }
    
    Filters.prototype.onChange = function() {
        this.texture  = new RawTexture(this.image, function(texture) {
            
            // Apply each filter to the texture, in order.
            texture = this.filters[this.filter1](texture);
            texture = this.filters[this.filter2](texture);
            texture = this.filters[this.filter3](texture);
            texture = this.filters[this.filter4](texture);
            texture = this.filters[this.filter5](texture);
            texture = this.filters[this.filter6](texture);
            
            // Store internally
            this.texture = texture;
        }.bind(this));
    };
    
    Filters.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        if(this.texture) {
            renderer.texture(this.texture);
        }
    }
    
    return Filters;
});
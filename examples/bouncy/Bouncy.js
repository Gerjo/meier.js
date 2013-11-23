define(function(require) {
    var Game       = require("meier/engine/Game");
    var Input      = require("meier/engine/Input");
    var Grid       = require("meier/prefab/Grid");
    var Vector     = require("meier/math/Vec")(2);
    var Random     = require("meier/math/Random");
    var Pixel      = require("meier/prefab/Pixel");
    var Bernstein  = require("meier/math/Polynomial").BernsteinBasis;
    var dat        = require("meier/contrib/datgui");
    
    
    // Dynamic matrix builder:
    var M   = require("meier/math/Mat");

    Bouncy.prototype = new Game();
    function Bouncy(container) {
        Game.call(this, container);
        this.setFps(60);
        
        this.add(this.grid = new Grid(0, 0, this.width, this.height));
                
        
        this.input.cursor(Input.Cursor.FINGER);
            
        // Line quality:
        this.lineQuality = 50;
        
        // Tile this.gridSpacing:
        this.gridSpacing = 30;
        
        // Mouse attraction force:
        this.mouseForce = 20;
        
        // Force dampening:
        this.dampening = 0.98;
        
        // Show the little sample points:
        this.showParticles = false;
        this.showLines  = true;
        this.showPoints = false;
        
        this.gui = new dat.GUI();
        
        // Require a recompute of polynomials:
    	this.gui.add(this, 'gridSpacing', 4, 200).onChange(this.restart.bind(this));
    	this.gui.add(this, 'lineQuality', 2, 100).onChange(this.restart.bind(this));
        
        // Change on the fly:
    	this.gui.add(this, 'mouseForce', -30, 30);
    	this.gui.add(this, 'dampening', 0.8, 1, 0.001);
        
    	this.gui.add(this, 'showParticles');
        
    	this.gui.add(this, 'showLines');
    	this.gui.add(this, 'showPoints');
        
        
        // Compute all initial values:
        this.restart();
    }
    
    Bouncy.prototype.restart = function() {
        
        // Initial velocity:
        var noise = 0;
        
        // Eventually will contain the fixels:
        this.pixels = [];
        
        // Grid size:
        this.size = Math.min(this.hh, this.hw);
        
        // Grid with "sensing" notches:
        for(var x = -this.size, pixel; x <= this.size; x += this.gridSpacing) {
            this.pixels.push([]);
            
            for(var y = -this.size; y <= this.size; y += this.gridSpacing) {
                pixel          = new Pixel(x, y);
                pixel.home     = pixel.position.clone();
                pixel.velocity = new Vector(0, 0);
                pixel.velocity.x = Random.IntegerInRange(-noise, noise);
                pixel.velocity.y = Random.IntegerInRange(-noise, noise);
                
                //this.add(pixel);
                this.pixels.last().push(pixel);
            }
        }
        
        // Bezier degree:
        this.degree = this.pixels[0].length;
        
        // Lookup table for bernstein polynomials:
        this.bernstein = [];
        
        // Build Bernstein polynomials:
        for(var j = 0; j <= this.lineQuality; ++j) {
            var t = j / this.lineQuality;
            
            this.bernstein[j] = [];
            
            for(var i = 0; i <= this.degree; ++i) {
                this.bernstein[j][i] = Bernstein(this.degree - 1, i, t);
            }
        }
    
    };
    
    Bouncy.prototype.update = function(dt) {
        this.grid.update(dt);
        
        for(var x = 0; x < this.pixels.length; ++x) {
            
            for(var y = 0; y < this.pixels[x].length; ++y) {
                var pixel     = this.pixels[x][y];
                
                
                var threshold = Math.pow(50, 2);
                var distance  = pixel.position.distanceSQ(this.input);
                
                var diff = pixel.home.clone().subtract(pixel.position).scaleScalar(10);
                
                
                // Attract:
                if(distance < threshold) {
                    diff = this.input.clone().subtract(pixel.position).scaleScalar(-this.mouseForce * 10);
                }
                
                
                pixel.velocity.addScaled(diff, dt);
                
                pixel.position.addScaled(pixel.velocity, dt);
                
                pixel.velocity.scaleScalar(this.dampening);
                
            }
        }
    };
    
    Bouncy.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        renderer.begin();
        
        var weight;
        var res = [];
        
        
        var prevHorizontal;
        var prevVertical;
        
        for(var y = 0; y < this.pixels.length; ++y) {
            for(var j = 0; j < this.bernstein.length; ++j) {
                var horizontal = new Vector(0, 0);
                var vertical   = new Vector(0, 0);
                
                for(var x = 0; x < this.pixels.length; ++x) {
                
                    weight = this.bernstein[j][x];
                        
                    horizontal.x += this.pixels[x][y].position.x * weight;
                    horizontal.y += this.pixels[x][y].position.y * weight;   
                    vertical.x   += this.pixels[y][x].position.x * weight;
                    vertical.y   += this.pixels[y][x].position.y * weight;
                }
                
                if(this.showPoints) {
                    renderer.rectangle(vertical, 2, 2);
                    renderer.rectangle(horizontal, 2, 2);
                }
                
                if( ! this.showLines) {
                    continue;
                }
            
                if(j > 0) {
                    renderer.line(prevHorizontal, horizontal);
                    renderer.line(prevVertical, vertical);
                }
                
                prevHorizontal = horizontal;
                prevVertical   = vertical;
            }
        }
        
        renderer.stroke("red");
        
        renderer.begin();
        for(var y = 0; y < this.pixels.length; ++y) {
            for(var x = 0; x < this.pixels.length; ++x) {
        
                if(this.showParticles) {
                    renderer.rectangle(this.pixels[y][x].position, 6, 6);
                }
            }
        }
        renderer.fill("black");
    };
    
    
    return Bouncy;
});
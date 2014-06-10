define(function(require){
    var Game   = require("meier/engine/Game");
    var Input  = require("meier/engine/Input");
    var Grid   = require("meier/prefab/Grid");
    var Line   = require("meier/math/Line");
    var Lerp   = require("meier/math/Lerp");
    var Random = require("meier/math/Random");
    var Vector = require("meier/math/Vec")(2);
    var Colors = require("meier/engine/Colors");
    var Noise  = require("meier/aux/Noise");
    var dat    = require("meier/contrib/datgui");
    var Intersection = require("meier/math/Intersection");
    
    HoughApp.prototype = new Game();
    
    function HoughApp(container) {        
        Game.call(this, container);
        
        this.grid = new Grid(
            this.hw * 0.5, 0, this.hw, this.height
        );
        this.grid.setEditable(true);
        this.grid.onChange = this.onChange.bind(this);
        this.add(this.grid);
        
        this.size        = 10;
        this.buckets     = [];
        this.lines       = [];
        this.normals     = [];
        this.coordinates = [];
        this.maxVotes    = 0;
        this.setFps(15);
        
        this.addLine();
        this.addNoise();
        
        this.gui = new dat.GUI();
        this.gui.width = 300;
        this.gui.add(this, "size", 1, 50).name("Bucket size").step(1).onChange(this.onChange.bind(this));
        
        this.gui.add(this.grid, "clear").name("Clear Canvas");
        this.gui.add(this, "addLine").name("Add Line");
        this.gui.add(this, "addNoise").name("Add Noise");
        
        this.logger.hide();
    }
    
    HoughApp.prototype.addNoise = function() {
        var n = 20;
        
        var arr = new Array(n);
        for(var i = 0; i < n; ++i) {
            arr[i] = (new Vector(Random(this.hw * 0.5, -this.hw * 0.5), Random(this.hh, -this.hh))).add(this.grid.position);
        }
                
        this.grid.addCoordinates(arr);
    };
    
    HoughApp.prototype.addLine = function() {
        
        var Sign = function() {
            return Random(0, 1) > 0.5 ? -1 : +1;
        };
        
        var a = this.hw * 0.5;
        var b = this.hh;
        
        var from, to;
        
        // Create a random line, with a minimum distance.
        do {
            from = new Vector(Random(a, -a), Random(b, -b));
            to   = new Vector(Random(a, -a), Random(b, -b));
        } while(from.distance(to) < 100);
        
        
        // Offset the noise
        var p = Noise.Line(from, to).map(function(p) {
            return p.add(this.grid.position);            
        }.bind(this));
       
        this.grid.addCoordinates(p);
    };
    
    HoughApp.prototype.onChange = function(coordinates) {
        
        // Update cache
        if(coordinates instanceof Array) {
            this.coordinates = coordinates;
            
        // Use cache
        } else {
            coordinates = this.coordinates;
        }
        
        var dNormalize = this.height / Math.hyp(this.grid.hh, this.grid.hw * 0.5);
        var aNormalize = this.hw / Math.TwoPI;
        var size       = this.size;
        var hSize      = size * 0.5;
        
        
        this.buckets.clear();
        this.lines.clear();
        this.normals.clear();
        this.maxVotes = 0;
                        
        // For each pair of coordinates O(n * (n-1) / 2)
        for(var i = 0; i < coordinates.length; ++i) {
            for(var j = i + 1; j < coordinates.length; ++j) {
                
                // A line between two coordinates
                var line     = new Line(this.grid.toWorld(coordinates[i]), this.grid.toWorld(coordinates[j]));
                
                // The perpendicular of the above line, ran through the origin. (the grid = origin)
                var normal   = Intersection.Get.Lines(line, new Line(this.grid.position, line.direction().perp().add(this.grid.position)));
                
                // Make sure we translate back to input space. 
                var normalOriginal = normal.clone().subtract(this.grid.position);
                
                // This is not a signed distance as the angle itself is already signed.
                var distance = normalOriginal.length();
                
                // Use the angle of the normal, this angle is better defined, the line AB has a different angle than BA, but their
                // normals are identical. 
                var angle    = normalOriginal.angle();
                
                // Calculate the appropriate bucket
                var x = Math.floor((angle+Math.PI) * aNormalize / size) * size;
                var y = Math.floor(distance * dNormalize / size) * size;
                
                
                if( ! this.buckets[x]) {
                    this.buckets[x] = [];
                    this.lines[x]   = [];
                    this.normals[x] = [];
                }
                
                if( ! this.buckets[x][y]) {
                    this.buckets[x][y] = [];
                    this.lines[x][y]   = [];
                    this.normals[x][y] = [];
                }
                
                // Attach the coordinate to this bucket, i.e., "cast a vote". The bucket with the most votes wins. At that
                // point we could fit a least squares line through all coordinates in said bucker.
                this.buckets[x][y].push(coordinates[i]);
                this.buckets[x][y].push(coordinates[j]);
                
                // Show these during some hover action
                this.lines[x][y].push(line);
                this.normals[x][y].push(new Line(this.grid.position, normal));
                
                // Record the highest number of votes, used for normalisation into [0,1]
                this.maxVotes = Math.max(this.maxVotes, this.buckets[x][y].length);     
            }
        }
    };
    
    HoughApp.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
        if(this.input.x > 0) {
            this.input.cursor(Input.Cursor.POINTER);
        }
        
    };
    
    HoughApp.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        
        var size     = this.size;
        var hSize    = size * 0.5;
        var grid     = this.grid;
        var maxVotes = this.maxVotes;
        var input    = this.input;
        var lines    = this.lines;
        var normals  = this.normals;
        var hw       = this.hw;
        
        // Draw the buckets
        this.buckets.forEach(function(bucket, x) {
            bucket.forEach(function(coordinates, y) {
                var rectX = x + hSize - hw;
                var rectY = y - grid.hh + hSize;
                
                renderer.begin();
                renderer.rectangle(rectX, rectY, size, size);
                renderer.fill(
                    Lerp([40, 255, 0, 0.2], [255, 0, 0, 1], coordinates.length / maxVotes)
                );
                
                if(input.x > rectX - hSize && input.x <= rectX + hSize) {
                    if(input.y > rectY - hSize && input.y <= rectY + hSize) {
                        
                        var text = (coordinates.length/2) + " vote";
                        if(coordinates.length != 2) {
                            text += "s";
                        }
                        
                        renderer.text(text, input.x + 20, input.y, "black", "left", "top");
                        
                        // The lines
                        renderer.begin();
                        lines[x][y].forEach(renderer.line.bind(renderer));
                        renderer.stroke(Colors.green);
                        
                        // The normals of each line
                        renderer.begin();
                        normals[x][y].forEach(renderer.line.bind(renderer));
                        renderer.stroke(Colors.blue);
                        
                        renderer.begin();
                        renderer.line();
                        renderer.stroke("green", 2);
                        
                        // Draw an outline in Hough Space
                        renderer.begin();
                        renderer.rectangle(rectX, rectY, size, size);
                        renderer.stroke(Colors.black, 2);
                        
                        // Highlight in Cartesian space
                        renderer.begin();
                        coordinates.forEach(function(p) {
                            renderer.circle(p.x + grid.position.x, p.y + grid.position.y, 3);
                        });
                        renderer.fill(Colors.red);
                    }
                }
                
            });
        });
                
        // Don't bother drawing a tiny grid.
        if(size > 5) {  
               
            // Draw a grid
            renderer.begin();
            for(var i = -this.grid.width; i < 0; i += size) {
                renderer.line(i, this.grid.hh, i, -this.grid.hh);
            }
            
            for(var i = -this.grid.hh; i < this.grid.hh; i += size) {
                renderer.line(0, i, -this.grid.width, i);
            }
            renderer.stroke(Colors.Alpha(Colors.black, 0.1));
        }
        
        // Some informative text
        var largeFont = "bold 20px monospace";
        var smallFont = "bold 12px monospace";
        renderer.text("Cartesian Space", this.hw * 0.5, -this.hh + 25, "black", "center", "bottom", largeFont);
        renderer.text("Click to add coordinates", this.hw * 0.5, -this.hh + 10, "black", "center", "bottom", smallFont);
        
        renderer.text("Hough Space", -this.hw * 0.5, -this.hh + 25, "black", "center", "bottom", largeFont);      
        renderer.text("Hover to highlight lines and their normal", -this.hw * 0.5, -this.hh + 10, "black", "center", "bottom", smallFont);      
    }
    
    
    return HoughApp;
});
define(function(require){
    var Game   = require("meier/engine/Game");
    var Input  = require("meier/engine/Input");
    var Grid   = require("meier/prefab/Grid");
    var Hull   = require("meier/math/Hull");
    var Vector = require("meier/math/Vec")(2);
    var Line   = require("meier/math/Line");
    var Lerp   = require("meier/math/Lerp");
    var Random = require("meier/math/Random");
    var ToAbsolute = require("meier/math/Angle").ToAbsoluteRadians;
    var ToDegrees  = require("meier/math/Angle").ToDegreesRounded;
    
    var Intersection = require("meier/math/Intersection").Get.Lines;
    
    var NnTree = require("meier/collections/NnTree");
    
    var M33    = require("meier/math/Mat")(3, 3);
    
    
    var V3 = require("meier/math/Vec")(3);
    
    
    var Stopwatch = require("meier/extra/Stopwatch");
    
    Test.prototype = new Game();
    
    function Test(container) {        
        Game.call(this, container);
        /*this.setFps(60);
        
        this.hull = null;
        this.aabb = null;
        
        this.grid = new Grid(0, 0, this.width, this.height);
        this.grid.setEditable(true);
        this.grid.onChange = this.onChange.bind(this);
        
        
        this.grid.addCoordinates([
            new Vector(10, 10),
            new Vector(100, 70),
            new Vector(-20, 120),
            new Vector(-215, 30)
        ]);
        this.add(this.grid);   */
        
        var seed = 8078;Random(0, 10000);
        
        Random.Seed(seed);
        
        console.log("Seed: " + seed);
        
        var s = new Stopwatch();
        
        var p = [
            new V3(1, 1, 1),
            new V3(-1, 10, 1),
            new V3(1, -41, 11),
            new V3(1, -1, -21),
            new V3(1, 1, -21),
            new V3(-1, 12, 10),
            new V3(11, 11, -21),
            new V3(0, 0, 0)
        ]; p = [];
        
        var n = [];
        for(var i = 0; i < 10 * 3; ++i) {
            n.push(Random(0, 100, true));
        }
        
        console.log("{" + n.join(",") + "};");
        
        for(var i = 0; i < n.length; i += 3) {
            p.push(new V3(
                n[i + 0],
                n[i + 1],
                n[i + 2]
            ));
        }
        
        this.nntree = new NnTree(p);
        
        var search = new V3(
                Random(-10, 10, true),
                Random(-10, 10, true),
                Random(-10, 10, true)
        );
        
        console.log("Searching for: " + search.wolfram());
        
        //search = new V3(1, 1, 1);
        
        var array = this.nntree.toArray();
        
        var l = 1; // 1 2 4 8
        var i = 1;
        array.forEach(function(v, index) {
            
            console.log(index, v.wolfram());
                
            if(i == l) {
                console.log("----", l);

                l *= 2;  
                
                i = 0;             
            }
            
            ++i;
            
        });
        
        s.start();
        var b = this.nntree.inArray(array, search);
        var t0 = s.stop();

        
        console.log("Array Search :", b.wolfram(), "[" + b.distanceSq(search) + "] at " + t0 + " ms");
        
        
        s.start();
        var n  = this.nntree.nearest(search);
        var t1 = s.stop();
        
        console.log("Kd Tree:      ", n.wolfram(),    "[" + n.distanceSq(search) + "] at " + t1 + " ms");
        
        var best = null;
        var bestDistance = Infinity;
        
        s.start();
        for(var i = 0; i < p.length; ++i) {
            var d = p[i].distanceSq(search);
            if(d < bestDistance) {
                bestDistance = d;
                best = p[i];
            }
        }
        var t2 = s.stop();
        
        
        
        console.log("Linear Search:", best.wolfram(), "[" + best.distance(search) + "] at " + t2 + " ms");
        
        if( ! n.equals(best) || ! b.equals(best)) {
            throw new Error("fail");
        }
    }
    
    Test.prototype.onChange = function(coordinates) {
        this.coordinates = coordinates;
        this.hull        = Hull.GiftWrap(coordinates).reverse(); 
        this.best        = null;
        
        this.total = 0;
        this.steps = 0;
        this.best  = Infinity;
        
        // Convex hull
        var hull = this.hull;
        
        // Indices of extrema, we initialize with the first index.
        var min = new Vector(0, 0);
        var max = new Vector(0, 0);
        
      
        // Significant points
        this.points = [
            hull.reduce(function(c, p, i) {
                return (hull[i].y < hull[c].y) ? i : c;
            }, 0),
            
            hull.reduce(function(c, p, i) {
                return (hull[i].x > hull[c].x) ? i : c;
            }, 0),
        
            hull.reduce(function(c, p, i) {
                return (hull[i].y > hull[c].y) ? i : c;
            }, 0),
            
            hull.reduce(function(c, p, i) {
                return (hull[i].x < hull[c].x) ? i : c;
            }, 0)
        ];
        
        this.visual = this.points.clone();
        
        // Current caliper angles
        this.angles = [
            0,
            Math.PI / 2,
            Math.PI,
            3 * Math.PI / 2
        ];
                      
        function Area(rectangle) {
            // This implies the "rectangle" is sorted. More robust would
            // be to calculate the area of two unique triangles?
            var h = rectangle[3].distance(rectangle[0]);
            var w = rectangle[1].distance(rectangle[0]);
            return w * h; 
        }              
                      
        this.Advance = function() {
            this.lines = [];
            
            var minDelta = Infinity;
            var minIndex = 0;
            
            for(var i = 0; i < this.points.length; ++i) {
                var a = hull[this.points[i]];
                var b = hull[(this.points[i] + 1) % hull.length]
                
                var direction = b.direction(a);
                var angle     = ToAbsolute(direction.angle());
                var delta     = ToAbsolute(angle - this.angles[i]);
                
                if(delta < minDelta) {
                    minDelta = delta;
                    minIndex = i;
                }      
            }
            
           
            var calipers = [];
            for(var i = 0; i < this.points.length; ++i) {
                this.visual[i] = this.points[i];
                
                this.angles[i] += minDelta;
                
                var direction = new Vector(
                    Math.cos(this.angles[i]),Math.sin(this.angles[i])
                ).scaleScalar(200);
                
                calipers.push(new Line(
                    hull[this.points[i]].clone().subtract(direction),
                    hull[this.points[i]].clone().add(direction)
                ));
                
                // Preceed to the next point.
                if(i == minIndex) {
                   this.points[i] = (this.points[i] + 1) % hull.length;
                }
            }
            
            var rectangle = [];
            for(var i = 0; i < calipers.length; ++i) {
                var prev = calipers[i - 1] || calipers.last();
                var curr = calipers[i];
                var next = calipers[i + 1] || calipers.first();
                
                var a = Intersection(prev, curr);
                var b = Intersection(next, curr);
                rectangle.push(a);
                
                this.lines.push(new Line(a, b));
            }            
            
            this.total += minDelta;
            ++this.steps;
            console.log("Total rotation:", ToDegrees(this.total) + "/90 step:", this.steps);
            
            var area = Area(rectangle);
            
            if(area.toFixed(6) < this.best.toFixed(6)) {
                console.log("New best! [" + area + "]");
                this.best = area;
            }
            
            this.circles = rectangle;
        }.bind(this);
        
        this.input.subscribe(Input.KEY_DOWN, function() {
            this.Advance();
        }.bind(this));
    };
    
    Test.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        

    };
    
    Test.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        var hull = this.hull;
        
        if(hull) {            
            renderer.begin();
            renderer.polygon(hull);
            renderer.stroke("rgba(255, 0, 0, 0.3)");
            
          
            
            renderer.begin();
            (this.lines || []).forEach(renderer.line.bind(renderer));
            
            (this.circles || []).forEach(function(c) {
                renderer.circle(c);
            });
            
            renderer.stroke("red");
        }
    }
    
    return Test;
});
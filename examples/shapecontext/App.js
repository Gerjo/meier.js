define(function(require){
    var Game = require("meier/engine/Game");
    var Grid = require("meier/prefab/Grid");
	var Shape = require("meier/math/ShapeContext");
	var Vec2 = require("meier/math/Vec")(2);
	var M = require("meier/math/Mat");
	var Html = require("meier/engine/HtmlEntity");
    var dat = require("meier/contrib/datgui");

    App.prototype = new Game();
    
    function App(container) {        
        Game.call(this, container);
		
		var hw = this.hw;
		var hh = this.hh;
		var hhw = this.hw * 0.5;
		var hhh = this.hh * 0.5;
		
		var padding = 20;

		var grids = this.grids = [
			new Grid(-hhw + padding * 0.3, 0, hw-padding*2, hh),
			new Grid(hhw - padding * 0.3, 0, hw-padding*2, hh)
		];
		
		this.metrics = [
			{
				showInitially: true,
				title: "Shape Context Descriptor",
				color: "red",
				line: "rgba(255, 0, 0, 0.5)",
				metric: function(a, b) {
					var angles = 6;
					var distances = 5;
		
					var u = Shape(distances, angles, a);
					var v = Shape(distances, angles, b);
		
					return Shape.Compute(u, v);
				},
				res: null
			},
			{
				showInitially: false,
				title: "Assignment Problem",
				color: "green",
				line: "rgba(0, 255, 0, 0.5)",
				metric: function(a, b) {
					return Shape.Assignment(a, b);
				},
				res: null
			},
			{
				showInitially: false,
				title: "Chamfer Matching",
				color: "blue",
				line: "rgba(0, 0, 255, 0.5)",
				metric: function(a, b) {
					
					a = grids[0].getCoordinates(true).map(function(p) {
						return new Vec2(p.x - grids[0].position.x, p.y - grids[0].position.y)
					});
					b = grids[1].getCoordinates(true).map(function(p) {
						return new Vec2(p.x - grids[1].position.x, p.y - grids[1].position.y)
					});
					
					return Shape.Chamfer(a, b);
				},
				res: null
			}
		];
		
        this.gui = new dat.GUI();
    	this.gui.width = 300;
		
		this.metrics.forEach(function(m) {
			this[m.title] = m.showInitially;
	        this.gui.add(this, m.title).name("<span style='color:" + m.color + ";'>" + m.title + "</span>");
		}.bind(this));
		
		

		
		this.grids.forEach(this.add.bind(this));
		
		this.grids.execute("setEditable", true);
		this.grids.execute("setTransformable", true);

		this.grids.forEach(function(grid) {
			grid.onChange = this.onChange.bind(this);
			grid.onTransform = this.onChange.bind(this);	
		}.bind(this));
		
		
		this.a = [];
		this.b = [];
		
		this.ui = this.grids.map(function(grid, i) {
			
			var ui = new Html(grid.position.x, grid.position.y - hhh - 30);
			
			ui.button("Clone other", function() {
				var coordinates = grids[1 - i].getCoordinates();
				
				if( ! coordinates.empty()) {
				
					var p = grids[1 - i].position;
					grid.clear();
				
					grid.addCoordinates(coordinates.map(function(c) {
						return new Vec2(c.x - p.x, c.y - p.y);
					}));				
				} else {
					// Show warning? Not cloning nothingness.
				}
			});
			
			ui.button("Clear this", grid.clear.bind(grid));
			
			ui.button("Axis Align Grid", grid.resetTransform.bind(grid));
			
			return ui;
		});
		
		this.ui.forEach(this.add.bind(this));
    }
	

    
    App.prototype.onChange = function() {
	
		var a = this.grids[0].getCoordinates(true);
		var b = this.grids[1].getCoordinates(true);
		
		// Remove bias
		if(true) {
			//a.shuffle();
			b.shuffle();
		}
		
		this.metrics.forEach(function(m) {
			if(this[m.title] == true) {
				m.res = m.metric(a, b);
			} else {
				m.res = null; // Remove previous outcome.
			}			
		}.bind(this));
		
		//console.log(this.metrics[0].res.weights.pretty());
		
		this.a = a;
		this.b = b;
	};
	
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
	
    App.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
 
		//this.onChange();
		
		/*
		this.grids.forEach(function(g) {			
			g.getCoordinates(true).forEach(function(c, i) {
				renderer.styled("<black>" + i, c.x, c.y+3);
			});
		});
		*/
		
		var a = this.a;
		var b = this.b;
		
		a.forEach(function(p, i) {
			renderer.text(i, p.x - 7, p.y, "black");
		});
		
		b.forEach(function(p, i) {
			renderer.text(i, p.x - 7, p.y, "black");
		});
		
		this.metrics.forEach(function(m) {
			
			if(this[m.title] === true) {
				
				// Enabled in UI, but not yet computed.
				if(m.res == null) {
					m.res = m.metric(a, b);
				}
				
				renderer.begin();
				m.res.path.forEach(function(r, c) {
				
					// Not mapped at all.
					if(r == -1) {
						return;
					}
				
					renderer.line(a[c], b[r]);
				});
				renderer.stroke(m.line, 2);
			}
			
		}.bind(this));
    };
    
    return App;
});
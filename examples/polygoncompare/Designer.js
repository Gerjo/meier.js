define(function(require) {
	
	var Doc      = require("meier/engine/Document");
	var Grid     = require("meier/prefab/Grid");
	var Html     = require("meier/engine/HtmlEntity");
	var Colors   = require("meier/engine/Colors");
	var Input    = require("meier/engine/Input");
	var Freeform = require("meier/prefab/Freeform");
	var Polygon  = require("meier/math/Polygon");
	var Random   = require("meier/math/Random");
	var Vec2     = require("meier/math/Vec")(2);
	
	Designer.prototype = new Grid();
	
	var id = 0;
	
	function Letter(id) {
		return String.fromCharCode("A".charCodeAt(0) + id);
	}
	
	function Designer(x, y, w, h) {
		Grid.call(this, x, y, w, h);
				

		this.id = id++;		
		this.isLeftdown = false;
		this.showOther = true;
		
		
		
		this.add(this.ui = new Html(0, -this.hh + 20));
		TODO("Figure out why the order of adding ui and freeform matters.");
		this.add(this.freeform = new Freeform());

		this.ui.append('<button id="clear">Clear</button>');
		//this.ui.append('<button id="clone">Clone Polygon ' + Letter(1 - this.id) + '</button>');
		//this.ui.append('<br>');
		this.ui.append('<button id="randomize">Randomize</button>');
		this.ui.append('<button id="toggle">Show Polygon ' + Letter(1 - this.id) + '</button>');
		 
		this.ui.click("#randomize", this.randomize.bind(this)); 
		
		this.ui.click("#toggle", function() {
			this.showOther = ! this.showOther;
			
			this.configureHtml();
		}.bind(this)); 
		
		this.ui.click("#clear", function() {
			this.freeform.clear();
			
			this.configureHtml();
		}.bind(this)); 
		
		if(this.ui.find("#clone")) {
			this.ui.click("#clone", function() {
				var other = this.game.designers[1 - this.id].freeform.polygon;
				this.freeform.polygon = other.clone();
				this.freeform.change.notify();
			
				this.configureHtml();
			}.bind(this)); 
		}
	
		this.configureHtml();
		this.enableEvent(Input.MOUSE_MOVE, Input.LEFT_DOWN, Input.LEFT_UP);
		
		this.randomize();
	}
	
	Designer.prototype.randomize = function() {
		var poly = new Polygon();
		
		var max = Math.min(this.hh, this.hw) * 0.8;
		
		for(var i = 0; i < 13; ++i) {
			poly.add(new Vec2(Random(-max, max), Random(-max, max)));
		}
		
		this.freeform.polygon = poly.hull();
		this.freeform.change.notify();
	};
	
	Designer.prototype.onLeftDown = function(input) {
		this.isLeftdown = true;
		
		this.freeform.clear();
		this.freeform.record();
		
		return true;
	};
	
	Designer.prototype.onLeftUp = function(input) {
		
		if(this.isLeftdown) {
			this.freeform.stop();
		}
		
		this.isLeftdown = false;
		
		return true;
	};
	
	Designer.prototype.onMouseMove = function(input) {		
		if( ! this.contains(input)) {
			this.onLeftUp();
		}
		
		return true;
	};
	
	Designer.prototype.configureHtml = function() {
		if(this.showOther) {
			Doc.Text(this.ui.find("#toggle"), "Hide Polygon " + Letter(1 - this.id) + "");
		} else {
			Doc.Text(this.ui.find("#toggle"), "Show Polygon " + Letter(1 - this.id) + "");
		}
	};
	
	Designer.prototype.onAdd = function(parent) {
		
	};
	
	Designer.prototype.draw = function(renderer) {
		Grid.prototype.draw.call(this, renderer);
		
		renderer.styled("<black><20px>Polygon " + Letter(this.id), -this.hw + 5, this.hh-20, "left", "bottom");
	
	
		if(this.showOther) {
			var other = this.game.designers[1 - this.id];
			
			/*renderer.begin();
			renderer.circle(0, 0, 10);
			renderer.fill("RED");
			renderer.begin();*/
			
			renderer.polygon(other.freeform.polygon);
			renderer.fill(Colors.Alpha("black", 0.2));
		}
	};
	
	return Designer;
});
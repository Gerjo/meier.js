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
		this.add(this.uitop = new Html(this.hh * 0.5, this.hh - 20));
		
		this.uitop.append('<button id="undo">undo</button>');
		this.uitop.append('<button id="redo">redo</button>');
		this.uitop.click("#redo", this.redo.bind(this)); 
		this.uitop.click("#undo", this.undo.bind(this)); 
		
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
			
			if( ! this.freeform.isEmpty()) {
				this._undo.push(this.freeform.polygon.clone());
			}
			
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
	
		this.enableEvent(Input.MOUSE_MOVE, Input.LEFT_DOWN, Input.LEFT_UP);
		
		
		this._undo = [];
		this._redo = [];
		
		
		// These must be the last call in the ctor.
		this.configureHtml();
		this.randomize();
	}
	
	Designer.prototype.undo = function() {
		if( ! this._undo.isEmpty()) {
			if( ! this.freeform.isEmpty()) {
				this._redo.push(this.freeform.polygon.clone());
			}
			
			this.freeform.polygon = this._undo.pop();
			this.freeform.change.notify();
			this.configureHtml();
		}		
	};
	
	Designer.prototype.redo = function() {
		if( ! this._redo.isEmpty()) {
			if( ! this.freeform.isEmpty()) {
				this._undo.push(this.freeform.polygon.clone());
			}
			
			this.freeform.polygon = this._redo.pop();
			this.freeform.change.notify();
		
			this.configureHtml();
		}		
	};
	
	Designer.prototype.randomize = function() {
		var poly = new Polygon();
		
		var max = Math.min(this.hh, this.hw) * 0.8;
		
		for(var i = 0; i < 13; ++i) {
			poly.add(new Vec2(Random(-max, max), Random(-max, max)));
		}
		
		if( ! this.freeform.isEmpty()) {
			this._undo.push(this.freeform.polygon.clone());
		}
		
		this.freeform.polygon = poly.hull();
		this.freeform.change.notify();
	};
	
	Designer.prototype.onLeftDown = function(input) {
		this.isLeftdown = true;
		
		if( ! this.freeform.isEmpty()) {
			this._undo.push(this.freeform.polygon.clone());
		}
		
		this.freeform.clear();
		this.freeform.record();
		
		return true;
	};
	
	Designer.prototype.onLeftUp = function(input) {
		
		if(this.isLeftdown) {
			this.freeform.stop();
			
			
			this.configureHtml();
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
		
		this.uitop.setEnabled("#undo", ! this._undo.isEmpty());
		this.uitop.setEnabled("#redo", ! this._redo.isEmpty());
		
		this.ui.setEnabled("#clear", ! this.freeform.isEmpty());
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
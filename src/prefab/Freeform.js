/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2016 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
	
    var Entity   = require("meier/engine/Entity");
    var Colors   = require("meier/engine/Colors");
    var Input    = require("meier/engine/Input");
	var Polygon  = require("meier/math/Polygon");
	var Vec2     = require("meier/math/Vec")(2);
	var Doc      = require("meier/engine/Document");
	var Notifier = require("meier/engine/Notifier");
	
	var Configuration = {
		Drawing: "blue",
		Finished: "red",
		Hover: "yellow", // perhaps just reduce opacity?
		
		autofill: true,
		autofillDistance: 1, // in pixels
		Interval: 0.0000001,
		MaxRecordedPoints: 1000,
	};
	
	Freeform.prototype = new Entity();
	
	function Freeform(configuration) {
	    Entity.call(this, 0, 0, 40, 40);
				
		if(configuration) {
			this.config = Object.assign(Object.create(Configuration), configuration);
		} else {
			this.config = Object.create(Configuration);
		}
		
		this.polygon = new Polygon();
		this._isRecording = false;
		
		this.interval = 0;
		
		this.change = new Notifier();
	}
	
	Freeform.prototype.record = Freeform.prototype.start = function() {
		this.enableEvent(Input.MOUSE_MOVE);
		
		this._isRecording = true;		
	};
	
	Freeform.prototype.stop = Freeform.prototype.pause = function() {
		this.disableEvent(Input.MOUSE_MOVE);
		
		this._isRecording = false;
	};
	
	Freeform.prototype.isRecording = Freeform.prototype.isEditing = function() {
		return this._isRecording;
	};
	
	Freeform.prototype.reset = Freeform.prototype.restart = Freeform.prototype.clear = function() {
		this.polygon.vertices.clear();
		this.change.notify();
	};
	
	Freeform.prototype.isEmpty = function() {
		return this.polygon.isEmpty();
	};
	
	Freeform.prototype.onMouseMove = function(input) {
		//console.log(this.contains(input));
		
		if( ! this._isRecording) {
			return;
		}
		
		var epsilon = 0.01;
		
		// Exclude successively repeated coordinates.
		if( ! this.polygon.isEmpty()) {
			if( this.polygon.last().equals(input, epsilon)) {
				return;
			}
		}
		
		if(this.interval > this.config.Interval) {
			this.interval = 0;
		
			if(this.polygon.vertices.length < this.config.MaxRecordedPoints) {
				var local = this.toLocal(this.input);
				this.polygon.add(local);
				
				this.change.notify();
			}
		}
		
	};
	
	TODO("Serialization protocol?");
	Freeform.prototype.export = function() {
	    return {
	    	class: "polygon",
			position: this.polygon.position,
			vertices: this.polygon.vertices.map(function(v) { return [v.x, v.y]; })
	    };
	};
	
	Freeform.prototype.update = function(dt) {
		this.interval += dt;
	};
	
	Freeform.prototype.contains = function(point) {
		return ! this._isRecording && this.polygon.contains(point);	
	};
	
	Freeform.prototype.draw = function(renderer) {
		
		TODO("Rename configuration entries.");
		var Preset = this.config;
		
		if( ! this._isRecording) {
			
			renderer.begin();
			renderer.polygon(this.polygon);
	
			this.polygon.vertices.forEach(function(p) {
				renderer.rect(p.x, p.y, 4, 4);
			});
	
			renderer.fill(Colors.Alpha(Preset.Finished, 0.2));
			renderer.stroke(Preset.Finished);
		} else {
			renderer.begin();
		
			this.polygon.vertices.forEach(function(p) {
				renderer.rect(p.x, p.y, 4, 4);
			});
				
			renderer.fill(Preset.Drawing);
			renderer.begin();
			
			renderer.begin();
			renderer.lines(this.polygon);
			renderer.stroke(Preset.Drawing);			
		}
	};


	return Freeform;
});
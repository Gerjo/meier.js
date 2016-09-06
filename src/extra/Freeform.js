/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2016 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
	
    var Entity  = require("meier/engine/Entity");
    var Colors  = require("meier/engine/Colors");
    var Input   = require("meier/engine/Input");
	var Polygon = require("meier/math/Polygon");
	var Vec2    = require("meier/math/Vec")(2);
	var Doc     = require("meier/engine/Document");
	
	var Configuration = {
		Drawing: "blue",
		Finished: "red",
		Hover: "yellow", // perhaps just reduce opacity?
		
		Interval: 0.0000001,
		MaxRecordedPoints: 1000,
	};
	
	Freeform.prototype = new Entity();
	
	function Freeform(configuration) {
	    Entity.call(this, 0, 0, 40, 40);
		
		TODO("Merge with existing configuration. Possible create global object Merge method.");
		this.config = configuration || Object.create(Configuration);
		
		this.polygon = new Polygon();
		this.isRecording = false;
		
		this.interval = 0;
	}
	
	Freeform.prototype.record = Freeform.prototype.start = function() {
		this.enableEvent(Input.MOUSE_MOVE);
		
		this.isRecording = true;		
	};
	
	Freeform.prototype.stop = Freeform.prototype.pause = function() {
		this.disableEvent(Input.MOUSE_MOVE);
		
		this.isRecording = false;
	};
	
	Freeform.prototype.reset = Freeform.prototype.restart = function() {
		this.polygon.vertices.clear();
	};
	
	Freeform.prototype.onMouseMove = function(input) {
		//console.log(this.contains(input));
		
		if( ! this.isRecording) {
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
		
			if(this.polygon.vertices.length < this.config.MaxRecordedPoints) {
				this.polygon.add(this.input.clone());
			}
		
			this.interval = 0;
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
		return ! this.isRecording && this.polygon.contains(point);	
	};
	
	Freeform.prototype.draw = function(renderer) {
		
		TODO("Rename configuration entries.");
		var Preset = this.config;
		
		if( ! this.isRecording) {
			
			renderer.begin();
			renderer.polygon(this.polygon);
	
			this.polygon.vertices.forEach(function(p) {
				renderer.rect(p.x, p.y, 4, 4);
			});
	
			renderer.fill(Colors.Alpha(Preset.Finished, 0.5));
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
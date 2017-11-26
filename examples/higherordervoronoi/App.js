/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2017 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require){
    var Game = require("meier/engine/Game");
    var Grid = require("meier/prefab/Grid");
    var Vec2 = require("meier/math/Vec")(2);
	var M = require("meier/math/Mat");
	var Utils = require("meier/extra/Utils");
	var Random = require("meier/math/Random");
	var RawTexture = require("meier/engine/RawTexture");
	
    App.prototype = new Game();
    
    function App(container) {        
        Game.call(this, container);
		
		this.grid = new Grid(0,0,123*2, 123*2);
		this.add(this.grid);
				
        this.grid.setEditable(true);
        this.grid.showPoints(true);
				
		this.points = []
				
		for(var i = 0; i < 4; ++i) {
			this.points.push(new Vec2(Random(-123,123), Random(-123,123)))
			
		}
		this.grid.add(this.points);
				
		//this.mat = Utils.Array(40, 40, null);
		
		this.mat = new (M(10, 10))();
		
		
		this.recompute();
    }
	
	function Hash(points, pos) {
		var k = 1;
		
		var hash = 0;
		
		var deltas = new Array(points.length);
		
		for(var i = 0; i < points.length; ++i) {
			
			deltas[i] = [ points[i].distanceSq(pos), i ];
			
		}
		
		deltas.sort(function(a, b) {
			return a[1] - b[1];
		});
		
		for(var i = 0; i < k; ++i) {
			hash |= 0x1 << i;
		}
		
		return hash;
	}
	
	App.prototype.recompute = function(points) {
		
		
		var s = this.grid.width /  this.mat.rows;
		
		for(var r = 0; r < this.mat.rows; ++r) {
			for(var c = 0; c < this.columns; ++c) {
				
				var pos = new Vec2(
					r * s,
					c * s
				);
				
				var d = Hash(this.points, pos);
				
				//console.log(d.toString(2))
				
				outer:
				for(i in [-1, 1]) {
					for(j in [-1, 1]) {
						var sub = new Vec2((r + i) * s, (c + j) * s);
						
						console.log(sub);
						
						var hash = Hash(this.points, sub);
						
						if(d != hash) {
							console.log("probably border of sorts");
							
							break outer;
						}
						
					}	
				}
				
				if(d != hash) {
					this.mat.set(r, c, 1);
					console.log("Broke from outer loop");
				}
				
				// Just one iteration for now.
				// break;
			}
		}
		
		this.raw = new RawTexture(this.mat);
	};
    
    App.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    App.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
		renderer.texture(this.raw);
		
		//renderer.grid(0,0,this.grid.width,this.grid.height,this.mat);
		
    };
    
    return App;
});
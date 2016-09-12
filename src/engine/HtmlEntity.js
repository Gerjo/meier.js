/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2016 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

/// TODO: extend and test stub functionality.
define(function(require) {
	var Entity = require("meier/engine/Entity");
	var Doc    = require("meier/engine/Document");
	
	HtmlEntity.prototype = new Entity();
	function HtmlEntity(x, y, w, h) {
		Entity.call(this, x || 0, y || 0, w || 0, h || 0);
		
		
		this._root = Doc.Create("div");
		this._root.style.border = "1px solid red";
		this._root.style.position = "absolute";
	}
	
	HtmlEntity.prototype.html = function(html) {
		this._root.innerHTML = html;
	};
	
	HtmlEntity.prototype.text = function(text) {
		this._root.innerText = text;
	};
	
	HtmlEntity.prototype._onDelete = function() {
		
		this.game.htmlContainer.removeChild(this._root);
		
		Entity.prototype._onDelete.call(this);
	};
	
	HtmlEntity.prototype._onAdd = function(game) {
		Entity.prototype._onAdd.call(this, game);
		
		game.htmlContainer.appendChild(this._root);
	};
	
	HtmlEntity.prototype.update = function(dt) {
		Entity.prototype.update.call(this, dt);
		
		if(this.width == 0) {
			this._root.style.width = "auto";
		}
		
		if(this.height == 0) {
			this._root.style.height = "auto";
		}
		
		var x = this.position.x + this.game.hw;
		var y = -this.position.y + this.game.hh;
		
		this._root.style.left = x + "px";
		this._root.style.top = y + "px";
		
		console.log(x, y);
	} 
	
	
	
	
	return HtmlEntity;
});
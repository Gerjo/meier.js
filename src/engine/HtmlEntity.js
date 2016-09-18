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
	var Vec2   = require("meier/math/Vec")(2);
	
	var Align = require("meier/engine/Enum")("left", "right", "center", "middle", "bottom", "top");
	
	
	var LastUsedId = -1;
	
	HtmlEntity.prototype = new Entity();
	function HtmlEntity(x, y, w, h) {
		Entity.call(this, x || 0, y || 0, w || 0, h || 0);
		
		++LastUsedId;
		
		this._root = Doc.Create("div");
		//this._root.style.border = "1px solid red";
		this._root.style.position = "absolute";
		this._root.id = "meier_html_entity_container_" + LastUsedId;
		
		
		this._hAlign = 0.5; // 0 = left, 1 = right
		this._vAlign = 0.5; // 0 = top,  1 = bottom
	}
	
	HtmlEntity.prototype._onAdd = function(game) {
		Entity.prototype._onAdd.call(this, game);
		
		game.htmlContainer.appendChild(this._root);
	};
	
	HtmlEntity.prototype._onDelete = function() {
		
		this.game.htmlContainer.removeChild(this._root);
		
		Entity.prototype._onDelete.call(this);
	};
	
	HtmlEntity.prototype.find = function(selector) {
		return this._root.querySelector(selector);
	};
	
	HtmlEntity.prototype.click = function(selector, fn) {
		return Doc.OnClick(this.find(selector), function() {
			fn(this);
		});
	};
	
	HtmlEntity.prototype.hover = function(selector, fn) {
		return Doc.OnHover(this.find(selector), function() {
			fn(this);
		});
	};
	
	HtmlEntity.prototype.html = function(html) {
		this._root.innerHTML = html;
		return this;
	};
	
	HtmlEntity.prototype.append = function(html) {
		this._root.innerHTML += (html);
		return this;
	};
	
	HtmlEntity.prototype.text = function(text) {
		this._root.innerText = text;
		return this;
	};
	
	TODO("floating coordinates for Html Entities");
	HtmlEntity.prototype.float = function(wherea, whereb) {
		
		if(whereb) {
			wherea = wherea.trim() + " " + whereb.trim();
		}
		
		var ops = whereb.split(" ");
		
		for(var k in ops) {
			
			
		}
		
	};
	
	HtmlEntity.prototype.update = function(dt) {
		Entity.prototype.update.call(this, dt);
		
		//console.log(width, height);
		
		if(this.width == 0) {
			this._root.style.width = "auto";
		}
		
		if(this.height == 0) {
			this._root.style.height = "auto";
		}
		
		// Computed size by HTML document
		var width = this._root.offsetWidth;
		var height = this._root.offsetHeight;
		
		
		
		
		// Bring to absolute game world space
		var abs = this.toWorld();

		// Center component in HTML space
		abs.x -= width * 0.5;
		abs.y += height * 0.5;


		// Undo engine sub-pixel offset to promote disabled AA.
		abs.x += 0.5;
		abs.y -= 0.5;


		// Bring to HTML space
		abs.x += this.game.hw;
		abs.y = -abs.y + this.game.hh;
		
		this._root.style.left = Math.round(abs.x) + "px";
		this._root.style.top  = Math.round(abs.y) + "px";		
	} 
	
	HtmlEntity.prototype.draw = function(renderer) {
		renderer.begin();
		renderer.rect(0, 0, 10, 10);
		renderer.fill("red");
	};
	
	return HtmlEntity;
});
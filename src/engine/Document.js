/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2016 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

define(function(require) {
	
	
	function self(selector) {
		return self.Find(selector);
	}; 
	
	self.Find = function(selector) {
			if(selector instanceof HTMLElement) {
				return selector;
			} else if(selector && selector._root) {
				return selector._root;
			}
			
			return document.querySelector(selector);
	};
	
	self.Text = function(e, text) {
		self.Find(e).innerText = text;
	};
	
	self.Html = function(e, html) {
		self.Find(e).innerHTML = html;
	};
		
	self.Visible = function(e, isVisible) {
		var e = self.Find(e);
		
		if(isVisible) {
			e.style.display = "";
		} else {
			e.style.display = "none";
		}
		
		return e;		
	};
	
    self.OnClick = function(selector, fn) {
        
		var node = self.Find(selector);
		
        var eventName = ("ontouchstart" in window) ? "touchend" : "click";
    
        return node.addEventListener(eventName, fn, false);
    };
	
    self.OnMouseMove = function(selector, fn) {
        
		var node = self.Find(selector);
		
        var eventName = ("ontouchstart" in window) ? "touchstart" : "mousemove";
    
        return node.addEventListener(eventName, fn, false);
    };
	
    self.OnMouseEnter = function(selector, fn) {
        
		var node = self.Find(selector);
		
        var eventName = ("ontouchstart" in window) ? "touchstart" : "mouseenter";
    
        return node.addEventListener(eventName, fn, false);
    };
	
    self.OnMouseLeave = function(selector, fn) {
        
		var node = self.Find(selector);
		
        var eventName = ("ontouchstart" in window) ? "touchend" : "mouseleave";
    
        return node.addEventListener(eventName, fn, false);
    };
	
	self.Remove = function(selector) {
		selector = self.Find(selector);
		
		if(selector.parentNode) {
			selector.parentNode.removeChild(selector);
			return true;
		}
		return false;
	};
	
	self.Create = function(tag, className) {
		var e = document.createElement(tag);
		
		if(className) {
			e.className = className;
		}
		
		return e;
	};

	self.SetEnabled = function(selector, state) {
		
		self.Find(selector).disabled = !state;
		
		return this;
	};
	
	self.ForEach = function(selector, callback) {
		
		if(selector instanceof HTMLElement) {
			callback(selector);
			return this;
		} else if(selector && selector._root) {
			callback(selector._root);
			return this;
		}
		
		var res = document.querySelectorAll(selector);
		
		for(var i = 0; i < res.length; ++i) {
			callback(res[i], i, res);
		}
		
		return this;
	};
	
	self.Append = function(selector, child, index) {
		var parent = self.Find(selector);
		
		if(arguments.length > 2) {
			var length = parent.children.length;
			
			console.log(parent.children);
			
			if(index < 0) {
				index = length - index - 1;
			}
			
			if(index > length) {
				index = length;
			}
			
			//console.log(index + "/" + length);
			
			parent.insertBefore(child, parent.childNodes[index] || null);
			
		} else {
			// Simple append.
			parent.appendChild(child);
		}
		
		
	};
	
	return self;
	
});
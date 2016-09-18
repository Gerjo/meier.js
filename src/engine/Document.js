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
	
    self.OnHover = function(selector, fn) {
        
		var node = self.Find(selector);
		
        var eventName = ("ontouchstart" in window) ? "touchbegin" : "mouseover";
    
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

	
	return self;
	
});
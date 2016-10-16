/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/


define(function(require) {
    function Stopwatch() {
        this.start();
    }

    Stopwatch.prototype.start = function() {
        this.startTime = new Date().getTime();
        return this;
    };
    
    Stopwatch.prototype.restart = function() {
        this.startTime = new Date().getTime();
        return this;
    };

    Stopwatch.prototype.forwardSecond = function() {
        this.startTime  -= 1001;
    };

    Stopwatch.prototype.stop = function() {
        return new Date().getTime() - this.startTime;
    };

    Stopwatch.prototype.peek = Stopwatch.prototype.elapsed = function() {
        return new Date().getTime() - this.startTime;
    };
    
    Stopwatch.prototype.seconds = function() {
		return this.peek() * 0.001;
	};
	
    Stopwatch.prototype.millies = function() {
		return this.peek();
	};
	
    return Stopwatch;
});



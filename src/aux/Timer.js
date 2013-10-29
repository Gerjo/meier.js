/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/


define(function(require) {
    
    function Timer(interval) {
        this.interval  = interval;
        this.startTime = new Date().getTime();
    }
    
    Timer.prototype.expired = function() {
        
        var hasExpired = (new Date().getTime() - this.startTime > this.interval) ? true : false;
                
        // Restart the timer:
        if(hasExpired) {
            this.startTime = new Date().getTime();
        }
        
        return hasExpired;
    };
    
    return Timer;
});
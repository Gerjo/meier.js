define(function(require){
    var Game = require("meier/engine/Game");
    var Colors = require("meier/engine/Colors");
    
    var ReadBytes = require("meier/extra/Read").Bytes;
    var FFT       = require("meier/math/Fft");
    var Orni      = require("./Orni");
    
    Spectrogram.prototype = new Game();
    
    function Spectrogram(container) {        
        Game.call(this, container);
        
        this.setHighFps(5);
        
        var f    = 22050; // Sampling frequency, i.e., datapoints per second.
        var wl   = 512/2/2/2/2/2;   // Group size being fed to FFT
        var data = Orni.slice(0, Orni.length - 482);  // Subject to be analyzed
        
        var indices = Array.Range(0, data.length);
        
        var buckets = [];
        
        var absmin = +Infinity;
        var absmax = -Infinity;
        var logmin = +Infinity;
        var logmax = -Infinity;
        var rmin   = +Infinity;
        var rmax   = -Infinity;
        var imin   = +Infinity;
        var imax   = -Infinity;
        var amin   = +Infinity
        var amax   = -Infinity;
        
        FFT.Split(data, wl).map(function(signal, i) {
            var real = signal.clone();
            var imag = Array.Fill(real.length, 0);
            
            FFT.Transform(real, imag);
            
            var abs = FFT.Abs(real, imag);
            
            var bucket = {
                abs:   abs,
                real:  real,
                imag:  imag,
                angle: real.map(function(r, i) { return Math.atan2(r, imag[i]); }),
                log10: abs.map(function(n) { return n ? Math.ln(n) / Math.ln(10) : 0; }),
                time:  i * wl / 22050
            };
            
            // Global minima / maxima
            absmin = Math.min(absmin, Math.min.apply(null, abs));
            absmax = Math.max(absmax, Math.max.apply(null, abs));
            logmin = Math.min(logmin, Math.min.apply(null, bucket.log10));
            logmax = Math.max(logmax, Math.max.apply(null, bucket.log10));
            rmin   = Math.min(rmin, Math.min.apply(null, real));
            rmax   = Math.max(rmax, Math.max.apply(null, real));
            imin   = Math.min(imin, Math.min.apply(null, imag));
            imax   = Math.max(imax, Math.max.apply(null, imag));
            amin   = Math.min(amin, Math.min.apply(null, bucket.angle));
            amax   = Math.max(amax, Math.max.apply(null, bucket.angle));
            
            buckets.push(bucket);
            
            console.log("Bucket " + i + " time: " + bucket.time);
        });
        
        // Bind state for drawing
        this.absmin     = absmin;
        this.absmax     = absmax;
        this.logmin     = logmin;
        this.logmax     = logmax;
        this.rmin       = rmin;
        this.rmax       = rmax;
        this.imin       = imin;
        this.imax       = imax;
        this.amin       = amin;
        this.amax       = amax;
        
        this.buckets    = buckets;
    }
    
    Spectrogram.prototype.update = function(dt) {
        Game.prototype.update.call(this, dt);
        
    };
    
    Spectrogram.prototype.draw = function(renderer) {
        Game.prototype.draw.call(this, renderer);
        
        
        var height = 200;
        
        
        this.buckets.forEach(function(bucket, i) {
            var x = i;
            
            
            for(var j = 0; j < bucket.abs.length; ++j) {
                //renderer.rectangle(x, (bucket.abs[j] / this.absmax) * height, 1, 1);
                renderer.begin()
                renderer.rectangle(x - this.buckets.length * .5, (bucket.real[j] / this.rmax) * height, 1, 1);
                //renderer.rectangle(x - this.buckets.length * .5, (bucket.angle[j] / this.amax) * height, 1, 1);
                //renderer.fill(Colors.HeatMap(this.absmin, this.absmax, bucket.abs[j]));
                renderer.fill(Colors.HeatMap(this.logmin, this.logmax, bucket.log10[j]));
                //renderer.fill(Colors.HeatMap(this.imin, this.imax, bucket.imag[j]));
                //renderer.rectangle(x, (bucket.log10[j] / this.logmax) * height, 1, 1);
            }
            
            
        }.bind(this));
        
        
    };
    
    return Spectrogram;
});
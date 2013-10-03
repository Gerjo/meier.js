function Stopwatch() {
    this.start();
}

Stopwatch.prototype.start = function() {
    this.startTime = new Date().getTime();
    return this;
};

Stopwatch.prototype.forwardSecond = function() {
    this.startTime  -= 1001;
};

Stopwatch.prototype.stop = function() {
    return new Date().getTime() - this.startTime;
};

Stopwatch.prototype.peek = function() {
    return new Date().getTime() - this.startTime;
};
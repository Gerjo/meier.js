///
/// Train of thought: leave most things up to the user. Just
/// have some boilerplate code here.
///
/// Second train: don't use statics, the user should be able
/// to run two games on the same page, at the same time.
///
/// If it can be mutable, it should be mutable. This for
/// performance reasons.
///
function Game(container) {

    // Default contructor, do nothing.
    if( ! container) {
        return;
    }

    this.isTablet = ('ontouchstart' in document.documentElement);
    this.isSlow   = false;
    
    // Update loop related matter:
    this.frame            = 0;               // frame counter.
    this.clock            = new Stopwatch(); // Wall Clock.
    this.fps              = 15;              // Desired framerate
    this.timer            = new Stopwatch(); // Delta time counter.
    this.width            = container.offsetWidth;
    this.height           = container.offsetHeight;
    
    this.renderer         = new Renderer(container, this.width, this.height);
    
    // Debug information:
    this.stats            = new Stats(this.width, this.height);
    
    // Keyboard, touch and mouse events:
    this.input            = new Input(this.renderer.canvas, this.width, this.height, this.isTablet);
    
    // Default loop:
    this.intervalId       = setInterval(this._update.bind(this), 1000 / this.fps);
}

Game.prototype.setFps = function(fps) {
    this.fps = fps;
    
    // Remove current loop:
    clearTimeout(this.intervalId);
    
    // Scedule a new loop:
    this.intervalId = setInterval(this._update.bind(this), 1000 / this.fps);
};

Game.prototype._update = function() {
    var dt = this.timer.peek() * 0.001;
    this.timer.start();
    
    this.stats.log("FPS", Math.ceil(1 / dt) + "/" + this.fps);
    this.stats.log("Clock", Math.floor(this.clock.peek() * 0.001));
    
    // User defined update.
    this.update(dt);
    
    // Clean the screen:
    // Actually, leave that up to the user.
    //this.renderer.clear();
    
    // User defined draw loop:
    this.draw(this.renderer);
    
    // Update statistics (TODO: rework some things)
    this.stats.update();
    
    this.stats.draw(this.renderer.context);
};

Game.prototype.update = function(dt) {
    // TODO: Override...
};

Game.prototype.draw = function(renderer) {
    // TODO: Override...
};


define(function(require) {
	
	var Entity    = require("meier/engine/Entity");
	var Stopwatch = require("meier/extra/Stopwatch");
	
	Task.prototype = new Entity();
	
	function Task(callable) {
		Entity.call(this, 0, 0);
		
		this._timer = new Stopwatch();
		this._iteration  = 0;
		this._generation = 0;
		this._callable = null;
		
		
		if(callable) {
			this.setTask(callable);
		}
	}
	
	Task.prototype.setTask = Task.prototype.set = function(callable) {
		this._callable = callable;
		this._iteration = 0;
		this._generation = 0;
	};
	
	Task.prototype.stop = function() {
		this.setTask(null);
		// perhaps cache, such that resume could work?
	};
	
	Task.prototype.update = function(dt) {
		
		if(typeof this._callable == "function") {
			++this._generation;
			
			var timer = this._timer;
		
			TODO("Tie async task / loop into FPS.");
			
			timer.start();
		
			var running = false;
		
			do {
		
				running = this._callable(this._iteration, this._generation);				
				++this._iteration;

			} while(running === true && timer.seconds() < 1/10);
			
			if(running == false) {
				this._callable = null;
			}
			
		}
	};
	
	
	return Task;
});
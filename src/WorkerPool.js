var WorkerPool = function(nNumberOfWorkers) {
	this.nNumberOfWorkers = nNumberOfWorkers;
	this.oWorkers = [];
	this.oIdleWorkers = [];
	this.oPendingTasksFIFO = [];
	this.bShouldClose = false;
	
	this._fnCreateWorkers();
};

WorkerPool.prototype._fnCreateWorkers = function() {
	var i;
	
	for (i = 0; i < this.nNumberOfWorkers; i++) {
		this.oWorkers.push(new PoolWorker(this));
		this.oIdleWorkers.push(this.oWorkers[i]);
	}		
};

WorkerPool.prototype.fnExecute = function(fnFunctionToExecute, fnCallback /*, oParameterValues...*/) {
	if (!this.bShouldClose) {
		var oTask = new Task(fnFunctionToExecute, fnCallback, Array.prototype.slice.call(arguments).slice(2));

		if (this.oIdleWorkers.length > 0) {
			this.oIdleWorkers.pop()._fnExecute(oTask);
		} else {
			console.log("Pool busy. Waiting for free worker.");
			this.oPendingTasksFIFO.push(oTask);
		}
		
		return 1;
	} else {
		return -1;
	}
	
};
	
WorkerPool.prototype._fnWorkOnPendingTasks = function() {
	if (this.oPendingTasksFIFO.length > 0) {
		var oTaskToExecute = this.oPendingTasksFIFO.splice(0,1)[0];
		console.log("Working on pending task.");
		this.oIdleWorkers.pop()._fnExecute(oTaskToExecute);
		
		return true;
	}
	
	return false;
};
	
WorkerPool.prototype._fnSignalIdleWorker = function(oWorker) {
	this.oIdleWorkers.push(oWorker);
	if (!this._fnWorkOnPendingTasks() && this.bShouldClose && this.oIdleWorkers.length === this.nNumberOfWorkers)
		this._fnTerminateWorkers();
};

WorkerPool.prototype.fnClose = function() {
	this.bShouldClose = true;
	
	if (this.oIdleWorkers.length === this.nNumberOfWorkers && this.oPendingTasksFIFO.length < 1) 
		this._fnTerminateWorkers();
};

WorkerPool.prototype._fnTerminateWorkers = function () {
	var i;
		
	for (i = 0; i < this.nNumberOfWorkers; i++) {
		this.oWorkers[i].fnTerminate();
	}

	this.oWorkers = [];
	this.oIdleWorkers = [];
};
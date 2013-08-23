describe("WorkerPool", function() {
 	var oPool;
 	var oTestFunctions;
 	var oCallbackCalled;
 	var oCallbackCalled2;
 	var nNumberOfWorkers = 2;

	beforeEach(function() {
		oCallbackCalled = false;
		oCallbackCalled2 = false;

		oPool = null;
		oPool = new WorkerPool(nNumberOfWorkers);

		oTestFunctions = {
			timeConsumer: function (maximum) {
				var i;

				for (i = 0; i < maximum; i++) {
					0 % (i + 1);
				}

				return i - 1;	
			},

			sleep: function (nMilliseconds) {
				oStartDate = new Date();
				while (new Date() - oStartDate < nMilliseconds);
			},

			waitASecond: function () {
				sleep(1000);

				return true;
			},

			callbacker: function (result) {
				oCallbackCalled = true;

				return true;
			},

			callbacker2: function (result) {
				oCallbackCalled2 = true;

				return true;
			}
		};
	});
	
	afterEach(function() {
		oPool.fnClose();
	});
	
	it("should execute a task and return the right result", function() {
		spyOn(oTestFunctions, "callbacker").andCallThrough();

		runs(function() {
			oPool.fnExecute(oTestFunctions.timeConsumer, oTestFunctions.callbacker, 1000);
		});

		waitsFor(function() {
			return oCallbackCalled;
		}, "The callback should be called", 5000);

		runs(function() {
			expect(oTestFunctions.callbacker).toHaveBeenCalled();
			expect(oTestFunctions.callbacker).toHaveBeenCalledWith(999);
		});
	});

	it("should add a task to the list of pending tasks if all workers are busy and execute it afterwards", function() {
		spyOn(oTestFunctions, "callbacker").andCallThrough();

		runs(function() {
			var i = 0;
			
			for (i = 0; i < nNumberOfWorkers; i++) {
				oPool.fnExecute(oTestFunctions.sleep, function() {}, 500);
			}
			oPool.fnExecute(oTestFunctions.timeConsumer, oTestFunctions.callbacker, 1000);

			expect(oPool.oPendingTasksFIFO.length).toBe(1);
		});

		waitsFor(function() {
			return oCallbackCalled;
		}, "The callback should be called", 5000);

		runs(function() {
			expect(oTestFunctions.callbacker).toHaveBeenCalled();
			expect(oTestFunctions.callbacker).toHaveBeenCalledWith(999);
		});
		
	});

	it("should spawn the right amount of WebWorker objects", function() {
		expect(oPool.oWorkers.length).toBe(nNumberOfWorkers);
	});

	it("should have all workers in idle state immediately after creation", function() {
		expect(oPool.oIdleWorkers.length).toBe(nNumberOfWorkers);
	});

	it("should have number of all workers - 1 in idle state after starting a task", function() {
		//create spy to prevent execution of _fnSignalIdleWorker and reinserting worker to idle list
		spyOn(oPool, "_fnSignalIdleWorker");
		oPool.fnExecute(oTestFunctions.timeConsumer, oTestFunctions.callbacker, 1000);
		expect(oPool.oIdleWorkers.length).toBe(nNumberOfWorkers - 1);
	});
	
	it("should have an empty list of pending tasks immediately after creation", function() {
		expect(oPool.oPendingTasksFIFO.length).toBe(0);
	});

});

describe("WorkerPool - close functionality", function() {
 	var oPool;
 	var oTestFunctions;
 	var oCallbackCalled;
 	var oCallbackCalled2;
 	var nNumberOfWorkers = 2;

	beforeEach(function() {
		oCallbackCalled = false;
		oCallbackCalled2 = false;

		oPool = null;
		oPool = new WorkerPool(nNumberOfWorkers);

		oTestFunctions = {
			timeConsumer: function (maximum) {
				var i;

				for (i = 0; i < maximum; i++) {
					0 % (i + 1);
				}

				return i - 1;	
			},

			sleep: function (nMilliseconds) {
				oStartDate = new Date();
				while (new Date() - oStartDate < nMilliseconds);
			},

			waitASecond: function () {
				sleep(1000);

				return true;
			},

			callbacker: function (result) {
				oCallbackCalled = true;

				return true;
			},

			callbacker2: function (result) {
				oCallbackCalled2 = true;

				return true;
			}
		};
	});
	
	it("should terminate all the workers immediately if no worker is running and no tasks are pending", function() {
		var oWorkersToClose = [];
		var i;
		
		for (i = 0; i < oPool.oWorkers.length; i++) {
			oWorkersToClose[i] = oPool.oWorkers[i].oPoolWorker;
			spyOn(oWorkersToClose[i], "terminate").andCallThrough();
		}
		
		oPool.fnClose();

		for (i = 0; i < oPool.oWorkers.length; i++) {
			expect(oWorkersToClose[i].terminate).toHaveBeenCalled();
		}
	});
	
	it("should terminate all the workers when no tasks are pending aynmore", function() {
		var oWorkersToClose = [];
		var i;
		
		for (i = 0; i < oPool.oWorkers.length; i++) {
			oWorkersToClose[i] = oPool.oWorkers[i].oPoolWorker;
			spyOn(oWorkersToClose[i], "terminate").andCallThrough();
		}
		
		runs(function() {
			var i = 0;
			
			for (i = 0; i < nNumberOfWorkers; i++) {
				oPool.fnExecute(oTestFunctions.sleep, function() {}, 500);
			}
			oPool.fnExecute(oTestFunctions.timeConsumer, oTestFunctions.callbacker, 1000);
			oPool.fnClose();

			expect(oPool.oPendingTasksFIFO.length).toBe(1);
			for (i = 0; i < oPool.oWorkers.length; i++) {
				expect(oWorkersToClose[i].terminate.calls.length).toEqual(0);
			}
		});
		
		waitsFor(function() {
			return oCallbackCalled;
		}, "The callback should be called", 5000);

		runs(function() {
			expect(oPool.oPendingTasksFIFO.length).toBe(0);
			expect(oPool.oIdleWorkers.length).toBe(0);
			for (i = 0; i < oPool.oWorkers.length; i++) {
				expect(oWorkersToClose[i].terminate).toHaveBeenCalled();
			}
		});		
	});
	
	it("should not be possible to execute tasks in a closed pool", function() {
		spyOn(window, "Task");
		
		oPool.fnClose();
		
		expect(oPool.fnExecute(oTestFunctions.sleep, function() {}, 500)).toBe(-1);
		expect(window.Task.calls.length).toEqual(0);
	});
	
	it("should not be possible to execute tasks in a pool which is waiting to be closed", function() {
		spyOn(window, "Task");
		var oWorkersToClose = [];
		var i;
		
		for (i = 0; i < oPool.oWorkers.length; i++) {
			oWorkersToClose[i] = oPool.oWorkers[i].oPoolWorker;
			spyOn(oWorkersToClose[i], "terminate").andCallThrough();
		}
		
		runs(function() {
			var i = 0;
			
			for (i = 0; i < nNumberOfWorkers; i++) {
				oPool.fnExecute(oTestFunctions.sleep, function() {}, 500);
			}
			oPool.fnExecute(oTestFunctions.timeConsumer, oTestFunctions.callbacker, 1000);
			oPool.fnClose();

			expect(oPool.oPendingTasksFIFO.length).toBe(1);
			for (i = 0; i < oPool.oWorkers.length; i++) {
				expect(oWorkersToClose[i].terminate.calls.length).toEqual(0);
			}
		
			expect(oPool.fnExecute(oTestFunctions.sleep, function() {}, 500)).toBe(-1);
			expect(window.Task.calls.length).toEqual(nNumberOfWorkers + 1);						
		});
	});
	
});

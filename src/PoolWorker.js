var PoolWorker = function(oPool) {
	var _this = this;
	this.oPool = oPool;	
	this.oCurrentTask = null;
	
	this.sPoolWorkerBoilerplate = 
		"self.fnExecute = function(sCodeToExecute) {\n" +
			"var fnCodeToExecute = new Function([], sCodeToExecute);" +
			"var oReturnValue = fnCodeToExecute();\n" +
			"self.postMessage({\n" +
				"command: \"stop\",\n" +
				"returnValue: oReturnValue\n" +
			"});\n" +
		"};" +
		"self.addEventListener(\"message\", function(e) {\n" +
  			"if (e.data.command === \"start\")\n" +
				"self.fnExecute(e.data.code, e.data.parameterList, e.data.parameters);\n" +
		"}, false);\n";
			
	this.oPoolWorker = new Worker(URL.createObjectURL(new Blob([this.sPoolWorkerBoilerplate], {type: "text/javascript"})));
	
	this.oPoolWorker.addEventListener("message", function(e) {
		if (e.data.command === "stop") {
			_this.oPool._fnSignalIdleWorker(_this);
			_this.oCurrentTask.fnCallback(e.data.returnValue);
		}		
	}, false);
};

PoolWorker.prototype._fnExecute = function(oTask) {
	this.oCurrentTask = oTask;
	this.oPoolWorker.postMessage({
		command: "start",
		code: oTask.sCodeToExecute
	});
};

PoolWorker.prototype.fnTerminate = function() {
	this.oPoolWorker.terminate();
};
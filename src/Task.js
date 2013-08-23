var Task = function(fnFunctionToExecute, fnCallback, oParameterValues) {
	this.fnCallback = fnCallback;
	this.sParameters = this._fnExtractParameterList(fnFunctionToExecute);
	this.sCodeToExecute = this._fnExtractCode(fnFunctionToExecute);
	this.sCodeToExecute = this._fnInsertParametersIntoCode(this.sParameters, oParameterValues, this.sCodeToExecute);
};

Task.prototype._fnExtractCode = function(fnFunctionToExtract) {
	var sFunctionToExtract = fnFunctionToExtract.toString();
	var sExtractedFunction = sFunctionToExtract.substr(sFunctionToExtract.indexOf("{"));
	
	return sExtractedFunction;
};

Task.prototype._fnExtractParameterList = function(fnFunctionToExtract) {
	var sFunctionToExtract = fnFunctionToExtract.toString();
	var sParameters = sFunctionToExtract.substr(sFunctionToExtract.indexOf("(") + 1);
	sParameters = sParameters.substr(0, sParameters.indexOf(")")).replace(/\s/g, "");

	return sParameters.length > 0 ? sParameters.split(",") : [];
};

Task.prototype._fnInsertParametersIntoCode = function(sParameters, oParameterValues, sCodeToExecute) {
	var sFilledParameterBlock = "{";
	var i;

	for (i = 0; i < sParameters.length; i++) {
		sFilledParameterBlock += "var " + sParameters[i] + " = " + oParameterValues[i] + ";\n";
	}

	return sFilledParameterBlock + sCodeToExecute.substr(1);
};
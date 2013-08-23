function removeFormatting(sString) {
	return sString.replace(/(\t|\n|\r)/g,"");
}

describe("Task", function() {
 	var oTask;
 	var oFunctionsToExtract;

	beforeEach(function() {
		oTask = null;
		

		oFunctionsToExtract = {
			withoutParameters: function() {
				var a;
				var d = 10;
				var e = [];
				var f = {};

				for (a = 0; a < d; a++) {
					e[a]= a;
				}

				f.test = e[1];

				return e[9];
			},

			oneParameter: function(a) {
				return a;
			},

			threeParameters: function(a, b, c) {
				return a + b + c;
			}
		};
	});
	describe("Function body extraction", function() {
		it("should extract the function body for functions without parameters", function() {	
			oTask = new Task(oFunctionsToExtract.withoutParameters, function() {}, []);
			expect(removeFormatting(oTask.sCodeToExecute)).toBe("{" +
	 			"var a;" +
	 			"var d = 10;" +
				"var e = [];" +
				"var f = {};" +
				 
				"for (a = 0; a < d; a++) {" +
				"e[a]= a;" +
				"}" +
				 
				"f.test = e[1];" +
				 
				"return e[9];" +
 			"}");
		});

		it("should extract the function body for functions with parameters and add the parameters", function() {	
			oTask = new Task(oFunctionsToExtract.threeParameters, function() {}, [1, 2, 3]);
			expect(removeFormatting(oTask.sCodeToExecute)).toBe("{" +
	 			"var a = 1;" +
	 			"var b = 2;" +
				"var c = 3;" +
								 
				"return a + b + c;" +
 			"}");
		});
	});

	describe("Function parameter extraction", function() {
		it("should not find any parameters if the function does not contain parameters", function() {	
			oTask = new Task(oFunctionsToExtract.withoutParameters, function() {}, []);
			expect(oTask.sParameters.length).toBe(0);
		});

		it("should find one parameters the function contains one parameter", function() {	
			oTask = new Task(oFunctionsToExtract.oneParameter, function() {}, []);
			expect(oTask.sParameters.length).toBe(1);
		});

		it("should find the exact amount of parameters the function contains multiple parameters", function() {	
			oTask = new Task(oFunctionsToExtract.threeParameters, function() {}, []);
			expect(oTask.sParameters.length).toBe(3);
		});
	});

});
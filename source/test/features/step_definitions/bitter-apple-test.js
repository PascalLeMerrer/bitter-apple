/* jslint node: true */
'use strict';

console.log('Using local bitter-apple for testing');
var bitterapple = require('../../../bitter-apple/bitter-apple.js');

var subtractionResult;

module.exports = function() {
	// cleanup before every scenario
	this.Before(function() {
		this.bitterapple = new bitterapple.BitterApple('http', 'httpbin.org');
	});

	this.When(/^I subtract (.*) from (.*)$/, function(variable1, variable2, callback) {
		var value1 = this.bitterapple.getGlobalVariable(variable1);
		var value2 = this.bitterapple.getGlobalVariable(variable2);
		subtractionResult = value2 - value1;
		callback();
	});

	this.Then(/^result should be (\d+)$/, function(result, callback) {
		if (subtractionResult == result) {
			callback();
		} else {
			callback(new Error(subtractionResult + ' is not equal to ' + result));
		}
	});
};

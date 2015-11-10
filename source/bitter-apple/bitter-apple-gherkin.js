/* jslint node: true */
'use strict';
module.exports = function() {

	var printResponse = function(self) {
		process.stdout.write('      but real value is\n' + self.bitterapple.getRealValue() + '\n');
	};

	this.Given(/^I set (.*) header to (.*)$/, function(headerName, headerValue, callback) {
		this.bitterapple.addRequestHeader(headerName, headerValue);
		callback();
	});

	this.Given(/^I set (.*) header to scenario variable (.*)$/, function(headerName, variableName, callback) {
		this.bitterapple.addRequestHeaderFromScenarioVariable(headerName, variableName);
		callback();
	});

	this.Given(/^I set (.*) header to global variable (.*)$/, function(headerName, variableName, callback) {
		this.bitterapple.addRequestHeaderFromGlobalVariable(headerName, variableName);
		callback();
	});

	this.Given(/^I set body to (.*)$/, function(bodyValue, callback) {
		this.bitterapple.setRequestBody(bodyValue);
		callback();
	});

	this.Given(/^I pipe contents of file (.*) to body$/, function(file, callback) {
		this.bitterapple.pipeFileContentsToRequestBody(file, function(error) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.Given(/^I have basic authentication credentials (.*) and (.*)$/, function(username, password, callback) {
		this.bitterapple.addHttpBasicAuthorizationHeader(username, password);
		callback();
	});

	this.When(/^I GET (.*)$/, function(resource, callback) {
		this.bitterapple.get(resource, function(error, response) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.When('I POST to $resource', function(resource, callback) {
		this.bitterapple.post(resource, function(error, response) {
			if (error) {
				callback.fail(error);
			}
			callback();
		});
	});

	this.When('I POST to $resource with body', function(resource, bodyValue, callback) {
		this.bitterapple.setRequestBody(bodyValue);
		this.bitterapple.post(resource, function(error, response) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.When('I PUT $resource', function(resource, callback) {
		this.bitterapple.put(resource, function(error, response) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.When('I PUT $resource with body', function(resource, bodyValue, callback) {
		this.bitterapple.setRequestBody(bodyValue);
		this.bitterapple.put(resource, function(error, response) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.When('I DELETE $resource', function(resource, callback) {
		this.bitterapple.delete(resource, function(error, response) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.When('I DELETE $resource with body', function(resource, bodyValue, callback) {
		this.bitterapple.setRequestBody(bodyValue);
		this.bitterapple.delete(resource, function(error, response) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.When('I PATCH $resource', function(resource, callback) {
		this.bitterapple.patch(resource, function(error, response) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.When('I PATCH $resource with body', function(resource, bodyValue, callback) {
		this.bitterapple.setRequestBody(bodyValue);
		this.bitterapple.patch(resource, function(error, response) {
			if (error) {
				callback.fail(error);
			}

			callback();
		});
	});

	this.Then(/^response header (.*) should exist$/, function(header, callback) {
		if (this.bitterapple.assertResponseContainsHeader(header)) {
			callback();
		} else {
			callback.fail('response header ' + header + ' does not exists in response');
			printResponse(this);
		}
	});

	this.Then(/^response header (.*) should not exist$/, function(header, callback) {
		if (this.bitterapple.assertResponseContainsHeader(header)) {
			callback.fail('response header ' + header + ' exists in response');
			printResponse(this);
		} else {
			callback();
		}
	});

	this.Then(/^response body should be valid (xml|json)$/, function(contentType, callback) {
		if (this.bitterapple.assertResponseBodyContentType(contentType)) {
			callback();
		} else {
			callback.fail('response body is not valid ' + contentType);
			printResponse(this);
		}
	});

	this.Then(/^response code should be (\d+)$/, function(responseCode, callback) {
		if (this.bitterapple.assertResponseCode(responseCode)) {
			callback();
		} else {
			callback.fail('response code should be ' + responseCode);
			printResponse(this);
		}
	});

	this.Then(/^response code should not be (\d+)$/, function(responseCode, callback) {
		if (this.bitterapple.assertResponseCode(responseCode)) {
			callback.fail('response code should not be ' + responseCode);
			printResponse(this);
		} else {
			callback();
		}
	});

	this.Then(/^response header (.*) should be (.*)$/, function(header, expression, callback) {
		if (this.bitterapple.assertHeaderValue(header, expression)) {
			callback();
		} else {
			callback.fail('response header ' + header +' should be ' + expression);
			printResponse(this);
		}
	});

	this.Then(/^response header (.*) should not be (.*)$/, function(header, expression, callback) {
		if (this.bitterapple.assertHeaderValue(header, expression)) {
			callback.fail('response header ' + header + ' should be ' + expression);
			printResponse(this);
		} else {
			callback();
		}
	});

	this.Then(/^response body should contain (.*)$/, function(expression, callback) {
		if (this.bitterapple.assertResponseBodyContainsExpression(expression)){
			callback();
		}
		else {
			callback.fail('reponse body should contain ' + expression);
			printResponse(this);
		}
	});

	this.Then(/^response body should not contain (.*)$/, function(expression, callback) {
		if(!this.bitterapple.assertResponseBodyContainsExpression(expression)) {
			callback();
		}
		else {
			callback.fail('reponse body should not contain ' + expression);
			printResponse(this);
		}
	});

	this.Then(/^the JSON should be$/, function(expression, callback) {
		if(this.bitterapple.assertResponseBodyIsJSON(expression)) {
			callback();
		}
		else {
			callback.fail('response body should be \n' + expression);
		  printResponse(this);
		}
	});

	this.Then(/^response body path (.*) should be (.*)$/, function(path, value, callback) {
		if (this.bitterapple.assertPathInResponseBodyMatchesExpression(path, value)) {
			callback();
		} else {
			callback.fail('response body path ' + path + ' should be ' + value);
		  printResponse(this);
		}
	});

	this.Then(/^response body path (.*) should not be (.*)$/, function(path, value, callback) {
		if (this.bitterapple.assertPathInResponseBodyMatchesExpression(path, value)) {
			callback.fail('response body path ' + path + ' should not be ' + value);
		  printResponse(this);
		} else {
			callback();
		}
	});

	this.Then(/^I store the value of body path (.*) as access token$/, function(path, callback) {
		this.bitterapple.setAccessTokenFromResponseBodyPath(path);
		callback();
	});

	this.Then(/^I store the value of header (.*) as access token$/, function(header, callback) {
		this.bitterapple.setAccessTokenFromHeader(header);
		callback();
	});

	this.When(/^I set bearer token$/, function(callback) {
		this.bitterapple.setBearerToken();
		callback();
	});

	this.Then(/^I store the value of response header(.*) as (.*) in global scope$/, function(headerName, variableName, callback) {
		this.bitterapple.storeValueOfHeaderInGlobalScope(headerName, variableName);
		callback();
	});

	this.Then(/^I store the value of body path (.*) as (.*) in global scope$/, function(path, variableName, callback) {
		this.bitterapple.storeValueOfResponseBodyPathInGlobalScope(path, variableName);
		callback();
	});

	this.When(/^I store the value of response header (.*) as (.*) in scenario scope$/, function(name, variable, callback) {
		this.bitterapple.storeValueOfHeaderInScenarioScope(name, variable);
		callback();
	});

	this.When(/^I store the value of body path (.*) as (.*) in scenario scope$/, function(path, variable, callback) {
		this.bitterapple.storeValueOfResponseBodyPathInScenarioScope(path, variable);
		callback();
	});

	this.Then(/^value of scenario variable (.*) should be (.*)$/, function(variableName, variableValue, callback) {
		if (this.bitterapple.assertScenarioVariableValue(variableName, variableValue)) {
			callback();
		} else {
			callback.fail('value of scenario variable ' + variableName + ' should be ' + variableValue);
			printResponse(this);
		}
	});

	this.Then(/^value of global variable (.*) should be (.*)$/, function(variableName, variableValue, callback) {
		if (this.bitterapple.assertGlobalVariableValue(variableName, variableValue)) {
			callback();
		} else {
			callback.fail('value of global variable ' + variableName + ' should be ' + variableValue);
			printResponse(this);
		}
	});

};

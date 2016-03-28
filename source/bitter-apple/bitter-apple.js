/* jslint node: true */
'use strict';

var request = require('request');
var jsonPath = require('jsonpath-plus');
var select = require('xpath.js');
var dom = require('xmldom').DOMParser;
var fs = require('fs');
var util = require('util');

var accessToken;
var globalVariables = {};
var cookies = [];

var ATTRIBUTE = 2;

function BitterApple(scheme, domain) {
  this.domain = scheme + '://' + domain;
  this.headers = {};
  this.httpResponse = {};
  this.requestBody = '';
  this.scenarioVariables = {};
  this.realValue = null;
}

/**
 * Provides the value that was compared to the expected one
 */
BitterApple.prototype.getRealValue = function() {
  var valueAsString = util.inspect(this.realValue);
  return '\x1b[31m ' + valueAsString + ' \x1b[0m ' ; // ANSI COLOR codes for red and reset attributes
};

BitterApple.prototype.addRequestHeader = function(name, value) {
  this.headers[name] = value;
};

BitterApple.prototype.setScenarioVariable = function(name, value) {
  this.scenarioVariables[name] = value;
};

BitterApple.prototype.setGlobalVariable = function(name, value) {
  globalVariables[name] = value;
};

BitterApple.prototype.addRequestHeaderFromScenarioVariable = function(name, variable) {
  this.headers[name] = this.scenarioVariables[variable];
};

BitterApple.prototype.addRequestHeaderFromGlobalVariable = function(name, variable) {
  this.headers[name] = globalVariables[variable];
};

BitterApple.prototype.getResponseObject = function() {
  return this.httpResponse;
};

BitterApple.prototype.setRequestBody = function(body) {
  this.requestBody = replaceVariables(body, this.scenarioVariables);
};

BitterApple.prototype.pipeFileContentsToRequestBody = function(file, callback) {
  var self = this;
  fs.readFile(file, 'utf8', function(err, data) {
    if (err) {
      callback(err);
    }

    self.setRequestBody(data);
    callback();
  });
};

BitterApple.prototype.get = function(resource, callback) {
  resource = replaceVariables(resource, this.scenarioVariables);
  var self = this;
  request.get({
      url: this.domain + resource,
      headers: this.headers,
      followRedirect: false
    },
    function(error, response) {
      if (error) {
        return callback(error);
      }

      processResponse(self, response);
      callback(null, response);
    });

};

/**
 * Memorizes the server response
 */
function processResponse(self, response) {
    self.httpResponse = response;
    if(response.headers.hasOwnProperty("set-cookie")) {
        for (var i = 0; i < response.headers["set-cookie"].length; i++) {
            parseCookies(response.headers["set-cookie"][i])
        }
    }
}

/**
 * Decodes a raw cookie and store its value in the cookies global var
 */
function parseCookies(rawCookie) {
    rawCookie && rawCookie.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        cookies[parts.shift().trim()] = decodeURI(parts.join('='));
    });
}

/**
 * Adds a received cookie to headers
 */
BitterApple.prototype.sendCookie = function(cookieName) {
    if(!cookies.hasOwnProperty(cookieName)) {
      return false;
    }
    if(!this.headers.hasOwnProperty('Cookie')) {
        this.headers['Cookie'] = []
    }
    this.headers['Cookie'].push(cookieName + '=' + cookies[cookieName] + ';')
    return true;
};

BitterApple.prototype.clearCookie = function(cookieName) {
    var suffix = cookieName + '=';
    for (var i = 0; i < this.headers['Cookie'].length; i++) {
        if (this.headers['Cookie'][i].startsWith(suffix)) {
          this.headers['Cookie'].splice(i, 1)
          break;
        }
    }
    return true;
}


BitterApple.prototype.post = function(resource, callback) {
  resource = replaceVariables(resource, this.scenarioVariables);
  var self = this;
  request({
      url: this.domain + resource,
      headers: this.headers,
      body: this.requestBody,
      followRedirect: false,
      method: 'POST'
    },
    function(error, response) {
      if (error) {
        return callback(error);
      }

      processResponse(self, response);
      callback(null, response);
    });
};

BitterApple.prototype.put = function(resource, callback) {
  resource = replaceVariables(resource, this.scenarioVariables);
  var self = this;
  request({
      url: this.domain + resource,
      headers: this.headers,
      followRedirect: false,
      body: this.requestBody,
      method: 'PUT'
    },
    function(error, response) {
      if (error) {
        return callback(error);
      }

      processResponse(self, response);
      callback(null, response);
    });
};

BitterApple.prototype.delete = function(resource, callback) {
  resource = replaceVariables(resource, this.scenarioVariables);
  var self = this;
  request({
      url: this.domain + resource,
      headers: this.headers,
      followRedirect: false,
      body: this.requestBody,
      method: 'DELETE'
    },
    function(error, response) {
      if (error) {
        return callback(error);
      }

      processResponse(self, response);
      callback(null, response);
    });
};

BitterApple.prototype.patch = function(resource, callback) {
  resource = replaceVariables(resource, this.scenarioVariables);
  var self = this;
  request({
      url: this.domain + resource,
      headers: this.headers,
      followRedirect: false,
      body: this.requestBody,
      method: 'PATCH'
    },
    function(error, response) {
      if (error) {
        return callback(error);
      }

      processResponse(self, response);
      callback(null, response);
    });
};

BitterApple.prototype.addHttpBasicAuthorizationHeader = function(username, password) {
  var b64EncodedValue = base64Encode(username + ':' + password);
  this.addRequestHeader('Authorization', 'Basic ' + b64EncodedValue);
};

BitterApple.prototype.assertResponseCode = function(responseCode) {
  this.realValue = this.getResponseObject().statusCode;
  return (this.getResponseObject().statusCode == responseCode);
};

BitterApple.prototype.assertResponseContainsHeader = function(header, callback) {
  this.realValue = this.getResponseObject().headers;
  if (this.getResponseObject().headers[header.toLowerCase()]) {
    return true;
  } else {
    return false;
  }
};

BitterApple.prototype.assertHeaderValue = function(header, expression) {
  this.realValue = this.getResponseObject().headers[header.toLowerCase()];
  var regex = new RegExp(expression);
  return (regex.test(this.realValue));
};

BitterApple.prototype.assertPathInResponseBodyMatchesExpression = function(path, regexp) {
  regexp = replaceVariables(regexp, this.scenarioVariables);
  var regExpObject = new RegExp(regexp);
  this.realValue = this.getResponseObject().body;
  try {
    var evalValue = evaluatePath(path, this.realValue);
    return (regExpObject.test(evalValue));
  } catch (exception) {
    return false; // json parsing failed
  }
};

BitterApple.prototype.assertResponseBodyIsJSON = function(expression) {
  expression = replaceVariables(expression, this.scenarioVariables);
  var real = JSON.parse(this.getResponseObject().body);
  this.realValue = JSON.stringify(real, null, 2);
  return areEqual(real, JSON.parse(expression));
};

BitterApple.prototype.assertResponseBodyContainsExpression = function(expression) {
  expression = replaceVariables(expression, this.scenarioVariables);
  var regex = new RegExp(expression);
  this.realValue = this.getResponseObject().body;
  return (regex.test(this.realValue));
};

BitterApple.prototype.assertResponseBodyContentType = function(contentType) {
  this.realValue = this.getResponseObject().body;
  return (getContentType(this.realValue) === contentType);
};

BitterApple.prototype.assertResponseBodyIsArray = function(path) {
  this.realValue = this.getResponseObject().body;
  return Array.isArray(evaluatePath(path, this.realValue));
};

BitterApple.prototype.assertResponseBodyIsArrayOfLength = function(path, value) {
  this.realValue = this.getResponseObject().body;
  var evaluatedValue = evaluatePath(path, this.realValue);
  return Array.isArray(evaluatedValue) && evaluatedValue.length == value;
};

BitterApple.prototype.evaluatePathInResponseBody = function(path) {
  return evaluatePath(path, this.getResponseObject().body);
};

BitterApple.prototype.setAccessTokenFromResponseBodyPath = function(path) {
  accessToken = evaluatePath(path, this.getResponseObject().body);
};

BitterApple.prototype.setAccessTokenFromHeader = function(header) {
  accessToken = this.getResponseObject().headers[header.toLowerCase()];
  this.setBearerToken();
};

BitterApple.prototype.setBearerToken = function() {
  this.addRequestHeader('Authorization', 'Bearer ' + accessToken);
};

BitterApple.prototype.storeValueOfHeaderInScenarioScope = function(header, variableName) {
  var value = this.getResponseObject().headers[header.toLowerCase()];
  this.scenarioVariables[variableName] = value;
};

BitterApple.prototype.storeValueOfResponseBodyPathInScenarioScope = function(path, variableName) {
  var value = evaluatePath(path, this.getResponseObject().body);
  this.scenarioVariables[variableName] = value;
};

BitterApple.prototype.assertScenarioVariableValue = function(variable, value) {
  this.realValue = String(this.scenarioVariables[variable]);
  return (this.realValue === value);
};

BitterApple.prototype.assertGlobalVariableValue = function(variable, value) {
  this.realValue = String(globalVariables[variable]);
  return (this.realValue === value);
};

BitterApple.prototype.storeValueOfHeaderInGlobalScope = function(headerName, variableName) {
  var value = this.getResponseObject().headers[headerName.toLowerCase()];
  this.setGlobalVariable(variableName, value);
};

BitterApple.prototype.storeValueOfResponseBodyPathInGlobalScope = function(path, variableName) {
  var value = evaluatePath(path, this.getResponseObject().body)[0];
  this.setGlobalVariable(variableName, value);
};

BitterApple.prototype.setGlobalVariable = function(name, value) {
  globalVariables[name] = value;
};

BitterApple.prototype.getGlobalVariable = function(name) {
  return globalVariables[name];
};

BitterApple.prototype.evaluatePath = function(path, content){
  return evaluatePath(path, content);
};



exports.BitterApple = BitterApple;


/**
 * Replaces variable identifiers in the resource string
 * with their value in scenario variables if it exists.
 * Otherwise looks for the value in global variables.
 * Returns the modified string
 * The variable identifiers must be delimited with backticks
 */
var replaceVariables = function(resource, scenarioVariables) {
  resource = replaceScopeVariables(resource, scenarioVariables);
  resource = replaceScopeVariables(resource, globalVariables);
  return resource;
};

/**
 * Replaces variable identifiers in the resource string
 * with their value in scope if it exists
 * Returns the modified string
 * The variable identifiers must be delimited with backticks
 * offset defines the index of the char from which the variables are to be searched
 * It's optional.
 */
var replaceScopeVariables = function(resource, scope, offset) {
  if (offset === undefined) {
    offset = 0;
  }
  var startIndex = resource.indexOf('`', offset);
  if (startIndex >= 0) {
    var endIndex = resource.indexOf('`', startIndex + 1);
    if (endIndex >= startIndex) {
      var variableName = resource.substr(startIndex + 1, endIndex - startIndex - 1);
      if (scope.hasOwnProperty(variableName)) {
        var variableValue = scope[variableName];
        resource = resource.substr(0, startIndex) + variableValue + resource.substr(endIndex + 1);
        endIndex = startIndex + variableValue.length;
      }
      resource = replaceScopeVariables(resource, scope, endIndex + 1);
    }
  }
  return resource;
};

var getContentType = function(content) {
  try {
    JSON.parse(content);
    return 'json';
  } catch (e) {
    try {
      new dom().parseFromString(content);
      return 'xml';
    } catch (e) {
      return null;
    }
  }
};

var evaluatePath = function(path, content) {
  var contentType = getContentType(content);

  switch (contentType) {
    case 'json':
      var contentJson = JSON.parse(content);
      return jsonPath({ flatten: true, json: contentJson, path: path });
    case 'xml':
      var xmlDocument = new dom().parseFromString(content);
      var node = select(xmlDocument, path)[0];
      if (node.nodeType === ATTRIBUTE) {
        return node.value;
      }

      return node.firstChild.data; // element or comment
    default:
      return null;
  }
};

var base64Encode = function(str) {
  return new Buffer(str).toString('base64');
};

/**
 * Makes a deep comparison of two objects
 * Returns true when they are equal, false otherwise
 * This function is intended to compare objects created from JSON string only
 * So it may not handle properly comparison of other types of objects
 */
var areEqual = function(real, expected) {
  for (var property in expected) {
    if (!real.hasOwnProperty(property)) return false;
    // allows to compare expected[ property ] and real[ property ] when set to undefined
    if (expected[property] === real[property]) continue;
    // if they have the same strict value or identity then they are equal

    if (typeof(expected[property]) !== "object") return false;
    // Numbers, Strings, Functions, Booleans must be strictly equal

    if (!areEqual(real[property], expected[property])) return false;
    // Objects and Arrays must be tested recursively
  }
  return true;
};

Feature:
	Httpbin.org exposes various resources for HTTP request testing
	As Httpbin client I want to verify that all API resources are working as they should

	Scenario: Setting headers in GET request
		Given I set User-Agent header to bitterapple
		When I GET /get
		Then response body path $.headers.User-Agent should be bitterapple


	Scenario: Setting body payload in POST request
		Given I set body to {"key":"hello-world"}
		When I POST to /post
		Then response body should contain hello-world


	Scenario: Setting body payload in POST request
		When I POST to /post with body
		"""
		{"key":"hello-world"}
		"""
		Then response body should contain hello-world


	Scenario: Setting body payload in PUT request
		Given I set body to {"key":"hello-world"}
		When I PUT /put
		Then response body should contain hello-world


	Scenario: Setting body payload in PUT request
		When I PUT /put with body
		"""
		{"key":"hello-world"}
		"""
		Then response body should contain hello-world


	Scenario: Setting body payload in PATCH request
		Given I set body to {"key":"hello-world"}
		When I PATCH /patch
		Then response body should contain hello-world


	Scenario: Setting body payload in PATCH request
		When I PATCH /patch with body
		"""
		{"key":"hello-world"}
		"""
		Then response body should contain hello-world


	Scenario: Setting body payload in DELETE request
		Given I set body to {"key":"hello-world"}
		When I DELETE /delete
		Then response body should contain hello-world


	Scenario: Setting body payload in DELETE request
		When I DELETE /delete with body
		"""
		{"key":"hello-world"}
		"""
		Then response body should contain hello-world


	Scenario: Setting body payload from file
		Given I pipe contents of file ./test/features/fixtures/requestbody.xml to body
		When I POST to /post
		Then response body should contain "<a>b</a>"


	Scenario: Sending request with basic auth authentication
		Given I have basic authentication credentials username and password
		When I POST to /post
		Then response body path $.headers.Authorization should be Basic dXNlcm5hbWU6cGFzc3dvcmQ=


	Scenario: Parsing response xml body
		When I GET /xml
		Then response body path /slideshow/slide[1]/title should be Wake up to WonderWidgets!


	Scenario: Response body content type assertions (xml)
		When I GET /xml
		Then response body should be valid xml


	Scenario: Response body content type assertions (json)
		When I GET /get
		Then response body should be valid json


	Scenario: Response body content type assertions (array)
		When I set body to ["John", "Robert"]
		When I POST to /post
		Then response body at path $.json should be a json array


	Scenario: Response body content length assertions (array)
		When I set body to ["John", "Robert"]
		When I POST to /post
		Then response body at path $.json should be an array of length 2


	Scenario: Checking headers in response
		When I GET /xml
		Then response header server should exist
		And response header boo should not exist


	Scenario: Response code checks
		When I GET /xml
		Then response code should be 200
		And response code should not be 404


	Scenario: Response header value assertions
		When I GET /xml
		Then response header Content-Type should be application/xml
		And response header Content-Type should be [a-z]/xml
		And response header Connection should not be boo


	Scenario: Response body text assertions
		When I GET /xml
		Then response body should contain WonderWidgets
		And response body should contain Wonder[Wdgist]
		And response body should not contain boo


	Scenario: Response body xpath assertions
		When I GET /xml
		Then response body path /slideshow/slide[2]/title should be [a-z]+
		And response body path /slideshow/slide[2]/title should not be \d+


	Scenario: Response body jsonpath assertions
		Given I set User-Agent header to bitterapple
		When I GET /get
		Then response body path $.headers.User-Agent should be [a-z]+
		And response body path $.headers.User-Agent should not be \d+


	Scenario: Access token retrieval from response body (authorization code grant, password, client credentials)
		Given I set Token header to token123
		When I GET /get
		Then I store the value of body path $.headers.Token as access token


	Scenario: Using access token
		Given I set bearer token
		When I GET /get
		Then response body path $.headers.Authorization should be Bearer token123


	Scenario: Access token retrieval from header
		Given I GET /get
		And I store the value of header Content-Type as access token
		When I GET /get
		Then response body path $.headers.Authorization should be Bearer application/json


	Scenario: Quota testing - first request
		Given I set X-Quota-Remaining header to 10
		When I GET /get
		Then I store the value of body path $.headers.X-Quota-Remaining as remaining1 in global scope


	Scenario: Quota testing - second request
		Given I set X-Quota-Remaining header to 9
		When I GET /get
		Then I store the value of body path $.headers.X-Quota-Remaining as remaining2 in global scope


	Scenario: Quota testing - assertion
		When I subtract remaining2 from remaining1
		Then result should be 1


	Scenario: setting global variable
		When I set global variable foo1 to bar1
		Then value of global variable foo1 should be bar1


	Scenario: setting scenario variable
		When I set scenario variable foo2 to bar2
		Then value of scenario variable foo2 should be bar2


	Scenario: Setting header from scenario variable
		Given I set scenario variable foo to bitterapple
		And I set User-Agent header to scenario variable foo
		When I GET /get
		Then response body path $.headers.User-Agent should be bitterapple

	Scenario: Setting header from scenario variable including space
		Given I set scenario variable foo to "bitter apple"
		And I set User-Agent header to scenario variable foo
		When I GET /get
		Then response body path $.headers.User-Agent should be bitter apple


	Scenario: Setting header from global variable
		Given I set global variable foo to bitterapple
		And I set User-Agent header to global variable foo
		When I GET /get
		Then response body path $.headers.User-Agent should be bitterapple


	Scenario: setting header value as variable
		When I GET /get
		Then I store the value of response header Server as agent in scenario scope
		And value of scenario variable agent should be nginx


	Scenario: setting body path as variable (xml)
		When I GET /xml
		And I store the value of body path /slideshow/slide[2]/title as title in scenario scope
		Then value of scenario variable title should be Overview


	Scenario: setting body path as variable (json)
		Given I set User-Agent header to bitterapple
		When I GET /get
		And I store the value of body path $.headers.User-Agent as agent in scenario scope
		Then value of scenario variable agent should be bitterapple


	Scenario: checking values of scenario variables
		Then value of scenario variable title should be undefined


	Scenario: using unknown variable in request path
		When I GET /get?fizz=`UNKNOWN_VARIABLE`
		Then I store the value of body path $.args.fizz as value2 in global scope
		Then value of global variable value2 should be `UNKNOWN_VARIABLE`

	Scenario: using global variable in request path
		When I GET /get?arg1=foo&arg2=bar
		Then I store the value of body path $.args.arg1 as value1 in global scope
		Then I store the value of body path $.args.arg2 as value2 in global scope
		When I GET /get?arg1=`value1`&arg2=`value2`
		Then I store the value of body path $.args.arg1 as value11 in global scope
		Then I store the value of body path $.args.arg2 as value12 in global scope
		Then value of global variable value11 should be foo
		Then value of global variable value12 should be bar


	Scenario: using scenario variable in request path
		When I GET /get?arg1=foo&arg2=bar
		Then I store the value of body path $.args.arg1 as value3 in scenario scope
		Then I store the value of body path $.args.arg2 as value4 in scenario scope
		When I GET /get?arg3=`value3`&arg4=`value4`
		Then I store the value of body path $.args.arg3 as value31 in scenario scope
		Then I store the value of body path $.args.arg4 as value41 in scenario scope
		Then value of scenario variable value31 should be foo
		Then value of scenario variable value41 should be bar


	Scenario: using scenario variable with long name in request path
		When I GET /get?arg1=foo&arg2=bar
		Then I store the value of body path $.args.arg1 as aValueWithAVeryLongName1 in scenario scope
		Then I store the value of body path $.args.arg2 as aValueWithAVeryLongName2 in scenario scope
		When I GET /get?arg3=`aValueWithAVeryLongName1`&arg4=`aValueWithAVeryLongName2`
		Then I store the value of body path $.args.arg3 as value31 in scenario scope
		Then I store the value of body path $.args.arg4 as value41 in scenario scope
		Then value of scenario variable value31 should be foo
		Then value of scenario variable value41 should be bar


	Scenario: using scenario variable and global variables in request path
		When I GET /get?arg1=foo&arg2=bar
		Then I store the value of body path $.args.arg1 as value5 in scenario scope
		Then I store the value of body path $.args.arg2 as value6 in global scope
		When I GET /get?arg3=`value5`&arg4=`value6`
		Then I store the value of body path $.args.arg3 as value7 in scenario scope
		Then I store the value of body path $.args.arg4 as value8 in global scope
		Then value of scenario variable value7 should be foo
		Then value of global variable value8 should be bar


	Scenario: using variables in json body path
		When I GET /get?arg1=foo&arg2=bar
		And I store the value of body path $.args.arg1 as value71 in scenario scope
		And I store the value of body path $.args.arg2 as value72 in global scope
		When I GET /get?arg1=`value71`&arg2=`value72`
		Then response body path $.args.arg1 should be `value71`
		And response body path $.args.arg2 should be `value72`
		But response body path $.args.arg1 should not be `foo`
		And response body path $.args.arg2 should not be `foo`


	Scenario: using variables in 'json body should contain'
		When I GET /get?arg1=foo&arg2=bar
		And I store the value of body path $.args.arg1 as value81 in scenario scope
		And I store the value of body path $.args.arg2 as value82 in global scope
		When I GET /get?arg1=`value81`&arg2=`value82`
		Then response body should contain `value81`
		And response body should contain `value82`
		But response body should not contain `foo`


	Scenario: comparing response body to JSON
		Given I set body to { "firstnames": ["John", "Robert"], "lastname": "Doe", "foo": { "bar": true, "age": 30 }}
		When I POST to /post
		Then the JSON should be
		"""
		{ "json":
			{
				"lastname": "Doe",
				"firstnames": ["John", "Robert"],
				"foo": {
						"bar": true,
						"age": 30
					}
		  	}
		}
		"""

	Scenario: using variables in request body
		Given I set scenario variable lastname to Kennedy
		And I set global variable age to 45
		And I set body to { "firstnames": ["John", "Robert"], "lastname": "`lastname`", "foo": { "bar": true, "age": `age` }}
		When I POST to /post
		Then the JSON should be
		"""
		{ "json":
			{
				"lastname": "Kennedy",
				"firstnames": ["John", "Robert"],
				"foo": {
						"bar": true,
						"age": 45
					}
		  	}
		}
		"""


	Scenario: using variables in JSON response
		Given I set scenario variable lastname to Kennedy
		And I set global variable age to 45
		And I set body to { "firstnames": ["John", "Robert"], "lastname": "Kennedy", "foo": { "bar": true, "age": 45 }}
		When I POST to /post
		Then the JSON should be
		"""
		{ "json":
			{
				"lastname": "`lastname`",
				"firstnames": ["John", "Robert"],
				"foo": {
						"bar": true,
						"age": `age`
					}
		  	}
		}
		"""


	Scenario: extra field in response should not break comparison of response body to JSON
		Given I set body to { "firstnames": ["John", "Robert"], "lastname": "Doe", "foo": { "bar": true, "age": 30, "city": "Orlando"}, "hobbies": ["skydiving"]}
		When I POST to /post
		Then the JSON should be
		"""
		{ "json":
			{
				"lastname": "Doe",
				"firstnames": ["John", "Robert"],
				"foo": {
						"bar": true,
						"age": 30
					}
		  	}
		}
		"""

var ModernDropbox = function(consumerKey, consumerSecret) {
	// Constructor / Private
	var _consumerKey = consumerKey;
	var _consumerSecret = consumerSecret;
	
	var _tokens = {};
	var _storagePrefix = "moderndropbox_";
	var _isSandbox = false;
	var _cache = true;
	var _authCallback = "http://drag2up.appspot.com/static/tpilb.html";
	var _fileListLimit = 10000;
	var _cookieTimeOut = 3650;
	var _dropboxApiVersion = 0;
	var _xhr = new XMLHttpRequest();
	
	var _ajaxSendFileContents = function(message, filename, content, callback) {
		_xhr.open("POST", message.action, true);
		
		var params = {};

		for (i in message.parameters) {
			params[message.parameters[i][0]] = message.parameters[i][1];
		}

    content.name = filename;
    params.file = content;

		_xhr.onreadystatechange = function() {
			//console.log(this);
			if(_xhr.status == 200 && _xhr.readyState == 4){
			  callback(_xhr);
			}
		}
		console.log(params);
		_xhr.sendMultipart(params);
	};
	
	var _setAuthCallback = function(callback) {
		_authCallback = callback;
	};
	
	var _setupAuthStorage = function() {
		keys = ["requestToken", "requestTokenSecret", "accessToken", "accessTokenSecret"];
		
		for (i in keys) {
			var key = keys[i];
			value = localStorage[_storagePrefix + key];
			if (value) {
				_tokens[key] = value;
			}
		}
	};
	
	var _clearAuthStorage = function() {
		keys = ["requestToken", "requestTokenSecret", "accessToken", "accessTokenSecret"];
		
		for (i in keys) {
			var key = keys[i];
			localStorage.removeItem(_storagePrefix + key);
		}
	};
	
	var _storeAuth = function(valueMap) {
		keys = ["requestToken", "requestTokenSecret", "accessToken", "accessTokenSecret"];
		
		for (i in keys) {
			var key = keys[i];
			
			if (valueMap[key] !== undefined) {
			
				localStorage[_storagePrefix + key] = valueMap[key];
				_tokens[key] = valueMap[key];
			}
		}	
	};
	
	var _isAccessGranted = function() {
		return (_tokens["accessToken"] != null) && (_tokens["accessTokenSecret"] != null);
	};
	
	var _isAuthorized = function() {
		return (_tokens["requestToken"] != null) && (_tokens["requestTokenSecret"] != null);
	};
	
	var _createOauthRequest = function(url, options) {
		if (!options) {
			options = [];
		}
		
		// Outline the message
		var message = {
			action: url,
			method: "GET",
		    parameters: [
		      	["oauth_consumer_key", _consumerKey],
		      	["oauth_signature_method", "HMAC-SHA1"]
		  	]
		};
		
		// Define the accessor
		var accessor = {
			consumerSecret: _consumerSecret,
		};
		
		if (!options.token) {
			message.parameters.push(["oauth_token", _tokens["accessToken"]]);
		} else {
			message.parameters.push(["oauth_token", options.token]);
			delete options.token;
		}
		
		if (!options.tokenSecret) {
			accessor.tokenSecret = _tokens["accessTokenSecret"];
		} else {
			accessor.tokenSecret = options.tokenSecret;
			delete options.tokenSecret;
		}
		
		if (options.method) {
			message.method = options.method;
			delete options.method;
		}
	
		for (key in options) {
			message.parameters.push([key, options[key]]);
		}
		
		OAuth.setTimestampAndNonce(message);
		OAuth.SignatureMethod.sign(message, accessor);

		return message;
	};
	
	var _sendOauthRequest = function(message, options) {
		if (!options) {
			options = [];
		}
		
		if (!options.success) {
			options.success = function() {};
		}

		if (!options.error) {
			options.error = function() {};
		}
		
		if (!options.type) {
			options.type = "json";
		}
		
		if (options.multipart) {
			_ajaxSendFileContents(
				message,
				options.filename,
				options.content,
				options.success
			);
		} else {
		  var xhr = new XMLHttpRequest();
		  function params(obj){
        var str = [];
        for(var i in obj) str.push(i+'='+encodeURIComponent(obj[i]));
        return str.join('&');
      }


		  var data =  params(OAuth.getParameterMap(message.parameters));

      
		  if(message.method.toLowerCase() == 'post'){
  		  xhr.open(message.method, message.action, true);
        xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
        xhr.send(data);
		  }else{
  		  xhr.open(message.method, message.action+'?'+data, true);
  		  xhr.send(null);
		  }
		  xhr.onload = function(){
		    var res = xhr.responseText;

		    if(options.type == 'json') res = JSON.parse(res);

		    options.success(res);
		  }
		}
	};
	
	// Public
	return ({
		initialize: function() {
			_setupAuthStorage();

			if (!_isAccessGranted()) {
				if (!_isAuthorized()) {
					var message = _createOauthRequest("https://www.dropbox.com/" + _dropboxApiVersion + "/oauth/request_token");
					
					_sendOauthRequest(message, {
						type: "text",
						success: (function(data) {
							if (!data) {
								data = "";
							}
						
							var tokenPairStrings = data.split("&");
							var parsedTokenPairs = [];
					
							for (i in tokenPairStrings) {
								var tokenPairs = tokenPairStrings[i].split("=");
								parsedTokenPairs[tokenPairs[0]] = tokenPairs[1];
							}
					
							var authTokens = {};
							authTokens["requestToken"] = parsedTokenPairs["oauth_token"];
							authTokens["requestTokenSecret"] = parsedTokenPairs["oauth_token_secret"];
					
							_storeAuth(authTokens);
							var init = this.initialize;
							var url = "https://www.dropbox.com/" + _dropboxApiVersion + "/oauth/authorize?oauth_token=" 
								+ authTokens["requestToken"] 
								+ "&oauth_callback=" 
								+ _authCallback;

		          loginTab(url, 'uid=', init);
						}).bind(this)
					});
				} else {
					var message = _createOauthRequest("https://www.dropbox.com/" + _dropboxApiVersion + "/oauth/access_token", {
						token: _tokens["requestToken"],
						tokenSecret: _tokens["requestTokenSecret"]
					});
					
					_sendOauthRequest(message, {
						type: "text",
						success: (function(data) {
							if (!data) {
								data = "";
							}
						
							var tokenPairStrings = data.split("&");
							var parsedTokenPairs = [];
					
							for (i in tokenPairStrings) {
								var tokenPairs = tokenPairStrings[i].split("=");
								parsedTokenPairs[tokenPairs[0]] = tokenPairs[1];
							}
					
							var authTokens = {};
							authTokens["accessToken"] = parsedTokenPairs["oauth_token"];
							authTokens["accessTokenSecret"] = parsedTokenPairs["oauth_token_secret"];
							
							_storeAuth(authTokens);
						}).bind(this),
						error: (function(data){
						  _storeAuth({
						    requestToken: '',
						    requestTokenSecret: ''
						  })
						  this.initialize();
						}).bind(this)
					});
				}
			}
			
			return this;
		},
		isAccessGranted: function(){
		  return _isAccessGranted()
		},
		getAccountInfo: function(callback) {
			var url = "https://www.dropbox.com/" + _dropboxApiVersion + "/account/info";
			var message = _createOauthRequest(url);
			_sendOauthRequest(message, {
				type: "json",
				success: (function(data) { callback(data); }).bind(this)
			});
		},
		
		getDirectoryContents: function(path, callback) {
			var url = "https://www.dropbox.com/" + _dropboxApiVersion + "/metadata/dropbox/" + path;
			var message = _createOauthRequest(url, {
				file_limit: _fileListLimit,
				list: "true"
			});
			
			_sendOauthRequest(message, {
				type: "json",
				success: (function(data) { callback(data); }).bind(this)
			});
		},
		
		getDirectoryMetadata: function(path, callback) {
			var url = "https://www.dropbox.com/" + _dropboxApiVersion + "/metadata/dropbox/" + path;
			var message = _createOauthRequest(url, {
				list: "false"
			});
			
			_sendOauthRequest(message, {
				type: "json",
				success: (function(data) { callback(data); }).bind(this)
			});
		},
		
		getFileContents: function(path, callback) {
			var url = "https://api-content.dropbox.com/" + _dropboxApiVersion + "/files/dropbox/" + path;
			var message = _createOauthRequest(url);
			
			_sendOauthRequest(message, {
				type: "text",
				success: (function(data) { callback(data); }).bind(this)
			});
		},
		
		putFileContents: function(path, file, callback) {
			var filename = path.match(/([^\\\/]+)$/)[1];
			var file_path = path.match(/^(.*?)[^\\\/]+$/)[1];
			var url = "https://api-content.dropbox.com/" + _dropboxApiVersion + "/files/dropbox/" + file_path + "?file=" + filename;
			var message = _createOauthRequest(url, { method: "POST" });
			
			_sendOauthRequest(message, {
				multipart: true,
				content: file,
				filename: filename,
				success: (function(data) { callback(data); }).bind(this)
			});
		},
		
		logOutDropbox: function() {
			_clearAuthStorage();
		}
	}).initialize();
};

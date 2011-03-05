
function twitter_login(callback){
  var message = {
	  action: 'https://api.twitter.com/oauth/request_token',
	  method: "GET",
      parameters: [
        	["oauth_consumer_key", Keys.twitter.key],
        	["oauth_signature_method", "HMAC-SHA1"]
    	]
  };

  // Define the accessor
  var accessor = {
	  consumerSecret: Keys.twitter.secret
  };
  OAuth.setTimestampAndNonce(message);
  OAuth.SignatureMethod.sign(message, accessor);
  var xhr = new XMLHttpRequest();
  xhr.open('get', message.action + '?' + OAuth.formEncode(message.parameters), true);
  xhr.onload = function(){
    var data = xhr.responseText || '';
	  var tokenPairStrings = data.split("&");
	  var parsedTokenPairs = {};
	  for (i in tokenPairStrings) {
		  var tokenPairs = tokenPairStrings[i].split("=");
		  parsedTokenPairs[tokenPairs[0]] = tokenPairs[1];
	  }
	  var requestToken = parsedTokenPairs.oauth_token,
	      requestTokenSecret = parsedTokenPairs.oauth_token_secret;
	  console.log(requestToken, requestTokenSecret);
	  var url = 'http://api.twitter.com/oauth/authorize?oauth_token=' + requestToken;
	  function init(url){
	    console.log(url);
	    var data = url.split('?')[1];
	    var tokenPairStrings = data.split("&");
	    var parsedTokenPairs = {};
	    for (i in tokenPairStrings) {
		    var tokenPairs = tokenPairStrings[i].split("=");
		    parsedTokenPairs[tokenPairs[0]] = tokenPairs[1];
	    }
	    console.log(parsedTokenPairs);
	    var message = {
	      action: 'https://api.twitter.com/oauth/access_token',
	      method: "GET",
          parameters: [
            	["oauth_consumer_key", Keys.twitter.key],
            	["oauth_signature_method", "HMAC-SHA1"],
            	["oauth_token", parsedTokenPairs.oauth_token],
            	["oauth_verifier", parsedTokenPairs.oauth_verifier]
        	]
      };

      // Define the accessor
      var accessor = {
	      consumerSecret: Keys.twitter.secret,
	      tokenSecret: requestTokenSecret
      };
      OAuth.setTimestampAndNonce(message);
      OAuth.SignatureMethod.sign(message, accessor);
      console.log(message)

      var xhr = new XMLHttpRequest();
      xhr.open('get', message.action + '?' + OAuth.formEncode(message.parameters), true);
      xhr.onload = function(){
        console.log(xhr.responseText);
        var data = xhr.responseText || '';
	      var tokenPairStrings = data.split("&");
	      var parsedTokenPairs = {};
	      for (i in tokenPairStrings) {
		      var tokenPairs = tokenPairStrings[i].split("=");
		      parsedTokenPairs[tokenPairs[0]] = tokenPairs[1];
	      }
	      console.log(parsedTokenPairs);
	      localStorage.twitter_token = parsedTokenPairs.oauth_token;
	      localStorage.twitter_secret = parsedTokenPairs.oauth_token_secret;
	      localStorage.twitter_username = parsedTokenPairs.screen_name
	      callback();
      }
      xhr.send()
	  }
	  if(typeof chrome != 'undefined'){
      chrome.tabs.create({
        url: url
      }, function(tab){
        var poll = function(){
          chrome.tabs.get(tab.id, function(info){
            if(info.url.indexOf('oauth_verifier') != -1){
              init(info.url);
              chrome.tabs.remove(tab.id);
            }else{
              setTimeout(poll, 100)
            }
          })
        };
        poll();
      })
    }else if(typeof tabs != 'undefined'){
      tabs.open({
        url: url,
        onOpen: function(tab){
          var poll = function(){
            if(tab.url.indexOf('oauth_verifier') != -1){
              init(tab.url);
              tab.close()
            }else{
              setTimeout(poll, 100)
            }
          };
          poll();
        }
      })
    }
	
	  /*

	  */
  }
  xhr.send()
}

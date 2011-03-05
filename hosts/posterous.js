Hosts.posterous = function uploadposterous(file, callback){
  function core_upload(){
    var message = {
      action: 'https://api.twitter.com/1/account/verify_credentials.json',
      method: "GET",
        parameters: [
          	["oauth_consumer_key", Keys.twitter.key],
          	["oauth_signature_method", "HMAC-SHA1"],
          	["oauth_callback", "http://drag2up.appspot.com/static/tpilb.html"],
          	["oauth_version", "1.0"],
          	["oauth_token", localStorage.twitter_token]
      	]
    };

    // Define the accessor
    var accessor = {
      consumerSecret: Keys.twitter.secret,
      tokenSecret: localStorage.twitter_secret
    };
    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);
    var auth = OAuth.getAuthorizationHeader("http://api.twitter.com/", message.parameters);
    
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://posterous.com/api2/upload.json");  
    xhr.setRequestHeader('X-Verify-Credentials-Authorization', auth);
    xhr.setRequestHeader('X-Auth-Service-Provider', 'https://api.twitter.com/1/account/verify_credentials.json');
    
    xhr.onload = function(){
      console.log(xhr);
      if(xhr.status == 401){
        twitter_login(core_upload);
      }else if(xhr.status == 200){
        var json = JSON.parse(xhr.responseText);
        console.log(json);
        callback({url: json.url}); //no direct upload
      }else{
        callback('error: posterous uploading failed')
      }
    }
    xhr.onerror = function(){
      callback('error: posterous uploading failed')
    }
    xhr.sendMultipart({
      key: Keys.posterous,
      media: file
    })
  }
  if(localStorage.twitter_token && localStorage.twitter_secret){
    core_upload();
  }else{
    twitter_login(core_upload);
  }
}


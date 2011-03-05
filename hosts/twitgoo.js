Hosts.twitgoo = function uploadTwitgoo(file, callback){
  function core_upload(){
    var message = {
      action: 'https://api.twitter.com/1/account/verify_credentials.json',
      method: "GET",
        parameters: [
          	["oauth_consumer_key", Keys.twitter.key],
          	["oauth_signature_method", "HMAC-SHA1"],
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
    xhr.open("POST", "http://twitgoo.com/api/upload");  
    xhr.setRequestHeader('X-Verify-Credentials-Authorization', auth);
    xhr.setRequestHeader('X-Auth-Service-Provider', 'https://api.twitter.com/1/account/verify_credentials.json');
    
    xhr.onload = function(){
      console.log(xhr);
      if(xhr.status == 401){
        twitter_login(core_upload);
      }else if(xhr.status == 200){
        var link = xhr.responseXML.getElementsByTagName('mediaurl')[0].childNodes[0].nodeValue;
        var thumb = xhr.responseXML.getElementsByTagName('thumburl')[0].childNodes[0].nodeValue;
        var direct = xhr.responseXML.getElementsByTagName('imageurl')[0].childNodes[0].nodeValue;
  	    callback({
  	      url: link,
  	      direct: direct,
  	      thumb: thumb
  	    });
  	    //also: imageurl element
      }else{
        callback('error: twitgoo uploading failed')
      }
    }
    xhr.onerror = function(){
      callback('error: Twitgoo uploading failed')
    }
    xhr.sendMultipart({
      media: file
    })
  }
  if(localStorage.twitter_token && localStorage.twitter_secret){
    core_upload();
  }else{
    twitter_login(core_upload);
  }
}


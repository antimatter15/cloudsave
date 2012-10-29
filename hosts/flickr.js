//19d4df95a040e50112bd8e49a6096b59
//edc13066151f70ed (super secret secret)
//http://flickr.com/services/auth/?api_key=19d4df95a040e50112bd8e49a6096b59&perms=write&api_sig=[api_sig]
//https://secure.flickr.com/services
//http://api.flickr.com/services

Hosts.flickr = function uploadFlickr(req, uploaded_fn){
  var base = "http://flickr.com/services" //https://secure.flickr.com/services
  //wooot security!
  if(https() == "https://"){
    base = "https://secure.flickr.com/services";
  }
  
  function auth(params){
    params.api_key = Keys.flickr.key;
    var secret = Keys.flickr.secret

    params.api_sig = hex_md5(secret+Object.keys(params).sort().map(function(x){return x+params[x]}).join(''))
    return params;
  }

  function params(obj){
    var str = [];
    for(var i in obj) str.push(i+'='+encodeURIComponent(obj[i]));
    return str.join('&');
  }
  function getAuthToken(callback){
    var authurl = base+"/auth/?"+params(auth({perms: "write"}));
    


    
    function init(url){
      var frob = url.match(/frob=(.+)/)[1]
      
      var xt = new XMLHttpRequest();
      xt.open("get", base+'/rest?'+params(auth({
        method: 'flickr.auth.getToken',
        frob: frob,
        nojsoncallback: 1,
        format: 'json'
      })))
      xt.onload = function(){
        var json = JSON.parse(xt.responseText);
        var token = json.auth.token._content;
        localStorage.flickr_token = token;
        console.log('magic token', token);
        callback();
      }
      xt.send()
      //localStorage.flickr_frob = frob;
      console.log('magic frob', frob);
    }
    
   
    loginTab(authurl, 'frob=', init);
  
  }

  
  function uploadPhoto(){
    var xhr = new XMLHttpRequest();
    xhr.open('POST',base+"/upload/");
    var p = auth({
      auth_token: localStorage.flickr_token, 
      tags: "drag2up",
      is_public: 0
    });
    p.photo = req;
    xhr.onload = function(){
      console.log(xhr.responseXML)
      var resX = xhr.responseXML
      if(resX.firstChild.getAttribute('stat') == 'fail'){
        var err = resX.getElementsByTagName('err')[0];
        if(err.getAttribute('code') == 98){
          //invalid auth token: login now.
          getAuthToken(uploadPhoto)
        }else{  
          callback("error: could not upload to flickr in uploadPhoto "+err.getAttribute(msg))
        }
      }else{
        var photoid = resX.getElementsByTagName('photoid')[0];
        console.log(photoid)
        var pid = photoid.firstChild.nodeValue;
        //window.PID = photoid;
        console.log('flickr photo id', photoid);
        
        var xt = new XMLHttpRequest();
            xt.open("get", base+'/rest?'+params(auth({
              method: 'flickr.photos.getSizes',
              photo_id: pid,
              nojsoncallback: 1,
              format: 'json'
            })))
            xt.onload = function(){
              var json = JSON.parse(xt.responseText);
              var urls = json.sizes.size.slice(-1)[0];
              console.log(json);
              uploaded_fn({
                direct: urls.source,
                url: urls.url
              });
            }
            xt.send()
        
        
      }
    }
    xhr.sendMultipart(p)
  }
  
  uploadPhoto();
}

//uses multipart helper function.
//does not support https
Hosts.cloudapp = function uploadCloudApp(file, callback){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://my.cl.ly/items/new');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = function(){
    if(xhr.status == 401){
      //i can haz login

      
    if(typeof chrome != 'undefined'){
      chrome.tabs.create({
        url: "http://my.cl.ly/login"
      }, function(tab){
        var poll = function(){
          chrome.tabs.get(tab.id, function(info){
            if('http://my.cl.ly/' == (info.url)){
              chrome.tabs.remove(tab.id);
              uploadCloudApp(file, callback);
            }else{
              setTimeout(poll, 100)
            }
          })
        };
        poll();
      })
    }else if(typeof tabs != 'undefined'){
      tabs.open({
        url: "http://my.cl.ly/login",
        onOpen: function(tab){
          var poll = function(){
            if('http://my.cl.ly/' == (tab.url)){
              tab.close()
              uploadCloudApp(file, callback);
            }else{
              setTimeout(poll, 100)
            }
          };
          poll();
        }
      })
    }
      
      
    }else{
      var json = JSON.parse(xhr.responseText);
      var xhr2 = new XMLHttpRequest();
      xhr2.open('POST', json.url);
      if(json.uploads_remaining == 0){
        return callback('error: You have exceeded your maximum number of uploads today for CloudApp. You may need to upgrade your account.');      
      }
      json.params.key = json.params.key.replace('${filename}', file.name);
      json.params.file = file;
      xhr2.sendMultipart(json.params);
      xhr2.onload = function(){
        //since ajax cant add the Accept: header to the redirects, heres a hack
        var xhr3 = new XMLHttpRequest();
        xhr3.open('GET', 'http://my.cl.ly/items');
        xhr3.setRequestHeader('Accept', 'application/json');
        xhr3.onload = function(){
          var j3 = JSON.parse(xhr3.responseText)[0];
          callback({
            direct: j3.remote_url,
            url: j3.url
          })
        }
        xhr3.send()
      }
    }
  }
  xhr.send()
}

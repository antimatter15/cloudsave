//box.net

Hosts.box = function uploadBox(file, callback){
  function create_folder(){
    var xhr = new XMLHttpRequest();
    var fname = 'cloudsave';
    xhr.open('GET', 'https://www.box.net/api/1.0/rest?action=create_folder&api_key='+Keys.box+'&auth_token='+localStorage.box_auth+'&parent_id=0&share=0&name='+fname, true);
    xhr.send();
    xhr.onload = function(){
      if(xhr.responseText.indexOf('not_logged_in') != -1){
        login(function(){
          //function inside a function (passed to another function inside a function inside a function) inside a function inside a function
          create_folder();
        });
      }else{
        var fid = xhr.responseXML.getElementsByTagName('folder_id')[0].firstChild.nodeValue;
        console.log('folder ID', fid);
        upload(fid);
      }
    }
  }
  
  
  function upload(folder){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://upload.box.net/api/1.0/upload/'+localStorage.box_auth+'/'+folder+'?new_copy=1');
    xhr.onload = function(){
      callback();
    }
    xhr.sendMultipart({
      share: 1,
      file: file
    })
  }
  
  function login(stopforward){ //sort of opposite vaguely of callback

    function auth_token(url){
      var auth = url.match(/auth_token=([^\&]+)/)[1];
      localStorage.box_auth = auth;
      console.log(localStorage.box_auth, localStorage.box_ticket);
      stopforward();
    }
  
    var xhr = new XMLHttpRequest();
    xhr.open('GET', https()+'www.box.net/api/1.0/rest?action=get_ticket&api_key='+Keys.box, true);
    xhr.send();
    xhr.onload = function(){
      var ticket = xhr.responseXML.getElementsByTagName('ticket')[0].firstChild.nodeValue;
      localStorage.box_ticket = ticket;
      var redirect = https()+"www.box.net/api/1.0/auth/"+ticket;
      
      if(typeof chrome != 'undefined'){
        chrome.tabs.create({
          url: redirect
        }, function(tab){
          var poll = function(){
            chrome.tabs.get(tab.id, function(info){
              if(info.url.indexOf('auth_token') != -1){
                auth_token(info.url);
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
          url: redirect,
          onOpen: function(tab){
            var poll = function(){
              if(tab.url.indexOf('auth_token') != -1){
                auth_token(tab.url);
                tab.close()
              }else{
                setTimeout(poll, 100)
              }
            };
            poll();
          }
        })
      }
    }
  }
  
  create_folder()
  return "http://box.net/";
}

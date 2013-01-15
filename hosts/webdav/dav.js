//does not use multipart helper function because its not multipart.


Hosts.webdav = function uploadWebDAV(req, callback){
  if(!localStorage.webdav_url){
    localStorage.webdav_url = prompt("Enter the URL of the WebDAV provider");
  }
  if(!localStorage.webdav_url || !/^http/.test(localStorage.webdav_url)){
    return callback("error: invalid webdav server url");
  }
  if(!localStorage.webdav_auth){
    localStorage.webdav_auth = "Basic "+btoa(prompt("WebDAV Username") + ":"+ prompt("WebDAV Password"));
  }


  var fs = new WebDAV.Fs(localStorage.webdav_url);
  WebDAV.auth = localStorage.webdav_auth; //this is a nasty hack
  getRaw(req, function(file){
    //var body = new BlobBuilder();
    var bin = file.data, arr = new Uint8Array(bin.length);
    for(var i = 0; i < bin.length; i++){
      arr[i] = bin.charCodeAt(i);
    }
    //body.append(arr.buffer);
    var body = new Blob([arr.buffer]);
    fs.file("/"+file.name).write(body, function(body, xhr){
      if(xhr.status >= 200 && xhr.status < 300){
        callback("Yay I think this means it works");
      }else{
        callback("error:"+xhr.status+" "+xhr.statusText);
      }
      console.log(body);
    });
  });
  /*
  var poll = function(){
    if(dropbox.isAccessGranted()){
      getRaw(req, function(file){
        var fname =  file.name;
        var folder = ''
        
        dropbox.getAccountInfo(function(user){
        
        
        dropbox.getDirectoryMetadata(folder + encodeURIComponent(file.name), function(json){
          if(json.error && json.error.indexOf('not found') != -1){
            //yay plop it on the top
          }else if(fname.indexOf('/') == -1){
            fname = Math.random().toString(36).substr(2,4) + '_' + fname;
          }else{
            //no idea. TODO: do something
          }
       
  */
  
}

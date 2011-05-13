//uses multipart helper function.


Hosts.dropbox = function uploadDropbox(file, callback){
  var dropbox = new ModernDropbox(Keys.dropbox.key, Keys.dropbox.secret)

  var poll = function(){
    if(dropbox.isAccessGranted()){
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
          
          
        dropbox.putFileContents(folder + fname, file,
          function(){
            console.log('done uploading');
            //yay done. hopefully
              console.log('got stuffs now');
              callback({
              	url: 'https://www.dropbox.com/' 
              })
          });
        })
          
          })
          
    }else{
      setTimeout(poll, 300);
    }
  };
  poll();
  
  
}

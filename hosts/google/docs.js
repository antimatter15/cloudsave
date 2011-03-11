Hosts.gdocs = function uploadGDocs(req, callback){

  getRaw(req, function(file){
    var builder = new BlobBuilder();
    var bin = file.data;
    var arr = new Uint8Array(bin.length);
    for(var i = 0, l = bin.length; i < l; i++){
      arr[i] = bin.charCodeAt(i);
    }
    builder.append(arr.buffer);
    
  
  
  function complete(resp, xhr){
    try{
      var prs = JSON.parse(resp);
      console.log(resp, xhr);
      callback();
    }catch(err){
      if(resp.indexOf("ServiceForbiddenException") != -1){
        callback('error: Google Docs API only supports Document, Presentation and Spreadsheet files.');
      }else{
        callback('error:'+resp.replace(/<.*?>/g,' ').replace(/ +/g,' '));
      }
    }
  }
  
  
  
  function uploadDocument(){
      console.log('uploading', file.type, file.name);
      
      if(file.name.indexOf('.doc') != -1) file.type = 'application/msword';
      if(file.name.indexOf('.xls') != -1) file.type = 'application/vnd.ms-excel';
      
      GoogleOAUTH.sendSignedRequest(
        'https://docs.google.com/feeds/default/private/full',
        complete,
        {
          method: 'POST',
          headers: {
            'Content-Type': file.type,
            'Slug': file.name,
            'GData-Version': '3.0'
          },
          parameters: {
            alt: 'json'
          },
          body: builder.getBlob(file.type)
        });
        
  
  }
  
  
  

    GoogleOAUTH.authorize(function() {
      console.log("yay authorized");
      uploadDocument();
    });
  });
}

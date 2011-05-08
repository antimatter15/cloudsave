Hosts.gdocs = function uploadGDocs(req, callback){

  getBuffer(req, function(file){
    var builder = new BlobBuilder();
    builder.append(file.data);
    
  
  
  function complete(resp, xhr){
    try{
      var prs = JSON.parse(resp);
      console.log(resp, xhr);
      callback();
    }catch(err){
      if(resp.indexOf("ServiceForbiddenException") != -1){
        callback('error: Google Docs API only supports ppt, docx, doc, xlsx, xls, jpeg, html, png, rtf, csv, odf, odt, ods, and odt.');
      }else{
        callback('error:'+resp.replace(/<.*?>/g,' ').replace(/ +/g,' '));
      }
    }
  }
  
  
  
  function uploadDocument(){
      console.log('uploading', file.type, file.name);
      
      if(file.name.indexOf('.doc') != -1) file.type = 'application/msword';
      if(file.name.indexOf('.xls') != -1) file.type = 'application/vnd.ms-excel';
      if(file.name.indexOf('.ppt') != -1) file.type = 'application/vnd.ms-powerpoint';
      

      if(file.name.indexOf('.xlsx') != -1) file.type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if(file.name.indexOf('.docx') != -1) file.type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      file.type = file.type.replace(/;.+/g,'');
      var convert = false;
      
      var types = 'csv,tsv,tab,html,htm,doc,docx,ods,odt,rtf,sxw,txt,xls,xlsx,pdf,ppt,pps,wmf';
      
      var len = types.split(',').filter(function(x){
      	return file.name.indexOf('.'+x) != -1
      }).length;
      
      if(len > 0){
      	convert = true;
      }
      
      console.log('uploading new mime type', file.type);
      var blob = builder.getBlob(file.type);
      
      GoogleOAUTH.sendSignedRequest(
        'https://docs.google.com/feeds/upload/create-session/default/private/full',
        function(body, xhr){
        	var upload_uri = xhr.getResponseHeader('Location');
        	
        	var xhr = new XMLHttpRequest();
        	xhr.open('PUT', upload_uri, true);
        	xhr.setRequestHeader('Content-Type', file.type);
        	 xhr.upload.addEventListener('progress', function(evt){
						uploadProgress(file.url, evt);
					}, false)
					xhr.onload = function(){
						console.log('OMFG DONE UPLAODING');
						complete(xhr.responseText, xhr);
					}
					xhr.send(blob);
        	
        },
        {
          method: 'POST',
          headers: {
            'X-Upload-Content-Type': file.type,
            'Content-Type': file.type,
            'Slug': file.name,
            'X-Upload-Content-Length': blob.size,
            'GData-Version': '3.0'
          },
          parameters: {
            alt: 'json',
            convert: convert
          },
          body: ''
        });
        
      
      /*
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
            alt: 'json',
            convert: false
          },
          body: blob
        });
        */
  
  }
  
  
  

    GoogleOAUTH.authorize(function() {
      console.log("yay authorized");
      uploadDocument();
    });
  });
}

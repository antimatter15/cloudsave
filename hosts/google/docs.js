Hosts.gdocs = function uploadGDocs(req, callback){
	
  getBuffer(req, function(file){
//    var builder = new BlobBuilder();
//    builder.append(file.data);
  
  function handleErrors(resp){
		if(resp.indexOf("ServiceForbiddenException") != -1){
      callback('error: The Google Docs API will enable arbitrary file support shortly. Try again in a few days.');
    }else{
      callback('error:'+resp.replace(/<.*?>/g,' ').replace(/ +/g,' '));
    }
  }
  
  function complete(resp, xhr){
    try{
      var prs = JSON.parse(resp);
      console.log(resp, xhr);
      callback({
      	url: 'https://docs.google.com/'
      });
    }catch(err){
      handleErrors(resp);
    }
  }
  
  
  function uploadDocument(){
      console.log('uploading', file.type, file.name);
      
      
			var types = {
				"CSV": "text/csv",
				"TSV": "text/tab-separated-values",
				"TAB": "text/tab-separated-values",
				"DOC": "application/msword",
				"DOCX": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				"ODS": "application/x-vnd.oasis.opendocument.spreadsheet",
				"ODT": "application/vnd.oasis.opendocument.text",
				"RTF": "application/rtf",
				"SXW": "application/vnd.sun.xml.writer",
				"TXT": "text/plain",
				"XLS": "application/vnd.ms-excel",
				"XLSX": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"PDF": "application/pdf",
				"PPT": "application/vnd.ms-powerpoint",
				"PPS": "application/vnd.ms-powerpoint",
				"WMF": "image/x-wmf"
			};
			var matches = 0;
			for(var i in types){
				if((new RegExp("\\."+i+"$", 'i')).test(file.name)){
					file.type = types[i];
					matches++;
				}
			}
			
      file.type = file.type.replace(/;.+/g,'');
      var convert = matches > 0;
      
      
      console.log('uploading new mime type', file.type);
      //var blob = builder.getBlob(file.type);
      var blob = new Blob([file.data], {type: file.type});
      
      GoogleOAUTH.sendSignedRequest(
        'https://docs.google.com/feeds/upload/create-session/default/private/full',
        function(body, xhr){
        	var upload_uri = xhr.getResponseHeader('Location');
        	if(upload_uri && xhr.status == 200){
		      	
		      	var xhr = new XMLHttpRequest();
		      	xhr.open('PUT', upload_uri, true);
		      	xhr.setRequestHeader('Content-Type', file.type);
		      	 xhr.upload.addEventListener('progress', function(evt){
							uploadProgress(file.url, evt);
						}, false)
						xhr.onload = function(){
							complete(xhr.responseText, xhr);
						}
						xhr.send(blob);
        	}else{
	        	handleErrors(xhr.responseText)
        	}
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

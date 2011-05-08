//stolen from mozilla http://demos.hacks.mozilla.org/openweb/imageUploader/js/extends/xhr.js
//http://code.google.com/p/chromium/issues/detail?id=35705#c6
//http://efreedom.com/Question/1-3743047/Uploading-Binary-String-WebKit-Chrome-Using-XHR-Equivalent-Firefoxs-SendAsBinary
//this is a mutilated sendMultipart function. BEWARE!

if(typeof btoa == 'undefined'){

  btoa = function (input) {
	  var output = "", i = 0, l = input.length,
	  key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", 
	  chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	  while (i < l) {
		  chr1 = input.charCodeAt(i++);
		  chr2 = input.charCodeAt(i++);
		  chr3 = input.charCodeAt(i++);
		  enc1 = chr1 >> 2;
		  enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		  enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		  enc4 = chr3 & 63;
		  if (isNaN(chr2)) enc3 = enc4 = 64;
		  else if (isNaN(chr3)) enc4 = 64;
		  output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
	  }
	  return output;
  }

  atob = function(input){
    var output = "", i = 0, l = input.length,
	  key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", 
	  chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	  while (i < l) {
		  enc1 = key.indexOf(input.charAt(i++));
		  enc2 = key.indexOf(input.charAt(i++));
		  enc3 = key.indexOf(input.charAt(i++));
		  enc4 = key.indexOf(input.charAt(i++));
		  chr1 = (enc1 << 2) | (enc2 >> 4);
		  chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		  chr3 = ((enc3 & 3) << 6) | enc4;
		  output = output + String.fromCharCode(chr1);
		  if (enc3 != 64) output = output + String.fromCharCode(chr2);
		  if (enc4 != 64) output = output + String.fromCharCode(chr3);
	  }
	  return output;
  }

}

XMLHttpRequest.prototype.sendMultipart = function(params) {
  var BOUNDARY = "---------------------------1966284435497298061834782736";
  var rn = "\r\n";
  console.log(params)
  
  var tmp = new XMLHttpRequest();
  var abuf = 'responseType' in tmp && 'response' in tmp;
  
  var binxhr = !!this.sendAsBinary;
  if(binxhr){
    var req = '', append = function(data){req += data}
  }else{
    var req = new BlobBuilder(), append = function(data){req.append(data)}
  }
  
  append("--" + BOUNDARY);
  
  var file_param = -1;
  var xhr = this;
  
  
  
  
  for (var i in params) {
    if (typeof params[i] == "object") {
      file_param = i;
    } else {
      append(rn + "Content-Disposition: form-data; name=\"" + i + "\"");
      append(rn + rn + params[i] + rn + "--" + BOUNDARY);
    }
  }
  
  var i = file_param;
  
  append(rn + "Content-Disposition: form-data; name=\"" + i + "\"");
  
  getURL(abuf?'arraybuffer':(binxhr?'binary':'raw'),params[i], function(file){
    //Uint8 does clamping, but sendAsBinary doesn't
    console.log('actual data entity', file);
    
    xhr.upload.addEventListener('progress', function(evt){
  		uploadProgress(file.url, evt);
	  }, false)

    append("; filename=\""+file.name+"\"" + rn + "Content-type: "+file.type);

    append(rn + rn);

    if(binxhr){
      append(file.data);
    }else if(abuf){
    	append(file.data);
    }else{
      var bin = file.data
      var arr = new Uint8Array(bin.length);
      for(var i = 0, l = bin.length; i < l; i++)
        arr[i] = bin.charCodeAt(i);
      
      append(arr.buffer)
    }
    append(rn + "--" + BOUNDARY);
  
    append("--");


    xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + BOUNDARY);
    
    if(binxhr){
      xhr.sendAsBinary(req);
    }else{
    	superblob = req.getBlob();
      xhr.send(superblob);
    }
  });
};

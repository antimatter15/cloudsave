//uses multipart helper function.
//magic totally obfuscated key that you shall never see
//39ACEJNQa5b92fbce7fd90b1cb6f1104d728eccb
//does not support https


Hosts.imageshack = function uploadImageshack(file, callback){
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://www.imageshack.us/upload_api.php");  
  xhr.onload = function(){
    try{
      var link = xhr.responseXML.getElementsByTagName('image_link');
	    callback({url: link[0].childNodes[0].nodeValue});
	  }catch(err){
	    callback('error: imageshack uploading failed')
	  }
  }
  xhr.onerror = function(){
    callback('error: imageshack uploading failed')
  }
  xhr.sendMultipart({
    key: Keys.imageshack,
    fileupload: file
  })
}



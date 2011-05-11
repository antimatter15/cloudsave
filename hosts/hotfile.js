//uses multipart helper function.
Hosts.hotfile = function uploadHotfile(file, callback){
  //http://api.hotfile.com/?action=getuploadserver

	var xhr = new XMLHttpRequest();
	xhr.open("GET", https()+"api.hotfile.com/?action=getuploadserver");  
	xhr.send();
	xhr.onload = function(){
		var post_url = https()+xhr.responseText.trim()+'/upload.cgi?'+(+new Date);
		
	  var xhr2 = new XMLHttpRequest();
	  xhr2.open("POST", post_url);  

	  xhr2.onerror = function(){
	    callback('error: hotfile hosting error')
	  }
		xhr2.onload = function(){
		  var url = xhr2.responseText.match(/value="(http.*?)"/);
		  if(url) callback({url: url[1]});
		  console.log(xhr2, url)
	  }
		xhr2.sendMultipart({
		  iagree: 'on',
		  'uploads[]': file
		})
		
	}
	xhr.onerror = function(){
	  callback('error: hotfile could not get upload server');
	}
	
}

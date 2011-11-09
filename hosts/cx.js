// Cx

Hosts.cx = function uploadCx(file, callback) {
	var login_shown = false;
	var poll = function(){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "https://www.cx.com/0/userInfo/viewProfile");
		xhr.send();
		xhr.onload = function(){
			if (xhr.status==200) {	// Logged in
				
				var tmp = new XMLHttpRequest();
				var abuf = 'responseType' in tmp && 'response' in tmp;
				var binxhr = !!this.sendAsBinary;
				
				// Amazon needs file size to upload
				getURL(abuf?'arraybuffer':(binxhr?'binary':'raw'),file, function(file){
					
					var xhr2 = new XMLHttpRequest();
					xhr2.open("POST", "https://www.cx.com/0/filedata/upload");
					xhr2.onload = function(){
						callback({url:"http://www.cx.com/mycx/files"});
					}
					xhr2.sendMultipart({
						fileName: file.name,
						fileSize: file.data.byteLength,
						file: file
					});
				});
				
			} else {
				if (!login_shown) {
					chrome.tabs.create({url:"http://www.cx.com/mycx/sign_in"});
					login_shown = true;
				}
				setTimeout(poll, 2000);
			}
		}
	}
	poll();
}
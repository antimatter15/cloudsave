Hosts.skydrive = function uploadSkyDrive(req, callback){
	console.log('SkyDrive Uploading is BETA');
	function checkLogin(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://skydrive.live.com/', true);
		xhr.send(null);
		xhr.onload = function(){
			var cid = xhr.responseText.match(/cid-([a-z0-9]+)\//);
			if(cid && (cid = cid[1])){

				var url = 'https://skydrive.live.com/upload.aspx/.Documents?sc=documents&cid='+cid;
				var down = new XMLHttpRequest();
				down.open('GET', url, true);
				down.onload = function(){
				  var canary = down.responseText.match('"canary".*?value.*?"(.*)"')[1]
				  var viewstate = down.responseText.match('"__VIEWSTATE".*?value.*?"(.*)"')[1]
				  console.log(canary, viewstate);
				  
				  var uploader = new XMLHttpRequest();
				  uploader.open('POST', url, true);
				  uploader.onload = function(){
					  callback({
					    url: "https://skydrive.live.com/"
					  });
				  }
				  var o = {
					  __VIEWSTATE: viewstate,
					  canary: canary,
					  fileUpload1: req,
					  hiddenInput: '',
					  photoSize: '1600'
				  };
				  o['fileUpload2"; filename="'] = '';
				  o['fileUpload3"; filename="'] = '';
				  o['fileUpload4"; filename="'] = '';
				  uploader.sendMultipart(o);
				};
				down.send(null);
			}else{
				var redirect = xhr.responseText.match(/url=(.+)"/)[1];
				var div = document.createElement('div');
				div.innerHTML = redirect;
				console.log('Calculated URL', div.innerText);
				loginTab(div.innerText, 'https://skydrive', checkLogin);
			}
		}
	}
	checkLogin();
}



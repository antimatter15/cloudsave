Hosts.facebook = function uploadfacebook(file, callback){

	function init(url){
		var code = url.match(/code=(.*)/)[1];
	  localStorage.facebook_code = code;
	  get_token();
	}
	
	
	function get_token(){
		var xhr = new XMLHttpRequest();
		var code = localStorage.facebook_code;
		xhr.open('GET', 'https://graph.facebook.com/oauth/access_token?client_id='+Keys.facebook.appid+'&redirect_uri=http://drag2up.appspot.com/static/tpilb.html&client_secret='+Keys.facebook.secret+'&code='+code, true);
		xhr.onload  = function(){
			if(xhr.status == 400){
				authorize();
			}else{
				var token = xhr.responseText.match(/access_token=([^\&]*)/)[1];
				upload(token);
			}
		}
		xhr.send(null);
	}
	
	function upload(token){
		var xhr = new XMLHttpRequest();
		xhr.open('POST', 'https://graph.facebook.com/me/photos?access_token='+token, true);
		xhr.onload = function(){
			callback({
				url: 'https://www.facebook.com/photo.php?fbid='+JSON.parse(xhr.responseText).id
			});
		}
		xhr.sendMultipart({
			source: file
		})
	}
	
	function authorize(){
		var url='https://graph.facebook.com/oauth/authorize?redirect_uri=http://drag2up.appspot.com/static/tpilb.html&client_id='+Keys.facebook.appid+'&scope=publish_stream';
	
		loginTab(url, 'code=', init);
  }
  get_token();
}

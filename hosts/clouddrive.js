Hosts.clouddrive = function uploadclouddrive(file, callback){
	var cid = '';
	var sessid = ''
	
	function apiRequest(p, callback){
		var xhr = new XMLHttpRequest();
		p._ = +new Date;
		p.ContentType = 'JSON';
		p.customerId = cid;
		xhr.open('GET', 'https://www.amazon.com/clouddrive/api/?'+urlencode(p), true);
		xhr.setRequestHeader('x-amzn-SessionId', sessid);
		xhr.onload = function(){
			var json = JSON.parse(xhr.responseText);
			callback(json);
		}
		xhr.send(null);
	}
	
	function urlencode(p){
		var params = [];	
		for(var i in p){
			params.push(i+'='+encodeURIComponent(p[i]));
		}
		return params.join('&');
	}
	
	
	function login(){
		var loginurl = 'https://www.amazon.com/ap/signin?_encoding=UTF8&openid.assoc_handle=usflex&openid.return_to=https%3A%2F%2Fwww.amazon.com%2Fclouddrive%2F%3F_encoding%3DUTF8%26path%3D%252Fclouddrive%252F%26ref_%3Dpd_irl_gw_r%26signIn%3D1%26useRedirectOnSuccess%3D1%26action%3Dsign-out&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.pape.max_auth_age=0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select';
		loginTab(loginurl, '/clouddrive', getKeys);
	}
	
	
	function getKeys(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://www.amazon.com/clouddrive', true);
		xhr.send(null);
		xhr.onload = function(){
			var match = xhr.responseText.match(/<input id="customerId" type="hidden" value="([A-Z0-9]+)?">/);
			var match2 = xhr.responseText.match(/<input id="sessionId" type="hidden" value="([0-9\-]+)">/);
			if(!match || !match2){
				//todo: redirect to amazon lgoin
				console.log('Error: not logged in');
				login();
			}else{
				cid = match[1];
				sessid = match2[1];
				createFile();
			}
		}
	}


	
function createFile(){
	apiRequest({
		Operation: 'createByPath',
		type: 'FILE',
		path: '/',
		name: file.name,
		conflictResolution: 'RENAME',
		overwrite: true,
		autoparent: true
	}, function(json){
		getUpload(json.createByPathResponse.createByPathResult.objectId);
	})
}



	
function completeFile(objectid, storagekey){
	apiRequest({
		Operation: 'completeFileUploadById',
		objectId: objectid,
		storageKey: storagekey
	}, function(json){
		callback({
			url: 'https://www.amazon.com/clouddrive'
		})
	})
}

function getUpload(objectid){
	apiRequest({
		Operation: 'getUploadUrlById',
		objectId: objectid,
		size: 42, //d.data.byteLength,
		method: 'POST'
	}, function(json){
		var h = json.getUploadUrlByIdResponse.getUploadUrlByIdResult.httpRequest;
		console.log('got http stuff', h);
		var storageKey = json.getUploadUrlByIdResponse.getUploadUrlByIdResult.storageKey;
		doUpload(h, function(){
			completeFile(objectid, storageKey);
		});
	})
}

function doUpload(h, cb){
	var xhr = new XMLHttpRequest();
	var params = JSON.parse(JSON.stringify(h.parameters));
	params.Filename = file.name;
	params.file = file;
	console.log(params);
	xhr.open('POST', h.endpoint, true);
	xhr.onload = function(){
		if(cb) cb();
	}
	xhr.sendMultipart(params)
}

getKeys();

}

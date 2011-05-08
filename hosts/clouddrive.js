Hosts.clouddrive = function uploadclouddrive(file, callback){
	var cid = '';
	var sessid = ''
	
	function apiRequest(p, callback){
		var xhr = new XMLHttpRequest();
		var params = [];
		p._ = +new Date;
		p.ContentType = 'JSON';
		p.customerId = cid;
		for(var i in p){
			params.push(i+'='+encodeURIComponent(p[i]));
		}
		xhr.open('GET', 'https://www.amazon.com/clouddrive/api/?'+params.join('&'), true);
		xhr.setRequestHeader('x-amzn-SessionId', sessid);
		xhr.onload = function(){
			var json = JSON.parse(xhr.responseText);
			callback(json);
		}
		xhr.send(null);
	}
	
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://www.amazon.com/clouddrive', true);
	xhr.send(null);
	xhr.onload = function(){
		var match = xhr.responseText.match(/<input id="customerId" type="hidden" value="([A-Z0-9]+)?">/);
		var match2 = xhr.responseText.match(/<input id="sessionId" type="hidden" value="([0-9\-]+)">/);
		if(!match || !match2){
			//todo: redirect to amazon lgoin
			console.log('Error: not logged in');
		}else{
			cid = match[1];
			sessid = match2[1];
			createFile();
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


function getUpload(objectid){
	apiRequest({
		Operation: 'getUploadUrlById',
		objectId: objectid,
		size: 42,
		method: 'POST'
	}, function(json){
		var h = json.getUploadUrlByIdResponse.getUploadUrlByIdResult.httpRequest;
		console.log('got http stuff', h);
		doUpload(h);
	})

}


function doUpload(h){
	var xhr = new XMLHttpRequest();
	xhr.open(h.methodName, h.endpoint+'/'+h.resourcePath, true);
	h.parameters.file = file;
	xhr.sendMultipart(h.parameters)
}

}

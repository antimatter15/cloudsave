var MINUS_API_TOKEN, MINUS_API_USER, MINUS_GALLERY_ID;

Hosts.minus = function uploadMinus(file, callback){
	
	function minus_ajax(url, options) { 
        if (!options) options = {};
        if (!options.params) options.params = {};
        if (!options.method) options.method = 'GET';

        var xhr = function() {
            if (typeof XMLHttpRequest === 'undefined') {
                XMLHttpRequest = function() {
                    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
                        catch(e) {}
                    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
                        catch(e) {}
                    try { return new ActiveXObject("Msxml2.XMLHTTP"); }
                        catch(e) {}
                    try { return new ActiveXObject("Microsoft.XMLHTTP"); }
                        catch(e) {}
                    throw new Error("This browser does not support XMLHttpRequest.");
                };
            }

            return new XMLHttpRequest();
        }();           
        
        if (MINUS_API_TOKEN && url.match(/minus.com/))
            options.params['bearer_token'] = MINUS_API_TOKEN;

        if (options.binaryData || options.method === "GET" && options.params) {
            
            if (hashToQueryString(options.params))
                url += (url.match(/\?/) ? "&" : "?") + hashToQueryString(options.params);
        }
        
        xhr.open(options.method, url, true);  

        xhr.onreadystatechange = function(){
            if (xhr.readyState == 4) {
                                
                console.log(url, xhr.status, xhr);

                // Parse response if it contains JSON string
                var response = xhr.responseText[0] === '{' ? (function(){
                                                                 return window.JSON && window.JSON.parse ?
                                                                    window.JSON.parse(xhr.responseText) :
                                                                    (new Function("return "+xhr.responseText))()
                                                             }()) :
                                                             xhr.responseText;

                if (xhr.status == 200) {
                    (options.onSuccess || emptyFunc)(response, xhr);
                } else {
                    (options.onError || emptyFunc)(response, xhr);
                }
            }
        }
        
        // Setting Request headers
        if (!options.headers) options.headers = {};        

        if (!options.headers["Content-Type"] && options.method === "POST") {
            options.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }

        for (key in options.headers) {
            if (options.headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, options.headers[key]);
            }
        }
        
        if (options.mime_type) xhr.overrideMimeType(options.mime_type);        
/*
        if (options.onProgress) {
            upload = xhr.upload;
            upload.addEventListener("progress", function (ev) {
                if (ev.lengthComputable) {
                    options.onProgress((ev.loaded / ev.total) * 100);
                }
            }, false);
        }
*/        
        // Sending data
        if (options.method === "POST" && (options.params || options.binaryData)) {
            if (options.binaryData) {
                xhr.sendAsBinary(options.binaryData);
            } else {
                xhr.send(hashToQueryString(options.params));
            }
        } else {
            xhr.send(null);
        }

        return xhr;
    };    

    minus_oauthToken = function(up) {
	
        var params = {
            'grant_type': 'password',
            'client_id': Keys.minus.key,
            'client_secret': Keys.minus.secret,
            'scope': 'read_all modify_all upload_new',
            'username': up.usr,
            'password': up.pwd
        }

        new minus_ajax("https://minus.com/oauth/token", {
            params: params,

            onSuccess: function(response) {
            	if (up.keep){
//            		console.log('oauthtoken: ', response);
            		localStorage.minus_refresh_token = response.refresh_token;
            		localStorage.minus_user = up.usr;
            	}
            	MINUS_API_TOKEN = response.access_token;
            	MINUS_API_USER = up.usr;
            	minus_createGallery(up);
            },

            onError: function(response) {
                alert('Cannot log in: ', response);
            }
        });
    }

    minus_createGallery = function(up) {
        name = "Cloud Save";

        minus_callMethod('users/'+ MINUS_API_USER +"/folders", {
            method: "POST",
            params: {'name': name},
            onSuccess: function(gallery){
            	if (up.keep)
            	   localStorage.minus_gallery_id = gallery.id;
            	MINUS_GALLERY_ID=gallery.id;
            	minus_upload();
            	},
            onError: function(resp) {console.log('create gallery error: ', resp);}
        });
    }
    
    function minus_upload(){
    	
    	var xhr = new XMLHttpRequest();
    	xhr.open('POST', 'http://minus.com/api/v2/folders/'+MINUS_GALLERY_ID+'/files?bearer_token='+MINUS_API_TOKEN, true);
    	xhr.onload = function(){
        	callback({
        		url: "http://minus.com/"
        	});
        }
        xhr.onreadystatechange=function(){
        	if (xhr.readyState === 4){
        		if(xhr.status != 200){
        			if (localStorage.minus_refresh_token && localStorage.minus_user && localStorage.minus_gallery_id){
        				minus_refreshToken(localStorage.minus_refresh_token);
        			}
        			else{
        				minus_loginWindow();
        			}
        		}
        	}
        }
    	xhr.sendMultipart({
    		'filename': (file.name||'untitled'),
            "file": {url: file.url, name: (file.name||'untitled')}
        });
    }
    
    minus_callMethod = function(method, options) {        
        if (options == undefined) {
            options = {}
        }

        var new_options = clone(options);

        new_options.onSuccess = function(resp, xhr){
            console.log("Method '%s' called succesefully", method, options, resp);
            
            (options.onSuccess || emptyFunc)(resp, xhr);        
        }

        new_options.onError = function(resp, xhr){
            console.log("Error while calling method '%s'", method, options);

            (options.onError || emptyFunc)(resp, xhr);        
        }

        return new minus_ajax('http://minus.com/api/v2/' + method, new_options);
    }
    
    function minus_refreshToken(refresh_token) {
        var params = {
            'grant_type': 'refresh_token',
            'access_type': 'offline',
            'client_id': Keys.minus.key,
            'client_secret': Keys.minus.secret,
            'refresh_token': refresh_token,
            'scope': 'read_all modify_all upload_new'
        }

        new minus_ajax("https://minus.com/oauth/token", {
        	method: "POST",
            params: params,

            onSuccess: function(response) {
                MINUS_API_TOKEN = response.access_token;
                MINUS_API_USER = localStorage.minus_user;
                MINUS_GALLERY_ID = localStorage.minus_gallery_id;
                minus_upload();
            },

            onError: function(response) {
                console.log('error: wrong refresh token: ', response);
            }
        });               
    }
    
    minus_loginWindow = function(){
    	chrome.tabs.create({
            url: chrome.extension.getURL('login_popup.html'),
            active: false
        }, function(tab) {
        	var w = 440;
        	var h = 220;
        	var left = (screen.width/2)-(w/2);
            var top = (screen.height/2)-(h/2); 
            chrome.windows.create({
                'tabId': tab.id,
                'type': 'popup',
                'focused': true,
                'width': w,
                'height': h,
                'left': left,
                'top': top
            });
        });
    }
/*    
    if ('usr' in file){
    	minus_oauthToken(file, callback);
    }
    else 
*/    
    
    chrome.extension.onRequest.addListener(
    	function from_minus_login(request){
    		chrome.tabs.remove(request.tid);
    		chrome.extension.onRequest.removeListener(from_minus_login);
    		minus_oauthToken(request);
    	}
    );

    if(MINUS_API_TOKEN && MINUS_API_USER && MINUS_GALLERY_ID){
		minus_upload();
	}
	else if (localStorage.minus_refresh_token && localStorage.minus_user && localStorage.minus_gallery_id){
		minus_refreshToken(localStorage.minus_refresh_token);
	}
	else{
	    minus_loginWindow();
	}
}
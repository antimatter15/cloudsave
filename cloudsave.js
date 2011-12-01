var Hosts = {};

var root = chrome.contextMenus.create({
  "title" : "Cloud Save",
  "contexts" : ["page", "image", "link", "selection"]
});

var save_as = chrome.contextMenus.create({
  "title": "Save As...",
  "contexts": ["all"],
  "parentId": root
});

chrome.contextMenus.create({
  "type": "separator",
  "contexts": ["all"],
  "parentId": root
});


//todo: add more
var original = {
  "image": {
    picasa: 'Picasa',
    twitpic: 'TwitPic',
    flickr: 'Flickr',
    posterous: 'Posterous',
    twitrpix: 'Twitrpix',
    twitgoo: 'Twitgoo',
    facebook: 'Facebook',
    imgly: 'Imgly'
  },
  "all": {
	cx: 'Cx',
    box: 'Box.net',
    sugarsync: 'SugarSync',
    dropbox: 'Dropbox',
    gdocs: 'Google Docs',
    minus: 'Min.us',
    cloudapp: 'CloudApp',
 	  clouddrive: 'Amazon Cloud',
    droplr: 'Droplr',
    skydrive: 'SkyDrive',
    webdav: 'WebDAV'
  }, 
  "link": {
    dropdo: 'Dropdo' //this one is peculiar because it works differently from all the other hosts
  }
};


var additional = {
	"image": {
		imageshack: 'Imageshack',
		imgur: 'Imgur',
		immio: 'Imm.io'
	},
	"all": {
		hotfile: 'Hotfile'
	}
};

var classes = clone_r(original);

function clone(obj){ //very shallow cloning
  var n = {};
  for(var i in obj) n[i] = obj[i]; //we are the knights who say ni!
  return n;
}

function clone_r(obj){ //not so shallow cloning
	if(typeof obj != 'object') return obj;
  var n = {};
  for(var i in obj) n[i] = clone(obj[i]); //we are the knights who say ni!
  return n;
}




//an order which shoudl theoretically work, but isnt optimal
//in any stretch of the imagination
/*
  general idea: 
    1. quantity (2 > 1)
    2. position (end > beginning)
*/


try {
  recent = JSON.parse(localStorage.cloudsave_recent);
}catch(err){
  recent = [
    'gdocs',
    'facebook',
    'dropbox',
    'flickr',
    'box',
    'clouddrive',
    'picasa',
    'gdocs',
    'dropbox'
  ];
}


function handle_click(info, tab){
  console.log(arguments);
  var url = info.srcUrl || info.linkUrl || info.pageUrl;
  console.log('Source URL', url);
  var name = unescape(decodeURIComponent(
							unescape(unescape(unescape(url)))
								.replace(/\s/g, '+')
		            .replace(/^.*\/|\?.*$|\#.*$|\&.*$/g,'') || 
		          url.replace(/.*\/\/|www./g,'')
		             .replace(/[^\w]+/g,'_')
		             .replace(/^_*|_*$/g,''))
             ).replace(/\+/g, ' ');
  console.log('Processed name', name);
  if(info.selectionText){
  	url = 'data:text/plain,'+encodeURIComponent(info.selectionText);
  }
  var host = menu_ids[info.menuItemId];
  if(Hosts[host]){
		if(host == 'dropdo'){
		  chrome.tabs.create({
		    url: 'http://dropdo.com/upload?link='+url
		  })
		}else{
		  if(host == 'dropbox' && localStorage.folder_prefix){
		    name = localStorage.folder_prefix + name;
		  }
		  if(info.parentMenuItemId == save_as){
		    //woot save as stuff
		    console.log('save as');
		    name = prompt('Save file as...', name);
		    if(!name) return;
		  };
		  
		  if(name.indexOf('/') != -1){
		    localStorage.folder_prefix = name.replace(/[^\/]+$/,'');
		  }
		  
		  upload(host, url, name);
		}
		console.log(host, url, name);
		recent.push(host);
		recent.shift();
		localStorage.cloudsave_recent = JSON.stringify(recent);
		updateMenus();
  }else{
		alert("Could not find host "+host);
  }
}

var title_map = {};
var menu_ids = {};

function updateMenus(){
	title_map = {};
	for(var i in classes){
		for(var h in classes[i]){
		  title_map[h] = classes[i][h]; //flatten it out
		}
	}

  Object.keys(menu_ids).reverse().forEach(function(item){
    chrome.contextMenus.remove(parseInt(item));
  });
  menu_ids = {};
  for(var unique = [], freqmap = {}, i = 0; i < recent.length;i++){
  	if(title_map[recent[i]]){
		  if(!freqmap[recent[i]]){
		    freqmap[recent[i]] = 1;
		    unique.push(recent[i]);
		  }
		  freqmap[recent[i]]++;
    }
  }
  var dilation_factor = 100;
  function grade(result){
    return freqmap[result] + recent.lastIndexOf(result) / dilation_factor;
  }
  var sorted = unique.sort(function(a,b){
    return grade(b) - grade(a);
  });
  console.log(recent);
  console.log(unique.map(function(a){
    return a + ' ' + grade(a)  
  }))
  for(var i = 0; i < sorted.length; i++){
    var prop = {
      "title": title_map[sorted[i]],
      "onclick": handle_click
    };
    prop.contexts = classes.image[sorted[i]] ? 
                    ['image'] : 
                  (classes.link[sorted[i]]? 
                    ['image', 'link', 'selection']:  ['page', 'link', 'image', 'selection']);
    prop.parentId = root;
    menu_ids[chrome.contextMenus.create(clone(prop))] = sorted[i];
    prop.parentId = save_as;
    menu_ids[chrome.contextMenus.create(clone(prop))] = sorted[i];
  }
  var others = Object.keys(title_map).sort().filter(function(x){
    return unique.indexOf(x) == -1;
  });
  /*
  menu_ids[chrome.contextMenus.create({
    "type": "separator",
    "contexts": ["all"],
    "parentId": root
  })] = 42;
  menu_ids[chrome.contextMenus.create({
    "type": "separator",
    "contexts": ["all"],
    "parentId": save_as
  })] = 42;
  //*/
  var save_as_more = chrome.contextMenus.create({
    "title": "More",
    "parentId": save_as,
    "contexts": ["all"]
  });
  menu_ids[save_as_more] = 'save_as_more';
  var root_more = chrome.contextMenus.create({
    "title": "More",
    "parentId": root,
    "contexts": ["all"]
  });
  menu_ids[root_more] = 'root_more';
  function add_more(host){
		var prop = {
      "title": title_map[host],
      "onclick": handle_click
    };
    prop.contexts = classes.image[host] ? 
                    ['image'] : 
                  (classes.link[host]? 
                    ['image', 'link']:  ['page', 'link', 'image']);
    prop.parentId = root_more;
    menu_ids[chrome.contextMenus.create(clone(prop))] = host;
    prop.parentId = save_as_more;
    menu_ids[chrome.contextMenus.create(clone(prop))] = host;
  }
  
  for(var i = 0; i < others.length; i++){
    if(classes.image[others[i]]){
      add_more(others[i])
    }
  }
  menu_ids[chrome.contextMenus.create({
    "type": "separator",
    "contexts": ["image"],
    "parentId": root_more
  })] = 42;
  menu_ids[chrome.contextMenus.create({
    "type": "separator",
    "contexts": ["image"],
    "parentId": save_as_more
  })] = 42;
  for(var i = 0; i < others.length; i++){
    if(!classes.image[others[i]]){
      add_more(others[i])
    }
  }
  //*
  menu_ids[chrome.contextMenus.create({
    "type": "separator",
    "contexts": ["all"],
    "parentId": root_more
  })] = 42;
  menu_ids[chrome.contextMenus.create({
    "title": "Add/Remove",
    "contexts": ["all"],
    "parentId": root_more,
    "onclick": open_settings
  })] = 'add_remove'; //*/
}


function open_settings(){
	chrome.tabs.create({url: "settings.html"})
}

//shamelessly stolen from john resig.
function wbr(str, num) {  
  return str.replace(RegExp("(\\w{" + num + "})(\\w)", "g"), function(all,text,char){ 
    return text + "<wbr>" + char; 
  }); 
}

var INDETERMINATE = {};


function updateNotification(id, arg1, arg2){
	function main(){
		var wins = chrome.extension.getViews({type:"notification"})
		var matches = wins.filter(function(win) {
			return win.location.search.substr(1) == id
		});
		if(id == 42) matches = wins; //please coding gods dont kill me
		if(matches.length){
			if(typeof arg1 == 'number' || arg1 == INDETERMINATE){
				matches[0].document.getElementById('progress').style.display = '';
				matches[0].document.getElementById('progress').value = arg1 == INDETERMINATE ? null : arg1;
			}else if(arg2){
				matches[0].document.getElementById('status').innerHTML = arg2;
				matches[0].document.body.style.backgroundImage = 'url('+arg1+')';
				matches[0].document.getElementById('progress').style.display = 'none'
			}else{
				matches[0].document.getElementById('status').innerHTML = arg1;
			}
		}else{
			return false
		}
		return true
	}
	if(!main()){
		console.log('Error! Could not locate notification', id, arg1, arg2);
		var count = 0;
		function looper(){
			if(!main() && count++ < 100) setTimeout(looper, 10);
		}
		looper();
	}
}


var urlid = {
	'todo_fix_this': 42
	//this is a sort of hack. it uses the file download urls
	//as a sort of state callback whatnot stuff.
};

function uploadProgress(url, event){
	updateNotification(urlid[url], event.loaded/event.total/2 + 0.5);
}

function downloadProgress(url, event){
	updateNotification(urlid[url], event.loaded/event.total/2);
}


function upload(host, url, name){
	var id = Math.random().toString(36).substr(3);
	var notification = webkitNotifications.createHTMLNotification('popup.html?'+id);
	notification.ondisplay = function(){
		updateNotification(id, 'icon/throbber.gif', 
			"The file '"+wbr(name,8)+"' is being saved to "+title_map[host]+"...");
	  updateNotification(id, INDETERMINATE);
	}
	var has_uploaded = false;
	var upload_callback = function(){};
	
	notification.onclick = function(){
		if(has_uploaded){
			openFile()
		}else{
			updateNotification(id, "Opening file '"+wbr(name,8)+"' on "+title_map[host] +" in a few seconds...");
			upload_callback = openFile;
		}
	}
	notification.onclose = function(){
		delete urlid[url];
	}
	
	function openFile(){
		chrome.tabs.create({url: has_uploaded})
	}
	notification.show();
	urlid[url] = id;
  Hosts[host]({
    url: url,
    name: name
  }, function(e){
	  has_uploaded = e && e.url;
	  setTimeout(upload_callback, 200);
    console.log('uploaded file yay', e);
    if(e && typeof e == "string" && e.indexOf('error:') != -1){
      updateNotification(id, 'icon/64sad.png', 
      	"The file '"+wbr(name,8)+"' could not be uploaded to "+
        title_map[host]+". "+e.substr(6));
    }else{
	    updateNotification(id, 'icon/64.png', 
	    	"The file '"+wbr(name,8)+"' has been uploaded to "+title_map[host]+"."
	    );
	    setTimeout(function(){
	    	notification.cancel();
			}, 5.4 * 1000) //May the fourth be with you.
    }
  })
}


function install_additional(state){
	if(state){
		for(var i in additional){
			for(var ii in additional[i])
				classes[i][ii] = additional[i][ii];
		}
	}else{
		classes = clone_r(original);
	}
	updateMenus();
}

if(localStorage.additional == 'yes'){
	install_additional(true);
}else{
	updateMenus();
}

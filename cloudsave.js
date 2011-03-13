var Hosts = {};

/*
var url = info.linkUrl || info.srcUrl || info.pageUrl;
unescape(unescape(unescape(url)))
  .replace(/^.*\/|\?.*$|\#.*$|\&.*$/g,'') || 
url.replace(/^.*:|\..*|[^\w]/g,'')
*/
//chrome.contextMenus.removeAll();

var root = chrome.contextMenus.create({
  "title" : "Cloud Save",
  "contexts" : ["page", "image", "link"]
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
var classes = {
  "image": {
    picasa: 'Picasa',
    twitpic: 'TwitPic',
    flickr: 'Flickr',
    posterous: 'Posterous'//,
    //twitrpix: 'Twitrpix'
  },
  "all": {
    box: 'Box.net',
    dropbox: 'Dropbox',
    gdocs: 'Google Docs',
    minus: 'Min.us'
  }
};


function clone(obj){ //very shallow cloning
  var n = {};
  for(var i in obj) n[i] = obj[i]; //we are the knights who say ni!
  return n;
}
var title_map = {};

for(var i in classes){
  for(var h in classes[i]){
    title_map[h] = classes[i][h]; //flatten it out
  }
}

var menu_ids = {};


var recent = [
  'twitpic',
  'dropbox',
  'minus',
  'flickr',
  'box',
  'picasa',
  'gdocs',
  'dropbox'
];

function updateMenus(){
  for(var i in menu_ids){
    chrome.contextMenus.remove(parseInt(i));
  }
  for(var unique = [], freqmap = {}, i = 0; i < recent.length;i++){
    if(!freqmap[recent[i]]){
      freqmap[recent[i]] = 1;
      unique.push(recent[i]);
    }
    freqmap[recent[i]]++;
  }
  var dilation_factor = 100;
  function grade(result){
    return freqmap[result] + recent.lastIndexOf(result) / dilation_factor;
  }
  var sorted = unique.sort(function(a,b){
    return grade(b) - grade(a);
  });
  for(var i = 0; i < sorted.length; i++){
    var prop = {
      "title": title_map[sorted[i]],
      "contexts": classes.image[sorted[i]] ? 
                  ['image'] : ['page', 'link', 'image']
    };
    prop.parentId = root;
    menu_ids[chrome.contextMenus.create(clone(prop))] = sorted[i];
    prop.parentId = save_as;
    menu_ids[chrome.contextMenus.create(clone(prop))] = sorted[i];
  }
  var others = Object.keys(title_map).sort().filter(function(x){
    return unique.indexOf(x) == -1;
  });
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
  for(var i = 0; i < others.length; i++){
    var prop = {
      "title": title_map[others[i]],
      "contexts": classes.image[sorted[i]] ? 
                  ['image'] : ['page', 'link', 'image']
    };
    prop.parentId = root_more;
    menu_ids[chrome.contextMenus.create(clone(prop))] = others[i];
    prop.parentId = save_as_more;
    menu_ids[chrome.contextMenus.create(clone(prop))] = others[i];
  }
  menu_ids[chrome.contextMenus.create({
    "title": "Add/Remove",
    "contexts": ["all"],
    "parentId": root
  })] = 'add_remove';
}

updateMenus();


/*

var root = chrome.contextMenus.create({
  "title" : "Cloud Save",
  "type" : "normal",
  "contexts" : ["page", "image", "link"]
});

var asroot = chrome.contextMenus.create({
  "title" : "Save As...",
  "type" : "normal",
  "parentId": root,
  "contexts" : ["page", "image", "link"]
});

chrome.contextMenus.create({
  "type" : "separator",
  "contexts": [["all"]],
  "parentId": root
});


var Hosts = {};



var hosts = {
  "gdocs": ["Google Docs", "link", "page"],
  "dropbox": ["Dropbox", "link", "image", "page"],
  "cloudapp": ["CloudApp", "link", "image", "page"],
  "box": ["Box.net", "link", "image", "page"],
  "minus": ["Min.us", "link", "image", "page"],
  "droplr": ["Droplr", "link", "image", "page"],
  "picasa": ["Picasa", "image"],
  "flickr": ["Flickr", "image"],
  "posterous": ["Posterous", "image"],
  "twitpic": ["Twitpic", "image"]
}, menus = {};

function contextClick2(info, tab){
  var url = info.linkUrl || info.srcUrl;
  var name = prompt("What would you like to save the file as?",
  unescape(unescape(unescape(url)))
  .replace(/^.*\/|\?.*$|\#.*$|\&.*$/g,''));
  if(name){
    upload(menus[info.menuItemId], url, name);
  }
}


function contextClick(info, tab){
  var url = info.linkUrl || info.srcUrl;
  var name = unescape(unescape(unescape(url)))
  .replace(/^.*\/|\?.*$|\#.*$|\&.*$/g,'');
  upload(menus[info.menuItemId], url, name);
}


function upload(host, url, name){
  Hosts[host]({
    url: url,
    name: name
  }, function(e){
    console.log('uploaded file yay', e);
    if(e && typeof e == "string" && e.indexOf('error:') != -1){
      var notification = webkitNotifications.createNotification(
        'icon/64sad.png',  // icon url - can be relative
        "Aww Snap!",  // notification title
        "The file '"+name+"' could not be uploaded to "+
        hosts[host][0]+". "+e.substr(6)  // notification body text
      );
      notification.show();
    }else{
      var notification = webkitNotifications.createNotification(
        'icon/64.png',  // icon url - can be relative
        "Uploading Complete",  // notification title
        "The file '"+name+"' has been uploaded to "+
        hosts[host][0]+"."  // notification body text
      );
      notification.show();
    }
  })
}

for(var i in hosts){
  menus[chrome.contextMenus.create({
    title: hosts[i][0],
    type: "normal",
    contexts: hosts[i].slice(1),
    parentId: root,
    onclick: contextClick
  })] = i;
  
  menus[chrome.contextMenus.create({
    title: hosts[i][0],
    type: "normal",
    contexts: hosts[i].slice(1),
    parentId: asroot,
    onclick: contextClick2
  })] = i;
}


chrome.contextMenus.create({
  "type" : "separator",
	"contexts": [["all"]],
  "parentId": root
});
chrome.contextMenus.create({
  "title" : "Add/Remove",
  "type" : "normal",
  "parentId": root,
	"onclick": function(){
		chrome.tabs.create({
			url: "settings.html"
		})
	},
  "contexts" : [["all"]]
});
*/


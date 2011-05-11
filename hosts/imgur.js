//*
Hosts.imgur = function uploadImgur(req, callback){
  console.log('using new version of imgur');
  var xhr = new XMLHttpRequest();
  xhr.open("POST", https()+"api.imgur.com/2/upload.json", true);  
  xhr.onload = function(){
    var data = JSON.parse(xhr.responseText);
    callback({
      direct: data.upload.links.original,
      url: data.upload.links.imgur_page,
      thumb: data.upload.links.small_square //or maybe large_thumbnail
    })
  }
  xhr.sendMultipart({
    key: Keys.imgur,
    image: req
  })

}

//*/

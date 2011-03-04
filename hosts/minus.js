//no https
//user requested!

var minusGallery = {};

Hosts.minus = function uploadMinus(file, callback){
  function newGallery(cb){
    minusGallery.obsolete = true;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://min.us/api/CreateGallery", true);
    xhr.onload = function(){
      var info = JSON.parse(xhr.responseText);
      info.time = +new Date;
      minusGallery = info;
      console.log(info);
      cb();
    }
    xhr.onerror = function(){
      callback('error: min.us could not create gallery')
    }
    xhr.send();
  }
  
  function upload(){
    minusGallery.time = +new Date;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://min.us/api/UploadItem?editor_id="+minusGallery.editor_id+"&filename="+(file.name||'unknown.file'));  
    xhr.onload = function(){
      var info = JSON.parse(xhr.responseText);
      //console.log(xhr.responseText);
      var x = new XMLHttpRequest();
      x.open('GET', 'http://min.us/api/GetItems/m'+minusGallery.reader_id, true);
      x.onload = function(){
        var j = JSON.parse(x.responseText).ITEMS_GALLERY
        var filepos = "";
        for(var i = 0; i < j.length; i++){
          if(j[i].indexOf(info.id) != -1){
            filepos = j[i];
            i++; //increment by one as counter starts at one
            break;
          }
        }
        callback({
          url: 'http://min.us/m'+minusGallery.reader_id+'#'+i,
          direct: filepos
        });
      }
      setTimeout(function(){
        x.send()
      }, 100);
    }
    xhr.onerror = function(){
      callback('error: min.us uploading failed')
    }
    xhr.sendMultipart({
      "file": file
    })
  }
  
  if(minusGallery.time && minusGallery.time > (+new Date) - (1000 * 60 * 10)){
    //keep uploading to the same gallery until 10 minutes of inactivity
    upload();
  }else if(minusGallery.obsolete){
    //when somethings outdated theres a potential race condition
    (function(){
      if(minusGallery.obsolete){
        setTimeout(arguments.callee, 100);
      }else{
        upload()
      }
    })()
  }else{
    newGallery(upload)
  }
}

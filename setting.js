    	function toggle_additional(state){
    		localStorage.additional = state ? 'yes': '';
	    	chrome.extension.getBackgroundPage().install_additional(state);
    	}
    	document.getElementById('moar').checked = localStorage.additional=='yes'
    	
    	function upload(files){
    		for(var i = 0; i < files.length; i++){
    			var url, file = files[i];
    			if(window.createObjectURL){
            url = window.createObjectURL(file)
          }else if(window.createBlobURL){
            url = window.createBlobURL(file)
          }else if(window.URL && window.URL.createObjectURL){
            url = window.URL.createObjectURL(file)
          }else if(window.webkitURL && window.webkitURL.createObjectURL){
            url = window.webkitURL.createObjectURL(file)
          }
				  chrome.extension.getBackgroundPage().upload(document.getElementById('hostselect').value, url, file.name);
    		}
    	}
    
document.addEventListener('DOMContentLoaded', function (){
	  	var titles = chrome.extension.getBackgroundPage().title_map;
    	for(var host in titles){
    		var opt = document.createElement('option');
    		opt.innerHTML = titles[host];
    		opt.value = host;
    		document.getElementById('hostselect').appendChild(opt);
    	}
	
	document.querySelector("#moar").addEventListener('change', function(){toggle_additional(this.checked)});
	document.querySelector("#file").addEventListener('change', function(){upload(this.files)});
});
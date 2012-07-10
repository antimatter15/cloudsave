function usrpwd(){
	var up = {};
	up.usr = document.login_form.usr.value.trim();
	up.pwd = document.login_form.pwd.value.trim();
	up.keep = document.login_form.loginkeeping.checked;
    chrome.tabs.getCurrent(function(tab){
    	up.tid=tab.id;
    	chrome.extension.sendRequest(up);
    });
}

document.addEventListener('DOMContentLoaded', function () {
	document.login_form.addEventListener('submit',usrpwd);
	document.login_form.cancel.addEventListener('click',window.close);
});


// urlInfo().getParamValue("blah")
// urlInfo().setHashParamValue("blah", "wee")
// urlInfo().setTheHash({"paramOf":"blah", "toAValueOf":"wee"});

	function urlInfo(sURL) {
		if (typeof sURL === "undefined") {
			sURL = document.location.href+"";
		} // end if
		
		var info = {};
		var nPos;
		var paramsByName = [];
		var paramsByIndex = [];
		var hashParamsByName = [];
		var hashParamsByIndex = [];
		var sWork = sURL;
		var inpUrl = {};
		var nPos = sWork.indexOf("://");
		
		info.inputValue = sURL;
		info.hasErrors = false;
		info.errorLog = [];
		
		if (nPos < 1) {
			info.hasErrors = true;
			info.errorLog[info.errorLog.length] = "missing protocol";
			return info;
		} // end if
		
		inpUrl.url = sURL;
		inpUrl.protocol = sWork.split(":")[0];
		
		sWork = sWork.substr(nPos+1, sWork.length - nPos - 1);
		nPos = sWork.indexOf("/");
		
		inpUrl.domain = sWork.substr(0, nPos);
		
		info.path = "/";
		info.port = 80;
		info.paramString = "?blah=3#blah2=4";
		
				
		info.hasQueryParam = function(sParamName) {
		} // end of method
		
		info.setQueryParamValue = function(sParamName, sValue) {
		} // end of method
				
		info.getQueryParamValue = function(sParamName) {
		} // end of method
		
		info.hasHashParam = function(sParamName) {
		} // end of method
		
		info.setHashParamValue = function(sParamName, sValue) {
		} // end of method
		
		info.getHashParamValue = function(sParamName) {
		} // end of method
		
		
		info.applyUrlChanges = function() {
		} // end of method
		
		return info;
		
	} // end of function
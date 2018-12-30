
	var app = {};
	var Q = '"';
	
	var INPUT_OK = 0;
	var EMAIL_INPUT = 1;
	var PWD_INPUT = 2;
	var EMAIL_INPUT2 = 3;
	var PWD_INPUT2 = 4;
	var FIRSTNAME_INPUT = 5;
	var LASTNAME_INPUT = 6;
	var INVCODE_INPUT = 7;
		
	var postCheck;
	
		
   /***************************************************************
       run when the onload event fires for the page:
	***************************************************************/
	function pageSetup() {
		var newPost = $("#newPost")[0];
		var usrStatusPnl = $("#usrStatusPnl")[0];
		var logonEmailAdr = $("#logonEmailAdr")[0];
		
		postCheck = $("#postCheck")[0]; // done at global level to slightly improve performance
		
		app.CR_key = 13;
		app.resizing = false;
		app.logonEmail = "";
		app.contentWidth = 850;
		app.currentOpenDialog = "";
		app.currentUserId = 0;
		app.currentUserObj = undefined;
		app.currentUserWallId = 0;   // which user's wall are we looking at?
		app.defaultUserImagePath = "./imgs/unknownUser.png";
		app.hdrHeight = 42;
		app.logoWidth = 32;		
		app.msgsPerPage = 10;		
		app.panelWidth = 500;
		app.panelHeight = 300;
		
		app.statusMsgWidth = 500;
		app.lastWallMsgQry = "01/01/1900 01:22:00"; // fallback date
		app.logonHashCode = "";
		app.requireInvCode = true;
		app.lastTmpId = 0;
		app.postsByIndex = [];
		app.postsById = [];
		app.postDataLoaded = false;
		app.titleSpacing = 18;
		app.topLevelPostsByIndex = [];
		app.usersByIndex = [];
		app.usersById = [];
		app.userDataLoaded = false;
		
		if (sessionStorage.currentUserId) {
			app.currentUserId = Number(sessionStorage.currentUserId);
			app.currentUserWallId = app.currentUserId;
		} // end if
		
		if (localStorage.lastLogonEmailAdr) {
			logonEmailAdr.value = localStorage.lastLogonEmailAdr;
		} // end if
		
		
		if (app.currentUserId === 0) {
			usrStatusPnl.innerHTML = getLogonLinkMarkup();
		} // end if
		
		loadLatestPageDataOnStartup();
		
		pageResize();
		newPost.focus();
	} // end of function pageSetup()
	
	
	
	
   /***************************************************************
	***************************************************************/
	function loadLatestPageDataOnStartup() {
		getPosts(0, true);
	} // end of function loadLatestPageDataOnStartup()
	
	
	
	
   /***************************************************************
	***************************************************************/
	function pageResize() {
		var pgHdr = $("#pgHdr")[0];
		var viewPort = $("#viewPort")[0];
		var tint = $("#tint")[0];
		var logonPanel = $("#logonPanel")[0];
		var topLvlPgContent_desktop = $("#topLvlPgContent_desktop")[0];
		var msgWallLogo = $("#msgWallLogo")[0];
		var statusMsg = $("#statusMsg")[0];
		var logOffPanel = $("#logOffPanel")[0];
		var msgCol =  $("#msgCol")[0];
		var w = window.innerWidth;
		var h = window.innerHeight;
		var nTop,nLeft,nHeight;
		var nHdrHeight = 42;
		if (app.resizing) return; // prevent unwanted cascading events
		
		app.resizing = true;
		
		pgHdr.style.width = (w)+"px";
		
		nLeft = Math.floor((w - app.contentWidth) / 2);
		topLvlPgContent_desktop.style.left = (nLeft)+"px";
		msgWallLogo.style.left = (nLeft)+"px";
		siteTitle.style.left = (nLeft + app.logoWidth + app.titleSpacing)+"px";
		
		viewPort.style.width = (w)+"px";
		viewPort.style.height = (h-nHdrHeight-4)+"px";
		
		tint.style.width = (w)+"px";
		tint.style.height = (h)+"px";
		
		nLeft = Math.floor((w - app.panelWidth) / 2);
		logonPanel.style.left = (nLeft)+"px";
		
		nTop = Math.floor((h - app.panelHeight) / 2);
		logonPanel.style.top = (nTop)+"px";
		
		nLeft = Math.floor((w - app.statusMsgWidth) / 2);
		statusMsg.style.left = (nLeft)+"px";
		
		nHeight = Math.floor((h - app.hdrHeight - 40) );
		msgCol.style.height = (nHeight)+"px";
		
		nLeft = Math.floor((w - 300) / 2);
		nTop = Math.floor((h - 120) / 2);
		logOffPanel.style.left = (nLeft)+"px";
		logOffPanel.style.top = (nTop)+"px";
		
		app.resizing = false;
	} // end of function pageResize()
	
	
	
	
	// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	
	// **** BEGINNING OF FUNCTIONS IN ALPHABETICAL ORDER:
	
	// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	
	
	
	
   /***************************************************************
	
	   called by:  validPwd()
	***************************************************************/
	function checkCharCount(sCheck, sChars) {
		var nCount = 0;
		var sChar,n;
		
		for (n=0;n<sChars.length;n++) {
			sChar = sChars.substr(n,1);
			if (sCheck.indexOf(sChar) > -1) {
				nCount = nCount + 1;
			} // end if
		} // next n
		
		return nCount;
	} // end of function checkCharCount()
	
		
		
		
	
   /***************************************************************
      {"ctrlId":"txtBlah",
       "inputType": EMAIL_INPUT,
       "validateFunction": validEmailAdr,
       "fromInput": nFromInput,
       "firstProblem": nFirstProblem
       
       ... optional:
       "submitCtlName":"btnSignIn"
       "extraParam1": "a value",
       "extraParam2": "a value",
       }
       
       sInputCtlId, nInputType, fnCheck, nFromInput, nFirstProblem, bOnBlur, sSubmitCtlName
	***************************************************************/		
	function checkUserInput(params) {
		var sInputCtlId = params.ctrlId;
		var nInputType = params.inputType;
		var fnCheck = params.validateFunction;
		var nFromInput = params.fromInput;
		var nFirstProblem = params.firstProblem;
		var nParamCount = 1;
		var inputCtl = $("#"+sInputCtlId)[0];
		var submitCtl;
		var sValue = inputCtl.value;
		var bOk = fnCheck(sValue);
		var bUpdateSubmitButton = false;
		var retObj = {};
		
		if (typeof sSubmitCtlName === "string") {
			submitCtl = $("#"+sSubmitCtlName)[0];
			bUpdateSubmitButton = true;
		} // end if
		
		if (bOk) {
			inputCtl.style.border = "solid gray 1px";
			inputCtl.style.backgroundColor = "white";
		} else {
			if (nFirstProblem === INPUT_OK) {
				nFirstProblem = nInputType;
				
				if (bOnBlur) {
					inputCtl.focus();
				} // end if
			} // end if
			
			if (nInputType === nFromInput) {
				inputCtl.style.border = "solid #ff3333 1px";
				inputCtl.style.backgroundColor = "#ffe6e6";
			} // end if
		} // end if/else
		
		if (bUpdateSubmitButton) {
			if (nFirstProblem === INPUT_OK) {
				submitCtl.disabled = false;
				submitCtl.className = "userSubmitBtn userSubmitBtnLogon";
			} else {
				submitCtl.disabled = true;
				submitCtl.className = "userSubmitBtnDisabled userSubmitBtnLogon";
			} // end if/else
		} // end if
		
		retObj.firstProblem = nFirstProblem;
		retObj.fldValue = sValue;
		
		return retObj;
	} // end of function checkUserInput()
	
	
	
	
   /***************************************************************
      in page setup, call Before code to display page
	***************************************************************/	
	function checkForUserWall(bUrlChange) {
		var sUserWallId = getUrlHashValue("userWall");
		var nUserWallId;
		
		if (! isNaN(sUserWallId)) {
			nUserWallId = sUserWallId-0;
			app.currentUserWallId = nUserWallId;
		} // end if
		
		if (bUrlChange) {
		} // end if
		
	} // end of function checkForUserWall()
	
	
	var bDroppedIn = false;
	
   /***************************************************************
	called when logon panel's email text box loses focus
	***************************************************************/
	function checkLogonInput(nFromInput, bOnBlur) {
		var nFirstProblem = INPUT_OK; // assumption until proven otherwise	
		var retObj;
		
		retObj = checkUserInput("logonEmailAdr", EMAIL_INPUT, validEmailAdr, nFromInput, nFirstProblem, bOnBlur);
		nFirstProblem = retObj.firstProblem;
		
		retObj = checkUserInput("pwd", PWD_INPUT, validPwd, nFromInput, nFirstProblem, bOnBlur, "btnSignIn");
		nFirstProblem = retObj.firstProblem;
		
		
		if (nFirstProblem === INPUT_OK) {
		
			// user presses ENTER or RETURN key:
			if (event.keyCode === app.CR_key) {
				signIn();
			} // end if
		
		} // end if
		
	} // end of function checkLogonEmailInput() 
	
	
	
   /***************************************************************
	***************************************************************/
	function checkPostEntry() {
		var newPost = $("#newPost")[0];
		var postBtn = $("#postBtn")[0];
		var sNewPost = newPost.value + "";
		
		if (sNewPost === "") {
			postBtn.style.display = "none";
		} else {
			postBtn.style.display = "block";
			
			// user presses ENTER or RETURN key:
			if (event.keyCode === app.CR_key) {
				savePost(0, sNewPost);
			} // end if
		} // end if/else
		
	} // end of function checkPostEntry()
	
	
	
	
   /***************************************************************
	***************************************************************/	
	function checkProp(obj,sPropName,vDefValue) {
		if (typeof obj[sPropName] === "undefined") {
			obj[sPropName] = vDefValue;
		} // end if
	} // end of function checkProp()
	
	
	
	
   /***************************************************************
      make sure all user's inputs for sign up are ok before
      enabling button!
	***************************************************************/	
	function checkSignUpInput(nFromInput, bOnBlur) {
		var nFirstProblem = INPUT_OK; // assumption until proven otherwise
		var retObj,sEmailAdr,sEmailAdrConfirm;
		
		retObj = checkUserInput("invCode", INVCODE_INPUT, validConfirmationCode, nFromInput, nFirstProblem, bOnBlur);
		nFirstProblem = retObj.firstProblem;
		
		retObj = checkUserInput("logonEmailAdr2", EMAIL_INPUT, validEmailAdr, nFromInput, nFirstProblem, bOnBlur);
		nFirstProblem = retObj.firstProblem;
		sEmailAdr = retObj.fldValue;
		
		retObj = checkUserInput("logonEmailAdr2_confirm", EMAIL_INPUT, validEmailAdr, nFromInput, nFirstProblem, bOnBlur);
		nFirstProblem = retObj.firstProblem;
		sEmailAdrConfirm = retObj.fldValue;
	
		
		var usrFirstName = $("#usrFirstName")[0];
		var usrLastName = $("#usrLastName")[0];
		var pwd2 = $("#pwd2")[0];
		var pwd2_confirm = $("#pwd2_confirm")[0];
		var btnSignUp = $("#btnSignUp")[0];
		var sInvCode = invCode.value;
		var sLogonEmailAdr = logonEmailAdr2.value;
		var sLogonEmailAdrConfirm = logonEmailAdr2_confirm.value;
		var sFirstName = usrFirstName.value;
		var sLastName = usrLastName.value;

EMAIL_INPUT = 1;
	var PWD_INPUT = 2;
	var EMAIL_INPUT2 = 3;
	var PWD_INPUT2 = 4;
	var FIRSTNAME_INPUT = 5;
	var LASTNAME_INPUT = 6;
	var INVCODE_INPUT	
		
		if (validEmailAdr(sLogonEmailAdr)) {
		} else {
			if (nFirstProblem === INPUT_OK) {
				nFirstProblem = EMAIL_INPUT;
			} // end if
		} // end if
		
		if (sLogonEmailAdr === sLogonEmailAdrConfirm) {
		} else {
			if (nFirstProblem === INPUT_OK) {
				nFirstProblem = EMAIL_INPUT2;
			} // end if
		} // end if
		
		if (nFirstProblem === INPUT_OK) {
			btnSignUp.disabled = false;
			btnSignUp.className = "userSubmitBtn userSubmitBtnLogon";
			
			// user presses ENTER or RETURN key:
			if (event.keyCode === app.CR_key) {
				signUp();
			} // end if
			
		} else {
			btnSignUp.disabled = true;
			btnSignUp.className = "userSubmitBtnDisabled userSubmitBtnLogon";
		} // end if/else
		
	} // end of function checkSignUpInput()
	
	
	
	
	
   /***************************************************************
	***************************************************************/
	function closeLogonPanel() {
		var logonPanel = $("#logonPanel")[0];
		var newPost = $("#newPost")[0];
		
		app.currentOpenDialog = "";
		hideTint();
		logonPanel.style.display = "none";
		newPost.focus();
	} // end of function closeLogonPanel()
	
	
	
	
   /***************************************************************
      basic Post object is generated when:
       - user is already logged in
       - they have typed in a message to post on the wall
       - they have clicked the POST button or hit the Enter key
	***************************************************************/
	function createNewPostObj(sMsg) {
		var post = {};
		
		post.msgId = getTempId();
		post.parentMsgId = 0; // default until otherwise changed
		post.userId = app.currentUserId;
		post.msgTimestamp = new Date();
		post.msgContent = sMsg;		
		post.postHeight = 0;
		post.likeCount = 0;
		post.parentPost = undefined;
		post.repliesByIndex = [];
		post.repliesById = [];
		post.hasParent = false;
		
		return post;
	} // end of function createNewPostObj()
	
	
	
	
   /***************************************************************
	  called when someone goes to Sign Up to the site
	***************************************************************/
	function createNewUserObj() {
		var usr = {};
		
		usr.userId =  getTempId();
		usr.emailAdr = "";
		usr.firstName = "";
		usr.lastName = "";
		usr.userFullName = "";
		usr.userImagePath = app.defaultUserImagePath;
		
		return usr;
	} // end of function createNewUserObj() 
	

	
	
	
	
   /***************************************************************
	***************************************************************/	
	function genPostReplyMarkup(post) {
		var s=[];
		
		
		return s.join("");
	} // end of function genPostReplyMarkup(post)
	
	
	
	
   /***************************************************************
	***************************************************************/
	function genWallPostMarkup(post) {
		var s=[];
		var usr = app.usersById[post.userId];
		var sBasicFormattedTimestamp = getFormattedDateTime(post.msgTimestamp);
		var sPostedAt = getFormattedRelativeDateTime(post.msgTimestamp);

		
		if (post.postHeight ===0) {
			post.postHeight = getMsgHeight(post);
		} // end if
		
		s[s.length] = "<li class='liMsg'>";
		
		
		
			s[s.length] = "<div class='msgCntr' ";
			
			if (post.postHeight > 100) {
				s[s.length] = "style="+Q+"height:"+post.postHeight+"px;"+Q;
			} // end if
			
			s[s.length] = ">";
				s[s.length] = "<img src="+Q+usr.userImagePath+Q+" class='userImg1'>";
				s[s.length] = "<div ";
				s[s.length] = "onclick="+Q+"showUserProfilePanel("+post.userId+")"+Q+" ";
				s[s.length] = "class='postUserName userNameTitle'>"+usr.userFullName+"</div>";
				
				s[s.length] = "<img ";
				s[s.length] = "class='postElipses' ";
				s[s.length] = " src='./imgs/bigElipses.png' border='0'>";
				
				s[s.length] = "<div ";
				s[s.length] = "title="+Q+sBasicFormattedTimestamp+Q+" ";
				s[s.length] = "class='postedAtInfo'>"+sPostedAt+"</div>";
				s[s.length] = "<div class='postContent'>"+post.msgContent;
				  
				
				s[s.length] ="</div>";  // postContent
				
				s[s.length] = "<div class='lblCommentCount' ";
				s[s.length] = "id='lblCommentCount"+post.msgId+"' ";
				s[s.length] = "></div>";
				
				s[s.length] = "<div class='commentContainer' ";
				s[s.length] = "id='commentContainer"+post.msgId+"' ";
				s[s.length] = "></div>";
				
			s[s.length] = "</div>";  // msgCntr class
		s[s.length] = "</li>"; // liMsg class
		
		return s.join("");
	} // end of function genWallPostMarkup()
	
	
	
	
	
   /***************************************************************
	***************************************************************/
	function getBlurb() {
		var s=[];
		var Q = '"';
		var sGithubRoot = "https://github.com/OrvilleChomer/phpMsgWallDemo/";
		var sGithubSourceUrl = sGithubRoot;
		var sGithubWikiUrl = sGithubRoot+"wiki/";
		s[s.length] = "<hr>&nbsp;<br>";
		s[s.length] = "<b>Github Info on this demo:</b><br>";
		s[s.length] = "<ul>";
		s[s.length] = "<li><a href="+Q;
		s[s.length] = sGithubSourceUrl;
		s[s.length] = Q+">repo</a></li>";
		s[s.length] = "<li><a href="+Q;
		s[s.length] = sGithubWikiUrl;
		s[s.length] = Q+">wiki</a></li>";
		s[s.length] = "</ul>";
		s[s.length] = "<br>";
		
		// function below is in:          generalBlurb.js
		// make sure there is a <script> tag for this on your HTML page!
		s[s.length] = getBlurbGeneral();
		
		return s.join("");
	} // end of function getBlurb()
	
	
	
   /***************************************************************
      takes an input of an initialized JavaScript Date object...
      and outputs a string of the date in the following format:
      mm/dd/yyyy h:mm AM/PM
      
      date method ref:
      https://www.w3schools.com/js/js_date_methods.asp
	***************************************************************/	
	function getFormattedDateTime(dateValue) {
		var sMonth = getPaddedNum(dateValue.getMonth()+1);
		var sDate = getPaddedNum(dateValue.getDate());
		var sVal = sMonth + "/" + sDate + "/" + dateValue.getFullYear()+" ";
				
		sVal = sVal + getFormattedTime(dateValue);
		
		return sVal;
		
	} // end of function getFormattedDateTime()

	
	
	
   /***************************************************************
	***************************************************************/	
	function getFormattedRelativeDateTime(dateValue) {
		var now = new Date();
		var mNow = now.getTime();
		var mThen = dateValue.getTime();
		var mDif = mNow - mThen;
		var nOneMinute = 1000 * 60;
		var nOneHour = nOneMinute * 60;
		var nOneDay = nOneHour * 24;
		var nOneWeek = nOneDay * 7;
		var nOneYear = nOneWeek * 52;
		var nMinutes,nHours,nDays,nWeeks;
		var sVal;
		
		if (mDif < nOneMinute) {
			return "just now";
		} // end if
		
		if (mDif < nOneHour) {
			nMinutes = Math.floor(mDif / nOneMinute);
			return nMinutes+"m";
		} // end if
		
		if (mDif < nOneDay) {
			nHours = Math.floor(mDif / nOneHour);
			
			if (nHours < 2) {
				return "1 hr";
			} else {
				return nHours+" hrs";
			} // end if/else
		} // end if
		
		if (dateValue.getFullYear() === now.getFullYear() ) {
			if (dateValue.getMonth() === now.getMonth()) {
				nWeeks = Math.floor(mDif / nOneWeek);
				
				if (nWeeks > 0) {
					return nWeeks+"w";
				} // end if (nWeeks > 0)
				
			} // end if (dateValue.getMonth() === now.getMonth()) 
			
			sVal = getMonthName(dateValue.getMonth())+" ";
			sVal = sVal + dateValue.getDate()+" at "+getFormattedTime(dateValue);
			return sVal;
		} // end if (dateValue.getFullYear() === now.getFullYear() ) 
		
		sVal = getMonthName(dateValue.getMonth())+" ";
		sVal = sVal + dateValue.getDate()+", "+dateValue.getFullYear();
		return sVal;
	} // end of function getFormattedRelativeDateTime()
	
	
	
	
   /***************************************************************
   	   returns string in the following format:
   	   h:mm AM/PM
	***************************************************************/	
	function getFormattedTime(dateValue) {
		var sAMPM = "AM";
		var nHour = dateValue.getHours()+1;

		var sMinutes = getPaddedNum(dateValue.getMinutes());
		
		if (nHour > 12) {
			nHour = nHour - 12;
			sAMPM = "PM";
		} // end if
		
		sVal = nHour + ":" + sMinutes + " " + sAMPM;
		
		return sVal;
	} // end of	function getFormattedTime()
	
	
	
	
   /***************************************************************
      get a value assigned to a key in the web page URL after the
      pound sign (hash mark '#')
      
      example:   mydomain.com?sample=yes#user=123
      
        in the above, 'user' is the key, so, if passing 'user' to this
        function, the value returned would be '123'
        
   	   also see function:   setUrlHashValue() !
	***************************************************************/	
	function getUrlHashValue(sKey) {
		var obj = getUrlHashValues();
		var sValue;
		
		if (!obj.hasHashValues) {
			return "";  // there was no hash value for the key (or any other hash value)!
		} // end if
		
		sKey = sKey.toLowerCase();
		
		if (typeof obj.hashValuesByKey[sKey] === "string") {
			sValue = obj.hashValuesByKey[sKey];
		} // end if
		
	} // end of function getUrlHashValue() 
	
	
	
   /***************************************************************
   	  builds an array of key/value pairs that are in the current 
   	  URL, as well as a "dictionary" that one can use to provide
   	  a key and get its Value returned!
   	  
   	  (used by the function: getUrlHashValue(sKey) )
	***************************************************************/	
	function getUrlHashValues() {
		var obj = {};
		var sUrl = document.location.href + "";
		var nPos = sUrl.indexOf("#");
		var sHashUrl,aParamsByIndex,nMax,n,param; 
		var aParam,paramObj;
				
		obj.hashValuesByIndex = [];
		obj.hashValuesByKey = [];
		obj.fullUrl = sUrl;
		
		if (nPos === -1) {
			obj.baseUrl = sUrl;
			obj.hashUrl = "";
			obj.hasHashValues = false;
			return obj;
		} // end if
		
		obj.hasHashValues = true;
		sHashUrl = sUrl.substr(nPos+1, sUrl.length - nPos - 1);
		obj.hashUrl = sHashUrl;
		obj.baseUrl = sUrl.substr(0, nPos);
		
		aParamsByIndex = sHashUrl.split("&");
		nMax = aParamsByIndex.length;
		
		for (n=0;n<nMax;n++) {
			param = aParamsByIndex[n];
			aParam = param.split("=");
			
			if (aParam.length === 2) {
				paramObj = {};
				paramObj.key = aParam[0];
				paramObj.value =  aParam[1];
				obj.hashValuesByIndex[obj.hashValuesByIndex.length] = paramObj;
				obj.hashValuesByKey[paramObj.key] = paramObj;
			} // end if
		} // next n
		
		return obj;
	} // end of function getUrlHashValues()

	
	
	
   /***************************************************************
      Not to be confused with the hash mark (pound sign)..
      It requests from the server a hash value which is a 
      string made up of 48 randomly generated characters
      
      Called by:    
            showLogonPanel()   - handles logging in and signing up
            showLogoffPanel()  - prevent a hack from signing user off unintentionally
            showUserProfilePanel() - handle changes user makes to their profile/password
            
	***************************************************************/
	function getLogonHash() {
		var wrk = makeAJAXWorkObj();
		var sURL = "./ajax/getLogonHash.php";

		app.logonHashCode = "";  // clear any previous value there might be
		wrk.beginningOfAnAJAXTransactionForURL(sURL);
		wrk.addPostFieldValueForInt("excludeUserId", app.currentUserId);
		wrk.addPostFieldValueForString("lastQuery", app.lastWallMsgQry);
		
		wrk.nextDoPostToServerAndThenDo(function(sResult) {
			var obj = jsonParse(sResult);
			
			app.logonHashCode = obj.logonHashCode;
			
			/* require invitation code flag value
			   is server requiring an invitation code from the user when they
			   sign up to the site? */			   
			app.requireInvCode = obj.requireInvCode;
			
		    processPostsAndUsers(obj);
		});	 // end of call-back block
		
	} // end of function getLogonHash()
	
	
	
   /***************************************************************
	***************************************************************/
	function getLogonLinkMarkup(siMsg) {
		var s=[];
		var Q = '"';
		var sMsg = "Do you want to post messages to the wall?";
		
		s[s.length] = "<b>Welcome to my Message Wall Demo</b>";
		s[s.length] = "<br>&nbsp;<br>";
		
		if (typeof siMsg !== "undefined") {
			sMsg = siMsg;
		} // end if
		
		s[s.length] = "<span style='font-size:10pt;'>";
		s[s.length] = sMsg;
		s[s.length] = "</span>";
		s[s.length] = "<center>";
		s[s.length] = "<p>";
		s[s.length] = "<button class='genericBtn' ";
		s[s.length] = "style='width:80px;' ";
		s[s.length] = "onclick="+Q+"showLogonPanel('')"+Q+" ";
		s[s.length] = ">";
		s[s.length] = "Log In";
		s[s.length] = "</button>";
		s[s.length] = "</p>";
		s[s.length] = "<p>";
		s[s.length] = "- or -";
		s[s.length] = "</p>";
		s[s.length] = "<p>";
		s[s.length] = "<button class='signupBtn' ";
		s[s.length] = "style='width:80px;' ";		
		s[s.length] = "onclick="+Q+"showSignUpPanel()"+Q+" ";
		s[s.length] = ">";
		s[s.length] = "Sign Up";
		s[s.length] = "</button>";
		s[s.length] = "</p>";
		s[s.length] = "</center>";
		s[s.length] = getBlurb();
		
		return s.join("");
	} // end of function getLogonLinkMarkup()
	
	
	
	
	
   /********************************************
	*********************************************/		
	function getMsgHeight(post) {
		var nContentHeight;
		var nTopPosOfContent = 72;
		
		// stuff for likes and comments not implemented yet
		postCheck.innerHTML = post.msgContent;
		nContentHeight = nTopPosOfContent + postCheck.clientHeight;
		
		
		if (nContentHeight < 100) {
			nContentHeight = 100;
		} // end if
		
		return nContentHeight;
	} // end of function getMsgHeight()
	
	
	
	
   /********************************************
	*********************************************/	
	function getMonthName(nMonthNum) {
	var sMonths = ["January", "February", "March", "April", "May", 
	               "June", "July", "August", "September", "October", 
	               "November", "December"];
	
		return sMonths[nMonthNum];
	} // end of function getMonthName(nMonthNum) 
	
	
	
   /********************************************
        returns a string that assumes a final
        length of 2 characters.
        if 1 digit, it will be padded on the 
        front with a zero.
        also assumes number is a positive integer
	*********************************************/	
	function getPaddedNum(nNum) {
		var sVal;
		
		if (nNum > 9) {
			sVal = nNum+"";
		} else {
			sVal = "0"+nNum;
		} // end if/else
		
		return sVal;
	} // end of function getPaddedNum()
	
	
	
	
	
   /********************************************
		retrieve posts via ajax
		as a Stand-Alone operation
	*********************************************/
	function getPosts(niStartingPostId, bPageStartup) {
		var wrk = makeAJAXWorkObj();
		var sURL = "./ajax/getPostAndUserDataOnly.php";
		var nStartingPostId = 0;
		
		
		if (typeof niStartingPostId !== "undefined") {
			nStartingPostId = niStartingPostId;
		} // end if
		
		wrk.beginningOfAnAJAXTransactionForURL(sURL);
		wrk.addPostFieldValueForInt("startingPostId", nStartingPostId);
		wrk.addPostFieldValueForInt("excludeUserId",0); // needs to be 0 here
		wrk.addPostFieldValueForString("lastQuery", app.lastWallMsgQry);
		wrk.nextDoPostToServerAndThenDo(function(sResult) {

			var obj = jsonParse(sResult);
			var usrStatusPnl = $("#usrStatusPnl")[0];
						
			processPostsAndUsers(obj);

			// make sure user can see posts...
			updateWallPostsDisplay(app.topLevelPostsByIndex);
			
			if (typeof bPageStartup !== "undefined") {
				if (bPageStartup) {
					if (app.currentUserId > 0) {
						app.currentUserObj = app.usersById[app.currentUserId];
						usrStatusPnl.innerHTML = getUserInfoMarkup();
					} // end if					
					
				} // end if
			} // end if
			
			updateWallUserDisplay();
		});	 // end of call-back block
		
	} // end of function getPosts()
	
	
	
	
   /***************************************************************
	***************************************************************/
	function getUserInfoMarkup() {
		var s=[];
		var usr = app.currentUserObj;
		
		s[s.length] = "<b>User: ";
		s[s.length] = usr.userFullName;
		s[s.length] = "</b>";
		
		s[s.length] = "<p>";
		s[s.length] = usr.aboutUser;
		s[s.length] = "</p>";
		
		s[s.length] = "<center>";
		s[s.length] = "<p>";
		
		s[s.length] = "<button class='signupBtn' ";
		s[s.length] = "style='width:80px;' ";		
		s[s.length] = "onclick="+Q;
		// true value means to go into edit mode...
		s[s.length] = "showUserProfilePanel("+app.currentUserId+", true)"+Q+" ";
		s[s.length] = ">";
		s[s.length] = "Edit Profile";
		s[s.length] = "</button>&nbsp;&nbsp;";
		
		s[s.length] = "<button class='genericBtn' ";
		s[s.length] = "style='width:80px;' ";
		s[s.length] = "onclick="+Q+"showLogoffPanel()"+Q+" ";
		s[s.length] = ">";
		s[s.length] = "Log Off";
		s[s.length] = "</button>";
		s[s.length] = "</p>";
		s[s.length] = "</center>";
		
		s[s.length] = getBlurb();
		
		return s.join("");
	}// end of getUserInfoMarkup()
	
	
	
	
   /******************************************************************************
	   return a temp id that is a negative #.
	   (that is how we know it is temporary)!
    ******************************************************************************/	
	function getTempId() {
		app.lastTmpId = app.lastTmpId - 1;
		
		return app.lastTmpId;
	} // end of function getTempId()
	
	
	
	
   /***************************************************************
	  runs when user clicks tint layer
	***************************************************************/
	function hideCurrentPanel() {
		
		if (app.currentOpenDialog === "logoff") {
			signOffCancel();
		} // end if
		
		if (app.currentOpenDialog === "logon") {
			closeLogonPanel();
		} // end if
		
		if (app.currentOpenDialog === "userProfile") {
		
		} // end if
		
		hideTint(); // probably needless
		app.currentOpenDialog = ""; // probably needless
		
	} // end of function hideCurrentPanel()
	
	
	
   /***************************************************************
	***************************************************************/
	function hideStatusMsg() {
		var statusMsg = $("#statusMsg")[0];
		
		statusMsg.style.display = "none";
	} // end of function hideStatusMsg()
	
	
	
   /***************************************************************
	***************************************************************/
	function hideTint() {
		var tint = $("#tint")[0];
		
		tint.style.display = "none";
	} // end of function hideTint()
	
	
   /******************************************************************************
    ******************************************************************************/			
	function jsonParse(sJson) {
		var obj;
		
		try {
			obj = JSON.parse(sJson);
			return obj;
		} catch(err) {
			showProblems(sJson);
			debugger;
			return false;
		} // end try/catch
		
	} // end of function jsonParse()
	
	
	

	
	
	
		
   /******************************************************************************
    ******************************************************************************/			
	function pickLogonView() {
		var logonView = $("#logonView")[0];
	 	var signUpView = $("#signUpView")[0];
	 	var loginTab = $("#loginTab")[0];
	 	var signupTab = $("#signupTab")[0];
	 	
	 	loginTab.classList.add("activeTab");
	 	loginTab.classList.remove("inactiveTab");
	 	
	 	signupTab.classList.add("inactiveTab");
	 	signupTab.classList.remove("activeTab");
	 	
	 	logonView.style.display = "block";
	 	signUpView.style.display = "none";
	} // end of function
	
	
	
   /******************************************************************************
    ******************************************************************************/		
	function pickSignupView() {
		var logonView = $("#logonView")[0];
	 	var signUpView = $("#signUpView")[0];
	 	var loginTab = $("#loginTab")[0];
	 	var signupTab = $("#signupTab")[0];
	 	
	 	loginTab.classList.add("inactiveTab");
	 	loginTab.classList.remove("activeTab");
	 	
	 	signupTab.classList.add("activeTab");
	 	signupTab.classList.remove("inactiveTab");
	 		 	
	 	
	 	logonView.style.display = "none";
	 	signUpView.style.display = "block";	
	} // end of function
	
	
	
   /***************************************************************
	***************************************************************/
	function processPosts(latestPosts) {
		var nMax = latestPosts.length;
		var post,parentPost;
		var n,nReplies;
		
		for (n=0;n<nMax;n++) {
			post = latestPosts[n];
			
			post.postHeight = 0; // new or old, need to recalculate
			
			if (typeof post.msgTimestamp === "string") {
				post.msgTimestamp = new Date(post.msgTimestamp);
			} // end if
			
			if (typeof post.repliesByIndex === "undefined") {
				post.repliesByIndex = [];
				post.repliesById = [];
				post.hasParent = false;				
			} // end if
			
			if (typeof app.postsById[post.msgId] === "undefined") {
				app.postsByIndex[app.postsByIndex.length] = post;
				
				if (post.parentMsgId === 0) {
					app.topLevelPostsByIndex[app.topLevelPostsByIndex.length] = post;
				} else {
					post.hasParent = true;
					parentPost = app.postsById[post.parentMsgId];
					
					if (typeof parentPost === "undefined") {
						debugger;
					} // end if
					
					post.parentPost = parentPost;
					
					if (typeof parentPost.repliesById[post.msgId] === "undefined") {
						nReplies = parentPost.repliesByIndex.length;
						parentPost.repliesByIndex[nReplies] = post;						
					} // end if
					
					parentPost.repliesById[post.msgId] = post;
					
				} // end if (post.parentMsgId === 0)
				
			} // end if (typeof app.postsById[post.msgId] === "undefined")
			
			app.postsById[post.msgId] = post;
		} // next n
		
		app.postDataLoaded = true;
	} // end of function processPosts(latestPosts)
	
	
	
   /******************************************************************
		processes user posts data and user data returned from server
	*******************************************************************/
	function processPostsAndUsers(obj) {
	
		if (typeof obj.lastChecked !== "") {
			app.lastWallMsgQry = obj.lastChecked;
		} // end if
		
		
		if (typeof obj.latestPosts !== "") {
			processPosts(obj.latestPosts);
		} // end if
		
		if (typeof obj.latestUsers !== "") {
			processUsers(obj.latestUsers);
		} // end if
	} // end of function processPostsAndUsers()
	
	
	
   /***************************************************************
		process user "list" downloaded via Ajax.
	***************************************************************/
	function processUsers(latestUsers) {
		var nMax = latestUsers.length;
		var usr;
		var n;
		
		for (n=0;n<nMax;n++) {
			usr = latestUsers[n];
			
			usr.userFullName = usr.firstName+" "+usr.lastName;
			
			checkProp(usr,"userImagePath",app.defaultUserImagePath);
			checkProp(usr,"aboutUser","");
			
			if (typeof app.usersById[usr.userId] === "undefined") {
				app.usersByIndex[app.usersByIndex.length] = usr;
			} // end if
			
			app.usersById[usr.userId] = usr;
		} // next n
		
		app.userDataLoaded = true;
	} // end of function processUsers(latestUsers)
	
	
	
   /***************************************************************
	  save a top-level post or a Reply to db via Ajax
	***************************************************************/
	function savePost(nParentMsgId, siPostValue) {
		if (app.currentUserId === 0) {
			showLogonPanel("You need to be logged in before you can post a message.");  // got to be logged in first!
			return;
		} // end if
		
		var wrk = makeAJAXWorkObj();
		var sURL = "./ajax/savePost.php";
		var newPost = $("#newPost")[0];
		var postBtn = $("#postBtn")[0];
		var sPostValue = newPost.value;
		var post;
		var aNewPosts = [];
		
		// for handling replies which will get value from some different DOM element.
		if (typeof siPostValue !== "undefined") {
			sPostValue = siPostValue;
		} // end if
		
		newPost.value = ""; //clear out text box
		
		post = createNewPostObj(sPostValue);
		
		app.postsByIndex.unshift(post); // add to beginning of array
		
		
		if (nParentMsgId === 0) {
			app.topLevelPostsByIndex.unshift(post); // add to beginning of array	
		} // end if
		
		aNewPosts[0] = post;

		updateWallPostsDisplay(aNewPosts);
		
		showStatusMsg("Posting message to Wall...");
		
		post.parentMsgId = nParentMsgId;
		wrk.beginningOfAnAJAXTransactionForURL(sURL);
		wrk.addPostFieldValueForInt("excludeUserId", app.currentUserId);
		wrk.addPostFieldValueForString("lastQuery", app.lastWallMsgQry);
		wrk.addPostFieldValueForInt("tmpMsgId", post.msgId);
		wrk.addPostFieldValueForInt("parentMsgId", post.parentMsgId);		
		wrk.addPostFieldValueForString("postContent", post.msgContent);
				
		// get ready for another post to be entered by user...
		newPost.value = "";
		postBtn.style.display = "none"; // hide post button
		newPost.focus();
		
		wrk.nextDoPostToServerAndThenDo(function(sResult) {
			var obj = jsonParse(sResult);
			hideStatusMsg();
			
			if (obj.status === "postSuccessful") {
				post.msgId = obj.newMsgId;
				post.msgTimestamp = new Date(obj.msgTimestamp);
				app.postsById[post.msgId] = post;
					
			} else {
			} // end if/else
			
		});	 // end of call-back block	
			
	} // end of function savePost()
	
	
	
   /***************************************************************
      set a key/value pair in the web page URL after the
      pound sign (hash mark '#')
	***************************************************************/	
	function setUrlHashValue(sKey, sValue) {
		var obj = getUrlHashValues();
		var paramObj;
		var sNewUrl,nMax,n;
		var s=[];
		
		sKey = sKey.toLowerCase();
		paramObj = obj.hashValuesByKey[sKey];
		
		if (typeof paramObj === "undefined") {
			paramObj = {};
			paramObj.key = sKey;
			paramObj.value = sValue;
			obj.hashValuesByKey[sKey] = paramObj;
			obj.hashValuesByIndex[obj.hashValuesByIndex.length] = paramObj;
		} else {
			paramObj.value = sValue;
		} // end if
		
		s[s.length] = obj.baseUrl + "#";
		
		nMax = obj.hashValuesByIndex.length
		for (n=0;n<nMax;n++) {
			if (n>0) {
				s[s.length] = "&";
			} // end if
			paramObj = obj.hashValuesByIndex[n];
			if (paramObj.value !== "") {
				s[s.length] = paramObj.key+"="+paramObj.value;
			} // end if
		} // next n
		
		sNewUrl = s.join("");
		
		if (obj.fullUrl !== sNewUrl) {
			document.location.href = sNewUrl;
		} // end if
		
		return sNewUrl;
	} // end of function setUrlHashValue()
	
	
	
   /***************************************************************
	***************************************************************/
	function showLogoffPanel() {
		var logOffPanel = $("#logOffPanel")[0];
		
		app.currentOpenDialog = "logoff";
		showTint();
		logOffPanel.style.display = "block"
		
		getLogonHash();
	} // end of function showLogoffPanel()
	
	
	
	
   /***************************************************************
	   comprises logon, and sign up tabs
	***************************************************************/
	function showLogonPanel(sMsg) {
		var logonPanel = $("#logonPanel")[0];
		var logonInfoMsg = $("#logonInfoMsg")[0];
		var logonEmailAdr = $("#logonEmailAdr")[0];
		var pwd = $("#pwd")[0];
		var pwd2 = $("#pwd2")[0];
		var pwd2_confirm = $("#pwd2_confirm")[0];
		
		
		app.currentOpenDialog = "logon";
		
		showTint();
		
		logonInfoMsg.innerHTML = sMsg;
		pwd.value = "";
		pwd2.value = "";
		pwd2_confirm.value = "";
		
		pickLogonView();
		
		logonPanel.style.display = "block";
		
		if (logonEmailAdr.value === "") {
			logonEmailAdr.focus();
		} else {
			pwd.focus();
		} // end if/else
		
		getLogonHash();
	} // end of function showLogonPanel()
	
	
	
   /******************************************************************************
    ******************************************************************************/		
	function showPostMenu(nMsgId) {
	} // end of function showPostMenu()
	
		
	
   /******************************************************************************
    ******************************************************************************/		
	function showProblems(sMsg) {
		var problems = $("#problems")[0];
		
		problems.innerHTML = sMsg;
		problems.style.display = "block";
	} // end of function showProblems()
	
	
   /*
	  bring up over-arching panel and toggle over to the sign up tab!
	*/
	function showSignUpPanel() {
		showLogonPanel("");
		pickSignupView();
	} // end of function showSignUpPanel()
	
	
	
	
   /***************************************************************
	   note:  the   hideStatusMsg()   function does the opposite!
	***************************************************************/
	function showStatusMsg(sMsg) {
		var statusMsg = $("#statusMsg")[0];
		
		statusMsg.innerHTML = sMsg;
		statusMsg.style.display = "block";
	} // end of function showStatusMsg()
	
	
	
   /***************************************************************
	***************************************************************/
	function showTint() {
		var tint = $("#tint")[0];
		
		tint.style.display = "block";
	} // end of function showTint()
	
	
	
   /***************************************************************
	***************************************************************/
	function showUserProfilePanel(nUserId, bEdit) {
		var userProfilePanel = $("#userProfilePanel")[0];
		
		app.currentOpenDialog = "userProfile";
		showTint();
		
		
		userProfilePanel.style.display = "block";
		getLogonHash();
		
	} // end of function showLogonPanel()
	
	
	
	
   /***************************************************************
	***************************************************************/
	function signIn() {
		validateLogon();
	} // end of function signIn()
	
	
	
   /***************************************************************
	***************************************************************/
	function signOff() {
		var wrk = makeAJAXWorkObj();
		var sURL = "./ajax/signOff.php";
		var usrStatusPnl = $("#usrStatusPnl")[0];
		var usr =  app.usersById[app.currentUserId];
		var sSignoutMsg = usr.firstName+" just signed out...";
		
		usrStatusPnl.innerHTML = "<p>Please wait...</p>";
		
		sessionStorage.clear(); // clear out client-side session info
		app.currentUserId = 0;
		showStatusMsg("Logging Out...");
		signOffCancel();
		
		wrk.beginningOfAnAJAXTransactionForURL(sURL);
		wrk.addPostFieldValueForInt("excludeUserId", app.currentUserId);
		wrk.addPostFieldValueForString("lastQuery", app.lastWallMsgQry);
		wrk.nextDoPostToServerAndThenDo(function(sResult) {
			var obj = jsonParse(sResult);			
			
			usrStatusPnl.innerHTML = getLogonLinkMarkup(sSignoutMsg);
			
			hideStatusMsg();
		});	 // end of call-back block	
	} // end of function signOff()
	
	
	
   /***************************************************************
	***************************************************************/
	function signOffCancel() {
		var logOffPanel = $("#logOffPanel")[0];
		var newPost = $("#newPost")[0];
		
		logOffPanel.style.display = "none";
		hideTint();
		newPost.focus();
		app.currentOpenDialog = "";
	} // end of function signOffCancel()
	
	
	
   /*****************************************************
	  run when user clicks sign up button after filling
	  in new user form.
	  Ajax call should create a new user record in db.
	******************************************************/
	function signUp() {
		var wrk = makeAJAXWorkObj();
		var sURL = "./ajax/userUpdates.php";
		var invCode = $("#invCode")[0];
		var logonEmailAdr2 = $("#logonEmailAdr2")[0];
		var sEmailAdr = logonEmailAdr2.value.toLowerCase();
		var pwd2 = $("#pwd2")[0];
		var usrFirstName = $("#usrFirstName")[0];
		var usrLastName = $("#usrLastName")[0];
		var usr = createNewUserObj();
		
		showStatusMsg("Signing You Up...");
		closeLogonPanel();
		
		usr.emailAdr = sEmailAdr;
		usr.firstName = usrFirstName.value;
		usr.lastName = usrLastName.value;
		
		wrk.beginningOfAnAJAXTransactionForURL(sURL);
		wrk.addPostFieldValueForInt("excludeUserId", app.currentUserId);
		wrk.addPostFieldValueForString("lastQuery", app.lastWallMsgQry);
		wrk.addPostFieldValueForString("logonHashCode", app.logonHashCode);
		wrk.addPostFieldValueForString("opp", "add");
		wrk.addPostFieldValueForInt("tmpId", usr.userId);
		wrk.addPostFieldValueForString("invCode", invCode.value);
		wrk.addPostFieldValueForString("emailAdr", sEmailAdr);
		wrk.addPostFieldValueForString("pwd", pwd2.value);
		wrk.addPostFieldValueForString("firstName", usrFirstName.value);
		wrk.addPostFieldValueForString("lastName", usrLastName.value);
		
		wrk.nextDoPostToServerAndThenDo(function(sResult) {
			var obj = jsonParse(sResult);
			var usrStatusPnl = $("#usrStatusPnl")[0];

			if (obj.status === "created") {
				usr.userId = obj.newUserId;
				app.logonEmail = sEmailAdr;
				app.usersById[usr.userId] = usr;
				app.usersByIndex[app.usersByIndex.length] = usr;
				app.currentUserObj = usr;
				
				sessionStorage.setItem("currentUserId", obj.userId);
				localStorage.setItem("lastLogonEmailAdr", sEmailAdr);
				
				processPostsAndUsers(obj);
								
				usrStatusPnl.innerHTML = getUserInfoMarkup();
				hideStatusMsg();
			} // end if (obj.status === "created") 
			
		});	 // end of call-back block	
	} // end of function signUp()
	
	
	
	
   /****************************************************************
	   after getting a new post from user before saving it to db,
	   or getting one or more additional posts downloaded since
	   the initial load, this will take an array of new posts
	   and add them to the top of the post view's unordered list
	   
	   note that this is Not completely regenerating the post stream
	   but just adding any new stuff to the top!
	****************************************************************/
 	function updateWallPostsDisplay(aNewPosts) {
 		var msgs = $("#msgs")[0];  // unordered list DOM element for posts
 		var sNewItemMarkup = [];
 		var nMax = aNewPosts.length;
 		var n,post;
 		
 		if (nMax < 1) {
 			return;
 		} // end if
 		
 		for (n=0; n<nMax; n++) {
 			post = aNewPosts[n];
 			
 			if (post.parentMsgId === 0) {
 				// top level post
 				sNewItemMarkup[sNewItemMarkup.length] = genWallPostMarkup(post);
 			} else {
 			} // end if/else
 		} // next n
 		
 		if (sNewItemMarkup.length > 0) {
 			msgs.insertAdjacentHTML("afterbegin", sNewItemMarkup.join(""));
 		} // end if
 		
 	} // end of function updateWallPostsDisplay(aNewPosts) 
 	
 	
 	
 	
 	
   /****************************************************************
	****************************************************************/ 	
 	function updateWallUserDisplay() {
 		var wallUserLst = $("#wallUserLst")[0];
 		var s=[];
 		var nMax = app.usersByIndex.length;
 		var n,usr;
 		var nCol = 0;
 		var nTop = 0;
 		var nLeft = 0;
 		var nPicSize = 95;
 		var nPadding = 6;
 		
 		if (nMax > 0) {
 			s[s.length] = "<div class='usrLstCntr'>";
			for (n=0;n<nMax;n++) {
				usr = app.usersByIndex[n];				
				
				s[s.length] = "<div class='usrPicCntr' style=";				
				s[s.length] = Q+"left:"+(nLeft)+"px;top:"+(nTop)+"px;"+Q;
				s[s.length] = ">";
				
					s[s.length] = "<img src="+Q+usr.userImagePath+Q;
					s[s.length] = " border='0' width='"+(nPicSize)+"' height='"+(nPicSize)+"' ";
					s[s.length] = " class='usrPic' ";
					s[s.length] = ">";
				
					s[s.length] = "<div class='usrPicName'>"+usr.userFullName+"</div>";
				
				s[s.length] = "</div>"; // div.usrPicCntr
				
				nCol = nCol + 1;
				
				if (nCol > 2) {
					nCol = 0;
					nTop = nTop + nPicSize + nPadding;
				} // end if
				
				nLeft = (nPicSize + nPadding) * nCol;
			} // next n
			s[s.length] = "</div>"; 
			
			
 		} else {
 		
 			// this should only appear before the first user signs up to the site...
 			s[s.length] = "<div style="+Q+"padding-left:40px;padding-top:30px;"+Q+">";
 			s[s.length] = "<p>Sniff! &nbsp;&nbsp;&nbsp;Boo Hoo! </p>";
 			s[s.length] = "<p>There are no users<br>of this message wall yet!</p>";
 			
 			if (!app.userDataLoaded) {
 				// below should never show, unless there is some sort of programming
 				// logic bug
 				s[s.length] = "... but perhaps the reason is that we haven't ";
 				s[s.length] = "actually loaded the user data from the server yet! ";
 			} // end if
 			
 			s[s.length] = "</div>"; 			
 		} // end if/else
 		
 		wallUserLst.innerHTML = s.join("");
 	} // end of function updateWallUserDisplay()
 	
 	
 	
 	
   /****************************************************************
	   when user is logging on...
	   validate the user's logon credentials using ajax
	****************************************************************/
	function validateLogon() {
		var wrk = makeAJAXWorkObj();
		var sURL = "./ajax/validateLogon.php";
		var logonEmailAdr = $("#logonEmailAdr")[0];
		var sLogonEmailAdr = logonEmailAdr.value.toLowerCase();
		var pwd = $("#pwd")[0];
		
		showStatusMsg("Validating your Logon...");
		
		wrk.beginningOfAnAJAXTransactionForURL(sURL);
		wrk.addPostFieldValueForString("lastQuery", app.lastWallMsgQry);
		wrk.addPostFieldValueForString("logonHashCode", app.logonHashCode);
		wrk.addPostFieldValueForString("emailAdr", sLogonEmailAdr);
		wrk.addPostFieldValueForString("pwd", pwd.value);
		wrk.addPostFieldValueForInt("excludeUserId", 0);
		
		wrk.nextDoPostToServerAndThenDo(function(sResult) {
			var obj = jsonParse(sResult);
			var newPosts;
			var usr;
			var usrStatusPnl = $("#usrStatusPnl")[0];
			var logonInfoMsg = $("#logonInfoMsg")[0];
			
			if (obj.status === "success") {
				app.currentUserId = obj.userId;
				usr = app.usersById[obj.userId];				
				app.currentUserObj = usr;
				app.logonEmail = sLogonEmailAdr;
				sessionStorage.setItem("currentUserId", obj.userId);
				localStorage.setItem("lastLogonEmailAdr", sLogonEmailAdr);
				
				processPostsAndUsers(obj);
				
				usrStatusPnl.innerHTML = getUserInfoMarkup();
				hideStatusMsg();
				closeLogonPanel();
			} else {
				app.currentUserId = 0;
				sessionStorage.setItem("currentUserId", 0);
				logonInfoMsg.innerHTML = "Invalid Logon";
				hideStatusMsg();
			} // end if/else
			
		});	 // end of call-back block
		
	} // end of function validateLogon()
	
	
	
   /***************************************************************
	   
	***************************************************************/	
	function validConfirmationCode(sCode) {
		var bOk = true;
		
		if (!app.requireInvCode) {
			return true;  // ok since none required in this case
		} // end if
		
		if (sCode.length < 4) {
			bOk = false;
		} // end if
				
		return bOk;
	} // end of function validConfirmationCode()
	
	
   /***************************************************************
	   is email address provided a properly formed email address...
	***************************************************************/
	function validEmailAdr(sEmailAdr) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(sEmailAdr).toLowerCase());
	} // end of function validEmailAdr()
	
	
	
	
	
   /***************************************************************
	client side check to see if password value is valid
	***************************************************************/
	function validPwd(sPwd) {
		var bOk = true;
		var nAlpha = 0;
		var nNumeric = 0;
		var nPunc = 0;
		var sAlpha1 = "abcdefghijklmnopqrstuvwxyz";
		var sAlpha2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		
		if (sPwd.length < 6) {
			bOk = false;
		}// end if
		
		nNumeric = checkCharCount(sPwd, "0123456789");
		nPunc = checkCharCount(sPwd, "!@#$%&*-_+=:.");
		nAlpha = checkCharCount(sPwd, sAlpha1+sAlpha2);
		
		if (sPwd.indexOf(" ") > -1) {
			bOk = false; // no space characters allowed
		} // end if
		
		if (nAlpha < 4 || nNumeric < 1|| nPunc < 1) {
			bOk = false;
		} // end if
		
		return bOk;
	} // end of function validPwd()
	
	
	
	

	
	
	
	
	
	
	
	
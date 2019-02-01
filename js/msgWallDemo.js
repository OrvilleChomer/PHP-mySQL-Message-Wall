
	var app = {};
	const  Q = '"';
	
	const  INPUT_OK = 0;
	const  EMAIL_INPUT = 1;
	const  PWD_INPUT = 2;
	const  EMAIL_INPUT2 = 3;
	const  PWD_INPUT2 = 4;
	const  FIRSTNAME_INPUT = 5;
	const  LASTNAME_INPUT = 6;
	const  INVCODE_INPUT = 7;
		
	var  postCheck;
	
	

	
	
	
		
   /***************************************************************
       run when the onload event fires for the page:
	***************************************************************/
	function pageSetup(biMobileFlg) {
		var newPost = $("#newPost")[0];
		var usrStatusPnl = $("#usrStatusPnl")[0];
		var logonEmailAdr = $("#logonEmailAdr")[0];
		var usrAgnt = $("#usrAgnt")[0];
		
		postCheck = $("#postCheck")[0]; // done at global level to slightly improve performance
		
		
		// initialize "app" values:
		resetAfterLogonCmd();
		app.CR_key = 13;
		app.contentWidth = 850;
		app.currentOpenDialog = "";
		app.currentUserId = 0;
		app.currentUserObj = undefined;
		app.currentUserWallId = 0;   // which user's wall are we looking at?
		app.defaultUserImagePath = "./userImages/noPic.png";
		app.desktopApp = !biMobileFlg;
		app.displayIdNums = false; // used for debugging (set to true)
		app.hdrHeight = 42;
		app.idMapping = [];  // lookup maps temp id to final id
		app.indentPixels = 73;
		app.initialDataLoadCompleted = false;
		app.lastWallMsgQry = "01/01/1900 01:22:00"; // fallback date
		app.logonEmail = "";
		app.logonHashCode = "";
		app.logoWidth = 32;		
		app.mobileApp = biMobileFlg;
		app.msgsPerPage = 10;	
		app.msgUsersByIndex = [];  // data a user has about a post
		app.msgUsersById = [];	
		app.panelWidth = 500;
		app.panelHeight = 300;
		app.lastScrollDiff = 0; // not initialized yet
		app.lastTmpId = 0;
		app.postsByIndex = [];
		app.postsById = [];
		app.postDataLoaded = false;
		app.prevScrollTopValue = -1; // not initialized yet
		app.processingInput = false;
		app.requireInvCode = true;
		app.resizing = false;
		app.statusMsgWidth = 500;
		app.titleSpacing = 18;
		app.topLevelPostsByIndex = [];
		app.userAgentValue = usrAgnt.innerHTML;
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
		
		
		if (app.currentUserId === 0 && typeof usrStatusPnl !== "undefined") {
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
		var wallInfo1 =  $("#wallInfo1")[0];
		var siteTitle =  $("#siteTitle")[0];
		var w = window.innerWidth;
		var h = window.innerHeight;
		var nTop,nLeft,nHeight;
		var nHdrHeight = 42;
		var nMgn;
		if (app.resizing) return; // prevent unwanted cascading events
		
		app.resizing = true;
		
		nMgn = Math.floor(w / 10.0);
		
		if (app.contentWidth > w) {			
			app.contentWidth  = w - (nMgn * 2);
			siteTitle.innerHTML = "Message Wall Demo";
			siteTitle.style.fontSize = "16pt";
			siteTitle.style.fontWeight = "bold";
			pgHdr.style.height = "50px";
			msgWallLogo.style.top = "4px";
			msgWallLogo.style.height = "42px";
			msgWallLogo.style.width = "42px";
			viewPort.style.top = "50px";
			topLvlPgContent_desktop.style.width = (app.contentWidth)+"px";
		} // end if
		
		pgHdr.style.width = (w)+"px";
		
		nLeft = Math.floor((w - app.contentWidth) / 2);
		topLvlPgContent_desktop.style.left = (nLeft)+"px";
		msgWallLogo.style.left = (nLeft)+"px";
		siteTitle.style.left = (nLeft + app.logoWidth + app.titleSpacing)+"px";
		
		viewPort.style.width = (w)+"px";
		viewPort.style.height = (h-nHdrHeight-4)+"px";
		
		tint.style.width = (w)+"px";
		tint.style.height = (h)+"px";
		
		// tmp:
		wallInfo1.innerHTML = (w)+"px X "+(h)+"px";
		
		
		// centering various popup panels:
		
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
		
		
		app.resizing = false; // we are all done!
		
	} // end of function pageResize()
	
	
	
	
	// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	
	// **** BEGINNING OF FUNCTIONS IN ALPHABETICAL ORDER:
	
	// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	
	
	
	
	
   /***************************************************************

	***************************************************************/
	function beginEnteringComment(nPostId) {
		var newComment = $("#newComment"+nPostId);
		
		newComment.focus();
	} // end of function beginEnteringComment()
	
	
	
   /***************************************************************
         Deliberate cancel by user of logon
         
         called from button click event
	***************************************************************/	
	function cancelLogonPanel() {
	
		closeLogonPanel();
		resetAfterLogonCmd();
		
	} // end of function cancelLogonPanel()
	
	
	
   /***************************************************************

	***************************************************************/	
	function captureMsgScroll() {
		if (!app.mobileApp) return;

	} // end of function captureMsgScroll()
	
	
	
	
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




	
   /***************************************************************
	called when logon panel's:
	  - email text box loses focus, or:
	  - keyup event occurs on email text box, or:
	  - password text box loses focus, or:
	  - keyup event on password text box
	***************************************************************/
	function checkLogonInput(nFromInput, bOnBlur) {
	
		if (app.processingInput) return;
		
		var nFirstProblem = INPUT_OK; // assumption everything is Ok until proven otherwise	
		var retObj;
		
		var tmp = $("#pwd")[0];
		var sVal = tmp.value;
		
		app.processingInput = true;
		
		
		
		// old: "logonEmailAdr", EMAIL_INPUT, validEmailAdr, nFromInput, nFirstProblem, bOnBlur
		
		retObj = checkUserInput({"ctrlId":"logonEmailAdr",
								 "inputType":EMAIL_INPUT,
								 "validateFunction":validEmailAdr,
								 "fromInput":nFromInput,
								 "firstProblem":nFirstProblem,
								 "onblur":bOnBlur});
								 
		nFirstProblem = retObj.firstProblem;
	//	if (sVal === "peace!1") debugger;
		
		// "pwd", PWD_INPUT, validPwd, nFromInput, nFirstProblem, bOnBlur, "btnSignIn"
		retObj = checkUserInput({"ctrlId":"pwd",
								 "inputType":PWD_INPUT,
								 "validateFunction":validPwd,
								 "fromInput":nFromInput,
								 "firstProblem":nFirstProblem,
								 "onblur":bOnBlur,
								 "submitCtlName":"btnSignIn"});
								 
		nFirstProblem = retObj.firstProblem;
		
		
		if (nFirstProblem === INPUT_OK) {
		
			// user presses ENTER or RETURN key:
			if (event.keyCode === app.CR_key) {
				signIn();
			} // end if
		
		} // end if
		
		app.processingInput = false;
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

	***************************************************************/		
	function checkUserInput(params) {
		if (typeof params !== "object") { 
			console.log("not passing in object!");
			return;
		} // end if
		
		var sInputCtlId = params.ctrlId;
		var nInputType = params.inputType;
		var fnCheck = params.validateFunction;
		var nFromInput = params.fromInput;
		var nFirstProblem = params.firstProblem;
		var sSubmitCtlName = params.submitCtlName;
		var nParamCount = 1;
		var inputCtl = $("#"+sInputCtlId)[0];
		var submitCtl;
		var sValue = inputCtl.value;
		var bOk = fnCheck(sValue);
		var bUpdateSubmitButton = false;
		var retObj = {};
		var bOnBlur = false;
		
		if (typeof sSubmitCtlName === "string") {
			submitCtl = $("#"+sSubmitCtlName)[0];
			bUpdateSubmitButton = true;
		} // end if
		
		if (typeof params.onblur === "boolean") {
			bOnBlur = params.onblur;
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
		
		
		// is there a submit button to update?
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
      make sure all user's inputs for sign up are ok before
      enabling button!
	***************************************************************/	
	function checkSignUpInput(nFromInput, bOnBlur) {
		if (app.processingInput) return;
		
		var nFirstProblem = INPUT_OK; // assumption until proven otherwise
		var retObj,sEmailAdr,sEmailAdrConfirm;
		
		app.processingInput = true;

		retObj = checkUserInput({"ctrlId":"invCode",
								 "inputType":INVCODE_INPUT,
								 "validateFunction":validConfirmationCode,
								 "fromInput":nFromInput,
								 "firstProblem":nFirstProblem,
								 "onblur":bOnBlur});
								 
		nFirstProblem = retObj.firstProblem;
		
		retObj = checkUserInput({"ctrlId":"logonEmailAdr2",
								 "inputType":EMAIL_INPUT,
								 "validateFunction":validEmailAdr,
								 "fromInput":nFromInput,
								 "firstProblem":nFirstProblem,
								 "onblur":bOnBlur});
								 
		nFirstProblem = retObj.firstProblem;
		
		sEmailAdr = retObj.fldValue;
			
		retObj = checkUserInput({"ctrlId":"logonEmailAdr2_confirm",
								 "inputType":EMAIL_INPUT,
								 "validateFunction":validEmailAdr,
								 "fromInput":nFromInput,
								 "firstProblem":nFirstProblem,
								 "onblur":bOnBlur});
								 
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
		
		app.processingInput = false;
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
       - they have typed in a:
             - message to post on the wall
             - a new comment on an existing message
             - a reply on an existing comment or other reply
             
       - they have clicked the POST button or hit the Enter key
       
       
       this function is NOT run when getting and processing posts
       from the server via Ajax.
	***************************************************************/
	function createNewPostObj(sMsg, niParentMsgId) {
		var post = {};
		var parentMsg;
		
		post.msgId = getTempId();
		post.parentMsgId = 0; // default until otherwise changed
		post.topLevelMsgId = 0;
		post.userId = app.currentUserId;
		post.msgTimestamp = new Date();
		post.msgContent = sMsg;		
		post.msgUsersByIndex = [];   // data that users have about the post
		post.msgUsersById = [];
		post.postHeight = 0;
		post.likeCount = 0;
		post.youLiked = false;
		post.parentPost = undefined;
		post.repliesByIndex = [];
		post.repliesById = [];
		post.hasParent = false;
		post.indentLevel = 0;
		post.repliesExpanded = false;
		post.updatingGui = true;
		
		if (typeof niParentMsgId === "number") {
			if (niParentMsgId > 0) {
				post.parentMsgId = niParentMsgId;
				parentMsg = app.postsById[post.parentMsgId];
				post.parentPost = parentMsg;
				
				// note: only Top Level wall messages are in reverse chronological
				//       order!
				parentMsg.repliesByIndex[parentMsg.repliesByIndex.length] =post;
				 
				parentMsg.commentCount = parentMsg.commentCount + 1;
				post.hasParent = true;
				post.indentLevel = parentMsg.indentLevel + 1;
				
				if (parentMsg.indentLevel < 1) {
					post.topLevelMsgId = niParentMsgId;
				} else {
					post.topLevelMsgId = parentMsg.topLevelMsgId;
				} // end if/else
								
				app.postsByIndex[app.postsByIndex.length] = post; // add to end of array
			} // end if
		} else {
		    // no parent...
		    app.postsByIndex.unshift(post); // add to beginning of array
		    app.topLevelPostsByIndex.unshift(post); // add to beginning of array
		} // end if
		
		
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
   	   called as user types in their comment
   	   or, paste into comment...
   	   ... or their Reply to a comment!
	***************************************************************/		
	function editComment(inpCtrl, nMsgId) {
		var sValue = inpCtrl.value;

		if (typeof nMsgId !== "number") {
			alert("editComment() - problem! nMsgId="+nMsgId);
			debugger;
			return;
		} // end if
		
		nMsgId = getActualId(nMsgId);
		
		if (sValue.length > 0) {
			// user presses ENTER or RETURN key:			
			if (event.keyCode === app.CR_key) {
				savePost(nMsgId, sValue, inpCtrl);
			} // end if
		} // end if
		
	} // end of function editComment()
	
	
	
	
	
	
   /***************************************************************
	***************************************************************/		
	function expandReplies(nPostId) {
		var postReplies;
		var commentReply;
		
		nPostId = getActualId(nPostId);
		postReplies = $("#postReplies"+nPostId)[0];
		
		commentReply = app.postsById[nPostId];
		
		commentReply.repliesExpanded = true;
		
		postReplies.innerHTML = genPostReplyMarkup(commentReply);
		
	} // end of function expandReplies()
	
	
	
	
	
   /***************************************************************
   	   kinda gives a summary of likes and replies for a post
   	   also gives some link options for liking and commenting
   	   
   	   
	***************************************************************/	
	function genMsgLikesAndCommentsSummaryMarkup(post) {
		var s=[];
		var sLikeBtnFileImage = "likeButton.png";
		
		s[s.length] = "<li class='msgSection'>";
			s[s.length] = "<div class='msgLikeAndCountSummary' >";
			
			s[s.length] = "<div class='msgCountInfo' "; // have this div every time
			s[s.length] = "id='msgCountInfo"+post.msgId+"' ";
			
			if (post.likeCount > 0 || post.repliesByIndex.length > 0) {
				s[s.length] = " style='display:block;' ";
			} // end if (post.likeCount > 0 || post.commentCount > 0)
			 
			s[s.length] = ">"; // end of msgCountInfo opening tag
			
			if (post.likeCount > 0 || post.repliesByIndex.length > 0) {
				s[s.length] = getPostLikeAndCommentInfo(post);
			} // end if
			
			s[s.length] = "</div>";	//msgCountInfo
			
			//s[s.length] = " likes";
			
				//s[s.length] = post.commentCount;
				//s[s.length] = " comments";
			//s[s.length] = "id='lblCommentCount"+post.msgId+"' ";
			
			if (post.youLiked) {
				// you Liked this top-level post so show the "Selected" like button!
				sLikeBtnFileImage = "likeButtonSel.png";
			} // end if
			
			s[s.length] = "<center>";
			
			s[s.length] = "<img class='likeCommentShareBtn' src='./imgs/"+sLikeBtnFileImage+"' ";
			s[s.length] = "id='likeLnk"+post.msgId+"' ";
			s[s.length] = "onclick="+Q+"likeUnlike("+post.msgId+")"+Q+" ";
			
			
			s[s.length] = ">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			
			s[s.length] = "<img class='likeCommentShareBtn' src='./imgs/commentButton.png' ";
			s[s.length] = "onclick=";
			s[s.length] = Q+"beginEnteringComment("+post.msgId+")"+Q+" ";
			s[s.length] = ">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			
			s[s.length] = "<img class='likeCommentShareBtn' src='./imgs/shareButton.png' ";
			s[s.length] = ">";
			s[s.length] = "</center>";
						
			s[s.length] = "</div>";	//msgLikeAndCountSummary
		s[s.length] = "</li>"; // msgSection
		
		return s.join("");
		
	} // end of function genMsgLikesAndCommentsSummaryMarkup()
	
	
	
	
	
   /***************************************************************
   	   generates markup for a post's comments as well as a 
   	   comment's replies.   And returns that markup string.
   	   
	***************************************************************/	
	function genPostReplyMarkup(post, options) {
		var s=[];
		var nMax = post.repliesByIndex.length;
		var n, reply, reply2;
		var sClass1 = "commentMsgCntr";
		var sClass2 = "commentMsg";
		var sImgClass = "commentUsrImg2";
		var usr;
		var sPostedAt, sReply;
		var sAniClass1;
		
		if (paramEquals(options, "break", true)) {
			debugger;
		} // end if
		
		for (n=0;n<nMax;n++) {
			reply = post.repliesByIndex[n];  // can be a Comment or a Reply 
			
			sAniClass1 = "";
			
			if (reply.updatingGui) {
				sAniClass1 = " class='highlightFadeoutAni'";
			} // end if
		
			usr = app.usersById[reply.userId];
			sPostedAt = getFormattedRelativeDateTime(reply.msgTimestamp);
			
			// only do on replies... the Comment <li> tag generation is in genWallPostMarkup()
			if (post.indentLevel > 1) {
				s[s.length] = "<li class='"+sClass1+"'>";				
			} // end if
			
			if (reply.indentLevel > 1) {
				sImgClass = "replyUsrImg2";
			} // end if
			
				s[s.length] = "<table"+sAniClass1+">";
				s[s.length] = "<tr valign='top'>";
				s[s.length] = "<td >";
				s[s.length] = "<img src="+Q+usr.userImagePath+Q+" class='"+sImgClass+"' border='0'>";
				s[s.length] = "</td>";
				s[s.length] = "<td width='*'>";
					s[s.length] = "<div class='"+sClass2+"'>";
					s[s.length] = "<span ";
					s[s.length] = "onclick="+Q+"showUsersPosts("+reply.userId+")"+Q+" ";
					s[s.length] = "class='commentUserName userNameTitle'>"+usr.userFullName+"</span>&nbsp;&nbsp;";
					
				
					s[s.length] = reply.msgContent;
					
					s[s.length] = outputObjId("postsById", "msgId", reply.msgId);
										
					s[s.length] = "</div>";
				
					s[s.length] = "&nbsp;&nbsp;&nbsp;";
					s[s.length] = "<span class='smallLink' ";
					s[s.length] = "id='likeLnk"+reply.msgId+"' ";
					s[s.length] = "onclick="+Q+"likeUnlike("+reply.msgId+")"+Q+" ";
					s[s.length] = ">";
					
					if (reply.youLiked) {
						s[s.length] = "<b>like</b>";
					} else {
						s[s.length] = "like";
					} // end if
					
					s[s.length] = "</span>";
					s[s.length] = " · ";
					s[s.length] = "<span class='smallLink' ";
					s[s.length] = " onclick='startAReplyTo("+reply.msgId+")' ";
					s[s.length] = ">";
					s[s.length] = "reply</span>";
					s[s.length] = " · ";
					
					s[s.length] = "<span class='postedAtInfo2'>";
					s[s.length] = sPostedAt;
					s[s.length] = "</span>";
				s[s.length] = "</td>";
				s[s.length] = "</tr>";
			s[s.length] = "</table>";
						
			s[s.length] = "<div class='commentReplies'>";
			
            s[s.length] = "<ul class='postReplies' id='postReplies"+reply.msgId+"'>";
            			
            
            			
			if (reply.repliesByIndex.length > 0) {
				
				if (post.repliesExpanded) {						
					s[s.length] = genPostReplyMarkup(reply);						
				} else {	
					reply2 = reply.repliesByIndex[reply.repliesByIndex.length-1];
					usr = app.usersById[reply2.userId];
					s[s.length] = "<li>";
								
					s[s.length] = "<table><tr>";
					
					s[s.length] = "<td width='12'>";
					s[s.length] = "<img ";
					s[s.length] = "class='lnkOnly' ";
					s[s.length] = "onclick='expandReplies("+reply.msgId+")' ";
					s[s.length] = "src='./imgs/replyArrow.png' width='11' height='8' border='0'>";
					s[s.length] = "</td>";
					
					s[s.length] = "<td>";
					s[s.length] = "<img ";
					s[s.length] = "class='lnkOnly replyUsrImg' ";
					s[s.length] = "onclick='expandReplies("+reply.msgId+")' ";
					s[s.length] = " src="+Q+usr.userImagePath+Q+" border='0'>";
					s[s.length] = "</td>";
					
					s[s.length] = "<td width='*'>";
					s[s.length] = "<span class='postRepliesSum1' ";
					s[s.length] = "onclick='expandReplies("+reply.msgId+")' ";
					s[s.length] = ">";	
					s[s.length] = usr.userFullName;
					s[s.length] = " replied ";
					s[s.length] = "</span>";
					s[s.length] = " · ";
					
					s[s.length] = "<span class='postRepliesSum1' ";
					s[s.length] = "onclick='expandReplies("+reply.msgId+")' ";
					s[s.length] = ">";
					s[s.length] = (reply.repliesByIndex.length)+" ";
					sReply = "Reply";
					
					if (reply.repliesByIndex.length > 1) {
						sReply = "Replies";
					} // end if
					
					s[s.length] = sReply;
					s[s.length] = "</span>";
					s[s.length] = "</td>";
					
					s[s.length] = "</tr></table>";
					
					s[s.length] = "</li>";
				} // end if/else
				
			} // end if
			
			s[s.length] = "</ul>";  // postReplies
			s[s.length] = "</div>"; // commentReplies
			
			// only do on replies... the Comment <li> tag generation is in genWallPostMarkup()
			if (post.indentLevel > 1) {
				s[s.length] = "</li>"; // commentMsgCntr
			} // end if
			
			reply.updatingGui = false;
		} // next n
		
		
		return s.join("");
	} // end of function genPostReplyMarkup(post)
	
	
	
	
   /***************************************************************

	***************************************************************/
	function genWallPostMarkup(post) {
		var s=[];
		var usr = app.usersById[post.userId];
		var sBasicFormattedTimestamp = getFormattedDateTime(post.msgTimestamp);
		var sPostedAt = getFormattedRelativeDateTime(post.msgTimestamp);
        var sAniClass1 = "";
		
		
		if (post.updatingGui) {
			sAniClass1 = " highlightFadeoutAni";
		} // end if
		
		s[s.length] = "<li class='liMsg'>";
		
		    
		
		
		// msgCntr is our white box
		
			s[s.length] = "<div class='msgCntr"+sAniClass1+"' ";
			
			if (post.postHeight > 100) {
		//		s[s.length] = "style="+Q+"height:"+post.postHeight+"px;"+Q;
			} // end if
			
			s[s.length] = ">";  // ending of div msgCntr (not closing tag)
			
			s[s.length] = "<ul class='msgSections'>";
				
				// msg header stuff... avatar, user name, etc.
				s[s.length] = "<li class='msgSection'>";
				
					s[s.length] = "<div class='msgHdrCntr'>";
					s[s.length] = "<div class='msgHdrCntr2'>";
					s[s.length] = "<img src="+Q+usr.userImagePath+Q+" class='userImg1'>";
					
					s[s.length] = "<div ";
					s[s.length] = "onclick="+Q+"showUsersPosts("+post.userId+")"+Q+" ";
					s[s.length] = "class='postUserName userNameTitle'>"+usr.userFullName+"</div>";
				
					s[s.length] = "<img ";
					s[s.length] = "class='postElipses' ";
					s[s.length] = " src='./imgs/bigElipses.png' border='0'>";
				
					s[s.length] = "<div ";
					s[s.length] = "title="+Q+sBasicFormattedTimestamp+Q+" ";
					s[s.length] = "class='postedAtInfo'>"+sPostedAt+"</div>";
					s[s.length] = "</div>&nbsp;";  // msgHdrCntr2
					s[s.length] = "</div>";  // msgHdrCntr
				s[s.length] = "</li>";	
					
				// actual msg content
				s[s.length] = "<li class='msgSection'>";
					s[s.length] = "<div class='postContent'>"+post.msgContent;
					
					s[s.length] = outputObjId("postsById", "msgId", post.msgId);
										
					s[s.length] = "</div>";
				s[s.length] = "</li>";
				
				// actual msg count stuff
				s[s.length] = genMsgLikesAndCommentsSummaryMarkup(post);
				
				// container to place comments into
				s[s.length] = "<li class='msgSection'>";				
					s[s.length] = "<div class='commentContainer' ";
					s[s.length] = "id='commentContainer"+post.msgId+"' ";
					s[s.length] = ">";
				
					s[s.length] = "<ul class='commentsLst'>";
					
					// display comments already entered here:
					s[s.length] = "<li class='commentMsgCntr' id='msgComments"+post.msgId+"'>";
					s[s.length] = genPostReplyMarkup(post);
					s[s.length] = "</li>";
					
					// place to Add my Own comment
					s[s.length] = "<li>";
					
					s[s.length] = "<table>";
						s[s.length] = "<tr valign='top'>";
						s[s.length] = "<td>";
						s[s.length] = "<img src="+Q+usr.userImagePath+Q+" class='commentUsrImg2'>";
					
						s[s.length] = "</td>";
						s[s.length] = "<td width='*'>";
						s[s.length] = "<input id='newComment"+post.msgId+"' class='commentInput' ";
						s[s.length] = " autocomplete='off' ";
						s[s.length] = " onkeyup="+Q+"editComment(this,"+post.msgId+")"+Q+" ";
						s[s.length] = " onpaste="+Q+"editComment(this,"+post.msgId+")"+Q+" ";
						s[s.length] = " placeholder='Write a comment...' ";
						s[s.length] = ">"; // end of input tag
						s[s.length] = "</td>";
						s[s.length] = "</tr>";
					s[s.length] = "</table>";
					
					s[s.length] = "</li>";
					
					s[s.length] = "</ul>";
				
					s[s.length] = "</div>";
				s[s.length] = "</li>";
				
				// !!! ---
				
				s[s.length] = "</ul>"; // msgSections
				
				s[s.length] ="</div>";  // postContent
				
				s[s.length] = "</li>";
				
				
			s[s.length] = "</div>";  // msgCntr class
		s[s.length] = "</li>"; // liMsg class
		
		post.updatingGui = false;
		
		return s.join("");
	} // end of function genWallPostMarkup()
	
	
	
	
   /***************************************************************
      if # is positive, it returns # as is
      if # is negative it:
         - checks to see if there is a new positive#, if so, it returns that#
         - else the fall-back is to return a negative#.   
         
         see: setActualId()   
	***************************************************************/	
	function getActualId(nId) {
		var nActualId = nId;  // default
		var nMappedNumber;
		
		// working with a temp id... do we have the final id# yet?
		if (nId < 0) {
			nMappedNumber = app.idMapping[nId];
			
			if (typeof nMappedNumber === "number") {
				nActualId = nMappedNumber;
			} // end if
		} // end if
		
		return nActualId;
	} // end of function getActualId()
	
	
	
	
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
     used to get a DOM element whose id ends with a post id
	***************************************************************/	
	function getDomEl(sPrefix, nId) {
		var el = $("#"+sPrefix+(nId))[0];
		var post;
		var sId;
		
		if (typeof el === "undefined") {
			if (nId > 0) {
				post = app.postsById[nId];
				nId = post.tmpId;
				sId = sPrefix+(nId);
				el = $("#"+sId)[0];
				if (typeof el === "undefined") {
					alert("problem - getDomEl() - 2 - "+sId);
					debugger;
				} // end if
			} else {
				alert("problem - getDomEl()");
				debugger;
			} // end if/else
		} // end if
		
		return el;debugger;
	} // end of function getDomEl()
	
	
	
	
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
	***************************************************************/	
	function getJsStack() {
		try {
			thisWillThrowAnError.everyTime();
		} catch(err) {
			var stackDta = err.stack.split("\n");
			var stackInfo = {};
			var stack = [];
			var nMax = stackDta.length;
			var sValue,nPos,sValue2;
			var n,stackEntry;
			var sHtmlIndexPgName = "index.php";
			
			stackInfo.timestamp = new Date();
			
			if (nMax>1) {
				for (n=1;n<nMax;n++) {
					sValue = stackDta[n];
					stackEntry = {};
					stackEntry.funcName = sValue.split("@")[0];
					sValue = sValue.split("@")[1];
					stackEntry.jsFileUrl = "";
					stackEntry.stackDepth = nMax - n;
					
					nPos = sValue.indexOf("?");
					
					if (nPos > -1) {
						stackEntry.jsFileUrl = sValue.substr(0,nPos);
					} // end if
					
					sValue = sValue.split(":");
					
					if (stackEntry.jsFileUrl === "") {
						// protocol plus rest of main url
						sValue2 = sValue[0] + ":" + sValue[1];
						
						if (sValue.length-2 > 2) {
							sValue2 = sValue2 + ":" + sValue[2]; // handle port if there
						} // end if
						
						stackEntry.jsFileUrl = sValue2;
					} // end if
					
					
					stackEntry.column = sValue[sValue.length-1]-0;
					stackEntry.lineNum = sValue[sValue.length-2]-0;
					stack[stack.length] = stackEntry;
				} // next n
			} // end if
			
			stackInfo.stackByIndex = stack;
			
			return stackInfo;
		} // end try/catch
	} // end of function getJsStack() 
	
		
   /***************************************************************
      
	***************************************************************/		
	function getLikedArray(post) {
		var a = [];
		var nMax = post.msgUsersByIndex.length;
		var n, obj;

		for (n=0;n<nMax;n++) {
			obj = post.msgUsersByIndex[n];
			
			if (obj.dataValueStr === "like") {
				a[a.length] = obj;
			} // end if
		} // next n
		
		post.likeCount = a.length;
		
		return a;
	} // end of function getLikedArray()
		
		
		
		
   /***************************************************************
      
	***************************************************************/		
	function getLikedList1(post){
		var s=[];
		var usr;
		var nCurrentUserCount = 0;
		var arr = getLikedArray(post);
		var msgUsr;
		var n;
		var nMax = arr.length;
		var Q = '"';
		
		s[s.length] = "<table cellpadding=0 cellspacing=0 class='largeLikeHoverArea' ";
		s[s.length] = "onclick="+Q+""+Q+" ";
		s[s.length] = "><tr valign='middle'>";
				
		s[s.length] = "<td><img src='./imgs/likesIcon.png' border='0' width='16' class='likeIcon'></td>";
		
		s[s.length] = "<td class='grayText' ";
		s[s.length] = ">";
		
		if (post.youLiked) {			
			if (post.likeCount > 1) {
				s[s.length] = "You ";
				nCurrentUserCount = nCurrentUserCount + 1;
			} else {
				usr = app.currentUserObj;
				s[s.length] = usr.userFullName;
				nCurrentUserCount = nCurrentUserCount + 1;
			} // end if/else
		} // end if
		
		if (nCurrentUserCount < 3) {
			for (n=0;n<nMax;n++) {
				msgUsr = arr[n];				
				
				if (msgUsr.userId !== app.currentUserId) {
					if (nCurrentUserCount > 1) {
						s[s.length] = ", ";
					} // end if
					
					if (nCurrentUserCount === nMax) {
						s[s.length] = "and ";
					} // end if
					
					s[s.length] = msgUsr.usrObj.userFullName;
					nCurrentUserCount = nCurrentUserCount + 1;
					
					if (nCurrentUserCount > 2) {
						break; // get out of for loop
					} // end if
				} // end if
			} // next n
		} // end if
		
		if (nCurrentUserCount < nMax) {
			s[s.length] = "and "+(nMax-nCurrentUserCount)+" others";
		} // end if
		
		s[s.length] = "</td>";
		
		s[s.length] = "</tr></table>";
		
		return s.join("");
	} // end of function getLikedList1()
	
	
	
	
	
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
		
		if (app.desktopApp) {
			s[s.length] = "<span style='font-size:10pt;'>";
			s[s.length] = sMsg;
			s[s.length] = "</span>";
		} // end if
		
		s[s.length] = "<center>";
		s[s.length] = "<p>";
		s[s.length] = "<button class='genericBtn' ";
		s[s.length] = "style='width:80px;' ";
		s[s.length] = "onclick="+Q+"showLogonPanel('')"+Q+" ";
		s[s.length] = ">";
		s[s.length] = "Log In";
		s[s.length] = "</button>";
		
		if (app.desktopApp) {
			s[s.length] = "</p>";
			s[s.length] = "<p>";
			s[s.length] = "- or -";
			s[s.length] = "</p>";
			s[s.length] = "<p>";
		} else {
			s[s.length] = "&nbsp;&nbsp;";
		} // end if/else
		
		s[s.length] = "<button class='signupBtn' ";
		s[s.length] = "style='width:80px;' ";		
		s[s.length] = "onclick="+Q+"showSignUpPanel()"+Q+" ";
		s[s.length] = ">";
		s[s.length] = "Sign Up";
		s[s.length] = "</button>";
		s[s.length] = "</p>";
		s[s.length] = "</center>";
		
		if (app.desktopApp) {
			s[s.length] = getBlurb();
		} // end if
		
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
	*********************************************/	
	function getPostLikeAndCommentInfo(post) {
		var s=[];
		
		s[s.length] = "<table cellpadding=0 cellspacing=0 width='100%'><tr>";
		s[s.length] = "<td align='left' width='*' nowrap ";
		s[s.length] = "id='likeLst1-"+(post.msgId)+"' ";
		s[s.length] = ">";
		
		if (post.likeCount > 0) {			
			s[s.length] = getLikedList1(post);		
		} else {
			s[s.length] = "&nbsp;</td>";
		} // end if
		
		
		s[s.length] = "<td align='right' nowrap width='120' class='grayText'>";
		
		if (post.repliesByIndex.length > 0) {
			s[s.length] = post.repliesByIndex.length;
			s[s.length] = " comments";
		} else {
			s[s.length] = "&nbsp;";
		} // end if
			
		s[s.length] = "</td></tr></table>";
		
		return s.join("");
	} // end of function getPostLikeAndCommentInfo()
	
	
	
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

			app.initialDataLoadCompleted = true;
			
			if (typeof bPageStartup !== "undefined") {
				if (bPageStartup) {
					if (app.currentUserId > 0) {
						app.currentUserObj = app.usersById[app.currentUserId];
						usrStatusPnl.innerHTML = getUserInfoMarkup();
					} // end if					
					
				} // end if
			} // end if
			
			// make sure user can see posts...
			updateWallPostsDisplay(app.topLevelPostsByIndex);
			
			
			
			updateWallUserDisplay();
		});	 // end of call-back block
		
	} // end of function getPosts()
	
	
	
	
	
	
	
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
		
		/*
		s[s.length] = "<button class='signupBtn' ";
		s[s.length] = "style='width:80px;' ";		
		s[s.length] = "onclick="+Q;
		// true value means to go into edit mode...
		s[s.length] = "showUserProfilePanel("+app.currentUserId+", true)"+Q+" ";
		s[s.length] = ">";
		s[s.length] = "Edit Profile";
		s[s.length] = "</button>&nbsp;&nbsp;";
		*/
		
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
   	  toggle "like" flag on msg for the current user
    ******************************************************************************/	
	function likeUnlike(nMsgId) {
		var likeLnk = getDomEl("likeLnk", nMsgId);  
		var msg = app.postsById[getActualId(nMsgId)];
		var sInfo = "You need to be logged in before you can un/like a message.";
		var wrk = makeAJAXWorkObj();
		var sURL = "./ajax/likeUnlike.php";
		var likeLst1;
		
		if (typeof msg === "undefined") {
			alert("Problem in likeUnlike() function.\n msg is undefined.\n nMsgId="+nMsgId);
			debugger;
			return;
		} // end if
		
		if (app.currentUserId === 0) {
			app.afterLogonCmd = "like";
			app.afterLogonMsgId = getActualId(nMsgId);
			showLogonPanel(sInfo);  // got to be logged in first!
			return;
		} // end if
		
		
		if (!msg.youLiked) {
			if (msg.parentMsgId === 0) {
				likeLnk.src= "./imgs/likeButtonSel.png";
			} else {
				likeLnk.innerHTML = "<b>like</b>";  // make the word "like" be bold
			} // end if/else
			
			msg.youLiked = true;
			msg.likeCount = msg.likeCount + 1;
		} else {
		
			if (msg.parentMsgId === 0) {
				likeLnk.src= "./imgs/likeButton.png";
			} else {
				likeLnk.innerHTML = "like";
			} // end if/else
			
			msg.youLiked = false;
			msg.likeCount = msg.likeCount - 1;
		} // end if/else
		
		
		if (msg.parentMsgId === 0) {
			likeLst1 = $("#likeLst1-"+getActualId(nMsgId))[0];
			likeLst1.innerHTML = getLikedList1(msg);
		} // end if
		
		wrk.beginningOfAnAJAXTransactionForURL(sURL);
		wrk.addPostFieldValueForInt("excludeUserId", app.currentUserId);
		wrk.addPostFieldValueForString("lastQuery", app.lastWallMsgQry);
		wrk.addPostFieldValueForInt("userId", app.currentUserId);
		wrk.addPostFieldValueForInt("msgId", getActualId(nMsgId));
						
		wrk.nextDoPostToServerAndThenDo(function(sResult) {
			var obj = jsonParse(sResult);
			
			processMsgUserDataItem(obj.msgUsrObj);
			processPostsAndUsers(obj); // pick up any other user's changes that might have happened
		});	 // end of call-back block	
		
	} // end of function likeUnlike()
	
	
	
	
	
   /******************************************************************************
   	  create some HTML markup to display a little label showing an Id #
   	  ... with the option to click for more stuff!
   	  ... do it that is IF the app.displayIdNums is set to true!
    ******************************************************************************/		
	function outputObjId(sAppDictName, sIdPropName, nId) {
		var s=[];
		var Q = '"';
		
		if (app.displayIdNums) {
			s[s.length] = "<br><div class='idDisp' ";
			s[s.length] = "title="+Q;
			s[s.length] = "click to check object's values";
			s[s.length] = Q;
			s[s.length] = "onclick="+Q+"showObjInfo('"+sAppDictName+"', "+nId+")"+Q+" ";
			s[s.length] = ">&nbsp;&nbsp;&nbsp;"+sIdPropName+": ("+nId+")</div>";
		} // end if
		
		return s.join("");
	} // end of function outputObjId()
	
	
	
	
	
   /******************************************************************************
    ******************************************************************************/			
	function paramEquals(obj, sParam, vValue) {
		if (typeof obj !== "object") {
			return false;
		} // end if
		
		if (typeof obj[sParam] === "undefined") {
			return false;
		} // end if
		
		if (obj[sParam] === vValue) {
			return true;
		} else {
			return false;
		} // end if/else
	} // end of function paramEquals()	
		
		
		
		
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
	} // end of function pickLogonView()
	
	
	
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
	} // end of function pickSignupView()
	
	
	
	
	
   /***************************************************************
	***************************************************************/	
	function processAfterLogonCmdPart1() {
	
		if (app.afterLogonCmd === "post") {
			if (typeof app.afterLogonTxtElement !== "undefined") {
				app.afterLogonTxtElement.readonly = true;
			} // end if
		} // end if
		
		setTimeout("processAfterLogonCmdPart2()",500);
		
	} // end of function processAfterLogonCmdPart1()
	
	
	
	
	
   /***************************************************************
	***************************************************************/	
	function processAfterLogonCmdPart2() {
		var nParentMsgId;
		var sPostValue;
		var txtCtrl;
		
		if (app.afterLogonCmd === "post") {
			nParentMsgId = app.afterLogonParentMsgId;
			sPostValue = app.afterLogonPostValue;
			txtCtrl = app.afterLogonTxtElement;
			
			if (txtCtrl !== "undefined") {
				txtCtrl.readonly = false;
			} // end if
			
			savePost(nParentMsgId, sPostValue, txtCtrl);
		} // end if
		
		if (app.afterLogonCmd === "like") {
			likeUnlike(app.afterLogonMsgId);
		} // end if
		
		resetAfterLogonCmd();
	} // end of function processAfterLogonCmdPart2()
	
	
	
	
	
   /***************************************************************
	***************************************************************/
	function processPosts(latestPosts) {
		var nMax = latestPosts.length;
		var post,parentPost;
		var n,nReplies;
		
		for (n=0;n<nMax;n++) {
			post = latestPosts[n];

			post.postHeight = 0; // new or old, need to recalculate
			
			post.repliesExpanded = false;
			post.youLiked = false;
			post.updatingGui = false;
			
			if (typeof post.msgTimestamp === "string") {
				post.msgTimestamp = new Date(post.msgTimestamp);
			} // end if
			
			if (app.initialDataLoadCompleted) {
				post.updatingGui = true;
			} // end if
			
			if (typeof post.repliesByIndex === "undefined") {
				post.repliesByIndex = [];
				post.repliesById = [];
				post.msgUsersByIndex = [];   // data that users have about the post
				post.msgUsersById = [];
				post.hasParent = false;				
			} // end if
			
			if (typeof app.postsById[post.msgId] === "undefined") {
				app.postsByIndex[app.postsByIndex.length] = post;
				
				
				
				if (post.parentMsgId === 0) {
					app.topLevelPostsByIndex[app.topLevelPostsByIndex.length] = post;
					post.indentLevel = 0;
				} else {
					post.hasParent = true;
					parentPost = app.postsById[post.parentMsgId];
					
					if (typeof parentPost === "undefined") {
						debugger;
					} // end if
					
					post.parentPost = parentPost;
					post.indentLevel = parentPost.indentLevel + 1;
					
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
	
		if (typeof obj.lastChecked !== "undefined") {
			app.lastWallMsgQry = obj.lastChecked;
		} // end if
		
		
		if (typeof obj.latestPosts !== "undefined") {
			processPosts(obj.latestPosts);
		} // end if
		
		if (typeof obj.latestUsers !== "undefined") {
			processUsers(obj.latestUsers);
		} // end if
		
		if (typeof obj.latestMsgUserData !== "undefined") {
			processMsgUserData(obj.latestMsgUserData);
		} // end if
		
	} // end of function processPostsAndUsers()
	
	
	
   /***************************************************************
		process individual msgUsr object
	***************************************************************/	
	function processMsgUserDataItem(msgUsr) {
		var msg,usr,msgUsr2;
		
		const DATATYPE_LIKE = 0;

		if (typeof app.msgUsersById[msgUsr.msgUserId] === "undefined") {
			app.msgUsersByIndex[app.msgUsersByIndex.length] = msgUsr;
		} // end if
		
		app.msgUsersById[msgUsr.msgUserId] = msgUsr.msgUserId;
		
		msg = app.postsById[msgUsr.msgId];
		usr = app.usersById[msgUsr.userId];
		
		if (typeof msg.msgUsersById[msgUsr.msgUserId] === "undefined") {
			msgUsr.idx = msg.msgUsersByIndex.length;
			msg.msgUsersByIndex[msg.msgUsersByIndex.length] = msgUsr;
			msg.msgUsersById[msgUsr.msgUserId] = msgUsr;
		} else {
			msgUsr2 = msg.msgUsersById[msgUsr.msgUserId];
			msgUsr2.dataValueStr = msgUsr.dataValueStr;
		} // end if
		
		
		// convenience properties:
		msgUsr.msgObj = msg;
		msgUsr.usrObj = usr;
		
		if (typeof msgUsr.createDate === "string") {
			msgUsr.createDate = new Date(msgUsr.createDate);
		} // end if
		
		
		if (typeof msgUsr.updateDate === "string") {
			msgUsr.updateDate = new Date(msgUsr.updateDate);
		} // end if
		
		if (msgUsr.userId === app.currentUserId && msgUsr.dataType === DATATYPE_LIKE) {
			if (msgUsr.dataValueStr === "like") {
				msg.youLiked = true;
			} else {
				msg.youLiked = false;
			} // end if/else
		} // end if
		
	} // end of function processMsgUserDataItem()
	
	
	
	
   /***************************************************************
		process latest user information about posts downloaded via Ajax.
	***************************************************************/	
	function processMsgUserData(latestMsgUserData) {
		var nMax = latestMsgUserData.length;
		var msgUsr,usr,msg;
		var n;
		
		for (n=0;n<nMax;n++) {
			msgUsr = latestMsgUserData[n];
			processMsgUserDataItem(msgUsr);
		} // next n
	} // end of function processMsgUserData()
	
	
	
	
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
	  
	***************************************************************/	
	function resetAfterLogonCmd() {
		app.afterLogonCmd = "";
		app.afterLogonMsgId = 0;
		app.afterLogonParentMsgId = 0;
		app.afterLogonPostValue = "";
		app.afterLogonTxtElement = undefined;
	} // end of function resetAfterLogonCmd()
	
	
	
	
	
   /***************************************************************
	  save a top-level post or a Reply to db via Ajax
	  
	  called:
	     - onclick event on button id'd as: "postBtn" in index.php
	        (this is for top-level posts)
	***************************************************************/
	function savePost(nParentMsgId, siPostValue, txtCtrl) {
		var sInfo = "You need to be logged in before you can post a message.";
		var parentMsg;
		var likeLst1;

	//	debugger;
		
		if (nParentMsgId > 0) {
			parentMsg = app.postsById[nParentMsgId];
		} // end if	
		
		if (app.currentUserId === 0) {
			if (nParentMsgId > 0) {
				sInfo = "You need to be logged in first before you can post a comment.";
				
				if (parentMsg.indentLevel > 1) {
					sInfo = "You need to be logged in first before you can reply to a comment.";
				} // end if
				
			} // end if
			
			// stash values so post can be done automatically after a successful logon:
			app.afterLogonCmd = "post";
			app.afterLogonParentMsgId = nParentMsgId;
			app.afterLogonPostValue = siPostValue;
			app.afterLogonTxtElement = txtCtrl;
		
			showLogonPanel(sInfo);  // got to be logged in first!
			return;
			
		} // end if
			
		
		var wrk = makeAJAXWorkObj();
		var sURL = "./ajax/savePost.php";
		var newPost = $("#newPost")[0];
		var postBtn = $("#postBtn")[0];
		var sPostValue = newPost.value;
		var post;
		var aNewPosts = [];  // this is fine
		var sInfo;
		var commentCntr;
		var sCntrId = "msgComments";
		
		// for handling replies which will get value from some different DOM element.
		if (typeof siPostValue !== "undefined") {
			sPostValue = siPostValue;
		} // end if
				
				
		
	   /*****************************************************************
	   	  note: function below adds new post to parent post already
	   	        (if post has a parent)!
	   	        
	   	        Also to app level arrays
		*****************************************************************/
		post = createNewPostObj(sPostValue, nParentMsgId);
		
		
		if (nParentMsgId === 0) {
			newPost.value = ""; //clear out text box for wall message post
			newPost.focus();
			postBtn.style.display = "none"; // hide post button
				
			aNewPosts[0] = post;  // this is fine

			updateWallPostsDisplay(aNewPosts);
			sInfo = "Posting message to Wall...";
		} else {
			txtCtrl.value = "";
			
			if (parentMsg.indentLevel > 0) {
				sCntrId = "postReplies";
			} // end if
			
			
			commentCntr = getDomEl(sCntrId, parentMsg.msgId);
			//commentCntr.innerHTML = genPostReplyMarkup(parentMsg); // update GUI with changes
			commentCntr.innerHTML = genPostReplyMarkup(parentMsg); // update GUI with changes
						
			sInfo = "Adding Comment to Post...";
			
			if (parentMsg.indentLevel > 1) {
				sInfo = "Adding a Reply to Comment...";
				parentMsg.repliesExpanded = true;
			} // end if
		} // end if/else
				
		
		showStatusMsg(sInfo);
		
		post.parentMsgId = nParentMsgId;
		wrk.beginningOfAnAJAXTransactionForURL(sURL);
		wrk.addPostFieldValueForInt("excludeUserId", app.currentUserId);
		wrk.addPostFieldValueForString("lastQuery", app.lastWallMsgQry);
		wrk.addPostFieldValueForInt("tmpMsgId", post.msgId);
		wrk.addPostFieldValueForInt("parentMsgId", post.parentMsgId);	
		wrk.addPostFieldValueForInt("topLevelMsgId", post.topLevelMsgId);	
		wrk.addPostFieldValueForString("postContent", post.msgContent);
						
		wrk.nextDoPostToServerAndThenDo(function(sResult) {
			var obj = jsonParse(sResult);
			hideStatusMsg();
			
			if (obj.status === "postSuccessful") {
				// put this (if) condition below in with the idea of using this save
				// function to {update} Existing posts not just create new ones
				if (post.msgId < 0) {
					post.tmpId = post.msgId;
					setActualId(post.msgId, obj.newMsgId);  // needs to be done BEFORE assigning post.msgId new value!
					post.msgId = obj.newMsgId;
				} // end if
				
				post.msgTimestamp = new Date(obj.msgTimestamp);
				app.postsById[post.msgId] = post;
				
				if (nParentMsgId > 0) {
					parentMsg.repliesById[obj.newMsgId] = post;
				} // end if
				
				if (post.indentLevel === 1) {
					likeLst1 = getDomEl("likeLst1-", parentMsg.msgId); 
					likeLst1.innerHTML = getLikedList1(parentMsg);
				} // end if
			} else {
				alert("Problem!");
				debugger;
			} // end if/else
			
		});	 // end of call-back block	
			
	} // end of function savePost()
	
	
	
   /***************************************************************   
   
   		see: getActualId()   
	***************************************************************/	
	function setActualId(nTempId, nActualId) {
		app.idMapping[nTempId] = nActualId;
	} // end of function setActualId()   
	
	
	
	
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
   		used for debugging
   		see: outputObjId()
    ******************************************************************************/		
	function showObjInfo(sAppDictName, nId) {
		var dict = app[sAppDictName];
		var obj = dict[nId];
		var a = app;   // make local variable version (easier to find in debugger)!
		
		/* check out the values of the [obj] object... */
		debugger;
	} // end of function showObjInfo()
	
	
	
		
	
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
      Filter posts in wall to show only the posts for a specific
      user.
	***************************************************************/	
	function showUsersPosts(nUserId) {
	} // end of function showUsersPosts()
	
	
	
	
   /***************************************************************
      called when user clicks [Sign In] button.
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
   	   start a reply to a comment or to another reply...
   	   
	****************************************************************/ 		
	function startAReplyTo(nMsgId) {
		var txtReply;
		var postReplies;
		var li;
		var s = [];
		var usr;
		var sUserImagePath;
		var msg,nWidth, nIndent, sStyle;
		var Q = '"';
		
		nMsgId = getActualId(nMsgId);
		txtReply = $("#txtReply"+nMsgId)[0];
		
		sUserImagePath = app.defaultUserImagePath;
		
		if (app.currentUserId > 0) {
			usr = app.usersById[app.currentUserId];
			sUserImagePath = usr.userImagePath;
		} // end if
		
		if (typeof txtReply === "undefined") {
			postReplies = $("#postReplies"+nMsgId)[0];
			li = document.createElement("li");
		
			msg = app.postsById[nMsgId];
			
			nIndent = app.indentPixels + 28;
			
			if (msg.indentLevel > 1) {
				nIndent = nIndent + ((app.indentPixels - 24) * (msg.indentLevel-1))
			} // end if
			
			nWidth = app.panelWidth - nIndent;
			
			if (nWidth < 80) {
				nWidth = 80;
			} // end if
			
			sStyle = " style="+Q+"width:"+(nWidth)+"px;"+Q+" ";
			s[s.length] = "<table><tr>";
			s[s.length] = "<td>";
			s[s.length] = "<img src="+Q+sUserImagePath+Q+"' class='replyUsrImg'>";
			s[s.length] = "</td>";
			s[s.length] = "<td><input id='txtReply"+nMsgId+"' ";
			s[s.length] = sStyle;
			s[s.length] = " autocomplete='off' ";
			s[s.length] = "class='txtReply' ";
			s[s.length] = " onkeyup="+Q+"editComment(this,"+nMsgId+")"+Q+" ";
			s[s.length] = " onpaste="+Q+"editComment(this,"+nMsgId+")"+Q+" ";
			s[s.length] = "placeholder='Write a reply...' ";
			s[s.length] = "></td>";
			s[s.length] = "</tr><table>";
			
			li.innerHTML = s.join("");
			postReplies.appendChild(li);
		} // end if
		
		setTimeout("startAReplyTo2("+nMsgId+")",10);
		
	} // end of function startAReplyTo()
	
	
   /****************************************************************
   	   
	****************************************************************/ 	
	function startAReplyTo2(nMsgId) {
		var txtReply = $("#txtReply"+nMsgId)[0];
		
		txtReply.focus();
	} // end of function startAReplyTo(nMsgId) 
	
	
	
	
	
	
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
				
				if (app.afterLogonCmd !== "") {
					processAfterLogonCmdPart1();
				} // end if
				
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
	***************************************************************/	
	function validFirstName(sFirstName) {
	} // end of function validFirstName()
	
	
	
	
	
   /***************************************************************
	***************************************************************/	
	function validLastName(sLastName) {
	} // end of function validLastName()
	
	
   /***************************************************************
	client side check to see if password value is valid
	rules:
	     - has to have at least 6 characters
	     - cannot have any spaces
	     - must have at least 4 letters.
	     - must have at least 1 numeric character.
	     - must have at least 1 punctuation characer from specified list: !@#$%&*-_+=:.
	     
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
	
	
	
	
  /***************************************************************
	
	***************************************************************/	
	function validUserName() {
	} // end of function validUserName()
	
	
	
	
	
	

	
	
	
	
	
	
	
	
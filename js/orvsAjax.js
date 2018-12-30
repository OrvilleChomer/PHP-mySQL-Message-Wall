  /*****************************************************************************************
   

     This Ajax library has a dependency on the JQuery library
	  
	  For (optional) general logging, it also has a dependency on:  orvsDebuggingStuff.js  !!! :)
	  
   Main Post Field Value Methods:
   ===============================
   wrk.addPostFieldValueForString()
   wrk.addPostFieldValueForInt()
   wrk.addPostFieldValueForDate()
   wrk.addPostFieldValueForJsonObj()
   
   wrk.addPostFieldValue() --- generic... original method for posting field values ... 
                               works the same as addPostFieldValueForString()

   ***********************************/


	if (typeof GBL_ORVS_AJX === "undefined") {	 
	   GBL_ORVS_AJX = {};
		GBL_ORVS_AJX.ajaxLogEnabled = false;
	   GBL_ORVS_AJX.jobQueue = [];  // a FIFO job queue
	   GBL_ORVS_AJX.jobsByTag = [];
		GBL_ORVS_AJX.pageSessionKeyNum = getCurrentDateMilli();
	   GBL_ORVS_AJX.queuingOn = false;
	   GBL_ORVS_AJX.runningAnAjaxQuery = false;
	   
	    // 08/10/2016
	//   GBL_AJX.ajaxPageLogByIndex = []; 
	 //  GBL_AJX.ajaxPageLogByAction = []; 

	} // end if (typeof GBL_ORVS_AJX === "undefined")



   /************************************************

   *************************************************/
	function getCurrentDateMilli() {
	   var dt = new Date();
	   return dt.valueOf();
	} // end of function getCurrentDateMilli() 



function makeAJAXWorkObj() {
   var wrk = {};
   var sPostData = "";
   var sURL;
   var sResponse;
   var nPos,nPos2;
   var nPosConR1,nPosConR2; 
   var ajx; // 


   wrk.lastErrorResult = ""; //
   wrk.readyState = READY_STATE_UNINITIALIZED;  
   wrk.status = -1; // 
   wrk.statusText = ""; // 

   wrk.connectionResetError = false;    // 
   wrk.postOperationTakingPlace = false;  // 
   wrk.postOperationCompleted = false;  // 
   wrk.postOperationAbortRequested = false;  // 
   wrk.objectType = "AJAX Object";  // 
   wrk.millisecondsTaken = -1;
   wrk.runTime = "";
   wrk.postURL = "";
   wrk.postDataByIndex = [];
   wrk.postDataByFieldName = [];
   wrk.postJobRunning = false;
   wrk.errorOnPostDuplicateFieldName = true;
   wrk.useLocalStore = false;
   

   /*

   */
   wrk.beginningOfAnAJAXTransactionForURL = function(siURL) {
      var wrk2 = this; 

      if (typeof siURL === "undefined") {
         throw new Error("wrk.beginningOfAnAJAXTransactionForURL(): parameter value is 'undefined'.");
         return;
      } // end if

      wrk2.attempts = 0;  // library will try n times to do ajax call if a status of 0 is returned
                          // this is just initializing it before we increment the counter

      wrk2.postURL = siURL;
      wrk2.postDataByIndex = [];
      wrk2.postDataByFieldName = [];
      wrk2.postDataString = "";
      wrk2.serverIpAddress = GBL_ORVS_AJX.serverIpAddress;
      wrk2.metaInfo = {};
      wrk2.metaInfo.dbStoredProcs = [];
      wrk2.metaInfo.dbTables = [];
      wrk2.eventTitle = "AJAX call made";   
   } // end of function wrk.beginningOfAnAJAXTransactionForURL()



   /*
	
   */
   wrk.clearPostedValues = function() {
      var wrk2 = this; //   	  

      wrk2.postDataByIndex = [];
      wrk2.postDataByFieldName = [];
   } // end of function wrk.clearPostedValues()



   // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
   wrk.addPostFieldValueForString = function(sFieldName, sFieldValue) {
      var wrk2 = this; // 
      var sNewFieldValue = betterEscape(sFieldValue);
      var postField = {};
      var oldPostField,nFieldIndex;
      var sDupMsg = wrk.checkForDupField(sFieldName);

      if (sDupMsg !== "") {
         throw new Error(sDupMsg);
         return; // is this needed?
      } // end if

      sNewFieldValue = sNewFieldValue.replace(/[\r\n]/g, "");
      postField.fieldName = sFieldName;
      postField.fieldValue = sNewFieldValue;
      postField.dataType = "String";
      postField.unencodedFieldValue = sFieldValue; 

      if (wrk2.postDataByFieldName[sFieldName]) {
         oldPostField = wrk.postDataByFieldName[sFieldName];
         nFieldIndex = oldPostField.fieldIndex;
         postField.fieldIndex = nFieldIndex;
         wrk2.postDataByFieldName[sFieldName] = postField;
         wrk2.postDataByIndex[nFieldIndex] = postField;
      } else {
         wrk2.postDataByFieldName[sFieldName] = postField;
         postField.fieldIndex = wrk2.postDataByIndex.length;
         wrk2.postDataByIndex[postField.fieldIndex] = postField;
      } // end if

   } // end of function



   /*
	*/
   wrk.addPostFieldValueForInt = function(sFieldName, sFieldValue) {
      var wrk2 = this;
      var sNewFieldValue = betterEscape(sFieldValue);
      var postField = {};
      var oldPostField,nFieldIndex;
      var sDupMsg = wrk.checkForDupField(sFieldName);
      var sErrMsg = "";   

      if (sDupMsg !== "") {
         throw new Error(sDupMsg);
         return; // is this needed?
      } // end if

      sNewFieldValue = sNewFieldValue.replace(/[\r\n]/g, "");

      if (isNaN(sNewFieldValue)) {
         sErrMsg = "wrk.addPostFieldValueForInt: ";
         sErrMsg = sErrMsg + "Posting Non-numeric value to Numeric Field: "+sFieldName;
         sErrMsg = sErrMsg + " Bad Value: '"+sNewFieldValue+"'";
         throw new Error(sErrMsg);
         return;
      } // end if    

      postField.fieldName = sFieldName;
      postField.fieldValue = sNewFieldValue;
      postField.dataType = "int";

      if (wrk.postDataByFieldName[sFieldName]) {
         oldPostField = wrk2.postDataByFieldName[sFieldName];
         nFieldIndex = oldPostField.fieldIndex;
         postField.fieldIndex = nFieldIndex;
         wrk2.postDataByFieldName[sFieldName] = postField;
         wrk2.postDataByIndex[nFieldIndex] = postField;
      } else {
         wrk2.postDataByFieldName[sFieldName] = postField;
         postField.fieldIndex = wrk2.postDataByIndex.length;
         wrk2.postDataByIndex[postField.fieldIndex] = postField;
      } // end if

   } // end of function



   /*    
   */
   wrk.addPostFieldValueForDate = function(sFieldName, sFieldValue) {
      var wrk2 = this;
      var sNewFieldValue = betterEscape(sFieldValue);
      var postField = {};
      var oldPostField,nFieldIndex;
      var sDupMsg = wrk2.checkForDupField(sFieldName);
      var sMonth,sDay;

      if (sDupMsg !== "") {
         throw new Error(sDupMsg);
         return; // is this needed?
      } // end if



      // if date value was passed in instead of a formatted string containing a date...
      // convert it into a formatted string containing a date!!! (mm/dd/yyyy)
      if (sFieldName instanceof Date) {
      		sMonth = sFieldName.getMonth();

      		if (sMonth.length===1) {
      			sMonth = "0"+sMonth;
      		} // end if

      		sDay = sFieldName.getDate();

      		if (sDay.length===1) {
      			sDay = "0"+sDay;
      		} // end if

      		sFieldName = sMonth+"/"+sDay+"/"+sFieldName.getYear();
      } // end if (sFieldName instanceof Date)



      sNewFieldValue = sNewFieldValue.replace(/[\r\n]/g, "");
      postField.fieldName = sFieldName;
      postField.fieldValue = sNewFieldValue;
      postField.dataType = "Date";


      if (wrk2.postDataByFieldName[sFieldName]) {
         oldPostField = wrk2.postDataByFieldName[sFieldName];
         nFieldIndex = oldPostField.fieldIndex;
         postField.fieldIndex = nFieldIndex;
         wrk2.postDataByFieldName[sFieldName] = postField;
         wrk2.postDataByIndex[nFieldIndex] = postField;
      } else {
         wrk2.postDataByFieldName[sFieldName] = postField;
         postField.fieldIndex = wrk2.postDataByIndex.length;
         wrk2.postDataByIndex[postField.fieldIndex] = postField;
      } // end if

   } // end of function addPostFieldValueForDate()
   



   /****************************************************************

      Method makes it easy to post a JS object in Ajax call.

   *****************************************************************/
   wrk.addPostFieldValueForJsonObj = function(sFieldName,jsObj) {

      var wrk2 = this; 
      var sNewFieldValue = JSON.stringify(jsObj);
      var postField = {};
      var sDupMsg = wrk2.checkForDupField(sFieldName);
      var nFieldIndex,oldPostField;      

      if (sDupMsg !== "") {
         throw new Error(sDupMsg);
         return; // is this needed?
      } // end if           

      postField.fieldName = sFieldName;
      postField.fieldValue = sNewFieldValue;
      postField.dataType = "JsonObject";      

      if (wrk2.postDataByFieldName[sFieldName]) {
         oldPostField = wrk2.postDataByFieldName[sFieldName];
         nFieldIndex = oldPostField.fieldIndex;
         postField.fieldIndex = nFieldIndex;
         wrk2.postDataByFieldName[sFieldName] = postField;
         wrk2.postDataByIndex[nFieldIndex] = postField;
      } else {
         wrk2.postDataByFieldName[sFieldName] = postField;
         postField.fieldIndex = wrk2.postDataByIndex.length;
         wrk2.postDataByIndex[postField.fieldIndex] = postField;
      } // end if / else

   } // end of function addPostFieldValueForJsonObj()


   /******************************************************************************************
      http://www.nczonline.net/blog/2009/03/03/the-art-of-throwing-javascript-errors/
    ******************************************************************************************/
   wrk.checkForDupField = function(sFieldName) {
      var wrk2 = this;
      var sDupMsg = "";

      if (wrk2.postDataByFieldName[sFieldName] && wrk2.errorOnPostDuplicateFieldName) {
         sDupMsg = "wrk.addPostFieldValue(): Duplicate Field Posting: The ["+sFieldName+"] field has already been added to this Ajax Post object.";
      } // end if

      return sDupMsg;
   } // end of wrk.checkForDupField() method



   // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

   wrk.addPostFieldValue = function(sFieldName,sFieldValue) {
      var wrk2 = this;
      var sNewFieldValue = betterEscape(sFieldValue);
      var postField = {};
      var oldPostField,nFieldIndex;
      var sDupMsg = wrk.checkForDupField(sFieldName);

      if (sDupMsg !== "") {
         throw new Error(sDupMsg);
         return; // is this needed?
      } // end if

      sNewFieldValue = sNewFieldValue.replace(/[\r\n]/g, "");
      postField.fieldName = sFieldName;
      postField.fieldValue = sNewFieldValue;
      postField.dataType = "String"; 

      if (wrk2.postDataByFieldName[sFieldName]) {
         oldPostField = wrk.postDataByFieldName[sFieldName];
         nFieldIndex = oldPostField.fieldIndex;
         postField.fieldIndex = nFieldIndex;
         wrk2.postDataByFieldName[sFieldName] = postField;
         wrk2.postDataByIndex[nFieldIndex] = postField;
      } else {
         wrk2.postDataByFieldName[sFieldName] = postField;
         postField.fieldIndex = wrk.postDataByIndex.length;
         wrk2.postDataByIndex[postField.fieldIndex] = postField;
      } // end if

   } // end of wrk.addPostFieldValue()



   // ### Queuing Methods work Globally! ###   



   /*
	*/
   wrk.setQueingOn = function() {
      GBL_ORVS_AJX.queuingOn = true;
   } // end of function





   /*
   */
   wrk.setQueingOff = function() {
      GBL_ORVS_AJX.queuingOn = false;
      GBL_ORVS_AJX.jobQueue = [];
      GBL_ORVS_AJX.jobsByTag = [];
   } // end of wrk.setQueingOff() method



   // #################################################################################







   // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
   wrk.pendingAJAXJobCount = function() {
      return GBL_ORVS_AJX.jobQueue.length;
   } // end of function





   // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
   wrk.nextDoPostToServerAndThenDo = function(functionToRunAfterReceivingResponse) {
      var wrk2 = this; 
      var jobEntry = {};
      var postField,n,nMax;
      var sPostData = [];
      var sPostFieldNameList = "";
      var sPostFieldTypeList = "";

      wrk2.rawStackTraceInfo = getJScallStackForAjaxCall(); 
  //    ODS_getJsStackInfo(wrk2);  // in orvsDebuggingStuff.js      

      nMax = wrk2.postDataByIndex.length;
      for (n=0;n<nMax;n++) {
         postField = wrk2.postDataByIndex[n];
         sPostData[sPostData.length] = "&";
         sPostData[sPostData.length] = postField.fieldName;
         sPostData[sPostData.length] = "=";
         sPostData[sPostData.length] = postField.fieldValue;

         if (n>0) {
         	sPostFieldNameList = sPostFieldNameList + ",";
         	sPostFieldTypeList = sPostFieldTypeList + ",";
         } // end if

         sPostFieldNameList = sPostFieldNameList + postField.fieldName;
         sPostFieldTypeList = sPostFieldTypeList + postField.dataType;
      } // next n

      // create our "cheat sheet" to pass to the server to use:
      sPostData[sPostData.length] = "&post_field_name_list=" + sPostFieldNameList;
      sPostData[sPostData.length] = "&post_field_data_type_list=" + sPostFieldTypeList;

      if (!GBL_ORVS_AJX.queuingOn) {
         wrk.postDataString = sPostData.join("");
         wrk.nextDoPostToServerAndThenDo2(functionToRunAfterReceivingResponse);
      } else {
         jobEntry.postString = sPostData.join("");
         jobEntry.returnFunction = functionToRunAfterReceivingResponse;
         jobEntry.postURL = wrk2.postURL;
         jobEntry.createdAt = new Date();
         GBL_ORVS_AJX.jobQueue[GBL_AJX.jobQueue.length] = jobEntry;

         if (!GBL_ORVS_AJX.runningAnAjaxQuery) {
            wrk.nextDoPostToServerAndThenDo2(functionToRunAfterReceivingResponse);
            return;
         } // end if
      } // end if

   } // end of function wrk.nextDoPostToServerAndThenDo()




   // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
   wrk.nextDoPostToServerAndThenDo2 = function(functionToRunAfterReceivingResponse) {
      var wrk2 = this;
      var datStartTime;
      var datEndTime;
      var nMinutes,nSeconds;
      var jobEntry;
      var sPostURL,sPostString;

      if (GBL_ORVS_AJX.queuingOn && GBL_ORVS_AJX.jobQueue.length === 0) {
         return;
      } // end if

      GBL_ORVS_AJX.runningAnAjaxQuery = true;
      sPostURL = wrk2.postURL;
      sPostString = wrk2.postDataString;

	   // to make Ajax log entry stand out in log display from other entries
      wrk2.fontColor = "red"; 
      wrk2.backgroundColor = "wheat";

      if (typeof sPostURL === "undefined") {
         debugger;
         return;
      } // end if

      wrk2.attempts = wrk2.attempts + 1;


      // new FIFO job queue code:
      if (GBL_ORVS_AJX.queuingOn) {
         jobEntry = GBL_ORVS_AJX.jobQueue[0];
         sPostURL = jobEntry.postURL;
         sPostString = jobEntry.postString;
         functionToRunAfterReceivingResponse = jobEntry.returnFunction;
         GBL_ORVS_AJX.jobQueue.remove(0);  // remove method setup in: [root]/publicScripts/general.js
      } // end if

      ajx = createAJAXPostObject(sPostURL, sPostString); // variable is now declared one level up (not in call-back)!

      ajx.onreadystatechange = function () {
         var wrkCopy;

         if (typeof wrk.debug !== "undefined") {
            debugger;
         } // end if

         try {
            wrk2.readyState = ajx.readyState; // expose readyState
         } catch(err) {
         } // end of try/catch

         try {
            wrk2.status = ajx.status;
         } catch(err) {
         } // end try/catch


         try {
            wrk2.statusText = ajx.statusText+"";
         } catch(err) {
         } // end try/catch


         if (ajx.readyState === READY_STATE_UNINITIALIZED) {
         } // end if

         if (ajx.readyState === READY_STATE_LOADING) {
         } // end if

         if (ajx.readyState === READY_STATE_LOADED) {
         } // end if

         if (ajx.readyState === READY_STATE_INTERACTIVE) {
         } // end if

         if (ajx.readyState === READY_STATE_COMPLETE) {
            datEndTime = new Date();
            wrk2.postOperationTakingPlace = false;
            wrk2.postOperationCompleted = true;

            if (wrk2.postOperationAbortRequested) {
               GBL_AJX.runningAnAjaxQuery = false;
               return;
            } // end if

            wrk2.endTime = datEndTime;
            wrk2.millisecondsTaken = datEndTime - datStartTime;
            nSeconds = wrk2.millisecondsTaken / 1000;
            nMinutes = 0;

            if (nSeconds >59) {
               nMinutes = Math.floor(nSeconds / 60);
               nSeconds = nSeconds - nMinutes * 60;
            } // end if

            wrk2.runTime = "";

            if (nMinutes > 0) {
               wrk2.runTime = wrk2.runTime + nMinutes+" Minutes";
            } // end if

            if (nMinutes > 0 && nSeconds > 0) {
               wrk2.runTime = wrk2.runTime + " and ";
            } // end if



            if (nSeconds > 0) {
               wrk2.runTime = wrk2.runTime + nSeconds.toFixed(2)+" Seconds";
            } // end if

            wrk2.responseText = ajx.responseText+"";   // 06/05/2013 -Orville Chomer
            sResponse = ajx.responseText+"";
            wrk2.ajaxError = false;
            

            // Stuff to catch a error for a database connection reset:
            nPosConR1 = sResponse.indexOf("Error Executing Database Query");
            nPosConR2 = sResponse.indexOf("Connection reset");

            if (nPosConR1>-1 && nPosConR2>-1) {
               wrk2.connectionResetError = true;
               return "~@@connection reset";
            } // end if



            nPos = sResponse.indexOf("Error Occurred");
            nPos2 = sResponse.indexOf("JRun Servlet Error");
			   nPos3 = sResponse.indexOf("<title>Struts Problem Report</title>");

            if (nPos===-1 && nPos2===-1 && nPos3 ===-1 && ajx.status === 200) {
               /*******************************************************************
                  keep a running log of all Ajax calls (this is for non-errors)
                *******************************************************************/
               wrk2.operationType = "ajaxCall";

               try {
                  wrkCopy = Object.create(wrk2);
                  GBL_AJX.ajaxLogEnabled = true;
                  ORVS_DEBUG_STUFF.pageLogByIndex[ORVS_DEBUG_STUFF.pageLogByIndex.length] = wrkCopy;
               } catch(err) {
                  // right now do not do anything.
                  // we get here if browser does not support Object.create() !
               } // end of try/catch

               GBL_ORVS_AJX.runningAnAjaxQuery = false;
               functionToRunAfterReceivingResponse(sResponse);

               if (GBL_ORVS_AJX.queuingOn && GBL_AJX.jobQueue.length > 0) {
                  ajx = undefined; // we are done with this object so let's release it from memory!

                  // param below really doesn't matter since the value will be replaced anyways...
                  wrk2.nextDoPostToServerAndThenDo2(functionToRunAfterReceivingResponse);
                  return;
               } // end if
            } else {
              /**********************************************************************************
                 It seems that a status code of zero (0) can cause a bunch of different
                 types of errors... a cross domain error is just one of them
                 a timed out URL, a web api undergoing maintenance, etc. see URL below:                  

                   http://stackoverflow.com/questions/872206/http-status-code-0-what-does-this-mean-in-ms-xmlhttp

                 so, we are no longer assuming that this code means a cross-domain error.
                 sadly there seems to be no way to determine programatically what is the Real
                 Http Status code for the problem.
               **********************************************************************************/
               if (ajx.status === 0) {
                  if (wrk2.attempts < 3) {                  

                  } // end if

                  sResponse = "<p><h2 style='color:red;'>Unknown Error...</h2></p><hr><br>"+sResponse;
               } // end if              

               wrk2.ajaxError = true;
               addErrorScreen(sPostURL, sResponse, wrk2);
               GBL_ORVS_AJX.runningAnAjaxQuery = false;
               
               /*
                  keep a running log of all Ajax calls (this is for errors)
               */
               wrkCopy = Object.create(wrk2);
               wrk2.ajaxLogErrorIndex = ORVS_DEBUG_STUFF.pageLogByIndex.length;
               ORVS_DEBUG_STUFF.pageLogByIndex[ORVS_DEBUG_STUFF.pageLogByIndex.length] = wrkCopy;
            } // end if

            ajx = undefined; // we are done with this object so let's release it from memory!
         } // end if (ajx.readyState === READY_STATE_COMPLETE)

      } // end of onreadystatechange() event handler (call-back)

      wrk2.postOperationTakingPlace = true;
      wrk2.postOperationCompleted = false;
      wrk2.postOperationAbortRequested = false;
      datStartTime = new Date();
      wrk2.startTime = datStartTime;
      wrk2.millisecondsTaken = -1;
      wrk2.runTime = "";
      ajx.send(sPostString); 

   } // end of function wrk.nextDoPostToServerAndThenDo()



	/*
	*/
   wrk.abort = function() {
      var wrk2 = this;      

      wrk2.postOperationAbortRequested = true;
		
      if (typeof ajx !== "undefined") {
         if (ajx.readyState !== READY_STATE_COMPLETE) {
            try {
               ajx.abort(); // standard abort method of AJAX component
            } catch(err) {
            } // end of try/catch

         } // end if
      } // end if
   } // end of function wrk.abort()

   return wrk;  // should Not be wrk2 variable!

} // end of function makeAJAXWorkObj()





	// create err msg GUI:	
	function setUpAjaxErrorMsgGui() {	
		var bdy = document.getElementsByTagName("body")[0];	
		var errBtn = document.createElement("div");	
		var dspErrs = document.createElement("div");	
		var s = [];	
		var nZindex = getMaxZindexForPage()+1;  // function in general.js	
		var tintPanel = $("#tintPanel")[0];
	
	
	
		if (typeof tintPanel === "undefined") {
	
			tintPanel = document.createElement("div");
	
			tintPanel.setAttribute("id", "tintPanel");
	
			tintPanel.style.zIndex = ""+(nZindex+1);
	
			tintPanel.style.backgroundColor = "black";
	
			tintPanel.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=60)";
	
			tintPanel.style.opacity = "0.6";
	
			tintPanel.style.position = "absolute";
	
			tintPanel.style.top = "0px";
	
			tintPanel.style.left = "0px";
	
			bdy.appendChild(tintPanel);
	
		} // end if
	
	
	
		errBtn.setAttribute("id", "errBtn");
	
		errBtn.style.position = "absolute";
	
		errBtn.style.top = "4px";
	
		errBtn.style.left = "4px";
	
		errBtn.style.width = "16px";
	
		errBtn.style.height = "16px";
	
		errBtn.style.cursor = "pointer";
	
		errBtn.style.zIndex = ""+nZindex;
	
		
	
		if (errBtn.addEventListener) {
	
			  errBtn.addEventListener("click", displayErrorInfo);
	
		} else {
	
			// IE 8 compatible code:
	
			errBtn.attachEvent("onclick", displayErrorInfo);
	
		} // end if / else
	
		
	
		s[s.length] = "<img src="+Q+CSM.AppPath+"assets/images/warning2.jpg"+Q+" width=16 height=16 border=0 id='warningIcon'>";
	
		errBtn.innerHTML = s.join("");
	
		bdy.appendChild(errBtn);
	
	
	
		dspErrs.setAttribute("id", "dspErrs");
	
		dspErrs.style.position = "absolute";
	
		dspErrs.style.top = "40px";
	
		dspErrs.style.left = "200px";
	
		dspErrs.style.width = "850px";
	
		dspErrs.style.height = "550px";
	
		dspErrs.style.border = "outset 1px";
	
		dspErrs.style.backgroundColor = "silver";
	
		dspErrs.style.display = "none";
	
		dspErrs.style.zIndex = ""+(nZindex+2);
	
		
	
		s= [];
	
		s[s.length] = "<center>";
	
		s[s.length] = "<table><tr><td colspan=2 align='center' style="+Q;
	
		s[s.length] = "filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#363636', endColorstr='#575958');";
	
		s[s.length] = "background: -ms-linear-gradient(top, #363636, #575958);"+Q+">";
	
		s[s.length] = "<b style='color:white;'>AJAX Errors</b></td></tr>";
	
		s[s.length] = "<tr valign='top'><td>";
	
		s[s.length] = "<select size='13' id='errLst' style='width:190;height:490;' onchange='displayErrorDetails()'>";
	
		s[s.length] = "</select></td><td><div id='errPage' style='width:640;height:486;border:solid black 1pxx;overflow:auto;'></div></td>";
	
		s[s.length] = "</tr><tr><td colspan='2' align='center'>";
	
		s[s.length] = "<button onclick='clearErrorList()'>Clear</button>&nbsp;";
	
		s[s.length] = "<button onclick='hideErrorPanel()'>Close</button>";
	
		s[s.length] = "</td></tr></table></center>";
	
		
	
		dspErrs.innerHTML = s.join("");
	
		bdy.appendChild(dspErrs);
	
	} // end of function







  /******************************************************************
	   Make it so any any errors on a page being called by using AJAX
		can be displayed:
	******************************************************************/
	function addErrorScreen(sPostURL,sInput, wrk2) {	
		var errPage = {};	
		var errBtn = $("#errBtn")[0];	
		var warningIcon = $("#warningIcon")[0];	
		var tintPanel = $("#tintPanel")[0];	
		var Q = String.fromCharCode(34);	
		var nPos,sWork,errObj,endOfErrorMsg,err,nMax,n,sStyle;	
		var sJsStack;		
	
		if (typeof tintPanel !== "undefined") {	
			tintPanel.style.display = "none";	
		} // end if
			
		if (typeof errBtn === "undefined") {	
			setUpAjaxErrorMsgGui();	
			errBtn = $("#errBtn")[0];	
			warningIcon = $("#warningIcon")[0];	
		} // end if (typeof errBtn === "undefined")	
		
		nPos = sInput.indexOf("{"+Q+"exceptionStatus"+Q+":"+Q+"Error Occurred"+Q+",");
	
		if (nPos > -1) {	
			sWork = sInput.substr(nPos, sInput.length - nPos);	
			endOfErrorMsg = ","+Q+"endOfErrorMsg"+Q+":";	
			nPos = sWork.indexOf(endOfErrorMsg);	
			sWork = sWork.substr(0, nPos)+"}";	
			errObj = eval("("+sWork+")");			
	
			sWork = [];				
			sWork[sWork.length] = "Class Name:  "+errObj.className;	
			sWork[sWork.length] = "Error Message:  "+errObj.errorMsg;	
			nMax = errObj.stackTrace.length;	
			sWork[sWork.length] = "<ul>";
	
			for (n=0;n<nMax;n++) {	
				 err = errObj.stackTrace[n];	
				 sStyle = "";				 
	
				 if (n===0) {	
					 sStyle = "background-color:yellow;";	
				 } // end if	
				 	
				 sWork[sWork.length] = "<li style="+Q+sStyle+Q+">";	
				 sWork[sWork.length] = "<ul>";	
					 sWork[sWork.length] = "<li>Class Name:  ";	
					 sWork[sWork.length] = err.className;
		
					 sWork[sWork.length] = "</li>";	
					 sWork[sWork.length] = "<li>File Name:  ";	
					 sWork[sWork.length] = err.fileName;	
					 sWork[sWork.length] = "</li>";
		
					 sWork[sWork.length] = "<li>Method Name:  ";	
					 sWork[sWork.length] = err.MethodName;	
					 sWork[sWork.length] = "</li>";
		
					 sWork[sWork.length] = "<li>Line Number:  ";	
					 sWork[sWork.length] = err.lineNum;	
					 sWork[sWork.length] = "</li>";	
			    sWork[sWork.length] = "</ul>";
	
				 sWork[sWork.length] = "</li>";	
			} // next n
	
			sWork[sWork.length] = "</ul>";	
			sInput = sWork.join("");	
		} // end if
	
				
	
		// If a JavaScript call stack is available include it in the output!
		if (wrk2.rawStackTraceInfo !== "") {	
			sInput = sInput + "<div style='color:black;'><h4>JavaScript Call Stack Trace:</h4>";	
			sInput = sInput + wrk2.rawStackTraceInfo;	
			sInput = sInput + "</div>";	
		} // end if	
		
	
		sInput =sInput + getPostList(wrk2); // shows what fields were posted
	
		errPage.errorMsg = sInput;	
		errPage.url = sPostURL;	
		errPage.timeStamp = new Date();	
		
		if (typeof ORVS_DEBUG_STUFF.errorPages === "undefined") {	
			ORVS_DEBUG_STUFF.errorPages = [];	
		} // end if
		
		ORVS_DEBUG_STUFF.errorPages[CSM.errorPages.length] = errPage;
	
		if (errBtn.style.display!=="inline") {
			errBtn.style.display="inline"; // show error button
			warningIcon.style.display="inline"; // make sure button icon is visible
			errBtn.title="Error(s) have happened in background\nClick here to view error details";
			setTimeout("flashWarningIcon()",800);	
		} // end if
	
	} // end of function addErrorScreen()




function displayErrorInfo() {

   var dspErrs = $("#dspErrs")[0];

   var lstErrs = $("#errLst")[0];

   var n,nMax;

   var errPage;

   var sCaption="";



   SCRN.tintPanelStyle.display="inline";





   lstErrs.options.length=0;

   nMax = CSM.errorPages.length;



   for (n=0;n<nMax;n++) {

      errPage = CSM.errorPages[n];

      sCaption = errPage.timeStamp;



      lstErrs.options[n] = new Option(sCaption, n+"");

   } // next n



   if (nMax>0) {

      lstErrs.selectedIndex = 0;

   } // end if



   displayErrorDetails();



   dspErrs.style.display="inline";





} // end of function









	function displayErrorDetails() {
	   var lstErrs = $("#errLst")[0];
	   var errMsg = $("#errPage")[0];
	   var errPage = CSM.errorPages[lstErrs.selectedIndex];
	   var sErrTxt = "<p><br><center><h4 style='color:red;background-color:yellow;'>AJAX URL: <span style='color:blue;'>";

	   sErrTxt = errPage.url+"</span></h4></center></p>"+errPage.errorMsg;
	   errMsg.innerHTML = sErrTxt;

	} // end of function







function getJScallStackForAjaxCall() {

   var sResult = getJScallStackForAjaxCall2();

   var nPos;

   

   if (sResult !== "") {

      nPos = sResult.indexOf("at wrk.nextDoPostToServerAndThenDo (");

      

      if (nPos > -1) {

         sResult = sResult.substr(nPos, sResult.length - nPos)+ " ";

         nPos = sResult.indexOf(")");

         sResult = sResult.substr(nPos + 1, sResult.length - nPos-1);

      } // end if

   } // end if

   

   return sResult;

} // end of function





function getPostList(wrk) {

	var nMax = wrk.postDataByIndex.length;

	var n;

	var s = [];

	var postField;

	

	if (nMax===0) {

	   return "<h4>No values were posted to this Action</h4>";

	} // end if

	

	s[s.length] = "<h4>Fields Posted:</h4>";

	s[s.length] = "<table>";

	s[s.length] = "<tr>";

	s[s.length] = "<td nowrap style='color:black;background-color:lightblue;'>Field Name</td>";

	s[s.length] = "<td nowrap style='color:black;background-color:lightblue;'>Field type</td>";

	s[s.length] = "<td nowrap style='color:black;background-color:lightblue;'>Field Value</td>";

	s[s.length] = "</tr>";

	

	for (n=0;n<nMax;n++) {

		postField = wrk.postDataByIndex[n];

		s[s.length] = "<tr>";

		s[s.length] = "<td nowrap style='color:black;background-color:white;'>"+postField.fieldName+"</td>";

		s[s.length] = "<td nowrap style='color:black;background-color:white;'>"+postField.dataType+"</td>";

		s[s.length] = "<td style='color:black;background-color:white;'>"+escape(postField.fieldValue)+"</td>";

		s[s.length] = "</tr>";

	} // next n

	

	s[s.length] = "</table>";



	return s.join("");

} // end of function





function getJScallStackForAjaxCall2() {

   var sResult = "";

   

   try {

      eval("will Generate JS err"); // bad JS delibrately to throw an error!

      return sResult;

   } catch(err) {

      if (err.stack) {

         sResult = err.stack;

      } // end if

      return sResult;

   } // end of try /catch

} // end of function





	function clearErrorList() {
	
		var errBtn = $("#errBtn")[0];	
	
		if (!confirm("Are you sure?")) {	
			return;	
		} // end if
	
	
	
		CSM.errorPages = [];	
		errBtn.style.display="none";	
		hideErrorPanel();	
		
	} // end of function

	
	
	function hideErrorPanel() {	
		var dspErrs = $("#dspErrs")[0];	
		dspErrs.style.display="none";	
		SCRN.tintPanelStyle.display="none";	
	} // end of function hideErrorPanel()



	function flashWarningIcon() {
	
		var errBtn = $("#errBtn")[0];
	
		var warningIcon = $("#warningIcon")[0];
	
	
	
		if (errBtn.style.display !== "none") {
	
			if (warningIcon.style.display === "none") {
	
				warningIcon.style.display = "inline";
	
			} else {
	
				warningIcon.style.display = "none";
	
			} // end if
	
			setTimeout("flashWarningIcon()",800);
	
		} // end if
	
	} // end of function











	  /***********
        Escape function for use instead of the regular escape function.        |

      ****/
      function betterEscape(sInput) {
         var re = new RegExp("\\+","g"); // look for the plus character in our string globally
         var sWork = escape(sInput);  // use standard javascript escape function first
         sWork = sWork.replace(re,"%2B");
         return sWork;
      } // end of function betterEscape(sInput)

   
   // *** AJAX "CONSTANTS"
   var READY_STATE_UNINITIALIZED = 0;
   var READY_STATE_LOADING = 1;
   var READY_STATE_LOADED = 2;
   var READY_STATE_INTERACTIVE = 3;
   var READY_STATE_COMPLETE = 4;


   function createAJAXPostObject(sURL,sParams) {
      var dt = new Date();
      var ajx = createAJAXObject();
      var sDelim = "&";
      var nPos;
		
      if (typeof ajx === "undefined") {
         throw new Error("createAJAXPostObject()... ajx object is undefined (comes from createAJAXObject() function).");
         return;
      } // end if

      if (typeof sURL === "undefined") {
         throw new Error("createAJAXPostObject()... sURL is undefined.");
         return;
      } // end if

      if (sURL.indexOf("?")===-1) {
         sDelim = "?";
      } // end if
		
      sURL = sURL + sDelim+"m="+dt.valueOf();        
      ajx.open("POST", sURL, true);

      //Send the proper header information along with the request:
      ajx.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      ajx.setRequestHeader("Content-length", sParams.length);
      ajx.setRequestHeader("Connection", "close");

      return ajx;
   } // end of function createAJAXPostObject()


     
   function createWebServicePostObject(sURL,sParams) {
      var dt = new Date();
      var ajx = createAJAXObject();
      var sDelim = "&";

      if (sURL.indexOf("?")===-1) {
         sDelim = "?";
      } // end if

      sURL = sURL + sDelim+"m="+dt.valueOf();
      ajx.open("POST", sURL, true);

      //Send the proper header information along with the request:
      setAjaxRequestHdr(ajx,"Accept-Encoding", "gzip,deflate");
      setAjaxRequestHdr(ajx,"Content-type", "text/xml;charset=UTF-8");
      setAjaxRequestHdr(ajx,"SOAPAction", "http://tempuri.org/GetProductList");
      setAjaxRequestHdr(ajx,"User-Agent", "Jakarta Commons-HttpClient/3.1");
      setAjaxRequestHdr(ajx,"Host", "???");
      setAjaxRequestHdr(ajx,"Content-length", sParams.length+"");
     //    ajx.setRequestHeader("Connection", "close");

      return ajx;
   } // end of function createWebServicePostObject()


	/*
		function put in to handle older browsers
	*/ 
	function setAjaxRequestHdr(ajx, sParam, sValue) {
		try {
			ajx.setRequestHeader(sParam, sValue);
		} catch(err) {
		} // end of try / catch block
	} // end of function
	

	function createAJAXAsSyncronPostObject(sURL,sParams) {
		var dt = new Date();
		var ajx = createAJAXObject();
		var sDelim = "&";

		if (sURL.indexOf("?")===-1) {
			sDelim = "?";
		} // end if

		sURL = sURL + sDelim+"m="+dt.valueOf();
      ajx.open("POST", sURL, true);

		// Send the proper header information along with the request:
	   ajx.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		ajx.setRequestHeader("Content-length", sParams.length);
		ajx.setRequestHeader("Connection", "close");
				
		return ajx;
	} // end of function createAJAXAsSyncronPostObject()



   /*********************************************************************************
      CREATE AJAX OBJECT
   *****************/

   function createAJAXObject() {
      var aVersions;
      var oXmlHttp,i;

      if (typeof XMLHttpRequest !== "undefined") {
         return new XMLHttpRequest();
      } else if (window.ActiveXObject) {
         aVersions = [ "MSXML2.XMLHttp.5.0",
                       "MSXML2.XMLHttp.4.0", "MSXML2.XMLHttp.3.0",
                       "MSXML2.XMLHttp", "Microsoft.XMLHttp"];

         for (i=0; i < aVersions.length; i++) {
            try {
               oXmlHttp = new ActiveXObject(aVersions[i]);
               return oXmlHttp;
            } catch (oError) {
               // do nothing
            } // end of try / catch block
         } // next i

      } // end if / else block
	 
      throw new Error("XMLHttp Object could not be created.   createAJAXObject() function.");
   }// end of function createAJAXObject()
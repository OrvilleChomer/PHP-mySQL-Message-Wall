<?php
	require_once '../pdo_connect.php';
	require_once './getWallMessages.php';
	
	
/*
   do user update operations
   
   note:
      logonHashCode is used for:
         - logging in
         - signing up
         - changing user password
         - updating user profile
         - checking validity during input of user values
         
 */
 
 	$sLogonHashCode = $_POST["logonHashCode"];
 	
 	
 	if ($_SESSION["logonHashCode"] != $sLogonHashCode) {
		echo '{' . "\n";
		echo '"status":"fail",' . "\n";
		echo '"reason":"1",' . "\n";
		outputLatestWallMessages(0);
		echo '}';
		return;
	} // end if
 
 	// don't let it linger! ...
 	unset($_SESSION['logonHashCode']);
 	
    $sOperation = $_POST["opp"];
 
 	if ($sOperation == "add") {
 		addNewUser(); 	
 		return;	
 	} // end if
 	
 	if ($sOperation == "update") {
 		updateUserProfile();
 		return;	
 	} // end if
 	
 	if ($sOperation == "chgpwd") {
 		changePassword();
 		return;	
 	} // end if
 	
 	
 	
   /******************************************************************************
 	   AJAX CALL...
 	   
 	   JS File:       msgWallDemo.js
 	   JS Function:   signUp()
 	******************************************************************************/
 	function addNewUser() {
 		// $sInvitationCodes value is set up in pdo_connect.php
 		$sInvitationCodes = $GLOBALS['sInvitationCodes'];
 		
 		if ($sInvitationCodes !== "") {
 		    $bInvCodeFound = false;
 			$aInvitationCodes = explode(',',$sInvitationCodes);
 			$sInvCode = $_POST["invCode"];
 			$nMax = sizeof($aInvitationCodes);
 			for ($n=0;$n < $nMax; $n++) {
 				if ($aInvitationCodes[$n] == $sInvCode) {
 					$bInvCodeFound = true;
 					break;
 				} // end if
 			} // next $n
 			
 			if (!$bInvCodeFound) {
 				// requires a valid invitation code... but none was provided...
 				echo '{' . "\n";
				echo '"status":"fail",' . "\n";
				echo '"reason":"2"';
				outputLatestWallMessages(0);
				echo '}';
				return;
 			} // end if
 			
 		} // end if ($sInvitationCodes !== "") 
 		
		$nTmpId = $_POST["tmpId"];
		$sEmailAdr = $_POST["emailAdr"];
		$sPassword = $_POST["pwd"];
		$sFirstName = $_POST["firstName"];
		$sLastName = $_POST["lastName"];
		
		if (!validateNewUserInputs($nTmpId, $sEmailAdr, $sPassword, $sFirstName, $sLastName)) {
			echo '{' . "\n";
			echo '"status":"fail",' . "\n";
			echo '"reason":"3"' ;
		//	outputLatestWallMessages(0);
			echo '}';
			return;
		} // end if
		
		$db = $GLOBALS['db'];
		
		$sPwdHash = password_hash($sPassword, PASSWORD_DEFAULT);
		
		// got this far? good to go...
		$sql = 'INSERT INTO users (';
		$sql = $sql . '   emailAdr,';
		$sql = $sql . '   pwdHash,';
		$sql = $sql . '   firstName,';
		$sql = $sql . '   lastName,';
		$sql = $sql . '   createDate,';
		$sql = $sql . '   updateDate,';
		$sql = $sql . '   lastLogon ';
		$sql = $sql . ') VALUES(';
		$sql = $sql . '   :emailAdr,';
		$sql = $sql . '   :pwdHash,';
		$sql = $sql . '   :firstName,';
		$sql = $sql . '   :lastName,';
		$sql = $sql . '   NOW(),'; // create date
		$sql = $sql . '   NOW(),'; // update date
		$sql = $sql . '   NOW()'; // last logon date
		$sql = $sql . ')';
		$stmt = $db->prepare($sql);
		$stmt->bindParam(':emailAdr', $sEmailAdr);  
		$stmt->bindParam(':pwdHash', $sPwdHash);  
		$stmt->bindParam(':firstName', $sFirstName);  
		$stmt->bindParam(':lastName', $sLastName);  	
		$stmt->execute();		
 		
 		$newUserId = $db->lastInsertId();
 		$excludeUserId = $newUserId; // added for code clarity
 		
 		
 		
 		$sSubject = 'Successful Signup of ';
 		$sSubject = $sSubject . $sEmailAdr;
 		$sEventDetails = 'Email Address: ' . $sEmailAdr . '<br>';
 		$sEventDetails = $sEventDetails . 'First Name: ' . $sFirstName . '<br>';
 		$sEventDetails = $sEventDetails . 'Last Name: ' . $sLastName . '<br>';
 		$sEventDetails = $sEventDetails . 'New User Id: ' . $newUserId. '<br>';
 		logEvent('signupSuccess', $sSubject, $sEventDetails, 3);
 		
 		echo '{' . "\n";
			echo '"status":"created",' . "\n";
			echo '"tempId":' . $nTmpId . ',' . "\n";
			echo '"newUserId":' . $newUserId;
			outputLatestWallMessages($excludeUserId);
		echo '}';
		return;
 	} // end of function addNewUser()
 	
 	
 	
 	
 	
 	
   /******************************************************************************
 	******************************************************************************/
 	function changePassword() {
 		
 		$sSubject = 'User successfully changed their Password';
 		$sEventDetails = 'User\'s Email Address: ' . $sEmailAdr . '<br>';
 		logEvent('changePwdSuccess', $sSubject, $sEventDetails, 3);
 	} // end of function changePassword() 
 	
 	
 	
 	
   /******************************************************************************
	  is properly formed email?
	  and, is email available for id?
	  
 	******************************************************************************/
 	function checkIfValidEmailAdr($sEmailAdr, $nUserId) {
 		if (strlen($sEmailAdr)  > 200) {
 			return false; // too long!
 		} // end if
 	
 		$regex = '/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/';
 		
 		if (!preg_match($regex, $sEmailAdr)) {
 			return false; // pattern not a valid email address
 		} // end if
 		
 		$sql = 'SELECT userId FROM users WHERE ';
 		$sql = $sql . '   emailAdr = :emailAdr ';
 		$sql = $sql . 'AND ';
 		$sql = $sql . '   userId <> :userId ';
 		$stmt = $db->prepare($sql);
 		$stmt->bindParam(':emailAdr', $sEmailAdr);  
 		$stmt->bindParam(':userId', $nUserId, PDO::PARAM_INT);
 		$stmt->execute();
 		
 		while ($row = $stmt->fetch()) {
 			// some other user has the user id, so the current user cannot use it!
 			return false; 
 		} // end while
 		
 		return true; // email address is usable for the user
 	} // end of function checkIfValidEmailAdr() 
 	
 	
 	
   /******************************************************************************
 	 is name properly formed?
 	 and, is name available (case insensitive) for id?
 	******************************************************************************/
 	function checkIfValidName($sFirstName, $sLastName, $nUserId) {
 		$sFirstName = strtolower($sFirstName);
 		$sLastName = strtolower($sLastName);
 		$sAlpha = 'abcdefghijklmnopqrstuvwxyz\'';
 		$sAlpha2 = $sAlpha . '0123456789';
 		
 		if (strlen($sFirstName)  > 60 || strlen($sLastName)  > 60) {
 			return false; // first or last name cannot have a length > 60 characters
 		} // end if
 		
 		if (strpos($sFirstName, ' ') || strpos($sFirstName, ' ') ) {
 			return false; // no spaces allowed in name
 		} // end if
 		
 		if (strlen($sFirstName)  < 1 || strlen($sLastName)  < 2) {
 			return false; // first name needs at least 1 letter
 		} // end if
 		
 		$nCount = checkCharCount($sFirstName, $sAlpha);
 		if ($nCount < strlen($sFirstName)) {
 			return false; // some characters in first name are not valid
 		} // end if
 		
 		$nCount = checkCharCount($sLastName, $sAlpha2);
 		if ($nCount < strlen($sLastName)) {
 			return false; // some characters in last name are not valid
 		} // end if
 		
 		$nCount = checkCharCount(substr($sFirstName, 0, 1), '\'0123456789');
 		if ($nCount > 0) {
 			return false; // first character of first name is invalid for first character
 		} // end if
 		
 		$nCount = checkCharCount(substr($sLastName, 0, 1), '\'0123456789');
 		if ($nCount > 0) {
 			return false; // first character of last name is invalid for first character
 		} // end if
 		
 		
 	   /*******************************************************************
 	      now, check if name is valid for current user...
 	    *******************************************************************/	
		$sql = 'SELECT userId FROM users WHERE ';
 		$sql = $sql . '   LOWER(firstName) = :firstName ';
 		$sql = $sql . 'AND ';
 		$sql = $sql . '   LOWER(lastName) = :lastName ';
 		$sql = $sql . 'AND ';
 		$sql = $sql . '   userId <> :userId ';
 		$stmt = $db->prepare($sql);
 		$stmt->bindParam(':firstName', $sFirstName);  
 		$stmt->bindParam(':lastName', $sLastName);
 		$stmt->execute();
 		
 		while ($row = $stmt->fetch()) {
 			// some other user has this first/last name combo, so the current user cannot use it!
 			return false; 
 		} // end while 		
 		
 		return true; // user first and last name are usable for the user
 	} // end of function checkIfValidName() 
 	
 	
 	
   /******************************************************************************
     does password follow rules?
     check on the server side...
 	******************************************************************************/ 	 	 	
 	function checkIfValidPassword($sPassword) {
 		$sAlpha1 = 'abcdefghijklmnopqrstuvwxyz';
    	$sAlpha2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
 	
 		if (strlen($str) < 6 || strlen($str) > 20) {
 			return false; // passwords cannot be too small... or too big
 		} // end if
 		
 		if (strpos($sPassword, ' ') ) {
 			return false; // passwords are not allowed to have spaces in them
 		} // end if
 		
 		if (checkCharCount($sPassword, '0123456789') < 1) {
 			return false; // passwords have to have at least 1 numeric character in them
 		} // end if
 		
 		if (checkCharCount($sPassword, '!@#$%&*-_+=:.') < 1) {
 			return false; // passwords have to have at least 1 valid punctuation character in them
 		} // end if
 		
 		
 		if (checkCharCount($sPassword, $sAlpha1 . $sAlpha2) < 4) {
 			return false; // passwords have to have at least 4 characters from the alphabet in them
 		} // end if
 		
 		return true;
 	} // end of function checkIfValidPassword() 
 	
 	
 	
   /******************************************************************************
   		Helper function...
   		get counts of certain types of characters
 	******************************************************************************/ 	
 	function checkCharCount($sCheck, $sChars) {
 		$nCount = 0;
 		
 		for ($n=0; $n < strlen($sCheck); $n = $n + 1) {
			$sChar = substr($sCheck, $n, 1);
		
			if (strpos($sChars, $sChar) ) {
				$nCount = $nCount + 1;
			} // end if
 		} // next $n
 		
 		return $nCount;
 	}  // end of function checkIfValidPassword2() 
 	
 	
 	
 	
   /******************************************************************************
 	******************************************************************************/
 	function updateUserProfile() {
 		
 		$sSubject = 'User successfully updated their User Profile';
 		$sEventDetails = 'User\'s Email Address: ' . $sEmailAdr . '<br>';
 		logEvent('changeProfileSuccess', $sSubject, $sEventDetails, 3);
 		
 	} // end of function updateUserProfile()
 	
 	
 	
   /******************************************************************************
 	******************************************************************************/
 	function validateNewUserInputs($nTmpId, $sEmailAdr, $sPassword, $sFirstName, $sLastName) {
 		$bInputsOk = true;
 		
 		if (!checkIfValidEmailAdr($sEmailAdr, 0)) {
 			$bInputsOk = false;
 		} // end if
 		
 		if (!checkIfValidPassword($sPassword)) {
 			$bInputsOk = false;
 		} // end if
 		
 		if (!checkIfValidName($sFirstName, $sLastName, 0)) {
 			$bInputsOk = false;
 		} // end if
 		
 		return $bInputsOk;
 	} // end of function validateNewUserInputs() 
 	
 	 	
 	
 ?>
 
 
 
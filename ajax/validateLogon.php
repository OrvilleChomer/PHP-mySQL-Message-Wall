<?php
	require_once '../pdo_connect.php';
	require_once './getWallMessages.php';

/*******************************************************************************
   
   Takes values posted and verifies if valid 
   logon credentials were provided.
   
   Called from:
   
      validateLogon()   function      in msgWallDemo.js
   
 *******************************************************************************/

    // the function:    isValidLogonHash()  resides in:   pdo_connect.php
	if (!isValidLogonHash()) {
		echo '{' . "\n";
		echo '"status":"fail",' . "\n";
		echo '"reason":"1"';
		outputLatestWallMessages();
		echo '}';
		return;
	} // end if
	
	$sEmailAdr = $_POST["emailAdr"];
	$sPassword = $_POST["pwd"];
	
	// clear out any possible previous values (just in case):
	$_SESSION["logonUserId"] = 0;
	$_SESSION["firstName"] = "";
	$_SESSION["lastName"] = "";
	
		
	$bUserFound = false;
	
	$sql = 'SELECT ';
	$sql = $sql . '   userId, ';
	$sql = $sql . '   pwdHash, ';
	$sql = $sql . '   firstName, ';
	$sql = $sql . '   lastName, ';
	$sql = $sql . '   ' . dtFld('lastLogon', 'lastLogonFmt') . ' ';
	$sql = $sql . ' FROM users ';
	$sql = $sql . ' WHERE ';
	$sql = $sql . '    emailAdr = :emailAdr ';
	
	//echo  $sql;
	
	$stmt = $db->prepare($sql);
	$stmt->bindParam(':emailAdr', $sEmailAdr);  	
	$stmt->execute();
	
	while ($row = $stmt->fetch()) {
		$bUserFound = true;
		$nUserId = $row['userId'];
		$sPwdHash = $row['pwdHash'];
		$sFirstName = $row['firstName'];
		$sLastName = $row['lastName'];
		$lastLogon = $row['lastLogonFmt'];
	} // end while()
	
	if (!$bUserFound) {
		$sEventDetails = 'Operation: Validate Logon<br>';
		$sEventDetails = $sEventDetails . 'The email address: ';
		$sEventDetails = $sEventDetails . '<b>' . $sEmailAdr . '<b> ';
		$sEventDetails = $sEventDetails . 'does not exist in our user base at this time.<br>';
		$sEventDetails = $sEventDetails . 'It could not be used by the user to log in!';
		logEvent('noUser', 'No such user email exists', $sEventDetails, 8);
		echo '{' . "\n";
		echo '"status":"fail",' . "\n";
		echo '"reason":"2"';
		outputLatestWallMessages();
		echo '}';
		return;
	} // end if
	
	$bMatches = password_verify($sPassword, $sPwdHash);
	
	if (!$bMatches) {
		$sEventDetails = 'Operation: Validate Logon<br>';
		$sEventDetails = $sEventDetails . 'The email address: ';
		$sEventDetails = $sEventDetails . '<b>' . $sEmailAdr . '<b><br>';
		$sEventDetails = $sEventDetails . 'This email address: ';
		$sEventDetails = $sEventDetails . 'EXISTS... but the password entered for it is invalid! ';
		logEvent('invalidPwd', 'User entered invalid password', $sEventDetails, 8);
		echo '{' . "\n";
		echo '"status":"fail",' . "\n";
		echo '"reason":"3",' . "\n";
		outputLatestWallMessages();
		echo '}';
		return;
	} // end if
	
	// if we made it this far, the user email and password validated correctly
	
	// record last logon time stamp:
	$sql = 'UPDATE users SET ';
	$sql = $sql . '   lastLogon = NOW() ';
	$sql = $sql . 'WHERE ';
	$sql = $sql . '   userId = :userId ';
	$stmt2 = $db->prepare($sql);
	$stmt2->bindParam(':userId', $nUserId, PDO::PARAM_INT);
	$stmt2->execute();
	
	$_SESSION["logonUserId"] = $nUserId;
	$_SESSION["firstName"] = $sFirstName;
	$_SESSION["lastName"] = $sLastName;
	
	echo '{' . "\n";
		echo '"status":"success",' . "\n";
		echo '"userId":' . $nUserId . ',' . "\n";
		echo '"firstName":"' . $sFirstName . '",' . "\n";
		echo '"lastName":"' . $sLastName . '",' . "\n";
		echo '"lastLogon":"' . $lastLogon . '"';
		outputLatestWallMessages($nUserId);
	echo '}';
	
		
	$sSubject = 'User: ';
	$sSubject = $sSubject . $sEmailAdr . ' logged on Successfully';
	$sEventDetails = $sSubject;
	logEvent('validLogon', $sSubject, $sEventDetails, 2);
?>




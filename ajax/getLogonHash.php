<?php
	require_once '../pdo_connect.php';
	require_once './getWallMessages.php';
/*
   
 */


	$sRequireInvCode = "true";
	$sLogonHashCode = random_str(48);
	
	$_SESSION["logonHashCode"] = $sLogonHashCode;
	
	if ($sInvitationCodes == '') {
		$sRequireInvCodes = "false";
	} // end if
	
	
 		
	echo '{' . "\n";
		echo '"logonHashCode":"' . jsonStrValue($sLogonHashCode) . '",' . "\n";
		echo '"requireInvCode":' . $sRequireInvCode . "\n";
		// echo '"requireInvCode":' . $sRequireInvCode . ',' . "\n";
		outputLatestWallMessages($nExcludeUserId);
	echo '}';
	
	$sSubject = 'Web Client Retrieved Logon Hash';
	$sEventDetails = 'Logon Hash Code Returned: ' . $sLogonHashCode . '<br>';
	logEvent('getLogonHash', $sSubject, $sEventDetails, 3);
?>
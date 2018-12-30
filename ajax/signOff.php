<?php
	require_once '../pdo_connect.php';
	require_once './getWallMessages.php';
	
	
	/*************************************************************
	   perform user log off on the server side.
	   
	   logon hash is used to prevent hack from logging user off
	   unintentionally.
	   
	**************************************************************/
	
	if (!isValidLogonHash()) {
		echo '{' . "\n";
		echo '"status":"fail",' . "\n";
		echo '"reason":"1"';
		outputLatestWallMessages();
		echo '}';
		return;
	} // end if
	
	$sSubject = 'User has signed off';
	$sEventDetails = $sSubject . '<br>';
	logEvent('signedOff', $sSubject, $sEventDetails, 2);
	
	$_SESSION["logonUserId"] = 0;
	$_SESSION["firstName"] = '';
	$_SESSION["lastName"] = '';
	
	echo '{' . "\n";
		echo '"status":"success"' . "\n";
		outputLatestWallMessages(0);
	echo '}';
	
?>	
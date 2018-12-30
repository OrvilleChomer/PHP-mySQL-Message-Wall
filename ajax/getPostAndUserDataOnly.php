<?php
	require_once '../pdo_connect.php';
	require_once './getWallMessages.php';

/*
   this page is called when ALL we are doing at the time is getting
   any new post data for changes to user data.
 */
 
 	$nUserId = 0;
 	
 	echo '{' . "\n";
		echo '"status":"success"' ;
 		outputLatestWallMessages($nUserId);
	echo '}';
	
 ?>
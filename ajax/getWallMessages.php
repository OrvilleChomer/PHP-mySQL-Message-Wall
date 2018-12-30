<?php
	require_once '../pdo_connect.php';
	
/*
   Get any wall messages that have not been already gotten...
 */
 
 
 $nExcludeUserId = $_POST["excludeUserId"];
 $sLastQuery = $_POST["lastQuery"];
 
 
 
 
 function outputLatestWallMessages($nExcludeUserId) {
 
 	$db = $GLOBALS['db'];
 	$sLastQuery = $GLOBALS['sLastQuery'];
 	
    // get the database's system date/time first thing:
 	$sNewLastQuery = '';
 	
 	$sql = 'SELECT ';
 	$sql = $sql . '  ' . dtFld('NOW()', 'dbSrvrDateTime');
 	$stmtLstTm = $db->prepare($sql);
 	$stmtLstTm->execute();	
 	
 	while ($row = $stmtLstTm->fetch()) {
 		$sNewLastQuery = $row['dbSrvrDateTime'];
 	} // end while
 	
 	
 	
 	// *** now do the rest...
 	echo ',' . "\n";
 	
 	echo '"latestPosts":[' . "\n";
 	getNewWallPosts($nExcludeUserId);
 	echo '],' . "\n";
 	
 	echo '"latestUsers":[' . "\n";
 	getNewUsers(0);
 	echo '],' . "\n";
 	
 	echo '"checkDatePosted":"' . jsonStrValue($sLastQuery) .'",' . "\n";
 	echo '"lastChecked":"' . jsonStrValue($sNewLastQuery) .'"' . "\n";
 	
 } // end of function outputLatestWallMessages()
 
 
 
 /***************************************************************
 ***************************************************************/
 function getNewWallPosts($nExcludeUserId) {
 
 	$db = $GLOBALS['db'];
 	$sLastQuery = $GLOBALS['sLastQuery'];
 	$nCount = 0;
 	$sq = "'";
 	
 	$sql = 'SELECT ';
 	$sql = $sql . '   msgId, ';
 	$sql = $sql . '   userId, ';
 	$sql = $sql . '   msgTimestamp, ';
 	$sql = $sql . '   ' . dtFld('msgTimestamp', 'msgTimestampFmt') . ',';
 	$sql = $sql . '   msgContent, ';
 	$sql = $sql . '   parentMsgId, ';
 	$sql = $sql . '   likeCount ';
 	$sql = $sql . ' FROM ';
 	$sql = $sql . '   wallMessages '; 
 	$sql = $sql . ' WHERE '; 
 	$sql = $sql . '   userId <> :exludeUserId ';
 	$sql = $sql . ' AND '; 
 	$sql = $sql . '   msgTimestamp >= STR_TO_DATE(:lastQuery,\'%m/%d/%Y %H:%i:%s\') ';
 	$sql = $sql . ' ORDER BY '; 
 	$sql = $sql . '   parentMsgId, '; 
 	$sql = $sql . '   msgTimestamp DESC '; 

 	$stmt = $db->prepare($sql);
 	$stmt->bindParam(':lastQuery', $sLastQuery);
 	$stmt->bindParam(':exludeUserId', $nExcludeUserId, PDO::PARAM_INT);
 	
 	$stmt->execute();	
 	
 	while ($row = $stmt->fetch()) {
 		if ($nCount > 0) {
 			echo ',' . "\n ";
 		} // end if
 		
 		echo '{' . "\n ";
 			echo '"msgId":' . $row['msgId'] . ',' . "\n";
 			echo '"userId":' . $row['userId'] . ',' . "\n";
 			echo '"msgTimestamp":"' . jsonStrValue($row['msgTimestampFmt']) . '",' . "\n";
 			echo '"msgContent":"' . jsonStrValue($row['msgContent']) . '",' . "\n";
 			echo '"parentMsgId":' . $row['parentMsgId'] . ',' . "\n";
 			echo '"likeCount":' . $row['likeCount'] . "\n";
 		echo '}';
 		
 		$nCount = $nCount + 1;
 	} // end while()
 	
 } // end of function getNewWallPosts()
 
 
 // STR_TO_DATE("12/17/2018 ", "%M %d %Y");
 
 /*
 */
 function getNewUsers($nExcludeUserId) {
 
 	$db = $GLOBALS['db'];
 	$sLastQuery = $GLOBALS['sLastQuery'];
 	$nCount = 0;
 	
 	$sql = 'SELECT ';
 	$sql = $sql . '    userId, ';
 	$sql = $sql . '    emailAdr, ';
 	$sql = $sql . '    firstName, '; 
 	$sql = $sql . '    lastName, '; 
 	$sql = $sql . '    aboutUser, '; 
 	$sql = $sql . '   ' . dtFld('lastLogon', 'lastLogonFmt') . ',';
 	$sql = $sql . '   ' . dtFld('lastPostDate', 'lastPostDateFmt') . ' ';
 	$sql = $sql . ' FROM users '; 
 	$sql = $sql . ' WHERE '; 
 	$sql = $sql . '    userId <> :exludeUserId ';
 	$sql = $sql . ' AND '; 
 	$sql = $sql . '   updateDate >= STR_TO_DATE(:lastQuery,\'%m/%d/%Y %H:%i:%s\') ';
 	

 	$stmt = $db->prepare($sql);
 	$stmt->bindParam(':lastQuery', $sLastQuery);
 	$stmt->bindParam(':exludeUserId', $nExcludeUserId, PDO::PARAM_INT);
 	
 	$stmt->execute();	
 	
 	while ($row = $stmt->fetch()) {
 		if ($nCount > 0) {
 			echo ',';
 		} // end if
 		
 		echo '{';
 			echo '"userId":' . $row['userId'] . ',' . "\n";
 			echo '"emailAdr":"' . jsonStrValue($row['emailAdr']) . '",' . "\n";
 			echo '"firstName":"' . jsonStrValue($row['firstName']) . '",' . "\n";
 			echo '"lastName":"' . jsonStrValue($row['lastName']) . '",' . "\n";
 			echo '"aboutUser":"' . jsonStrValue($row['aboutUser']) . '",' . "\n";
 			echo '"lastLogon":"' . jsonStrValue($row['lastLogonFmt']) . '",' . "\n";
 			echo '"lastPostDate":"' . jsonStrValue($row['lastPostDateFmt']) . '"' . "\n";
 		echo '}';
 		
 		$nCount = $nCount + 1;
 	} // end while()
 	
 } // end of function getNewUsers()
 






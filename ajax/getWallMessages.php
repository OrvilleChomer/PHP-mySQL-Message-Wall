<?php
	require_once '../pdo_connect.php';
	
/*
   Get any wall messages that have not been already gotten...
   along with any of their comments and replies
   and, any user data that is associated with those messages.
 */
 
 
 $nExcludeUserId = $_POST["excludeUserId"];
 $sLastQuery = $_POST["lastQuery"];
 
 $nLimitOnTopLevelRows = 10;
 
 
 
 
/***************************************************************
 ***************************************************************/
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
 	
 	
 	// added Jan 23, 2019
 	echo '"latestMsgUserData":[' . "\n";
 	getNewMsgUserData(0);
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
 	
	$sql = getTopLevelMsgSql($nExcludeUserId,0,0);	
 	$stmt1 = $db->prepare($sql);
 	$stmt1->bindParam(':lastQuery', $sLastQuery);
 	$stmt1->bindParam(':exludeUserId', $nExcludeUserId, PDO::PARAM_INT);
 	
 	$stmt1->execute();	
 	
 	while ($row = $stmt1->fetch()) {
 		if ($nCount > 0) {
 			echo ',' . "\n ";
 		} // end if
 		
 		outputMsgObj($row);	
 		$nCount = $nCount + 1;
 	} // end while()
 	
 	$sql = getCommentsAndRepliesSql($nExcludeUserId,0,0);
 	$stmt2 = $db->prepare($sql);
 	$stmt2->bindParam(':exludeUserId', $nExcludeUserId, PDO::PARAM_INT);
 	$stmt2->execute();	
 	
 	while ($row = $stmt2->fetch()) {
 		if ($nCount > 0) {
 			echo ',' . "\n ";
 		} // end if
 		
 		outputMsgObj($row);	
 		$nCount = $nCount + 1;
 	} // end while()
 	 	
 } // end of function getNewWallPosts()
 
 
 
/***************************************************************
 ***************************************************************/ 
 function outputMsgObj($row) {
	echo '{' . "\n ";
		echo '"msgId":' . $row['msgId'] . ',' . "\n";
		echo '"userId":' . $row['userId'] . ',' . "\n";
		echo '"msgTimestamp":"' . jsonStrValue($row['msgTimestampFmt']) . '",' . "\n";
		echo '"msgContent":"' . jsonStrValue($row['msgContent']) . '",' . "\n";
		echo '"parentMsgId":' . $row['parentMsgId'] . ',' . "\n";
		echo '"topLevelMsgId":' . $row['topLevelMsgId'] . ',' . "\n";
		echo '"likeCount":' . $row['likeCount'] . "\n";
	echo '}';
 
 } // end of function outputMsgObj()
 
 
 
 
/***************************************************************
 ***************************************************************/ 
 function outputMsgUsrObj($row) {
	echo '{' . "\n ";
		echo '"msgUserId":' . $row['msgUserId'] . ',' . "\n";
		echo '"msgId":' . $row['msgId'] . ',' . "\n";
		echo '"userId":' . $row['userId'] . ',' . "\n";
		echo '"dataType":' . $row['dataType'] . ',' . "\n";
		echo '"dataValueStr":"' . jsonStrValue($row['dataValueStr']) . '",' . "\n";
		echo '"createDate":"' . jsonStrValue($row['createDateFmt']) . '",' . "\n";
		echo '"updateDate":"' . jsonStrValue($row['updateDateFmt']) . '"' . "\n";
	echo '}';
 
 } // end of function outputMsgObj()
  
 
 
/***************************************************************
 ***************************************************************/ 
 function getTopLevelMsgSql($nExcludeUserId,$nGtMsgId,$nLimitNum) {
 
 	$sql = 'SELECT ';
 	$sql = $sql . '   msgId, ';
 	$sql = $sql . '   userId, ';
 	$sql = $sql . '   msgTimestamp, ';
 	$sql = $sql . '   ' . dtFld('msgTimestamp', 'msgTimestampFmt') . ',';
 	$sql = $sql . '   msgContent, ';
 	$sql = $sql . '   parentMsgId, ';
 	$sql = $sql . '   topLevelMsgId, ';
 	$sql = $sql . '   likeCount ';
 	$sql = $sql . ' FROM ';
 	$sql = $sql . '   wallMessages '; 
 	$sql = $sql . ' WHERE '; 
 	$sql = $sql . '   parentMsgId = 0 ';
 	$sql = $sql . ' AND '; 
 	$sql = $sql . '   userId <> :exludeUserId ';
 	$sql = $sql . ' AND '; 
 	
 	if ($nGtMsgId > 0) {
 		$sql = $sql . '   msgId > :gtMsgId ';
 	} else {
 		$sql = $sql . '   msgTimestamp >= STR_TO_DATE(:lastQuery,\'%m/%d/%Y %H:%i:%s\') ';
 	} // end if/else
 	
 	$sql = $sql . ' ORDER BY '; 
 	$sql = $sql . '   msgTimestamp DESC ';
 	
 	if ($nLimitNum > 0) {
 		$sql = $sql . ' LIMIT :limitNum';
 	} // end if
 	
 	return $sql;
 } // end of function getTopLevelMsgSql()
 
 
 
 
/***************************************************************
 ***************************************************************/
 function getTopLevelMsgUserDataSql($nExcludeUserId,$nGtMsgId,$nLimitNum) {
 	$sql = 'SELECT ';
 	$sql = $sql . '    msgUserId, ';
 	$sql = $sql . '    msgId, ';
 	$sql = $sql . '    userId, ';
 	$sql = $sql . '    dataType, ';
 	$sql = $sql . '    dataValueStr, ';
 	$sql = $sql . '   ' . dtFld('createDate', 'createDateFmt') . ',';
 	$sql = $sql . '   ' . dtFld('updateDate', 'updateDateFmt') . ' ';
 	$sql = $sql . ' FROM ';
 	$sql = $sql . '   msgUser';
 	$sql = $sql . ' WHERE ';
 	$sql = $sql .     getMsgSubQuerySql('msgId', $nExcludeUserId,$nGtMsgId,$nLimitNum);
 	
 	return $sql;
 } // end of function getTopLevelMsgUserDataSql()
 
 
 
 
/***************************************************************
 ***************************************************************/  
 function getCommentsAndRepliesSql($nExcludeUserId,$nGtMsgId,$nLimitNum) {
  	$sql = 'SELECT ';
 	$sql = $sql . '   m.msgId, ';
 	$sql = $sql . '   m.userId, ';
 	$sql = $sql . '   m.msgTimestamp, ';
 	$sql = $sql . '   ' . dtFld('m.msgTimestamp', 'msgTimestampFmt') . ',';
 	$sql = $sql . '   m.msgContent, ';
 	$sql = $sql . '   m.parentMsgId, ';
 	$sql = $sql . '   m.topLevelMsgId, ';
 	$sql = $sql . '   m.likeCount ';
 	$sql = $sql . ' FROM ';
 	$sql = $sql . '   wallMessages AS m '; 
 	$sql = $sql . ' WHERE '; 
 	$sql = $sql . '   m.userId <> :exludeUserId ';
 	$sql = $sql . ' AND '; 
 	$sql = $sql . getMsgSubQuerySql('m.topLevelMsgId', $nExcludeUserId,$nGtMsgId,$nLimitNum);
 	 	
 	return $sql;
 } // end of function getCommentsAndRepliesSql()
 
 
 
 
 
 
 
 // STR_TO_DATE("12/17/2018 ", "%M %d %Y");
 
/**********************************************************************
 **********************************************************************/
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
 
 
 
/**********************************************************************
   get message user data for all comments and replies to top-level
   message ids returned by sub query.
 **********************************************************************/
 function getMsgUserDataSql($nExcludeUserId,$nGtMsgId,$nLimitNum) {
 	$sql = 'SELECT ';
 	$sql = $sql . '    mu.msgUserId, ';
 	$sql = $sql . '    mu.msgId, ';
 	$sql = $sql . '    mu.userId, ';
 	$sql = $sql . '    mu.dataType, ';
 	$sql = $sql . '    mu.dataValueStr, ';
 	$sql = $sql . '   ' . dtFld('mu.createDate', 'createDateFmt') . ',';
 	$sql = $sql . '   ' . dtFld('mu.updateDate', 'updateDateFmt') . ' ';
 	$sql = $sql . ' FROM ';
 	$sql = $sql . '   wallMessages AS m, '; 
 	$sql = $sql . '   msgUser AS mu';
 	$sql = $sql . ' WHERE ';
 	$sql = $sql .     getMsgSubQuerySql('m.topLevelMsgId', $nExcludeUserId,$nGtMsgId,$nLimitNum);
 	$sql = $sql . ' AND ';
 	$sql = $sql . '    mu.msgId = m.msgId ';

 	return $sql;
 } // end of function getMsgUserDataSql()
 
 
 
 
 
/**********************************************************************
 **********************************************************************/ 
 function getNewMsgUserData($nExcludeUserId) {
 	$db = $GLOBALS['db'];
 	$nCount = 0;
 	
 	$sql = getTopLevelMsgUserDataSql($nExcludeUserId,0,0);	
 	$stmt = $db->prepare($sql);
 	$stmt->bindParam(':exludeUserId', $nExcludeUserId, PDO::PARAM_INT);
 	
 	$stmt->execute();	
 	
 	while ($row = $stmt->fetch()) {
 		if ($nCount > 0) {
 			echo ',';
 		} // end if
 		
 		outputMsgUsrObj($row); 		
 		
 		$nCount = $nCount + 1;
 	} // end while()
 	
 	$sql = getMsgUserDataSql($nExcludeUserId,0,0);	
 	$stmt = $db->prepare($sql);
 	$stmt->bindParam(':exludeUserId', $nExcludeUserId, PDO::PARAM_INT);
 	
 	$stmt->execute();	
 	
 	while ($row = $stmt->fetch()) {
 		if ($nCount > 0) {
 			echo ',';
 		} // end if
 		
 		outputMsgUsrObj($row); 		
 		
 		$nCount = $nCount + 1;
 	} // end while()
 	
 } // end of function getNewMsgUserData()
 
 
 
 
 
/**********************************************************************
   trying to improve my DRY on this project!  :D
 **********************************************************************/ 
 function getMsgSubQuerySql($sColToCheck, $nExcludeUserId,$nGtMsgId,$nLimitNum) {
 	$sql = '  ' . $sColToCheck . ' IN (';
 	$sql = $sql . '      SELECT msgId FROM wallMessages WHERE ';
 	$sql = $sql . '         parentMsgId = 0 ';
 	
 	if ($nGtMsgId > 0) {
 		$sql = $sql . '  AND ';
 		$sql = $sql . '    msgId > :gtMsgId ';
 	} // end if
 	
 	$sql = $sql . ' ORDER BY '; 
 	$sql = $sql . '   msgTimestamp ';
 	
 	if ($nLimitNum > 0) {
 		$sql = $sql . ' LIMIT :limitNum';
 	} // end if
 	
 	$sql = $sql . '   )'; // closing paren of Sub Query!
 	
 	
 	return $sql;
 } // end of function getMsgSubQuerySql()
 
 




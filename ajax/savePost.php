<?php
	require_once '../pdo_connect.php';
	require_once './getWallMessages.php';
	
	
	/*************************************************************
	   Saves top level posts as well as replies to those posts!
	
		ref: casting strings to ints...
		http://www.phpf1.com/tutorial/php-string-to-int.html
	**************************************************************/
	
	
	$nUserId = 0; 
	
	if (isset($_SESSION['logonUserId'])) {
		$nUserId = (int)$_SESSION['logonUserId'];
	} // end if
    	
	$nTmpMsgId = (int)$_POST["tmpMsgId"];
	$sPostContent = $_POST["postContent"];
	$nParentMsgId = (int)$_POST["parentMsgId"];
	
	
	$sql = 'INSERT INTO wallMessages (';
	$sql = $sql . '   userId,';
	$sql = $sql . '   msgTimestamp,';
	$sql = $sql . '   msgContent,';
	$sql = $sql . '   parentMsgId,';
	$sql = $sql . '   likeCount,';
	$sql = $sql . '   commentCount';
	$sql = $sql . ') VALUES(';
	$sql = $sql . '   :userId,';
	$sql = $sql . '   NOW(),'; // msgTimestamp
	$sql = $sql . '   :msgContent,';
	$sql = $sql . '   :parentMsgId,';
	$sql = $sql . '   0,'; // like count starts at zero
	$sql = $sql . '   0 '; // comment count starts at zero
	$sql = $sql . ')';
	
	$stmt = $db->prepare($sql);
	$stmt->bindParam(':userId', $nUserId, PDO::PARAM_INT);	
	$stmt->bindParam(':msgContent', $sPostContent);
	$stmt->bindParam(':parentMsgId', $nParentMsgId, PDO::PARAM_INT);
 	$stmt->execute();
 	
 	$nMsgId = $db->lastInsertId();
 	
 	$sql = 'SELECT ';
 	$sql = $sql . '   ' . dtFld('msgTimestamp', 'msgTimestampFmt') . ' ';
 	$sql = $sql . 'FROM ';
 	$sql = $sql . '   wallMessages ';
 	$sql = $sql . 'WHERE msgId = :msgId ';
 	$stmt2 = $db->prepare($sql);
 	$stmt2->bindParam(':msgId', $nMsgId, PDO::PARAM_INT);	
 	$stmt2->execute();
 	
 	while ($row = $stmt2->fetch()) {
 		$sMsgTimestamp = $row['msgTimestampFmt'];
 	} // end while
 	
 	if ($nParentMsgId > 0) {
 		$sql = 'UPDATE wallMessages SET commentCount = commentCount + 1 WHERE msgId = :parentMsgId';
 		$stmt3 = $db->prepare($sql);
		$stmt3->bindParam(':parentMsgId', $nParentMsgId, PDO::PARAM_INT);	
		$stmt3->execute();
 	} // end if
 	
	$sSubject = 'Post Saved... msgId: ' . $nMsgId;
	$sEventDetails = $sSubject;
	
	
	echo '{' . "\n";;
		echo '"status":"postSuccessful",' . "\n";
		echo '"tempMsgId":' . $nTmpMsgId . ',' . "\n";
		echo '"newMsgId":' . $nMsgId . ',' . "\n";
		echo '"msgTimestamp":"' . $sMsgTimestamp . '"' . "\n";
		outputLatestWallMessages($nUserId);
	echo '}';
	
	if ($nParentMsgId == 0) {
		$sEventDetails = $sEventDetails . '<br>This is a top-level post.';
	} else {
		$sEventDetails = $sEventDetails . '<br>This is a reply to msgId: ';
		$sEventDetails = $sEventDetails . $nParentMsgId;
	} // end if/else
	
	logEvent('postSaved', $sSubject, $sEventDetails, 0);
	
?>





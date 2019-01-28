<?php
	require_once '../pdo_connect.php';
	require_once './getWallMessages.php';
	
	
	/**********************************************************************
	   Saves top level posts as well as replies to those posts!
	
	   In other words:   
	      save all top level posts, comments to those posts, and
	      replies to those comments!
	      
	      ...
	      
	      
		ref: casting strings to ints...
		http://www.phpf1.com/tutorial/php-string-to-int.html
		
		========================================================
		
		This file is accessed by an Ajax call from:
		
		       savePost()   function   in the: msgWallDemo.js     file
	***********************************************************************/
	
	
	
	$nUserId = 0; 
	
   /**********************************************************************
       note: At the moment, I can't remember my reasoning for doing this...
       
       the value of this session variable is set in:   validateLogon.php
       
	**********************************************************************/
	if (isset($_SESSION['logonUserId'])) {
		$nUserId = (int)$_SESSION['logonUserId'];
	} // end if
    	
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // for now, until I can figure out why I would do otherwise, a user id of zero (0)
    // here will generate and error and Not save the post!
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    if ($nUserId == 0) {
    	$sSubject = "Error: No session user id";
    	$sEventDetails = $sSubject . '<p>';
    	$sEventDetails ='You may want to check validateLogon.php for problems</p>';
    	logEvent('postSaveError', $sSubject, $sEventDetails, 0);
		echo '{' . "\n";
			echo '"status":"error",' . "\n";	
			echo '"reason":"2"' . "\n";		
			outputLatestWallMessages($nUserId);
			return; // do not continue any further
		echo '}';
    } // end if ($nUserId == 0)
    
	$nTmpMsgId = (int)$_POST["tmpMsgId"];
	$sPostContent = $_POST["postContent"];
	$nParentMsgId = (int)$_POST["parentMsgId"];
	$nTopLevelMsgId = (int)$_POST["topLevelMsgId"];
	
	$sql = 'INSERT INTO wallMessages (';
	$sql = $sql . '   userId,';
	$sql = $sql . '   msgTimestamp,';
	$sql = $sql . '   msgContent,';
	$sql = $sql . '   parentMsgId,';
	$sql = $sql . '   topLevelMsgId,';
	$sql = $sql . '   likeCount,';
	$sql = $sql . '   commentCount';
	$sql = $sql . ') VALUES(';
	$sql = $sql . '   :userId,';
	$sql = $sql . '   NOW(),'; // msgTimestamp
	$sql = $sql . '   :msgContent,';
	$sql = $sql . '   :parentMsgId,';
	$sql = $sql . '   :topLevelMsgId,';
	$sql = $sql . '   0,'; // like count starts at zero
	$sql = $sql . '   0 '; // comment count starts at zero
	$sql = $sql . ')';
	
	$stmt = $db->prepare($sql);
	$stmt->bindParam(':userId', $nUserId, PDO::PARAM_INT);	
	$stmt->bindParam(':msgContent', $sPostContent);
	$stmt->bindParam(':parentMsgId', $nParentMsgId, PDO::PARAM_INT);
	$stmt->bindParam(':topLevelMsgId', $nTopLevelMsgId, PDO::PARAM_INT);
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





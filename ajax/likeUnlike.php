<?php
	require_once '../pdo_connect.php';
	
/*
   Like / Unlike a Message (a toggle)
   note to self: webLogic
 */
 
 	$nMsgId = (int)$_POST["msgId"];
 	$nUserId = (int)$_SESSION["logonUserId"];
 	
 	if ($nMsgId < 1 || $nUserId < 1) {
 		echo 'problem!';
 		return;
 	} // end if
 	
 	try {
 		$db->beginTransaction();
 		
 		$nMsgUserId = 0;
 		
 	   /***************************************************
 		  does this user have a "Like" on this message ?
 		***************************************************/
 		$sql = 'SELECT msgUserId ';
 		$sql = $sql . 'FROM ';
 		$sql = $sql . '	  msgUser ';
 		$sql = $sql . 'WHERE ';
 		$sql = $sql . '	  msgId = :msgId ';
 		$sql = $sql . 'AND ';
 		$sql = $sql . '   userId = :userId ';
 		$sql = $sql . 'AND ';
 		$sql = $sql . '   dataValueStr = \'like\' ';
 		$stmt1 = $db->prepare($sql);
 		$stmt1->bindParam(':msgId', $nMsgId, PDO::PARAM_INT);
 		$stmt1->bindParam(':userId', $nUserId, PDO::PARAM_INT);
 		$stmt1->execute();	
 		
 		while ($row = $stmt1->fetch()) {
 			// found record:
 			$nMsgUserId = $row['msgUserId'];
 		} // end while()
 		
 		$stmt1 = null;
 		
 		if ($nMsgUserId == 0) {
 			// not liked by user right now, so Like it
 			
 			$sql = 'INSERT INTO msgUser (';
 			$sql = $sql . '	  msgId, ';
 			$sql = $sql . '	  userId, ';
 			$sql = $sql . '	  dataValueStr, '; 	
 			$sql = $sql . '	  createDate, '; 	
 			$sql = $sql . '	  updateDate '; 			
 			$sql = $sql . ') VALUES(';
 			$sql = $sql . '	  :msgId, ';
 			$sql = $sql . '	  :userId, ';
 			$sql = $sql . '	  NOW(), ';
 			$sql = $sql . '	  NOW(), ';
 			$sql = $sql . '	  \'like\' ';
 			$sql = $sql . ')';
 			$stmt2 = $db->prepare($sql);
			$stmt2->bindParam(':msgId', $nMsgId, PDO::PARAM_INT);
			$stmt2->bindParam(':userId', $nUserId, PDO::PARAM_INT);
			$stmt2->execute();	
			$nMsgUserId = $db->lastInsertId();
			$stmt2 = null;
			
			$sql = 'UPDATE wallMessages SET likeCount = likeCount + 1 ';
			$sql = $sql . 'WHERE ';
			$sql = $sql . '   msgId = :msgId ';
			$stmt3 = $db->prepare($sql);
			$stmt3->bindParam(':msgId', $nMsgId, PDO::PARAM_INT);
			$stmt3->execute();	
			$stmt3 = null;
			
			$sEventDetails = "msgId liked:" . $nMsgId;
			logEvent('likePost', 'Post was Liked', $sEventDetails, 0);
			
			echo '{' . "\n ";
				echo '"result":"liked",' . "\n";
				echo '"msgUsrObj": {' . "\n";
					echo '"msgUserId":' . $nMsgUserId . ',' . "\n";
					echo '"msgId":' . $nMsgId . ',' . "\n";
					echo '"userId":' . $nUserId . ',' . "\n";
					echo '"dataValueStr":"like"' . "\n";
				echo '}';
			echo '}';
 		} else {
 			// currently liked by the user now so Unlike it
 			
 			$sql = 'DELETE FROM msgUser ';
 			$sql = $sql . 'WHERE msgUserId = :msgUserId';
 			$stmt4 = $db->prepare($sql);
 			$stmt4->bindParam(':msgUserId', $nMsgUserId, PDO::PARAM_INT);
 			$stmt4->execute();	
 			$stmt4 = null;
 			
 			$sql = 'UPDATE wallMessages SET likeCount = likeCount - 1 ';
			$sql = $sql . 'WHERE ';
			$sql = $sql . '   msgId = :msgId ';
			$stmt4 = $db->prepare($sql);
			$stmt4->bindParam(':msgId', $nMsgId, PDO::PARAM_INT);
			$stmt4->execute();	
			$stmt4 = null;
			
			$sEventDetails = "msgId unliked:" . $nMsgId;
			logEvent('unlikePost', 'Post was Unliked', $sEventDetails, 0);
						
			echo '{' . "\n ";
				echo '"result":"unliked",' . "\n";
				echo '"msgUsrObj": {' . "\n";
					echo '"msgUserId":' . $nMsgUserId . ',' . "\n";
					echo '"msgId":' . $nMsgId . ',' . "\n";
					echo '"userId":' . $nUserId . ',' . "\n";
					echo '"dataValueStr":"unlike"' . "\n";
				echo '}';
			echo '}';
 		} // end if
 		
 		$db->commit();
 		
 	} catch(Exception $err) {
 		$db->rollBack();
 		echo '<br><b>problem!</b> : <br>' . $err->getMessage();
 		return;
 	} // try/catch
 	
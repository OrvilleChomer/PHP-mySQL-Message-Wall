<?php 
	session_start();
    $dsn = 'mysql:host=localhost;dbname=msgWallDemo;port=8889'; 

   /*******************************************************************************
      note: when using the "global" key word, once cannot do a value assignment on the
            same line!
	*******************************************************************************/
	global $sInvitationCodes;
	global $sIpAddress;
    global $db; 
    
    
    $sInvitationCodes = 'blue,monday';
    $db = new PDO ( $dsn, "root", "root"); 
    $sIpAddress = $_SERVER['REMOTE_ADDR'];  // best version of user's IP Address
    
    
   /*******************************************************************************
    *******************************************************************************/
    function dtFld($sFieldName, $sAlias) {
    	$sq = "'";
       	$s = ' DATE_FORMAT(' . $sFieldName . ',';
    	$s = $s . $sq . '%m/%d/%Y %T' . $sq . ') AS ' . $sAlias;
    	return $s;
    } // end of function dtFld()
    
    
    
   /*******************************************************************************
      logging of system events (at very least)
    *******************************************************************************/
    function logEvent($sEventType, $sEventSubject, $sEventDetails, $nAlertLevel) {
    	$db = $GLOBALS['db'];
    	$sIpAddress = $GLOBALS['sIpAddress'];
    	$nUserId = 0;
    	
    	if (isset($_SESSION['logonUserId'])) {
    		$nUserId = (int)$_SESSION['logonUserId'];
    	} // end if
    	
    	$sql = 'INSERT INTO eventLog (';
    	$sql = $sql . '   eventType,';
    	$sql = $sql . '   eventSubject,';
    	$sql = $sql . '   eventDetails,';
    	$sql = $sql . '   eventTimestamp,';
    	$sql = $sql . '   userId,';
    	$sql = $sql . '   ipAddress,';
    	$sql = $sql . '   alertLevel ';
    	$sql = $sql . ') VALUES(';
    	$sql = $sql . '   :eventType,';
    	$sql = $sql . '   :eventSubject,';
    	$sql = $sql . '   :eventDetails,';
    	$sql = $sql . '   NOW(),';
    	$sql = $sql . '   :userId,';
    	$sql = $sql . '   :ipAddress,';
    	$sql = $sql . '   :alertLevel ';
    	$sql = $sql . ')';
    	
    	$stmt = $db->prepare($sql);
    	
    	$stmt->bindParam(':eventType', $sEventType);
    	$stmt->bindParam(':eventSubject', $sEventSubject);
    	$stmt->bindParam(':eventDetails', $sEventDetails);
    	$stmt->bindParam(':userId', $nUserId, PDO::PARAM_INT);
    	$stmt->bindParam(':ipAddress', $sIpAddress);
    	$stmt->bindParam(':alertLevel', $nAlertLevel, PDO::PARAM_INT);
    	
    	$stmt->execute();	
    	
    	$nLogEventId = $db->lastInsertId();
    	
    	return $nLogEventId;
    } // end of function logEvent()
    
    
    
    
   /*******************************************************************************
      called when an Ajax call is being done that requires a valid logon hash
      before going ahead to perform its operation...
      
      should only be done one time on ajax page.
      if you need to know what the result was in more than one place, put the 
      return value in a variable.
    *******************************************************************************/    
    function isValidLogonHash() {
    	if (!isset($_SESSION["logonHashCode"]) || !isset($_POST["logonHashCode"])) {
			$sEventDetails = 'Operation requires a logon hash code for security reasons';
			logEvent('noLogonHash', 'No Logon Hash on Ajax Post Data', $sEventDetails, 8);
    		return false; // one of the key elements is missing!
    	} // end if
    	
    	$sLogonHashCode = $_POST["logonHashCode"];
    	
    	if ($_SESSION["logonHashCode"] != $sLogonHashCode) {
    		$sEventDetails = 'Operation requires a Valid logon hash code for security reasons';
			logEvent('invalidLogonHash', 'Invalid Logon Hash on Ajax Post Data', $sEventDetails, 8);
			unset($_SESSION['logonHashCode']); // reset so it can't be reused!
    		return false; // hash code does not match
    	} // end if
    	
    	// got this far? then hash code matched and is good to go
    	
    	unset($_SESSION['logonHashCode']); // reset so it can't be reused!
    	
    	return true; // hash code matched!  return true!
    } // end of function isValidLogonHash()
    
    
    
    
   /*******************************************************************************
    *******************************************************************************/
    function jsonStrValue($sInput) {
    	$sOutput = $sInput;
    	$sOutput = str_replace("%", "%25", $sOutput);  // do first
    	$sOutput = str_replace(chr(10), "%0A", $sOutput);
    	$sOutput = str_replace(chr(13), "&#13;", $sOutput);
    	$sOutput = str_replace(chr(34), "%22", $sOutput);  // double quote
    	//$sOutput = str_replace(chr(39), "&#39;", $sOutput);  // single quote
    	$sOutput = str_replace("{", "%7B", $sOutput);
    	$sOutput = str_replace("}", "%7D", $sOutput);
    	$sOutput = str_replace("[", "%5B", $sOutput);
    	$sOutput = str_replace("]", "%5D", $sOutput);
    	
    	return $sOutput;
    	
    } // end of function jsonStrValue()
    
    
    /**
	 * Generate a random string, using a cryptographically secure 
	 * pseudorandom number generator (random_int)
	 * 
	 * For PHP 7, random_int is a PHP core function
	 * For PHP 5.x, depends on https://github.com/paragonie/random_compat
	 * 
	 * @param int $length      How many characters do we want?
	 * @param string $keyspace A string of all possible characters
	 *                         to select from
	 * @return string
	 */
	function random_str($length, $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
	{
		$pieces = [];
		$max = mb_strlen($keyspace, '8bit') - 1;
		for ($i = 0; $i < $length; ++$i) {
			$pieces []= $keyspace[random_int(0, $max)];
		}
		return implode('', $pieces);
	} // end of function random_str()
	
	
    
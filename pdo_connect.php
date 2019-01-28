<?php 
	session_start();  // make sure we have a PHP session going if we don't have one already
	
   /**************************************************************************************
    **************************************************************************************
    
      ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      FILE:    pdo_connect.php
      -----    ---------------
      
      This file is included at the beginning of Every php Ajax page. So, that page,
      will have a handy (db) object to use (all connected up) for any queries/ inserts/
      updates that it may need to do.
      
      It will also setup a PHP session if there isn't one yet.
      
      It also contains some convenience functions I've written that I can use on said
      pages to do various useful things.
      
      Github location (Master Branch):
      
         https://github.com/OrvilleChomer/PHP-mySQL-Message-Wall/blob/master/pdo_connect.php
      
      ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
     
    ************************************************************************************** 
	**************************************************************************************/
	
	
	// initialize db variables:
	$sDbType = 'mysql';
	$sHost = 'localhost';
	$sDbName = 'msgWallDemo';
	$sPort = '8889';
	$sDbUserName = 'root';
	$sDbPassword = 'root';
	
   // $dsn = 'mysql:host=localhost;dbname=msgWallDemo;port=8889'; 
    $dsn = $sDbType . ':host=' . $sHost . ';dbname=' . $sDbName . ';port=' . $sPort;


   /*******************************************************************************
      note: when using the "global" key word, one cannot do a value assignment on the
            same line!   Silly PHP!
	*******************************************************************************/
	global $sInvitationCodes;
	global $sIpAddress;
    global $db; 
    
    
   /*******************************************************************************
                      INVITATION CODES:
                      -----------------
                      
     Comma delimited list of invitation codes you want for your site.
     If this variable has one or more invitation codes set in it, when a
     user signs up they will have to provide an invitation code that matches one
     of the codes in this list.
     
     Blank it out? No invitation code is required!
     
     if this variable is set to: 'blue,monday'
     then a user signing up will find that the word 'blue' or the word 'monday'
     will work as an invitation code.
     
     Changing this variable's value will not affect any users who signed up with
     it previously!
     
    *******************************************************************************/
    $sInvitationCodes = 'blue,monday';
    
    
    
    
    
   /*******************************************************************************
                      CONNECT TO OUR MYSQL DB:
                      ------------------------
                     
      Connects to database and places connection in global $db variable. 
    *******************************************************************************/    
    $db = new PDO ( $dsn, $sDbUserName, $sDbPassword); 
    
    // comment out line below for production
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    
    $sIpAddress = $_SERVER['REMOTE_ADDR'];  // best version of user's IP Address
    
    
    
    
    
   /*******************************************************************************
      Can call this when building SQL that needs to output a value of a Date/Time
      column making it into a nicely formatted string value which can be easily
      outputted in a JSON string!
    *******************************************************************************/
    function dtFld($sFieldName, $sAlias) {
    	$sq = "'";
       	$s = ' DATE_FORMAT(' . $sFieldName . ',';
    	$s = $s . $sq . '%m/%d/%Y %T' . $sq . ') AS ' . $sAlias;
    	return $s;
    } // end of function dtFld()
    
    
    
    
    
    
   /**************************************************************************************
      logging of system events (at very least)
      
      found out about PHP session id from:
      https://stackoverflow.com/questions/21302733/how-can-i-get-session-id-in-php-and-show-it
      
      Page on my Github wiki about the eventLog table:
      
         https://github.com/OrvilleChomer/PHP-mySQL-Message-Wall/wiki/eventLog-Table
         
    **************************************************************************************/
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
    	$sql = $sql . '   alertLevel, ';
    	$sql = $sql . '   phpSessionId ';
    	$sql = $sql . ') VALUES(';
    	$sql = $sql . '   :eventType,';
    	$sql = $sql . '   :eventSubject,';
    	$sql = $sql . '   :eventDetails,';
    	$sql = $sql . '   NOW(),';   // Database's System Date/Time to put into eventTimestamp column
    	$sql = $sql . '   :userId,';
    	$sql = $sql . '   :ipAddress,';
    	$sql = $sql . '   :alertLevel, ';
    	$sql = $sql . '   :phpSessionId ';
    	$sql = $sql . ')';
    	
    	$stmt = $db->prepare($sql);
    	
    	$sSessionId = session_id() . '';
    	
    	$stmt->bindParam(':eventType', $sEventType);
    	$stmt->bindParam(':eventSubject', $sEventSubject);
    	$stmt->bindParam(':eventDetails', $sEventDetails);
    	$stmt->bindParam(':userId', $nUserId, PDO::PARAM_INT);
    	$stmt->bindParam(':ipAddress', $sIpAddress);
    	$stmt->bindParam(':alertLevel', $nAlertLevel, PDO::PARAM_INT);
    	$stmt->bindParam(':phpSessionId', $sSessionId);
    	
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
    	
    	unset($_SESSION['logonHashCode']); // reset so the hash can't be reused!
    	
    	return true; // hash code matched!  return true!
    } // end of function isValidLogonHash()
    
    
    
    
   /*******************************************************************************
      Used to escape out values in a string so that the value can be safely
      placed in a JSON string without causing errors and end up being
      the right value for a property when the JavaScript client does a JSON.parse()
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
    
    
    /********************************************************************************
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
	 ********************************************************************************/
	function random_str($length, $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
	{
		$pieces = [];
		$max = mb_strlen($keyspace, '8bit') - 1;
		for ($i = 0; $i < $length; ++$i) {
			$pieces []= $keyspace[random_int(0, $max)];
		}
		return implode('', $pieces);
	} // end of function random_str()
	
	
    
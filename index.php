<!DOCTYPE html>
<html lang="en">
<!--

   Project Started: Tuesday, December 10, 2018 after getting an email from a recruiter.


   Location of project on Github:
   
-->
<?php
	session_start();
	
	$env = "Dev"; // environment
	$bMobile = false;
	$sMobile = "false";
	$bDesktop = true;
	$sUserAgent = $_SERVER['HTTP_USER_AGENT'];
	$nPos = strpos($sUserAgent, 'iPhone');
	
	
	if ($nPos) {
		$bMobile = true;
		$sMobile = "true";
		$bDesktop = false;
	} // end if
	
	if ($env != 'Prod') {
		$time = microtime(true);

		$datetime = new DateTime();
		$datetime->setTimestamp($time);
		$microSecs = $datetime->format('H:i:s:U');
		$uniqueParam = '?r=' . $microSecs;
	} else {
		$uniqueParam = '';
	} // end if/else
	
?>
	<head>
		<title>Msg Wall</title>
		<meta name = "viewport" content = "user-scalable=no, width = device-width">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
		<link rel="apple-touch-icon" href="./touch-icon-228x228.png<?= $uniqueParam ?>"/>
		<link rel="icon" type="image/png" href="./touch-icon-228x228.png<?= $uniqueParam ?>">
		<meta http-equiv="PRAGMA" content="NO-CACHE" />
		<link rel="stylesheet" href="./style.css<?= $uniqueParam ?>" type="text/css">
	</head>
	
	
	<body onload="pageSetup(<?= $sMobile ?>)" onresize="pageResize()" onhashchange="checkForUserWall(true)">
		<div style="display:none;">
			<!-- load images right away (even if not needed right away) -->
			<img src="./imgs/bigElipses.png<?= $uniqueParam ?>">
			<img src="./imgs/bigElipses_Hov.png<?= $uniqueParam ?>">
			<div id="usrAgnt"><?= $sUserAgent ?></div>
		</div>
		
		<div id="pgHdr">
			<a href="./"><img src="./touch-icon-228x228.png<?= $uniqueParam ?>" id="msgWallLogo" border="0"></a>
			<div id="siteTitle"><div style="position:relative;left:0;top:0;width:100%;">
			Orville Chomer's Message Wall Demo (PHP/mySQL) v 1.0
			<div id="wallInfo1">abc</div>
			
			</div> <!-- pos:rel -->
			</div> <!-- siteTitle -->
		</div>
		<div id="postCheck"></div>
		
			<div id="usrBanner"></div>
			
			<div id="viewPort">

				
					<div id="topLvlPgContent_desktop">
					
					<?php
						if ($bDesktop) {
					?>
						<div id="leftSideCol">
							<ul class="sidePanelList">
								<li class="liMsg"><div id="usrStatusPnl" class="sidePanel_desktop">
								
								</div></li>
								
								<li class="liMsg"><br><div id="usrLstPnl" class="sidePanel_desktop">
								<div class="wallUsrTitleCntr">
								<img src="./imgs/peopleIcon.png<?= $uniqueParam ?>" 
								class="peopleIcon1"
								border="0" width="24" height="24">
								<b class="wallUsrTitle">Message Wall Users</b>
								</div>
								
								<div id="wallUserLst"></div>
								</div></li>
								<!--<li><div>Orville Chomer &copy; <span id="cpyrtYr"></span></div></li> -->
							</ul>
						</div><!-- leftSideCol -->
						
					<?php
						} // end if ($bDesktop)
					?>
					
						<div id="msgCol" onscroll="captureMsgScroll()">
							<ul class="msgColLst">
						
							<?php
							if ($bMobile) {
							?>
								<li>
								<div id="usrStatusPnl" class="mobileUserStatusPnl">
								</div>
								</li>
							<?php
							} // end if ($bMobile)
							?>
							
							<li>
								<div id="postFrm" class="msgCntr">
									<table><tr><td><img 
									src="./userImages/noPic.png<?= $uniqueParam ?>" 
									         class="userImg1" id="postUsrImg"></td>
									<td><input id="newPost" autocomplete="off"
									onkeyup="checkPostEntry()"
									onpaste="checkPostEntry()"
									placeholder="What's on your mind?"/></td>
									</tr>
									<tr><td colspan="2">
									<hr class="hr1">
									</td></tr>
									</table>
									<table><tr>
									<td><button id="postBtn" onclick="savePost(0)">Post</button></td>
									<td><div 
									id="postMsg">Note: all messages posted to this 
									board are public and can be seen by everyone.</div></td>
									</tr></table></td>
									</tr></table>
								</div><!-- postFrm -->
								
							</li>

							<li>
							   <div class="smlHdr">Posts</div> 
							</li>
						
							<!-- msgs displayed below via innerHTML: -->
							<li>
							<ul id="msgs"></ul>
							</li>
						
						
						</div><!-- msgCol -->
						
					</div><!-- topLvlPgContent_desktop -->
					
               
			</div><!-- viewPort -->
		
		<div id="tint" onclick="hideCurrentPanel()"></div>
		
		<div id="logonPanel">
			<div id="logonTabs">
				<div class="tabLeftSpacing"></div>
				<div class="activeTab loginTab" onclick="pickLogonView()"
				     id="loginTab">Logon</div>
				<div class="inactiveTab signupTab" onclick="pickSignupView()" 
				     id="signupTab">Sign Up</div>
				<div class="tabRightSpacing"></div>
			</div><!-- logonTabs -->
			
			<div id="logonView">
				<div id="logonInfoMsg"></div>
				
				<span id="lblLogon" class="hdr1">Please Log In...</span>
				
				<span id="lblEmailAdr">Email Address:</span>
				<input id="logonEmailAdr" type="text"
				       maxlength="200"
				       onkeyup="checkLogonInput(EMAIL_INPUT,false)"
				       onblur="checkLogonInput(EMAIL_INPUT,true)">
			
				<span id="lblPassword">Password:</span>
				<input id="pwd" type="password"
					   maxlength="20"	
					   onkeyup="checkLogonInput(PWD_INPUT,false)"
				       onblur="checkLogonInput(PWD_INPUT),true">
			
				
			
				<button title="click to cancel logon"
				 onclick="cancelLogonPanel()"
				 class="cancelBtn cancelBtnLogon">Cancel</button>
			
				<button id="btnSignIn" disabled
				onclick="signIn()"
				class="userSubmitBtnDisabled userSubmitBtnLogon">Sign In</button>
				
				<div class="notAUser">Not a user? &nbsp;
					<span class="specLnk" onclick="pickSignupView()">Sign Up!</span>
				</div>
				
			</div><!-- logonView -->
			
			<div id="signUpView">
			
				<span class="hdr2">Sign Up...</span>
				
				<span id="lblInvitationCode">Invitation Code:</span>
				<input id="invCode" 
				       maxlength="40"
				       type="text"
				       onkeyup="checkSignUpInput(INVCODE_INPUT,false)"
				       onblur="checkSignUpInput(INVCODE_INPUT,true)">
				
				<span id="lblEmailAdr2">Email Address:</span>
				<input id="logonEmailAdr2" 
				       maxlength="200"
				       type="text"
				       onkeyup="checkSignUpInput(EMAIL_INPUT,false)"
				       onblur="checkSignUpInput(EMAIL_INPUT,true)">
				
				<span id="lblEmailAdr2c">Confirm Email:</span>
				<input id="logonEmailAdr2_confirm" 
				       maxlength="200"
				       type="text"
				       onkeyup="checkSignUpInput(EMAIL_INPUT2,false)"
				       onblur="checkSignUpInput(EMAIL_INPUT2,true)">
				
				<span id="lblUsrFirstName">First Name:</span>
				<input id="usrFirstName" 
				       maxlength="60"
				       type="text"
				       onkeyup="checkSignUpInput(FIRSTNAME_INPUT,false)"
				       onblur="checkSignUpInput(FIRSTNAME_INPUT,true)">
				
				<span id="lblUsrLastName">Last Name:</span>
				<input id="usrLastName" 
				       maxlength="60"
				       type="text"
				       onkeyup="checkSignUpInput(LASTNAME_INPUT,false)"
				       onblur="checkSignUpInput(LASTNAME_INPUT,true)">
				
				
				<span id="lblPassword2">Password:</span>
				<input id="pwd2" type="password" 
				       maxlength="20"
				       onkeyup="checkSignUpInput(PWD_INPUT,false)"
				       onblur="checkSignUpInput(PWD_INPUT,true)">
				
				<span id="lblPassword2c">Confirm Password:</span>
				<input id="pwd2_confirm" type="password" 
				      maxlength="20"
				      onkeyup="checkSignUpInput(PWD_INPUT2,false)"
				      onblur="checkSignUpInput(PWD_INPUT2,true)">
				
				<button title="click to cancel logon"
				 onclick="cancelLogonPanel()"
				 class="cancelBtn cancelBtnLogon">Cancel</button>
				 
				 <div id="signUpMsg"></div>
				 
				<button id="btnSignUp" disabled
				onclick="signUp()"
				class="userSubmitBtnDisabled userSubmitBtnLogon">Sign Up</button>
				 
			</div><!-- signUpView -->
			
		</div><!-- logonPanel -->
		
		
		<div id="logOffPanel">
			<div class="lblLogoff">Are you sure want to log off?</div>
			<button class="userSubmitBtn" 
			onclick="signOff()"
			style="top:67px;left:30px;">Log Off</button>
			<button class="cancelBtn" 
			onclick="signOffCancel()"
			style="top:67px;left:170px;">Cancel</button>
		</div>
		
		<div id="userProfilePanel">
		</div><!-- userProfilePanel -->
		
		<div id="popupMnu"></div>
		
		<div id="statusMsg">Operation Status</div>
		
		<div id="problems"></div>
		
	
		<script src="./js/jquery-3.1.1.min.js"></script>
		<script src="./js/orvsAjax.js<?= $uniqueParam ?>"></script>
		<script src="./js/msgWallDemo.js<?= $uniqueParam ?>"></script>
		<script src="./js/generalBlurb.js<?= $uniqueParam ?>"></script>
		<script src="./js/popupMenu.js<?= $uniqueParam ?>"></script>
		<script src="./js/duh.js<?= $uniqueParam ?>"></script>
	</body>
</html>
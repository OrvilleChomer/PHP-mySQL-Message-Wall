	
	/*
	*/
	function getBlurbGeneral() {
		var s=[];
		var Q = '"';
		
		s[s.length] = "<b>About Orville Chomer:</b><br>";
		s[s.length] = "<ul>";
		
		s[s.length] = "<li><a ";
		s[s.length] = "target='linkedIn' ";
		s[s.length] = "href="+Q;
		s[s.length] = "https://www.linkedin.com/in/orvillechomer/";
		s[s.length] = Q+">LinkedIn Profile</a></li>";
		
		s[s.length] = "<li><a href="+Q;
		s[s.length] = "target='resume' ";
		s[s.length] = "http://chomer.com/wp-content/2017/12/OrvilleChomerResume2017.docx";
		s[s.length] = Q+">Resume (MS Word)</a></li>";
		
		s[s.length] = "<li><a ";
		s[s.length] = "target='resume' ";
		s[s.length] = "href="+Q;
		s[s.length] = "http://chomer.com/wp-content/2017/12/OrvilleChomerResume2017.pdf";
		s[s.length] = Q+">Resume (PDF)</a></li>";
		
		s[s.length] = "<li><a ";
		s[s.length] = "target='blog' ";
		s[s.length] = "href="+Q;
		s[s.length] = "http://chomer.com/";
		s[s.length] = Q+">Blog</a></li>";
		
		s[s.length] = "<li><a ";
		s[s.length] = "target='codepen' ";
		s[s.length] = "href="+Q;
		s[s.length] = "https://codepen.io/pens/mypens/";
		s[s.length] = Q+">CodePen (Public Pens)</a></li>";
		
		s[s.length] = "<li><a ";
		s[s.length] = "target='twitter' ";
		s[s.length] = "href="+Q;
		s[s.length] = "http://twitter.com/orvilleChomer";
		s[s.length] = Q+">Twitter (@orvilleChomer)</a></li>";		
		s[s.length] = "</ul>";
		s[s.length] = "&nbsp;<br>";
		return s.join("");
	} // end of function getBlurbGeneral()
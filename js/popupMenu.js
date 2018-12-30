


	function newMenu(ctl) {
		var mnu = {};
		
		mnu.ctl = ctl;
		mnu.itemsByIndex = [];
		
		mnu.addMenuItem = function(sCaption, sRunCode) {
			var itm = {};
			
			itm.caption = sCaption;
			itm.runCode = sRunCode;
			itm.indexNum = mnu.itemsByIndex.length;
			
			mnu.itemsByIndex[itm.indexNum] = itm;
			
			return itm;
		} // end of method
		
		
		mnu.renderMenu = function() {
			var popupMnu = $("#popupMnu")[0];
			var s = [];
			
			popupMnu.style.minHeight = "100px";
			
			s[s.length] = "<ul>";
			
			s[s.length] = "<ul>";
			
			popupMnu.innerHTML =s.join("");
		}  // end of method
		
		mnu.hideMenu = function() {
		} // end of method
		
		return mnu;
	} // end of function newMenu() 
	
	
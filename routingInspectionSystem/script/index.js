apiready = function(){
	var userInfo = api.getPrefs({
		sync:true,
		key: "userInfo"
	});

	alert("userInfo:" + userInfo);

	var info = {
		username : userInfo.username,
	}

	// if(!userInfo){
		transferToPage('login', 'html/login.html', info);
	// }
	// else {
	// 	connectToService("",
	// 		{
	// 		    values:{
	// 		        username: userInfo.username,
	// 		        password: userInfo.password
	// 		    }
	// 		},
	// 	    function(ret){
	// 	    	alert(ret);
	// 	    	animationStart(function(){}, 'main', 'html/main.html', {username: userInfo.username});
	// 	    },
	// 	    function(ret){
	// 	    	animationStart(function(){}, 'main', 'html/main.html', {username: userInfo.username});
	// 	    	// transferToPage('login', 'html/login.html', {});
	// 	    }
	// 	);
	// }
}

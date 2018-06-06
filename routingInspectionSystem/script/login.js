apiready = function(){

    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

    api.addEventListener({
        name: 'online'
    }, function(ret, err) {
        if (ret) {
        	//doNothing
        } else {
            alert("网络连接出现问题，请确保当前连接可用");
        }
    });

    var checkBoxStuff = function(username, password){
    	var checkb = window.$api.byId("checkbox");
    	if(checkb.checked){
    		setPrefs(username, password);
    	}
    }

    var setPrefs = function(username, password){
    	api.setPrefs({
    		key: 'userInfo',
    		value: {
    			'username' : '' + username,
    			'password' : '' + password
    		}
    	});
    }

    window.$api.byId('submitBtn').addEventListener("click", function(){

    	var username = window.$api.byId("inputUsername").value;

	    var password = window.$api.byId('inputPassword').value;

    	checkBoxStuff(username, password);

	    alert('userName:'+ username + ' password:' + password);

	    /*connectToService("http://dgjxj.liveej.com/appapi.ashx?action=login",
	    	{
		        values: {"username": "" + username , "password": "" + password }
		    },
		    function(ret){
                alert(JSON.stringify(ret));
		    	// animationStart(function(){}, 'main', './main.html', {username: username})
		    },
		    function(ret){
                alert(JSON.stringify(ret));
		    	alert("用户名或密码有错误！");
		    }
		);*/
	    animationStart(function(){}, 'main', './main.html', {username: username});

    }, false);

}

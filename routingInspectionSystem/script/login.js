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

	    connectToService( commonURL + "?action=login",
	    	{
		        values: {"username": "admin" , "password": "admin88" }
		    },
		    function(ret){
          if(ret.result){
            var param = {user:{}, history:{}};
            param.user.userid = ret.data.id;
            param.user.name = ret.data.name;
            param.user.username = ret.data.username;
            param.user.departmentid = ret.data.departmentid;
            param.user.departmentname = ret.data.departmentname;
            param.history.page = "login";
            param.history.url = "../html/login.html";
  		    	animationStart(function(){}, 'main', './main.html', param);
          }
          else {
            alert("用户名或密码有错误！");
          }
		    },
		    function(ret,err){
		    	alert(JSON.stringify(err));
		    }
		  );

    }, false);

}

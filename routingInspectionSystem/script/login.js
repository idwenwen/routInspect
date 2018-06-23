apiready = function(){

    var intervalTime = 5000;
    var requestTime = 5000;

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

    var aMapLBS = api.require('aMapLBS');
  	var positions = [];
  	var send = false;
    var showingErrMessage = false;
    var showingFailMessage = false;
    var alerts  = true;

  	var startlbsPO = function(ms, ms2, userid){
    	aMapLBS.configManager({
    			accuracy: 'hundredMeters',
    			filter: 1
    	}, function(ret, err) {
    		if (ret.status) {
    			// setInterval(function(){
    			// 		aMapLBS.singleLocation({
    			// 				timeout: 5
    			// 		}, function(ret, err) {
    			// 				if (ret.status) {
    			// 					//TODO：此处记录一个位置信息信息内容，并发送位置信息。信息
    			// 					if(positions.length >= 50){
    			// 						positions.pop();
    			// 					}
    			// 					positions.unshift([ret.lon, ret.lat]);
          //           // alert(JSON.stringify(positions));
    			// 					$api.setStorage('position', positions);
          //           alert($api.getStorage("position"));
    			// 					if(!send)
    			// 					{
    			// 						sned = true;
    			// 					}
    			// 					else {
    			// 						//发送请求。
    			// 					}
    			// 				}
      		// 			});
      		// 		},ms);
          //通过LBS进行连续定位
          api.addEventListener({
              name: 'changePositionList'
          }, function(ret, err){
              if( ret ){
                var v = ret.value;
                positions = [];
                positions.unshift([v.lon, v.lat]);
              }else{
                alert( JSON.stringify( err ) );
              }
          });
          aMapLBS.startLocation(function(ret, err) {
                if (ret.status) {
                  if(positions.length >= 100){
                    positions.pop();
                  }
                  positions.unshift([ret.lon, ret.lat]);
                  $api.setStorage('position', JSON.stringify(positions));
                  if(positions.length >= 4){
                    api.sendEvent({
                      name: 'refreshmap'
                    });
                  }
                  api.sendEvent({
                      name: 'postionChange'
                  });
                  // alert($api.getStorage("position"));

                }
          			else {
          				// alert("当前无法进行定位。");
          			}
              });
          setInterval(function(){
                  var pos = positions[0];
                  var lat = 0;
                  var lon = 0;
                  if(pos){
                    lat = pos[1];
                    lon = pos[0];
                  }
                  connectToService(commonURL + "?action=position",
            	    	{
                      values:{"userid": userid, "lat":lat, "lon":lon }
                    },
                    function(ret){
                    	if(ret.result == true){

            					}
                      else{
                        if(!showingFailMessage){
                          showingErrMessage = true;
                          // alert("当前网络信号不佳， 无法进行实时定位！");
                        }
                      }
            		    },
            		    function(ret){
                      if(!showingErrMessage){
                        showingErrMessage = true;
                        // alert("程序错误，程序员正在奋斗中！");
                      }
            		    });
              }, ms2);
        }
      });
    }

    var loginfunc = function(username, password){
      connectToService( commonURL + "?action=login",
	    	{
		        values: {"username": username , "password": password }
		    },
		    function(ret){
          if(ret.result){
            startlbsPO(intervalTime, requestTime, ret.data.id);
            var param = {user:{}, history:{}};
            param.user.userid = ret.data.id;
            param.user.name = ret.data.name;
            param.user.username = ret.data.username;
            param.user.departmentid = ret.data.departmentid;
            param.user.departmentname = ret.data.departmentname;
            param.history.page = "login";
            param.history.url = "../html/login.html";
            setTimeout(function(){
  		    	     animationStart(function(){}, 'main', './main.html', param, true);
            },10);
          }
          else {
            alert(ret.desc);
          }
		    },
		    function(ret,err){
		    	alert(JSON.stringify(err));
		    }
		  );
    }

    var autoLogin = function(){
      var data = api.getPrefs({
          key: 'userInfo'
      }, function(ret, err){
        if( ret ){
          var users = JSON.parse(ret.value);
            $api.byId("inputUsername").value = users.username;
            $api.byId('inputPassword').value = users.password;
            // loginfunc(users.username, users.password);
          }else{
               alert( JSON.stringify( err ) );
          }
      });

    }

    $api.clearStorage("position");
    $api.clearStorage("taskpoint");

    window.$api.byId('submitBtn').addEventListener("click", function(){

    	var username = window.$api.byId("inputUsername").value;

	    var password = window.$api.byId('inputPassword').value;

    	checkBoxStuff(username, password);

      loginfunc(username, password);

    }, false);

    api.addEventListener({
      name: 'keyback'
    }, function(ret, err) {
      api.toLauncher();
    });

    autoLogin();
}

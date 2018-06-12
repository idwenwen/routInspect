apiready = function(){
	var userInfo = api.getPrefs({
		sync:true,
		key: "userInfo"
	});

	var info = {
		username : userInfo.username,
	}

	// var amapLocation = api.require('aMapLocation');
	// var myx = 0;
	// var myy = 0;
	// var mytimestamp = 0;
	// var mytotaltamp = 0;
	//
	// //打开地图，并设定人物展示位置
	// var startPos = function(){
	// 	var param = { accuracy: 20, filter: 1, autoStop: false };
	// 	var resultCallback = function(ret, err) {
	// 			if (ret.status) {
	// 					//alert("经度：" + ret.longitude + "\n纬度：" + ret.latitude + "\n时间：" + ret.timestamp);
	// 					myx = ret.latitude;
	// 					myy = ret.longitude;
	// 					mytimestamp = ret.timestamp;
	// 					mytotaltamp += mytimestamp;
	// 					var el = document.createElement("span");
	// 					el.innerHTML = "location : " + " x:" + myx + "  y:" + myy;
	// 					$api.byId('info').appendChild(el);
	// 			} else {
	// 					alert(err.code + ',' + err.msg);
	// 			}
	// 	}
	// 	amapLocation.startLocation(param, resultCallback);
	// }

	var aMapLBS = api.require('aMapLBS');
	var startlbsPO = function(){
		aMapLBS.configManager({
		    accuracy: 'best',
		    filter: 1
		}, function(ret, err) {
		    if (ret.status) {
					aMapLBS.startLocation(function(ret, err) {
						if(ret.status){
							var el = document.createElement("span");
							el.innerHTML = "lbs : " + " x:" + ret.lat + "  y:" + ret.lon;
							$api.byId('info').appendChild(el);
						}
					});
		    }
		});
}

	//结束相关的定位功能
	// var stopLocation = function(){
	// 	amapLocation.stopLocation();
	// }

	// startPos();
	startlbsPO();
	// if(!userInfo){
		// transferToPage('login', 'html/login.html', info);
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

apiready = function(){
	var userInfo = api.getPrefs({
		sync:true,
		key: "userInfo"
	});

	var info = {
		username : userInfo.username,
	}

	var background = false;
	api.addEventListener({
	    name: 'pause'
	}, function(ret, err){
	    background = true;
			//TODO:唤醒
	});

	api.addEventListener({
	    name: 'resume'
	}, function(ret, err){
	    background = false;
	});



	var eventcache = {};
	var enew = -1;
	var echeck = -1;

	var taskcache = {};
	var tnew = -1;
	var tcache = -1;

	var checkdifferent = function(arr1, arr2){
		if(arr1.length != arr2.length){
			return true;
		}
		arr1.forEach(function(item, index){
			if(item.id != arr2[index].id){
				return true;
			}
		});
		return false;
	}

	var eventNotice = function(){
		api.addEventListener({
				name: 'notificationE'
		}, function(ret, err){
				if(!background){
					return false;
				}
				var eventc = ret.value.cachelist;
				if(eventcache.n){
					if(checkdifferent(eventc.n, eventcache.n)){
						if(enew == -1){
							// 说明当前没有任何的提示内容
							api.notification({
							    notify: {
							        content: '有新的事项有待处理！',
											extra: "newEvent"
							    }
							}, function(ret, err){
							    if( ret ){
							         enew = ret.id;
							    }
							});
						}
					}
				}
				if(eventcache.c){
					if(checkdifferent(eventc.c, eventcache.c)){
						if(echeck == -1){
							// 说明当前没有任何的提示内容
							api.notification({
							    notify: {
							        content: '有新的待审核事项哟！',
											extra: "checkEvent"
							    }
							}, function(ret, err){
							    if( ret ){
							         echeck = ret.id;
							    }
							});
						}
					}
				}
				eventcache = eventc;
			}
		);
	}

	var taskNotice = function(){
		api.addEventListener({
				name: 'notificationT'
		}, function(ret, err){
				if(!background){
					return false;
				}
				var taskc = ret.value.cachelist;
				if(taskcache.n){
					if(checkdifferent(taskc.n, taskcache.n)){
						if(tnew == -1){
							// 说明当前没有任何的提示内容
							api.notification({
							    notify: {
							        content: '有新的任务有待处理！',
											extra: "newTask"
							    }
							}, function(ret, err){
							    if( ret ){
							         tnew = ret.id;
							    }
							});
						}
					}
				}
				if(taskcache.c){
					if(checkdifferent(taskc.c, taskcache.c)){
						if(tcheck == -1){
							// 说明当前没有任何的提示内容
							api.notification({
							    notify: {
							        content: '有新的待审核任务哟！',
											extra: "checkTask"
							    }
							}, function(ret, err){
							    if( ret ){
							         tcheck = ret.id;
							    }
							});
						}
					}
				}
				taskcache = taskc;
			}
		);
	}

	//消息提醒监控
	var noticeWatching = function(){
		api.addEventListener({
		    name: 'noticeclicked'
		}, function(ret, err){
		    if( ret ){
		    	var check = ret.value;
					if(check == "newEvent"){
						api.cancelNotification({
						    id: enew
						});
						enew = -1;
						animationStart(function(){}, "eventlist" ,"./html/eventlist.html", true);
					}
					else if(check == "checkEvent"){
						api.cancelNotification({
						    id: echeck
						});
						echeck = -1;
						animationStart(function(){}, "eventlist" ,"./html/eventlist.html", true);
					}
					else if(check == "tnew"){
						api.cancelNotification({
						    id: tnew
						});
						tnew = -1;
						animationStart(function(){}, "noticelist" ,"./html/noticelist.html", true);
					}
					else if(check == "checkEvent"){
						api.cancelNotification({
						    id: tcheck
						});
						tcheck = -1;
						animationStart(function(){}, "noticelist" ,"./html/noticelist.html", true);
					}
		    }
		});
	}
	eventNotice();
	taskNotice();
	noticeWatching();

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

	//结束相关的定位功能
	// var stopLocation = function(){
	// 	amapLocation.stopLocation();
	// }

	// startPos();
	// if(!userInfo){

	// var aMapLBS = api.require('aMapLBS');
	// aMapLBS.configManager({
	// 		accuracy: 'best',
	// 		filter: 5
	// }, function(ret, err) {
	// 	if (ret.status) {
	// 		aMapLBS.startLocation(function(ret, err) {
	// 		    if (ret.status) {
	// 		        var s = document.createElement("span");
	// 						s.innerHTML = "lon:" + ret.lon + " lat:" + ret.lat;
	// 						$api.byId("info").appendChild(s);
	// 		    }
	// 		});
	// 	}
	// });

	// setInterval(function(){
	// 	var sp = document.createElement("span");
	// 	sp.innerHTML = "steps";
	// 	$api.byId('info').appendChild(sp);
	// }, 5000);

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

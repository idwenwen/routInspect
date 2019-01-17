apiready = function() {

    var intervalTime = 5000;
    var requestTime = 2000;

    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

    var checkonline = true;
    api.addEventListener({
        name: 'onlineoff'
    }, function(ret, err) {
        if (err) {
            alert(JSON.stringify(err));
            return false;
        }
        if (checkonline) {
            checkonline = false;
        }

    });

    var checkBoxStuff = function(username, password) {
        var checkb = window.$api.byId("checkbox");
        if (checkb.checked) {
            setPrefs(username, password);
        }
    }

    var setPrefs = function(username, password) {
        api.setPrefs({
            key: 'userInfo',
            value: {
                'username': '' + username,
                'password': '' + password
            }
        });
    }

    var aMapLBS = api.require('aMapLBS');
    var positions = [];
    var send = false;
    var showingErrMessage = false;
    var showingFailMessage = false;
    var alerts = true;
    var checkrefresh = 0;

    var startlbsPO = function(ms, ms2, userid) {
        // aMapLBS.configManager({
        // 		accuracy: 'hundredMeters',
        // 		filter: 1
        // }, function(ret, err) {
        // 	if (ret.status) {
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
        // api.addEventListener({
        //     name: 'changePositionList'
        // }, function(ret, err){
        //     if( ret ){
        //       var v = ret.value;
        //       positions = [];
        //       positions.unshift([v.lon, v.lat]);
        //     }else{
        //       // alert( JSON.stringify( err ) );
        //     }
        // });
        // aMapLBS.stopUpdatingLocation();
        // aMapLBS.startLocation(function(ret, err) {
        //       if (ret.status) {
        //         if(positions.length >= 100){
        //           positions.pop();
        //         }
        //         positions.unshift([ret.lon, ret.lat]);
        //         $api.setStorage('position', JSON.stringify(positions));
        //         checkrefresh++;
        //         if(checkrefresh >= 5){
        //           checkrefresh = 0;
        //           api.sendEvent({
        //             name: 'refreshmap'
        //           });
        //         }
        //         // alert($api.getStorage("position"));
        //
        //       }
        // 			else {
        // 				// alert("当前无法进行定位。");
        // 			}
        //     });
        // }
        // });

        mapObj = new AMap.Map('iCenter');
        mapObj.plugin('AMap.Geolocation', function() {
            geolocation = new AMap.Geolocation({
                enableHighAccuracy: true, //是否使用高精度定位，默认:true
                convert: false, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                showButton: false, //显示定位按钮，默认：true
                buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                showMarker: false, //定位成功后在定位到的位置显示点标记，默认：true
                showCircle: false, //定位成功后用圆圈表示定位精度范围，默认：true
                panToLocation: false, //定位成功后将定位到的位置作为地图中心点，默认：true
                zoomToAccuracy: false //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
            });
            mapObj.addControl(geolocation);
            AMap.event.addListener(geolocation, 'complete', function(data) {
                var ret = data.position;
                if (positions.length >= 100) {
                    positions.pop();
                }
                positions.unshift([ret.lng, ret.lat]);
                $api.setStorage('position', JSON.stringify(positions));
                checkrefresh++;
                if (checkrefresh >= 2) {
                    checkrefresh = 0;
                    api.sendEvent({
                        name: 'refreshmap'
                    });
                }
            }); //返回定位信息
            AMap.event.addListener(geolocation, 'error', function() {
                alert("当前GPS信号不佳");
            }); //返回定位出错信息
            setInterval(function() {
                geolocation.getCurrentPosition(function(status, result) {
                    if (status == "complete") {
                        var pos = positions[0];
                        var lat = 0;
                        var lon = 0;
                        if (pos) {
                            lat = pos[1];
                            lon = pos[0];
                        }
                        connectToService(commonURL + "?action=position", {
                                values: {
                                    "userid": userid,
                                    "lat": lat,
                                    "lon": lon
                                }
                            },
                            function(ret) {
                                if (ret.result == true) {

                                } else {
                                    if (!showingFailMessage) {
                                        showingErrMessage = true;
                                        // alert("当前网络信号不佳， 无法进行实时定位！");
                                    }
                                }
                            },
                            function(ret) {
                                if (!showingErrMessage) {
                                    showingErrMessage = true;
                                    // alert("程序错误，程序员正在奋斗中！");
                                }
                            });
                    }
                })
            }, ms2);

        });
    }

    var loginfunc = function(username, password) {
        connectToService(commonURL + "?action=login", {
                values: {
                    "username": username,
                    "password": password
                }
            },
            function(ret) {
                if (ret.result) {
                    startlbsPO(intervalTime, requestTime, ret.data.id);
                    var param = {
                        user: {},
                        history: {}
                    };
                    param.user.userid = ret.data.id;
                    param.user.name = ret.data.name;
                    param.user.username = ret.data.username;
                    param.user.departmentid = ret.data.departmentid;
                    param.user.departmentname = ret.data.departmentname;
                    param.history.page = "login";
                    param.history.url = "../html/login.html";
                    setTimeout(function() {
                        animationStart(function() {}, 'modellist', './modellist.html', param, true);
                    }, 10);
                    // append();
                } else {
                    alert(ret.desc);
                }
            },
            function(ret, err) {
                // alert(JSON.stringify(err));
            }
        );
    }

    var indexes = 0;
    var append = function() {
        api.addEventListener({
            name: 'refreshmap'
        }, function(ret, err) {
            var pos = $api.getStorage('position');
            if (pos) {
                pos = JSON.parse(pos);
            } else {
                return false;
            }
            var s = document.createElement("span");
            s.innerHTML = pos[0][0] + "----" + pos[0][1];
            $api.byId('checkthings').appendChild(s);
        });

    }

    var autoLogin = function() {
        var data = api.getPrefs({
            key: 'userInfo'
        }, function(ret, err) {
            if (ret) {
                var users = JSON.parse(ret.value);
                $api.byId("inputUsername").value = users.username;
                $api.byId('inputPassword').value = users.password;
                // loginfunc(users.username, users.password);
            } else {
                //  alert( JSON.stringify( err ) );
            }
        });

    }

    var idle = function() {
        api.addEventListener({
            name: 'appidle',
            extra: {
                timeout: 300 //设置经过多长时间不操作屏幕时触发，单位秒，数字类型
            }
        }, function(ret, err) {
            alert('已闲置');
        });
    }

    window.$api.byId('submitBtn').addEventListener("click", function() {

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

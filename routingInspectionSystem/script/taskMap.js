apiready = function(){

		var info = api.pageParam;
    var history = info.history;
    info.history = "taskMap";

    //将当前的页面设置为占用手机就全屏内容。
    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

		var amapLocation = api.require('aMapLocation');
		var myx = 0;
		var myy = 0;
		var mytimestamp = 0;
		var mytotaltamp = 0;

		//打开地图，并设定人物展示位置
		var startPos = function(){
			var param = { accuracy: 20, filter: 5, autoStop: false };
			var resultCallback = function(ret, err) {
			    if (ret.status) {
			        //alert("经度：" + ret.longitude + "\n纬度：" + ret.latitude + "\n时间：" + ret.timestamp);
							myx = ret.latitude;
							myy = ret.longitude;
							mytimestamp = ret.timestamp;
							mytotaltamp += mytimestamp;
			    } else {
			        alert(err.code + ',' + err.msg);
			    }
			}
			amapLocation.startLocation(param, resultCallback);
		}

		//结束相关的定位功能
		var stopLocation = function(){
			amapLocation.stopLocation();
		}

		//初始化高德地图相关内容
  	var map = "";
		var points = [];
		var markers = [];
		var initMap = function(){
	  var	layer =  new AMap.TileLayer({
          zooms:[3,20],    //可见级别
          visible:true,    //是否可见
          opacity:1,       //透明度
          zIndex:0         //叠加层级
    	});
			map = new AMap.Map('mapContainer',{
          layers:[layer] //当只想显示标准图层时layers属性可缺省
    	});
			map.on("complete", function(){
				userPos();

			});
		}

		//用户定位函数内容
		var geolocation = "";
		var userPos = function(success, fail){
			map.plugin('AMap.Geolocation', function() {
				geolocation = new AMap.Geolocation({
					// 是否使用高精度定位，默认：true
					enableHighAccuracy: true,
					// 设置定位超时时间，默认：无穷大
					timeout: 10000,
					panToLocation: true,
					zoomToAccuracy: true,
					showCircle: false,
					//  定位按钮的排放位置,  RB表示右下
					buttonPosition: 'RB',
					buttonOffset: new AMap.Pixel(15, 90)
				});
				map.addControl(geolocation);
				geolocation.getCurrentPosition()
				AMap.event.addListener(geolocation, 'complete', onComplete)
				AMap.event.addListener(geolocation, 'error', onError)
				function onComplete (data) {
					if(typeof success == "function"){
						success.call(null, data);
					}
				}
				function onError (data) {
					if(typeof fail == "function"){
						fail.call(null. data);
					}
				}
			});
		}


		//地图相关的点标记
		var addMarker = function(x, y, color){
			var param = {
				map: map,
				// icon:  new AMap.Icon({
        //     size: new AMap.Size(32, 32),  //图标大小
        //     image: "../icon/b-p.png",
				// 		imageOffset: new AMap.Pixel(0, -60)
				// }),
				icon: (color == "blue" ? '../icon/b-p.png' : "../icon/r-p.png"),
				position:[x, y],
				offset: new AMap.Pixel(-20, -30)
			}
			var marker = new AMap.Marker(param);
			if(map){
				marker.setMap(map);
			}
			else{
				alert("map has not inited");
			}
			markers.push(marker);
		}


		//两点之间的点标记内容
		var walkingLine = function(posOne, posTwo){
			 AMap.plugin('AMap.Walking', function() {
				 var walking = new AMap.Walking({
					 map: map,
					 hideMarkers: true
				 });
				 //根据起终点坐标规划步行路线
				 walking.search([posOne.x, posOne.y], [posTwo.x, posTwo.y], function(status, result){

				 });
			 })
		}


		//绘制简易打卡点页面
		var routingPoint = function(arr){
			for(var i = 0 ; i < arr.length ; i ++){
				var newEle = document.createElement("div");
				newEle.setAttribute("class", "punchPoint");
				newEle.innerHTML = "<span class='num numcolorgr'>" + (i+1) + "</span>" +
					"<span class='name'>" + arr[i].info + "</span>";
				if( i == (arr.length -1) ){
					 newEle.innerHTML = "<span class='num numcolorgr lastpp'>" + (i+1) + "</span>" +
						"<span class='name'>" + arr[i].info + "</span>";
				}
				$api.byId("easymap").appendChild(newEle);

			}
		}

		var clickToInit = function(){
			initMap();
			addMarker(118.125, 24.71, "red");
			addMarker(118.127, 24.72, "blue");
			walkingLine(poss[0], poss[1]);
		}

		//动态页面绑定
		var inited = false;
		var dynamicWeb = function(){
			$api.byId('excMap').addEventListener("click", function(){
				var em = $api.byId("easymap");
				var sm = $api.byId('ampa');
				if(em.getAttribute("style")){
					em.removeAttribute("style");
					sm.setAttribute("style", "display:none;");
				}
				else {
					sm.removeAttribute("style");
					em.setAttribute("style", "display:none;");
					if(!inited){
						inited = true;
						clickToInit();
					}
				}
			},false);

			$api.byId("repEvent").addEventListener("click", function(){
				animationStart(function(){}, "reportEvent", "../html/reportEvent.html", info, true);
			},false);

			$api.byId('endTask').addEventListener("click", function(){
				//todo: 验证签到点, 提交相关的请求.
				stopLocation();
				animationStart(function(){}, "main", "../html/main.html", info, true);
			},false);
		}

		var poss = [{x: 118.125 , y:24.71}, {x:118.127, y:24.72}];
		startPos();
		routingPoint([{info:"xx路段"}, {info:"YY路段"}]);
		dynamicWeb();
		// setTimeout(function(){
		// 	animationStart(function(){}, "main" , "../html/main.html", info, true);
		// }, 3000);
}

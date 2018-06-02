apiready = function(){

		var info = api.pageParam;
    var history = info.history;
    info.history = "main";

    //将当前的页面设置为占用手机就全屏内容。
    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

		// var amapLocation = api.require('aMapLocation');
		// //打开地图，并设定人物展示位置
		// var startPos = function(){
		// 	var param = { accuracy: 20, filter: 1, autoStop: false };
		// 	var resultCallback = function(ret, err) {
		// 	    if (ret.status) {
		// 	        alert("经度：" + ret.longitude + "\n纬度：" + ret.latitude + "\n时间：" + ret.timestamp);
		// 	    } else {
		// 	        alert(err.code + ',' + err.msg);
		// 	    }
		// 	}
		// 	amapLocation.startLocation(param, resultCallback);
		// }
		//
		// var stopLocation = function(){
		// 	amapLocation.stopLocation();
		// }
		//
  	// var map = "";
		// var points = [];
		// var markers = [];
		// var initMap = function(position){
		position = {x: 116, y: 133};
	  var	layer =  new AMap.TileLayer({
          zooms:[3,20],    //可见级别
          visible:true,    //是否可见
          opacity:1,       //透明度
          zIndex:0,         //叠加层级
					center: [position.x, position.y]
    	});
			var map = new AMap.Map('container',{
          layers:[layer] //当只想显示标准图层时layers属性可缺省
    	});
			// map.on("complete", function(){
			// 	userPos();
			// });
		// }

		// var userPos = function(success, fail){
		// 	map.plugin('AMap.Geolocation', function() {
		// 		var geolocation = new AMap.Geolocation({
		// 			// 是否使用高精度定位，默认：true
		// 			enableHighAccuracy: true,
		// 			// 设置定位超时时间，默认：无穷大
		// 			timeout: 10000,
		// 			//  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
		// 			zoomToAccuracy: true,
		// 			//  定位按钮的排放位置,  RB表示右下
		// 			buttonPosition: 'RB'
		// 		})
		//
		// 		geolocation.getCurrentPosition()
		// 		AMap.event.addListener(geolocation, 'complete', onComplete)
		// 		AMap.event.addListener(geolocation, 'error', onError)
		// 		function onComplete (data) {
		// 			if(typeof success == "function"){
		// 				success.call(null, data);
		// 			}
		// 		}
		// 		function onError (data) {
		// 			if(typeof fail == "function"){
		// 				fail.call(null. data);
		// 			}
		// 		}
		// 	});
		// }
		//
		// var addMarker = function(x, y, color){
		// 	var param = {
		// 		icon: (color == "blue" ? "http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png" :
		// 			"http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png"),
		// 		position:[x, y]
		// 	}
		// 	var marker = new AMap.Marker(param);
		// 	if(map){
		// 		marker.setMap(map);
		// 	}
		// 	else{
		// 		alert("map has not inited");
		// 	}
		// 	markers.push(marker);
		// }
		//
		// startPos();
		// initMap()
		// setTimeout(function(){
		// 	stopLocation();
		// }, 30000)
}

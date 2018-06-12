apiready = function(){

		var info = api.pageParam.info;
    var history = info.history;
    info.history.page = "taskMap";
		info.history.url = "../html/taskMap.html"
		var visit = info.start;

    //将当前的页面设置为占用手机就全屏内容。
    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

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
				var eleColor = arr[i].color == "red" ? "numcolorr" : (arr[i].color == "green" ? "numcolorg" : "numcolorgr");
				newEle.setAttribute("class", "punchPoint");
				newEle.innerHTML = "<span class='num " + eleColor + "'>" + (i+1) + "</span>" +
					"<span class='name'>" + arr[i].info + "</span>";
				if( i == (arr.length -1) ){
					 newEle.innerHTML = "<span class='num numcolorgr lastpp'>" + (i+1) + "</span>" +
						"<span class='name'>" + arr[i].info + "</span>";
				}
				$api.byId("easymap").appendChild(newEle);

			}
		}

		var clickToInit = function(){
			var poss = [{x: 118.125 , y:24.71}, {x:118.127, y:24.72}, {x:118.120, y:24.73}, {x:118.119, y:24.69}];
			initMap();
			addMarker(118.125, 24.71, "red");
			addMarker(118.127, 24.72, "blue");
			addMarker(poss[2].x, poss[2].y, "blue");
			addMarker(poss[3].x, poss[3].y, "blue");
			walkingLine(poss[0], poss[1]);
			walkingLine(poss[1], poss[2]);
			walkingLine(poss[2], poss[3]);
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

			$api.byId("repEvent").addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				animationStart(function(){}, "reportEvent", "../html/reportEvent.html", info, true);
			},false);

			$api.byId('endTask').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				//TODO: 验证签到点, 提交相关的请求.
				animationStart(function(){}, "main", "../html/main.html", info, true);
			},false);

			$api.byId('returnBtn').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				animationStart(function(){}, "inspectionTask", "../html/inspectionTask.html", info, false);
			},false);
		}

		//获取当前的数据内容
		var requestForFata = function(callback){
			//TODO：获取当前页面的展示内容，并进行初始化当前的数据
		}

		var countingDistance = function(p1, p2){
			//TODO: 计算当前的两点之间之间的支线距离
			var dis = AMap.GeometryUtil.distance(p1, p2);
			return dis;
		}

		var checkmark = function(p1, p2){
			var dis = countingDistance(p1, p2);
			if(dis <= 20){
				//TODO：发送请求说明打卡点。
			}
		}

		//获取路段的展示点内容
		var getRouteMark = function(r1){
			var len = r1.length;
			var point = Math.floor(len/2);
			return r1[point - 1];
		}

		//核对当前的路段是否已经打卡成功
		var checkRouteMark = function(r1){
			//TODO：当打卡点打卡80%以上算当前路段打卡成功。
		}

		//上报打卡成功的点或者路段内容
		var requestMark = function(){
			//TODO：当有点打卡成功的话，我们直接上报当前打卡成功的点的信息
		}

		var initedPage = function(){
			//TODO: 通过对比visit变量来进行相关内容的参数设置。
			if(visit){
				$api.byId('returnBtn').removeAttribute("style");
				$api.byId('repEvent').setAttribute("style", "display:none;");
				$api.byId('endTask').setAttribute("style", "display:none;");
			}
			else {
				$api.byId('repEvent').removeAttribute("style");
				$api.byId('endTask').removeAttribute("style");
				$api.byId('returnBtn').setAttribute("style", "display:none;");
			}
		}

		//存储当前内容的点击内容。
		var savePoints = function(){
			//TODO: 通过setStorage来进行点集合的存储来进行相关内容存储。
		}

		var getPoints = function(){
			//TODO: 获取存储的点集。
		}

		routingPoint([{info:"梧桐路", color:"green"}, {info:"二环南路", color:"red"}, {info:"吉安路"}, {info:"同宏路"}]);
		if(visit){
			$api.byId('returnBtn').setAttribute("style", "display:none;");
			$api.byId('returnBtn').removeAttribute("style");
			$api.byId('endTask').removeAttribute("style");
		}
		dynamicWeb();
}

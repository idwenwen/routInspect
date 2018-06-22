apiready = function(){

		var info = api.pageParam.info;
    var history = info.history;
    info.history.page = "taskMap";
		info.history.url = "../html/taskMap.html";
		var visit = info.start;
		var taskData = info.taskdata;
		var leader = taskData.userid;

    //将当前的页面设置为占用手机就全屏内容。
    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

		//初始化高德地图相关内容
  	var map = "";
		var points = [];
		var initPlace = false;
		var initMap = function(){
	  	var	layer =  new AMap.TileLayer({
          zooms:[3,18],    //可见级别
          visible:true,    //是否可见
          opacity:1,       //透明度
          zIndex:0         //叠加层级
    	});
			map = new AMap.Map('mapContainer',{
          layers:[layer] //当只想显示标准图层时layers属性可缺省
    	});
			map.on("complete", function(){
				drawingPoints();
				if(visit){
					api.addEventListener({
					    name: 'postionChange'
					}, function(ret, err){
					    if( ret ){
								var pos = JSON.parse($api.getStorage('position'));
								pos = pos[0];
								usePos(pos[0], pos[1]);
								checksignin(pos);
								$api.byId('blackmode').setAttribute("style", "display:none;");
								api.removeEventListener({
								    name: 'postionChange'
								});
					    }else{
					    }
					});
					setTimeout(function(){
						if(initPlace){
							return false;
						}
						$api.byId('blackmode').setAttribute("style", "display:none;");
						api.removeEventListener({
								name: 'postionChange'
						});
						var p = getCenterPoint();
						setTimeout(function(){
							map.setZoomAndCenter(15, p);
							$api.byId('blackmode').setAttribute("style", "display:none;");
						},500);
					}, 10000);
				}
				else {
					// api.addEventListener({
					//     name: 'postionChange'
					// }, function(ret, err){
					//     if( ret ){
								var p = getCenterPoint();
								setTimeout(function(){
									map.setZoomAndCenter(15, p);
									$api.byId('blackmode').setAttribute("style", "display:none;");
								},500);
					// 			api.removeEventListener({
					// 			    name: 'postionChange'
					// 			});
					//     }else{
					//     }
					// });
				}
			});
		}

		var getCenterPoint = function(){
			if(pointlist.length > 0){
				if(typeof pointlist[0].point[0] == "object"){
					return pointlist[0].point[0];
				}
				else {
					return pointlist[0].point;
				}
			}
			else {
				var pos = JSON.parse($api.getStorage('position'));
				return pos[pos.length - 1];
			}
		}

		//初始化任务定位内容，并实时展示任务的
		var userMark = null;
		var usePos = function(lat, lon){
			var param = {
				icon: '../icon/position-my.png',
				position:new AMap.LngLat(lat, lon),
				offset: new AMap.Pixel(-20, -30)
			}
			var markerup = new AMap.Marker(param);
			if(map){
				markerup.setMap(map);
				//定位当前的位置信息 //BUG:定位中心有问题
				setTimeout(function(){
					map.setZoomAndCenter(15, [lat, lon]);
				},500);
			}
			else{
				alert("map has not inited");
			}
			userMark = markerup;
			initPlace = true;
		}

		//试试绘制路线内容
		var drawLine = function(arr){
			var paths = [];
			for(var i = 0 ; i < arr.length ; i ++){
				paths.push(new AMap.LngLat(arr[i][0], arr[i][1]));
			}
			var polyline = new AMap.Polyline({
			    path: paths,
			    borderWeight: 2, // 线条宽度，默认为 1
			    strokeColor: '#4169E1', // 线条颜色
			    lineJoin: 'round', // 折线拐点连接处样式
					lineCap:'round'
			});
			if(map){
				map.add(polyline);
			}
			else {
				alert("map has not inited");
			}
		}

		//定时刷新定位与路径内容
		var refreshMap = function(){
			// alert("refreshMap");
				var arr = [];
				var pos = JSON.parse($api.getStorage('position'));
				if(pos && pos.length >= 2){

					for(var i = pos.length - 1; i >= 0 ; i--){
						arr.push(pos[i]);
						checksignin(pos[i]);
					}
					// alert(JSON.stringify(arr));
					if(userMark){
						userMark.setPosition(new AMap.LngLat(pos[0][0], pos[0][1]));
						drawLine(arr);
					}
					api.sendEvent({
						name: 'changePositionList',
						extra: {
						  lat: pos[0][1],
							lon: pos[0][0]
						}
					});
				}
		}

		var filterPoints = function(arr){
			if(arr.length == 2){
				var distance = countingDistance(arr[0], arr[1]);
			}
			return arr;
		};

		//地图相关的点标记
		var addMarker = function(lat, lon, color, index){
			var param = {
				icon: (color == "green" ? '../icon/g-p.png' : (color == "red" ? '../icon/r-p.png': "../icon/b-p.png")),
				position:new AMap.LngLat(lat, lon),
				offset: new AMap.Pixel(-20, -30)
			}
			var markerp = new AMap.Marker(param);
			// marker.setLabel({//label默认蓝框白底左上角显示，样式className为：amap-marker-label
      //   offset: new AMap.Pixel(20, 20),//修改label相对于maker的位置
      //   content: "我是marker的label标签"
    	// });
			if(map){
				 markerp.setMap(map);
			}
			else{
				alert("map has not inited");
			}
			// markers.push(marker);
			// marker.setColors = function(color){
			// 	this.setIcon(color == "green" ? '../icon/g-p.png' : color == "red" ? '../icon/r-p.png': "../icon/b-p.png");
			// }
			return markerp;
		}

		//两点之间行走路线
		var walkingLine = function(posOne, posTwo, callback){
			 AMap.plugin('AMap.Walking', function() {
				 var walking = new AMap.Walking({
					 map: map,
					 hideMarkers: true
				 });
				 //根据起终点坐标规划步行路线
				 walking.search([posOne.x, posOne.y], [posTwo.x, posTwo.y], function(status, result){
					 callback && callback(posOne, posTwo);
				 });
			 })
		}

		//绘制简易打卡点页面
		var routingPoint = function(data, index, check){
				var newEle = document.createElement("div");
				var eleColor = data.color == "red" ? "numcolorr" : (data.color == "green" ? "numcolorg" : "numcolorgr");
				newEle.setAttribute("class", "punchPoint");
				newEle.innerHTML = "<span class='num " + eleColor + "'>" + (index+1) + "</span>" +
					"<span class='name'>" + data.info + "</span>";
				if( check ){
					 newEle.innerHTML = "<span class='num lastpp numcolorgr'>" + (index+1) + "</span>" +
						"<span class='name'>" + data.info + "</span>";
				}
				$api.byId("easymap").appendChild(newEle);
				newEle.setColors = function(color){
					var eles = this.children[0];
					var classes = eles.getAttribute("class").split(" ");
					classes[classes.length-1] = color == "red" ? "numcolorr" : (color == "green" ? "numcolorg" : "numcolorgr");
					eles.setAttribute("class", classes.join(" "));
				}
				return newEle;
		}

		//获取路段展示点
		var calculatePointForRoute = function(arr){
			var len = Math.floor(arr.length / 2);
			var lat = (arr[0][0] + arr[arr.length-1][0]) / 2;
			var lon = (arr[0][1] + arr[arr.length-1][1]) / 2;
			if(arr.lenth % 2){
				var disOlat = arr[len-1][0] - lat;
				var disOlon = arr[len-1][1] - lat;
				var disTlat = arr[len][0] - lat;
				var disTlon = arr[len][1] - lat;
			}
			if( ( disOlat + disOlon ) / 2  <=  ( disTlat + disTlon ) / 2 ){
				return arr[len - 1];
			}
			else{
				return arr[len];
			}
		}

		//核对当前的路段是否打卡成功
		var checkRouteMarked = function(marr){
			var mc = 0 ;
			for(var i = 0 ; i < marr.length ; i ++) {
				if(marr[i]){
					mc += 1;
				}
			}
			if(mc/marr.length >= 0.8){
				return true;
			}
			else {
				return false;
			}
		}

		//核对GPS点是否打卡成功
		var checkgps = function(p1, p2){
			var dis = countingDistance(p1, p2);
			if(dis <= 20){
				return true;
			}
			else {
				return false;
			}
		}

		//切换地图首次加载实体地图
		var clickToInit = function(){
			initMap();
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
				// animationStart(function(){}, "main", "../html/main.html", info, true);
				endTask();
			},false);

			$api.byId('returnBtn').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				animationStart(function(){}, "inspectionTask", "../html/inspectionTask.html", info, false);
			},false);

			$api.byId('returnBtns').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				animationStart(function(){}, "main", "../html/main.html", info, true);
			},false);

			api.addEventListener({
				name: 'keyback'
			}, function(ret, err) {
				animationStart(function(){}, "main", "../html/main.html", info, true);
			});
		}

		//核对并当前的打卡点的状态内容
		var checksignin = function(pos){
			for(var i = 0 ; i < pointlist.length ; i++){
				var p = pointlist[i];
				if(!p.marker){
					if(typeof p.point[0] == "object"){
						for(var j = 0 ; j < p.point.length ; j ++){
							if(!p.markers[j]){
								p.markers[j] = checkgps(pos, p.point[j]);
								if(p.markers[j]){
									requestMark({"userid": info.user.userid, "taskid": info.taskid, "markerid":p.id, "index":j, "lat":p.point[j][1], "lon":p.point[j][0]});
								}
							}
						}
						p.marker = checkRouteMarked(p.markers);
						if(p.marker){
							if(p.ele){
								p.ele.setIcon("../icon/g-p.png");
							}
							p.rele && p.rele.setColors("green");
						}
						else{
							if(checkMiss(i)){
								p.ele && p.ele.setIcon("../icon/r-p.png");
								p.rele && p.rele.setColors("red");
							}
						}
					}
					else {
						p.marker = checkgps(pos, p.point);
						if(p.marker){
							requestMark({"userid": info.user.userid, "taskid": info.taskid, "markerid":p.id, "index":0, "lat":p.point[1], "lon":p.point[0]});
							if(p.ele){
								p.ele.setIcon("../icon/g-p.png");
							}
							p.rele && p.rele.setColors("green");
						}
						else{
							if(checkMiss(i)){
								p.ele && p.ele.setIcon("../icon/r-p.png");
								p.rele && p.rele.setColors("red");
							}
						}
					}
				}
			}
		}

		var checkMiss = function(index){
			for(var i = index+1; i < pointlist.length; i++){
				 if(pointlist[i].marker){
					 return true;
				 }
			}
			return false;
		}

		//获取当前的数据内容并且调用绘制简单表。
		var groupleader = "";
		var requestForFata = function(){
			var p = getPoints("taskpoint");
			if(p && info.taskid == p.taskid){
				exchangeForData(p.point, false);
			}
			else {
			connectToService( commonURL + "?action=taskpoint",
				{
						values: {"id": info.taskid }
				},
				function(ret){
					if(ret.result){
							exchangeForData(ret.data, true);
					}
					else {
						alert("请求数据出错，可能是网络不太好！");
					}
				},
				function(ret,err){
					alert(JSON.stringify(err));
				});
			}
		}

		var pointlist = [];
		var exchangeForData = function(data, check){
			if(check){
				if(data.length == 0){
					alert("未录入任何打卡点数据")
				}
				for(var i = 0 ; i < data.length ; i++){
					var obj = {};
					obj.name = data[i].name;
					obj.id = data[i].id;
					obj.marker = data[i].marker;
					obj.color = "blue";
					if(data[i].point.length == 1){
						obj.point = [data[i].point[0].lon, data[i].point[0].lat];
					}
					else {
						obj.point = [];
						obj.markers = [];
						var list = data[i].point;
						for(var j = 0 ; j < list.length ; j++){
							obj.point[list[j].index] = [list[j].lon, list[j].lat];
							obj.markers[list[j].index] = list[j].marker;
						}
					}
					pointlist[data[i].index] = obj;
				}
				for(var i = 0 ; i < pointlist.length - 1 ; i++){
					if(pointlist[i]){
						if(pointlist[i].marker){
							pointlist[i].color = "green";
						}
						else {
							if(pointlist[i+1].marker){
								pointlist[i].color = "red";
							}
						}
					}
				}
				savePoints("taskpoint", {taskid:info.taskid, point:pointlist});
			}
			else{
				pointlist = data;
			}
			pointlist = easyMark(pointlist);
		}

		//绘制实体地图点内容。
		var drawingPoints = function(){
			if(pointlist.length > 0){
				for(var i = 0 ; i < pointlist.length ; i++){
					(function(){
						var p = pointlist[i];
						var m  = "";
						var color = "blue";
						if(typeof p.point[0] == "object"){
						 	m = calculatePointForRoute(p.point);
						}
						else {
							m = p.point;
						}
						p.ele = addMarker(m[0], m[1], p.color, i);
					})();
				}
			}
		}

		var countingDistance = function(p1, p2){
			var dis = AMap.GeometryUtil.distance(p1, p2);
			return dis;
		}

		//上报打卡成功的点或者路段内容
		var requestMark = function(val){
			connectToService( commonURL + "?action=taskposition",
			 {
					 values: val
			 },
			 function(ret){
				 if(!ret.result){
					 requestMark(val);
				 }
			 },
			 function(ret,err){
				 alert(JSON.stringify(err));
			 }
			);
		}

		var endTask = function(){
			var unmark = [];
			connectToService( commonURL + "?action=taskpoint",
			 {
					 values: {"id": info.taskid}
			 },
			 function(ret){
				 if(ret.result){
					 var data = ret.data;
					 for(var i = 0 ; i < data.length ; i++){
						 if(!data[i].marker){
							 unmark.push({index:data[i].index, name:data[i].name});
						 }
					 }
					 if(unmark.length > 0){
						 var msgs = "";
						 for(var i = 0 ; i < unmark.length ; i ++){
							 msgs += (unmark[i].index + 1) + "." + unmark[i].name + ", ";
						 }
			 				api.confirm({
			 				    title: '提示',
			 				    msg: '此次任务还有 ' + msgs + "打卡未成功，确定结束当前任务吗",
			 				    buttons: ['确定', '取消']
			 				}, function(ret, err){
			 				    if( ret.buttonIndex == 1 ){
			 							connectToService( commonURL + "?action=taskfinish",
			 							 {
			 									 values: {"id": info.taskid}
			 							 },
			 							 function(ret){
			 								 if(ret.result){
			 									 animationStart(function(){}, "main", "../html/main.html", info, true);
			 								 }
			 								 else {
												 //  alert(JSON.stringify(ret));
			 									 alert("任务完成提交失败！");
			 								 }
			 							 },
			 							 function(ret,err){
			 								 alert(JSON.stringify(err));
			 							 }
			 						 );
			 				    }
			 				});
		 				}
						else{
							connectToService( commonURL + "?action=taskfinish",
							 {
									 values: {"id": info.taskid}
							 },
							 function(ret){
								 if(ret.result){
									 alert("任务完成!");
									 animationStart(function(){}, "main", "../html/main.html", info, true);
								 }
								 else {
									 //  alert(JSON.stringify(ret));
									 alert("任务完成提交失败！");
								 }
							 },
							 function(ret,err){
								 alert(JSON.stringify(err));
							 }
						 );
						}
				 }
				 else {
					//  alert(JSON.stringify(ret));
					 alert("任务完成提交失败！");
				 }
			 },
			 function(ret,err){
				 alert(JSON.stringify(err));
			 }
		 );
		}

		var initedPage = function(){
			if(!visit){
				$api.byId('returnBtn').removeAttribute("style");
				$api.byId('repEvent').setAttribute("style", "display:none;");
				$api.byId('endTask').setAttribute("style", "display:none;");
				if(!inited){
					inited = true;
					clickToInit();
				}
				requestForFata();
				dynamicWeb();
			}
			else {
				$api.byId('repEvent').removeAttribute("style");
				$api.byId('endTask').removeAttribute("style");
				$api.byId('returnBtn').setAttribute("style", "display:none;");
				if(leader != info.user.userid){
					$api.byId('repEvent').setAttribute("class", "return-to-last-page");
					$api.byId('endTask').setAttribute("style", "display:none;");
				}
				if(!inited){
					inited = true;
					clickToInit();
				}
				requestForFata();
				dynamicWeb();
			}
		}

		//存储当前内容的点击内容。
		var savePoints = function(key, value){
			$api.setStorage(key, value);
		}

		var getPoints = function(key){
			return $api.getStorage(key);
		}

		var reduce = 0;
		var easyMark = function(datas){
			reduce = 0;
			for(var i = 0 ; i < datas.length ; i++){
				if(!datas[i]){
					reduce += 1;
				}
				if(i == datas.length - 1){
					datas[i].rele = routingPoint({"info":datas[i].name, "color":datas[i].color || ""}, i-reduce , true);
				}
				else {
					datas[i].rele = routingPoint({"info":datas[i].name, "color":datas[i].color || ""}, i-reduce);
				}
			}
			return datas;
		}
		initedPage()
}

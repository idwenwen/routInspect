apiready = function(){

		var info = api.pageParam;
    var history = info.history;
    info.history = "reportEvent";

    //将当前的页面设置为占用手机就全屏内容。
    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

		//获取当前的位置信息
		var amapLocation = api.require("aMapLocation");
		var position = {};
		var getLocalPosition = function(g_callBack){
			amapLocation.startLocation({
				accuracy: 20, filter: 1, autoStop: true
			}, function(ret, err){
					if(ret.status){
						var lnglatXY = [ret.latitude, ret.longitude];
						function regeocoder() {  //逆地理编码
							var geocoder = new AMap.Geocoder({
									radius: 20,
									extensions: "all"
							});
							geocoder.getAddress(lnglatXY, function(status, result) {
									if (status === 'complete' && result.info === 'OK') {
											g_callBack(result);
									}
							});
					}
			}});
		}

		//绘制问题类型选择
		var chooseid = "";
		var chooseType = "";
		var choosename = "";
		var drawing = function(obj, index, callback){
			var sp = document.createElement("span");
			sp.setAttribute("class", "type-de");
			sp.setAttribute("id", "type"+index);
			sp.innerHTML = obj.name;
			sp.addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				chooseType = index;
				callback && callback(obj, index);
			})
			$api.byId('typeListContent').appendChild(sp);
		}

		//添加问题展示选择内容的情况
		var setContentList = function(obj, callback){
			for(var i = 0; i < obj.items.length ; i++){
				var spde = document.createElement("span");
				spde.setAttribute("class", "ty-de-content-list");
				spde.setAttribute("id", obj.items[i].id);
				spde.innerHTML = obj.items[i].name;
				spde.addEventListener("click", function(e){
					e.preventDefault();
					e.stopPropagation();
					chooseid = e.target.getAttribute("id");
					choosename = e.target.innerHTML;
					callback && callback(chooseid, choosename);
				});
				$api.byId('typeListDetail').appendChild(spde);
			}
		}

		//照片添加
		var getPicture = function(success, fail){
			api.getPicture({
			    sourceType: 'camera',
			    encodingType: 'jpg',
			    mediaValue: 'pic',
			    destinationType: 'url',
			    allowEdit: true,
			    quality: 70,
			    saveToPhotoAlbum: false
			}, function(ret, err) {
			    if (ret) {
			        success && success(ret);
			    } else {
			        fail && fail(err);
			    }
			});
		}

		//添加路段内容
		var sectionid = "";
		var sectionname = "";
		var addPosition = function(arr, callback){
			for(var i = 0 ; i < arr.length ; i++){
				var sp = document.createElement("span");
				sp.setAttribute("class", "position-list-content");
				sp.setAttribute("id", arr[i].id);
				sp.innerHTML = arr[i].name;
				sp.addEventListener("click", function(e){
					e.preventDefault();
					e.stopPropagation();
					sectionid = e.target.getAttribute("id");
					sectionname = e.target.innerHTML;
					callback && callback(sectionid, sectionname);
				});
				$api.byId('positionList').appendChild(sp);
			}
		}

		//测试数据内容
		var testingData = [{id: "p1", name: "环保" ,items: [{id: 'ch1', name:'环保问题1'}]},
			{id: "p2", name: "环测" ,items: [{id: 'ch2', name:'环测问题1'}]},
			{id: "p3", name: "环俐" ,items: [{id: 'ch3', name:'环俐问题1'}]}];

		var routDetail = [{id:'r1', name:'路段1'},{id:'r2', name:'路段2'}];

		//绘制当前的页面数据内容
		var drawingDetail = function(td, showStuffO){
			td.forEach(function(x, index){
				drawing(x, index, function(obj, index){
					showStuffO && showStuffO(obj ,index);
				})
			});
		}

		var drawingDetailT = function(rd, showStuffT){
			addPosition(rd, function(id, name){
				showStuffT && showStuffT(id, name);
			});
		}

		//数据请求
		var checkData = function(showStuffO, showStuffT){
			connectToService("http://dgjxj.liveej.com/appapi.ashx?action=eventclass",
	    	null,function(ret){
        	if(ret.result == true){
						drawingDetail(ret.data, showStuffO);
					}
		    },
		    function(ret){
          alert(JSON.stringify(ret.desc));
		    }
			);
			connectToService("http://dgjxj.liveej.com/appapi.ashx?action=eventroad",
	    	null,function(ret){
        	if(ret.result == true){
						drawingDetailT(ret.data, showStuffT);
					}
		    },
		    function(ret){
          alert(JSON.stringify(ret.desc));
		    }
			);
		}

		//发送相关数据内容
		var sendData = function(){
				//选取的问题类别， 路段内容，相关的数据的file内容。
		}

		//当前页面照片内容获取\
		var target = "";
		var addPic = function(imgUrl, pid){
			var image = new Image();
			image.src = imgUrl;
			image.onload = function(){
				var width = image.width;
				var height = image.height;
				var check = 1;
				if(width > height){
					check = 1;
				}
				else {
					check = 2;
				}
				var el = document.createElement("div");
				el.setAttribute("class", "photo-list-content");
				el.setAttribute("pid", pid);
				el.appendChild(image);
				image.setAttribute("class", (check == 1 ? "picture1" : "picture2"));
				el.addEventListener("click", function(e){
					e.preventDefault();
					e.stopPropagation();
					target = e.target;
					$api.byId("checkPhoto").setAttribute("src", imgUrl);
					$api.byId("checkPhoto").setAttribute("class", check == 1 ? "checkPhoto1" : "checkPhoto2");
					$api.byId('showingPhoto').removeAttribute("style");
					if(check == 2){
						$api.byId('showingPhoto').setAttribute("style", "height: 80%;");
					}
					$api.byId('blackMode').removeAttribute("style");
				})
				$api.byId('' + pid).insertBefore(el, $api.byId('' + pid).children[0]);
			}
		}

		var dynamicWeb = function(){
			//页面数据内容绑定
			var showStuffO = function(obj, index){
				$api.byId('checkTypeList').setAttribute("style", "display:none;");
				setContentList(obj, function(id, name){
					$api.byId("infoDetail").innerHTML = name;
					$api.byId('blackMode').setAttribute("style", "display:none;");
					$api.byId('typeListDetail').setAttribute("style", "display:none;");
				})
			};
			var showStuffT = function(id, name){
				$api.byId('streetPart').innerHTML = name;
				$api.byId('blackMode').setAttribute("style", "display:none;");
				$api.byId('positionList').setAttribute("style", "display:none;");
			}
			checkData(showStuffO, showStuffT);

			//事件内容绑定
			$api.byId('street').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				$api.byId('blackMode').removeAttribute("style");
				$api.byId('positionList').removeAttribute("style");
			});

			$api.byId('information').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				$api.byId('blackMode').removeAttribute("style");
				$api.byId('typeListDetail').removeAttribute("style");
			});

			$api.byId('blackMode').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				$api.byId('blackMode').setAttribute("style", "display:none;");
				$api.byId('checkTypeList').setAttribute("style", "display:none;");
				$api.byId('typeListDetail').setAttribute("style", "display:none;");
				$api.byId('positionList').setAttribute("style", "display:none;");
				$api.byId('showingPhoto').setAttribute("style", "display:none;");
			});

			$api.byId('checkPhoto').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				$api.byId('blackMode').setAttribute("style", "display:none;");
				$api.byId('showingPhoto').setAttribute("style", "display:none;");
			});


			$api.byId('photoing').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				getPicture(function(ret){
					addPic(ret.data, "eventsPhoto");
				}, function(ret){})
			});

		}

		dynamicWeb();
}

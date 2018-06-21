apiready = function(){

		var info = api.pageParam.info;
    var history = info.history;

    //将当前的页面设置为占用手机就全屏内容。
    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");


		userid = info.user.userid || "";
		//获取当前的位置信息
		var aMapLBS = api.require('aMapLBS');
		var position = {};
		var getLocalPosition = function(func){
			var positions = $api.getStorage('position');
			positions = JSON.parse(positions);
			if(positions && positions.length > 0){
				var pos = {lat : positions[0][1], lon : positions[0][0]};
				func && func(pos);
			}
			else {
				aMapLBS.configManager({
	  			accuracy: 'best',
	  			filter: 1
		  	}, function(ret, err) {
					if(err){
						alert(JSON.stringify(err));
					}
					if (ret.status) {
						position.lat = ret.lat;
						position.lon = ret.lon;
						func && func(position);
					}
					else {
						alert("定位出现错误!");
					}
				});
			}
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
		var contentlist = [];
		var setContentList = function(obj, callback){
			for(var i = 0; i < obj.items.length ; i++){
				(function(){
					var a = i;
					var spde = document.createElement("span");
					spde.setAttribute("class", "ty-de-content-list");
					spde.setAttribute("id", obj.items[a].id);
					spde.innerHTML = obj.items[a].name;
					spde.addEventListener("click", function(e){
						e.preventDefault();
						e.stopPropagation();
						chooseid = obj.items[a].id;
						choosename = obj.items[a].name;
						callback && callback(chooseid, choosename);
					});
					$api.byId('typeListDetails').appendChild(spde);
				})();
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
			    quality: 40,
					targetWidth: 1000,
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
				(function(){
					var a = i;
					var sp = document.createElement("span");
					sp.setAttribute("class", "position-list-content");
					sp.setAttribute("id", arr[a].id);
					sp.innerHTML = arr[a].name;
					sp.addEventListener("click", function(e){
						e.preventDefault();
						e.stopPropagation();
						sectionid = arr[a].id;
						sectionname = arr[a].name;
						callback && callback(sectionid, sectionname);
					});
					$api.byId('positionLists').appendChild(sp);
				})();
			}
		}

		var getAddress = function(callback){
			var pos = JSON.parse($api.getStorage("position"));
			pos = pos[0];
			var lnglat = pos;
			AMap.plugin('AMap.Geocoder', function() {
			  var geocoder = new AMap.Geocoder({
			    // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
			    radius: 100
			  })
			  geocoder.getAddress(lnglat, function(status, result) {
			    if (status === 'complete' && result.info === 'OK') {
			        // result为对应的地理位置详细信息
							callback && callback(result.regeocode.formattedAddress);
			    }
			  })
			})
		}

		//测试数据内
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
			connectToService(commonURL + "?action=eventclass",
	    	null,function(ret){
        	if(ret.result == true){
						drawingDetail(ret.data, showStuffO);
					}
		    },
		    function(ret){
          alert(JSON.stringify(ret.desc));
		    }
			);
			connectToService(commonURL + "?action=eventroad",
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

		//当前页面照片内容获取\
		var target = "";
		var imageUrl = "";
		var pidcheck = "";
		var addMessageP = [];
		var addPositionP = [];
		var addPic = function(imgUrl, pid, id){
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
				el.setAttribute("id", id);
				el.appendChild(image);
				if(pid == "eventsPhoto"){
					addMessageP.unshift(imgUrl);
				}
				else {
					addPositionP.unshift(imgUrl);
				}
				image.setAttribute("class", (check == 1 ? "picture1" : "picture2"));
				el.addEventListener("click", function(e){
					e.preventDefault();
					e.stopPropagation();
					target = id;
					imageUrl = imgUrl;
					pidcheck = pid;
					$api.byId("checkPhoto").setAttribute("src", imgUrl);
					$api.byId("checkPhoto").setAttribute("class", check == 1 ? "checkPhoto1" : "checkPhoto2");
					$api.byId('showingPhoto').removeAttribute("style");
					if(check == 2){
						$api.byId('showingPhoto').setAttribute("style", "height: 80%;");
					}
					$api.byId('blackMode').removeAttribute("style");
				})
				$api.byId('' + pid).insertBefore(el, $api.byId('' + pid).children[0]);
				el.setAttribute("style", "height:" + el.offsetWidth + "px;");
			}
		}

		//发送相关数据内容
		var sendData = function(position){
				//选取的问题类别， 路段内容，相关的数据的file内容。
				if(!sectionid){
					alert("请选择问题路段");
					return false;
				}
				if(!chooseid){
					alert("请选择问题类型");
					return false;
				}
				if(addMessageP.length == 0){
					alert("请上传相关信息图片");
					return false;
				}
				if(addPositionP.length == 0){
					alert("请上传辅助位置图片");
					return false;
				}
				var explain = $api.byId('questionMessage').value || "";
				var address = $api.byId("positionMessage").value || "";
			  connectToService( commonURL + "?action=event",
					{
						values: {"road": sectionid, "type": chooseid, "explain": explain, "address": address,
						 	"lat": position.lat, "lon": position.lon, "userid": userid},
						files: {"accident": addMessageP, "position": addPositionP}
					},
					function(ret){
							if(ret.result){
								alert("事件上报成功!");
								animationStart(function(){}, history.page, history.url, info, (history.page == "taskMap" ? false:true));
							}
							else {
								alert("事件未上报成功: " + ret.desc);
							}
			    },
			    function(ret, err){
						alert(JSON.stringify(err));
			    }
				);
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

			$api.byId('searchroad').addEventListener("input", function(e){
				var val = $api.byId('searchroad').value;
				var child = $api.byId('positionLists').children;
				var i = 0 ;
				while( child[""+i] ){
					if(child[i].innerHTML.indexOf(val) == -1){
						child[i].setAttribute("style", "display:none;");
					}
					else {
						child[i].removeAttribute("style");
					}
					i++;
				}
			});


			var p1 = 1;
			$api.byId('photoing').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				getPicture(function(ret){
					addPic(ret.data, "eventsPhoto", "p1" + p1);
					p1++;
					if(addMessageP.length >= 5){
						$api.byId('photoing').setAttribute("style", "display:none;");
					}
				}, function(ret){
					alert(JSON.stringify(ret));
				})
			});

			var p2 = 1;
			$api.byId('photoing2').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				getPicture(function(ret){
					addPic(ret.data, "contentPhoto", "p2"+ p2);
					p2++;
					if(addPositionP.length >= 5){
						$api.byId('photoing2').setAttribute("style", "display:none;");
					}
				}, function(ret){
					alert(JSON.stringify(ret));
				})
			});

			$api.byId('deletePicture').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				var list = "";
				var btn = "";
				var container = $api.byId(pidcheck);
				if(pidcheck == "eventsPhoto"){
					list = addMessageP;
					btn = $api.byId('photoing');
				}
				else {
					list = addPositionP;
					btn = $api.byId('photoing2');
				}
				for(var i = 0 ; i < list.length ; i++){
					if(list[i] == imageUrl){
						list.splice(i, 1);
					}
				}
				container.removeChild($api.byId(target));
				if(list.length < 5){
					btn.setAttribute("style", "height:"+ btn.offsetWidth + "px;");

				}
				$api.byId('blackMode').setAttribute("style", "display:none;");
				$api.byId('showingPhoto').setAttribute("style", "display:none;");
			});

			$api.byId('reportEvents').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				getLocalPosition(sendData);
			});

			$api.byId('returnBtn').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				animationStart(function(){}, history.page, history.url, info, (history.page == "taskMap" ? false:true));
			});

			api.addEventListener({
				name: 'keyback'
			}, function(ret, err) {
				animationStart(function(){}, history.page, history.url, info, (history.page == "taskMap" ? false:true));
			});

		}

		var el = $api.byId('photoing');
		el.setAttribute("style", "height:"+el.offsetWidth +'px;');
		el = $api.byId('photoing2');
		el.setAttribute("style", "height:"+el.offsetWidth + 'px;');
		dynamicWeb();
		getAddress(function(data){
			$api.byId('positionMessage').value = data;
		});
}

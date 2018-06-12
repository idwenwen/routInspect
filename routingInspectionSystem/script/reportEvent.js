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
			var positions = JSON.parse($api.getStorage('position'));
			if(positions && positions.length > 0){
				var pos = {lat : positions[positions.length - 1][0], lon : positions[positions.length -1][1]};
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
				$api.byId('typeListDetails').appendChild(spde);
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
				$api.byId('positionLists').appendChild(sp);
			}
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
						values: {"road": chooseid, "type": sectionid, "explain": explain, "address": address,
						 	"lat": position.lat, "lon": position.lon, "userid": userid},
						files: {"accident": addMessageP, "position": addPositionP}
					},
					function(ret){
							if(ret.result){
								alert("事件上报成功!");
								animationStart(function(){}, history.page, history.url, info, (history.page == "taskMap" ? false:true));
							}
							else {
								alert("事件未上报成功:" + ret.desc);
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
}

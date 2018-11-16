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
		var hasGot = false;
		var getLocalPosition = function(func){
			api.addEventListener({
			    name: 'refreshmap'
			}, function(ret, err){
					if(hasGot){
						return false;
					}
					if(err){
						// alert(JSON.stringify(err));
						return false;
					}
					var positions = $api.getStorage('position');
					positions = positions ? JSON.parse(positions) : "";
					if(positions && positions.length > 0){
						position.lat = positions[0][1];
						position.lon = positions[0][0];
						func && func(position);
						hasGot = true;
						api.sendEvent({
							name: 'hasGetPosition',
						});
					}
			});


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
		var FNPhotograph = api.require('FNPhotograph');
		var getPicture = function(success, fail){
			api.getPicture({
			    sourceType: 'camera',
			    encodingType: 'jpg',
			    mediaValue: 'pic',
			    destinationType: 'url',
			    allowEdit: true,
			    quality: 50,
					targetWidth: 1000,
			    saveToPhotoAlbum: true
			}, function(ret, err) {
					if( ret ){
			// FNPhotograph.openCameraView({
			// 		rect: {
			//        x: 0,
			//        y: 0,
			//        w: "auto",
			//        h: "auto"
			//     },
			//     quality: 'medium',
			// 		orientation: 'portrait',
			//     fixedOn: api.frameName,
			//     fixed: true
			// }, function(ret){
			//     if (ret.eventType == "takePhoto") {
			// 				alert(ret.imagePath);
							// var img = new Image();
							// img.src = ret.imagePath;
							// img.onload = function(){
							// 	EXIF.getData(img, function(){
							// 		var or = EXIF.getAllTags(this);
							// 		alert(JSON.stringify(or));
							// 	});
							// }
							// ret.data = ret.imagePath;
							var img = new Image();
							img.onload = function(){
								EXIF.getData(img, function(){
									//获取oritention数据依据数据进行数据判断内容。
								});
								success && success(ret);
							}
							img.src = ret.data;
							// FNPhotograph.close(function(ret) {
							//     if (ret) {
							//         alert(JSON.stringify(ret));
							//     }
							// });
			    }
			});
		}

		function getBase64Image(img) {
		     var canvas = document.createElement("canvas");
		     canvas.width = img.width;
		     canvas.height = img.height;
		     var ctx = canvas.getContext("2d");
		     ctx.drawImage(img, 0, 0, img.width, img.height);
		     var ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase();
		     var dataURL = canvas.toDataURL("image/"+ext);
		     return dataURL;
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

		var getAddress = function(position, callback){
			var pos  = [];
			pos.push(position.lon);
			pos.push(position.lat);
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
					else {
							alert("当前无法定位到准确位置");
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
			var data = $api.getStorage('eventclass');
			if(data){
				$api.byId('loading').setAttribute("style", "display:none;");
				drawingDetail(data, showStuffO);
			}
			else {
				connectToService(commonURL + "?action=eventclass",
		    	null,function(ret){
	        	if(ret.result == true){
							$api.setStorage('eventclass', ret.data);
							drawingDetail(ret.data, showStuffO);
							$api.byId('loading').setAttribute("style", "display:none;");
						}
			    },
			    function(ret){
	          // alert(JSON.stringify(ret.desc));
			    }
				);
			}
			var data2 = $api.getStorage('eventroad');
			if(data2){
				drawingDetailT(data2, showStuffT);
			}
			else {
				connectToService(commonURL + "?action=eventroad",
		    	null,function(ret){
	        	if(ret.result == true){
							$api.setStorage('eventroad', ret.data);
							drawingDetailT(ret.data, showStuffT);
						}
			    },
			    function(ret){
	          // alert(JSON.stringify(ret.desc));
			    }
				);
			}
		}

		var areas = [];
		var areasId = [];
		var getAreaId = [];
		var clicked = false;

		var requestArea = function(pos, checkstuff, obj){
			areas = [];
			areasId = [];
		  getAreaId = [];
			if(clicked){
				return false;
			}
			clicked = true;
			connectToService(commonURL + "?action=area",
			{
				values: { "userid": info.user.userid }
			},
			function(ret){
				if(ret.result == true){
					ret.data.forEach(function(item, index){
						var sl = item.area.split("|");
						var originl = [];
						sl.forEach(function(item, index){
							var poss = item.split(",");
							originl.push(poss);
						})
						areas.push(originl);
						areasId.push(item.id);
					});
					var len = areas.length;
					for(var i = 0; i < areas.length ; i++){
						alert("i:" + i);
						var checkpoint = [pos.lon, pos.lat];
						var check = AMap.GeometryUtil.isPointInRing(checkpoint, areas[i]);
						if(check){
							getAreaId.push(areasId[i]);
							connectToService(commonURL + "?action=subarea",
							{
								values: { "areaid": areasId[i] }
							},
							function(ret){
								if(ret.result == true){
									areas = [];
									areasId = [];
									ret.data.forEach(function(item, index){
										var sl = item.area.split("|");
										var originl = [];
										sl.forEach(function(item, index){
											var poss = item.split(",");
											originl.push(poss);
										})
										areas.push(originl);
										areasId.push(item.id);
									});
									for(var j = 0; j < areas.length ; j++){
										var checkpoint = [pos.lon, pos.lat];
										var checksub = AMap.GeometryUtil.isPointInRing(checkpoint, areas[j]);
										if(checksub){
											getAreaId.push(areasId[j]);
										}
									}
									if(checkstuff){
										requestEvent(pos, true, obj);
										return true;
									}
									else {
										requestEvent(pos, false, obj);
										return true;
									}
								}
							});
							break;
						}
					}
					alert("i:" + i + "&&" + "len:" + len);
					if(i >= len){
						if(checkstuff){
							requestEvent(pos, true, obj);
							return true;
						}
						else {
							requestEvent(pos, false, obj);
							return true;
						}
					}
				}
				else {
					alert("无法确定当前用户所属区域，事项提交失败");
				}
			});
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
					var index = checkindexForArr($api.byId(pidcheck).children, target);
					if(index <= 0){
						$api.byId('leftImage').setAttribute("style", "display:none;");
					}
					else {
						$api.byId('leftImage').setAttribute("style", "display:block;");
					}
					if(index >= checkNumber - 1){
						$api.byId('rightImage').setAttribute("style", "display:none;");
					}
					else {
						$api.byId('rightImage').setAttribute("style", "display:block;");
					}
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
				if(!position.lat){
					api.addEventListener({
					    name: 'hasGetPosition'
					}, function(ret, err){
					    if( ret ){
					        //  alert( JSON.stringify( err ) );
					    }
							requestArea(position, false, {"explain":explain, "address":address});
							api.removeEventListener({
							    name: 'hasGetPosition'
							});
					});
					alert("由于当前GPS信号弱，上报事项将会在获取位置之后，自动上传。");
					changePages();
				}
				else {
					requestArea(position, true, {"explain":explain, "address":address});
				}
		}

		var requestEvent = function(position, func, obj){
			var areaStr = "";
			if(getAreaId.length > 0){
				areaStr = getAreaId.toString();
			}
			connectToService( commonURL + "?action=event",
				{
					values: {"road": sectionid, "type": chooseid, "explain": obj.explain, "address": obj.address,
						"lat": position.lat, "lon": position.lon, "userid": userid, "areaid": areaStr},
						files: {"accident": addMessageP, "position": addPositionP}
				},
				function(ret){
						if(ret.result){
							//上报成功。
							if(func){
								alert("事件上报成功!");
								changePages();
							}
							else {
								//TODO:暂定
							}
						}
						else {
							alert("事件未上报成功: " + ret.desc);
						}
				},
				function(ret, err){
					// alert(JSON.stringify(err));
				}
			);
		}

		var changePages = function(){
			setTimeout(function(){
				$api.byId('checkTypeList').removeAttribute("style");
			}, 500);
			animationStart(function(){}, history.page, history.url, info);
		}

		var checkIndex = -1;
		var checkNumber = 0;

		var checkindexForArr = function(arr, tar){
			var index = -1;
			checkNumber = 0;
			for(var i = 0 ; ; i++){
					if(!arr[i+""]){
						break;
					}
					if(arr[i+""].getAttribute("id") == "photoing2" || arr[i+""].getAttribute("id") == "photoing"){
						break;
					}
					if(arr[i+""].getAttribute("id") == target){
						index = i;
					}
					checkNumber ++;
			}
			return index;
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
				checkIndex = -1;
			});

			$api.byId('checkPhoto').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				$api.byId('blackMode').setAttribute("style", "display:none;");
				$api.byId('showingPhoto').setAttribute("style", "display:none;");
				checkIndex = -1;
			});

			$api.byId("rightImage").addEventListener("click", function(e){
				var parent = $api.byId(pidcheck);
				var childs = parent.children;
				if(checkIndex < 0){
					checkIndex = checkindexForArr(childs, target);
				}
				if(checkIndex < checkNumber){
					checkIndex ++;
					imageUrl = childs[checkIndex+""].children[0].src;
					target = childs[checkIndex+""].getAttribute("id");
					$api.byId('checkPhoto').src = imageUrl;
					$api.byId('checkPhoto').onload = function(){
						var check = 1;
						if($api.byId('checkPhoto').width < $api.byId('checkPhoto').height){
							check = 2;
						}
						if(checkIndex >= checkNumber - 1){
							$api.byId('rightImage').setAttribute("style", "display:none;");
						}
						else {
							$api.byId('rightImage').removeAttribute("style");
						}
						$api.byId('leftImage').removeAttribute("style");
						$api.byId("checkPhoto").setAttribute("class", check == 1 ? "checkPhoto1" : "checkPhoto2");
						if(check == 2){
							$api.byId('showingPhoto').setAttribute("style", "height: 80%;");
						}
						else{
							$api.byId('showingPhoto').removeAttribute("style");
						}
						$api.byId('checkPhoto').onload = function(){};
					}
				}
			})

			$api.byId("leftImage").addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				var parent = $api.byId(pidcheck);
				var childs = parent.children;
				if(checkIndex < 0){
					checkIndex = checkindexForArr(childs, target);
				}
				if(checkIndex > 0){
					checkIndex --;
					imageUrl = childs[checkIndex+""].children[0].src;
					target = childs[checkIndex+""].getAttribute("id");
					$api.byId('checkPhoto').src = imageUrl;
					$api.byId('checkPhoto').onload = function(){
						var check = 1;
						if($api.byId('checkPhoto').width <= $api.byId('checkPhoto').height){
							check = 2;
						}
						if(checkIndex <= 0){
							$api.byId('leftImage').setAttribute("style", "display:none;");
						}
						else {
							$api.byId('leftImage').removeAttribute("style");
						}
						$api.byId('rightImage').removeAttribute("style");
						$api.byId("checkPhoto").setAttribute("class", check == 1 ? "checkPhoto1" : "checkPhoto2");
						if(check == 2){
							$api.byId('showingPhoto').setAttribute("style", "height: 80%;");
						}
						else{
							$api.byId('showingPhoto').removeAttribute("style");
						}
						$api.byId('checkPhoto').onload = function(){};
					}
				}
			})

			$api.byId('searchroad').addEventListener("input", function(e){
				e.preventDefault();
				e.stopPropagation();
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
					// alert(JSON.stringify(ret));
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
					// alert(JSON.stringify(ret));
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
				checkIndex = -1;
			});

			$api.byId('reportEvents').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				sendData(position);
			});

			$api.byId('returnBtn').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				setTimeout(function(){
					$api.byId('checkTypeList').removeAttribute("style");
				}, 500);
				animationStart(function(){}, history.page, history.url, info);

			});

			api.addEventListener({
				name: 'keyback'
			}, function(ret, err) {
				animationStart(function(){}, history.page, history.url, info);
				setTimeout(function(){
					$api.byId('checkTypeList').removeAttribute("style");
				}, 500);
			});

		}

		var el = $api.byId('photoing');
		el.setAttribute("style", "height:"+el.offsetWidth +'px;');
		el = $api.byId('photoing2');
		el.setAttribute("style", "height:"+el.offsetWidth + 'px;');
		getLocalPosition(function(pos){
			getAddress(pos, function(data){
				$api.byId('positionMessage').value = data;
			});
		});
		dynamicWeb();
}

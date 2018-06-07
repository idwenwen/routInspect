apiready = function(){

		var info = api.pageParam.info;
    var history = info.history;

		var eventId = info.eventId;

    //将当前的页面设置为占用手机就全屏内容。
    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

		//添加图片内容
		var uploadPic = [];
		var target = "";
		var deleteUrl = "";
		var pidcheck = "";
		var addExhibitionPic = function(imgUrl, pid, id, photo){
			var el = document.createElement("div");
			el.setAttribute("class", "list-photo");
			if(photo){
				el.setAttribute("pid", pid);
				el.setAttribute("id", id);
			}
			var img = new Image();
			img.src = imgUrl;
			img.onload = function(){
				var width = img.widht;
				var height = img.height;
				var check = 0;
				if(width > height){
					check = 1
				}
				else {
					check = 2;
				}
				img.setAttribute("class", (check == 1 ? "picture1" : "picture2"));
				el.appendChild(img);
				if(photo){
					uploadPic.unshift(imgUrl);
				}
				el.addEventListener("click", function(e){
					e.preventDefault();
					e.stopPropagation();
					if(photo){
						target = id;
						deleteUrl = imgUrl;
						pidcheck = pid;
					}
					$api.byId("checkPhoto").setAttribute("src", imgUrl);
					$api.byId("checkPhoto").setAttribute("class", check == 1 ? "checkPhoto1" : "checkPhoto2");
					$api.byId('showingPhoto').removeAttribute("style");
					if(check == 2){
						$api.byId('showingPhoto').setAttribute("style", "height: 80%;");
					}
					$api.byId('blackMode').removeAttribute("style");
				});
				if(!photo){

					$api.byId('' + pid).appendChild(el);
				}
				else {
					$api.byId('' + pid).insertBefore(el, $api.byId('' + pid).children[0]);
				}
			}
		}

		//getPicture
		var getPicture = function(success, fail){
			api.getPicture({
			    sourceType: 'camera',
			    encodingType: 'jpg',
			    mediaValue: 'pic',
			    destinationType: 'url',
			    allowEdit: true,
			    quality: 45,
			    saveToPhotoAlbum: false
			}, function(ret, err) {
			    if (ret) {
			        success && success(ret);
			    } else {
			        fail && fail(err);
			    }
			});
		}

		//请求相关数据内容
		var requestForData = function(){
				//通过EventID获取事件内容。
				connectToService(commonURL + "?action=eventdetail",
					{
						values:{"id" : "1"}
					}
					,function(ret){
						addResponseExhibition(ret.data);
						// alert(JSON.stringify(ret));
			    },
			    function(ret){
	          alert(JSON.stringify(ret.desc));
			    }
				);
		}

		//添加回馈内容：
		var addResponseExhibition = function(data){
			if(data.statusname == "待接单"){
				$api.byId('hangup').removeAttribute("style");
				$api.byId('accept').removeAttribute("style");
				$api.byId('statusmessage').setAttribute("style", "display:none;");
			}
			else {
				//todo
			}
			if(!data.handlname){
				$api.byId('name').innerHTML = "未确定";
			}
			else{
				$api.byId('name').innerHTML = data.handlname;
			}
			$api.byId('things').innerHTML = data.roadname;
			$api.byId('parts').innerHTML = data.typenamesub;
			$api.byId('explain').innerHTML = data.explain;
			$api.byId('time').innerHTML = data.limittime;
			$api.byId('id');
			for(var i = 0 ; i < data.accident.length ; i++){
				addExhibitionPic(data.accident[i], "eventPhoto");
			}
			for(var i = 0 ; i < data.position.length ; i++){
				addExhibitionPic(data.position[i], "positionPhoto");
			}
		}

		//挂起状态请求
		var hangUp = function(){
			//传递eventID，uerId，和状态数据
		}

		//传递接单内容
		var accept = function(){
			//传递eventID,USERID 和状态
		}

		//依据页面状态修改该页面展示
		var pageStatus = 0;
		var displayPic = function(status){
			if(status == "初始状态"){
				$api.byId('responseList').setAttribute("style", "display:none;");
				$api.byId('completeStuff').setAttribute("style", "display:none;");
			}
			else if(status == "挂起待审批"){

			}
		}

		//页面动态效果展示
		var dynamicWeb = function(){
			$api.byId('showingPhoto').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				$api.byId('showingPhoto').setAttribute("style","display:none;");
				$api.byId('blackMode').setAttribute("style","display:none;");
			});

			$api.byId('blackMode').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				$api.byId('showingPhoto').setAttribute("style","display:none;");
				$api.byId('blackMode').setAttribute("style","display:none;");
			});

			$api.byId('hangup').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				$api.byId('blackMode').removeAttribute("style");
				$api.byId('hangupReason').removeAttribute("style");
			});

			$api.byId('hangupReason').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				//提交相关的反馈数据内容
				var value = $api.byId('inputReason').value;
				alert(value);
				$api.byId('blackMode').setAttribute("style","display:none;");
				$api.byId('hangupReason').setAttribute("style","display:none;");
			});

			$api.byId('accept').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				//发送当前的请求内容。
				//展示相关页面内容。
			});


			$api.byId('completeStuff').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				//提交相关数据内容
			});

		}

		requestForData();
		dynamicWeb();
}

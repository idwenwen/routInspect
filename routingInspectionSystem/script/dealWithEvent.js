apiready = function(){

		var info = api.pageParam.info;
    var history = info.history;

		var eventId = info.eventid;
		var eventStatus = info.eventstatus;

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
		var requestForData = function(id){
				//通过EventID获取事件内容。
				connectToService(commonURL + "?action=eventdetail",
					{
						values:{"id": id}
					}
					,function(ret){
						addResponseExhibition(ret.data);
						// alert(JSON.stringify(ret));
			    },
			    function(ret, err){
						alert(JSON.stringify(err));
			    }
				);
		}


		//添加回馈内容：
		var addResponseExhibition = function(data){
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
			$api.byId("express").innerHTML = data.address;
			if(data.handluserid != info.user.userid){
				$api.byId('responseList').setAttribute("style", "display:none;");
				$api.byId('completeStuff').setAttribute("style", "display:none;");
			}
			$api.byId('id');
			for(var i = 0 ; i < data.accident.length ; i++){
				addExhibitionPic(data.accident[i], "eventPhoto");
			}
			for(var i = 0 ; i < data.position.length ; i++){
				addExhibitionPic(data.position[i], "positionPhoto");
			}
			if(data.response){
				addResponse(data.response, []);
			}
			if(data.responsepic){

			}
		}

		var addResponse = function(response, pic){
			for(var i = 0 ; i < response.length ; i ++){
				var str = "<div class='message-list'>"+
					"<span class='message-title'>" + (response[i].name) + "</span>" +
					"<span class='message-content'>" + (response[i].info) + "</span>";
					var id = response[i].name;
					for(var j = 0 ; j < pic.length ; j++){
						var picstr = "<div class='message-photo'>"+
							"<div class='list-photo' id=" + (id + j) + ">"+
								"<img src=" + pic[j] + " alt=" + " class='add-pic-btn'>"+
							"</div>"+
						"</div>";
						str += picstr;
					}
					str += "<span class='messsage-title'>"+ (response[i].time) +"</span>" +
				"</div>";
				$api.append($api.byId("responseMessage"), str);
				for(var a = 0 ; a < pic.length ; a++){
					(function(){
						var elid= id+a;
						$api.byId(elid).addEventListener("click", function(e){
							e.preventDefault();
							e.stopPropagation();
							$api.byId("checkPhoto").setAttribute("src", imgUrl);
							$api.byId("checkPhoto").setAttribute("class", check == 1 ? "checkPhoto1" : "checkPhoto2");
							$api.byId('showingPhoto').removeAttribute("style");
							if(check == 2){
								$api.byId('showingPhoto').setAttribute("style", "height: 80%;");
							}
							$api.byId('blackMode').removeAttribute("style");
						});
					})
				}
			}
		}

		//挂起状态请求
		var hangUp = function(){
			//传递eventID，uerId，和状态数据
			var userid = info.user.userid;
			var value = $api.byId('inputReason').value;
			connectToService(commonURL + "?action=eventsuspend",
				{
					values:{"userid": userid, "eventid": eventId, "explain": value}
				}
				,function(ret){
					if(ret.result){
						api.alert({
								title: '提示',
								msg: '任务已挂起，正在接受审核!',
						}, function(ret, err){
								if(err){
									alert(JSON.stringify(err));
								}
						});
						info.eventid = "";
						info.eventstatus = "";
						animationStart(function(){}, "main", "../html/main.html", info ,true);
					}
				},
				function(ret, err){
					alert(JSON.stringify(err));
				}
			);
		}

		//传递接单内容
		var accept = function(){
			//传递eventID,USERID 和状态
			var userid = info.user.userid;
			connectToService(commonURL + "?action=eventaccept",
				{
					values:{"userid": userid, "eventid": eventId}
				}
				,function(ret){
					if(ret.result){
						api.confirm({
					    title: '提示',
					    msg: '任务已经接受，接下来怎么做呢？',
					    buttons: ['返回首页', '留在当页']
					}, function(ret, err) {
					    var index = ret.buttonIndex;
							if(index == 1){
								info.eventid = "";
								info.eventstatus = "";
								animationStart(function(){}, "main", "../html/main.html", info, true);
							}
							else {
								$api.byId('name').innerHTML = info.user.username;
								$api.byId('hangup').setAttribute("style", "display:none;");
								$api.byId('accept').setAttribute("style", "display:none;");
								$api.byId('statusmessage').removeAttribute("style");
								$api.byId('responseList').removeAttribute("style");
								$api.byId('completeStuff').removeAttribute("style");
							}
					});

					}
				},
				function(ret, err){
					alert(JSON.stringify(err));
				}
			);
		}

		//依据页面状态修改该页面展示
		var pageStatus = eventStatus;
		var displayPic = function(statusinfo){
			$api.byId('blackMode').setAttribute("style", "display:none;");
			$api.byId('showingPhoto').setAttribute("style", "display:none;");
			$api.byId('hangupReason').setAttribute("style", "display:none;");
			if(statusinfo == 1){
				$api.byId('hangup').removeAttribute("style");
				$api.byId('accept').removeAttribute("style");
				$api.byId('statusmessage').setAttribute("style", "display:none;");
				$api.byId('responseMessage').setAttribute("style", "display:none;");
				$api.byId('responseList').setAttribute("style", "display:none;");
				$api.byId('completeStuff').setAttribute("style", "display:none;");
			}
			else {
				$api.byId('hangup').setAttribute("style", "display:none;");
				$api.byId('accept').setAttribute("style", "display:none;");
				$api.byId('statusmessage').removeAttribute("style");
				if(statusinfo == 2){
					$api.byId('responseMessage').setAttribute("style", "display:none;");
					$api.byId('responseList').removeAttribute("style");
					$api.byId('completeStuff').removeAttribute("style");
				}
				else if(statusinfo == 4){
					$api.byId('responseMessage').removeAttribute("style");
					$api.byId('responseList').setAttribute("style", "display:none;");
					$api.byId('completeStuff').setAttribute("style", "display:none;");
				}
				else if(statusinfo == 8){
					$api.byId('responseMessage').removeAttribute("style");
					$api.byId('responseList').setAttribute("style", "display:none;");
					$api.byId('completeStuff').setAttribute("style", "display:none;");
				}
				else if(statusinfo == 32){
					$api.byId('responseMessage').removeAttribute("style");
					$api.byId('responseList').removeAttribute("style");
					$api.byId('completeStuff').removeAttribute("style");
				}
				else if(statusinfo == 64){
					$api.byId('responseMessage').removeAttribute("style");
					$api.byId('responseList').setAttribute("style", "display:none;");
					$api.byId('completeStuff').setAttribute("style", "display:none;");
				}
			}
		}

		//完成相关的事件
		var complete = function(){
			var explain = $api.byId('responseEvent').value;
			if(!explain){
				alert("请输入反馈内容!");
				return false;
			}
			var data = {
				values:{"userid": info.user.userid, "eventid": eventId, "explain":explain}
			}
			if(uploadPic.length > 0){
				data.files = {"files": uploadPic};
			}
			connectToService(commonURL + "?action=eventrepair",
				data
				,function(ret){
					if(ret.result){
						api.alert({
						    title: '提示',
						    msg: '事件处理上报成功',
						}, function(ret, err){
						    animationStart(function(){}, "main", "../html/main.html", info, true);
						});
					}
				},
				function(ret, err){
					alert(JSON.stringify(err));
				}
			);
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
				$api.byId('hangupReason').setAttribute("style","display:none;");
			});

			$api.byId('hangup').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				$api.byId('blackMode').removeAttribute("style");
				$api.byId('hangupReason').removeAttribute("style");
			});

			$api.byId('hangupCheck').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				//提交相关的反馈数据内容
				var values = $api.byId('inputReason').value;
				if(!values){
					alert("请输入任务挂起的原因!");
					return false;
				}
				hangUp();
				$api.byId('blackMode').setAttribute("style","display:none;");
				$api.byId('hangupReason').setAttribute("style","display:none;");
			});

			$api.byId('accept').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				//发送当前的请求内容。
				//展示相关页面内容。
				accept();
			});

			$api.byId('addResponsePic').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				getPicture(function(ret, err){
					addExhibitionPic(ret.data, "responsePhotoList", "uploadPic"+uploadPic.length, true);
				})
			});

			$api.byId('completeStuff').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				//提交相关数据内容
				complete();
			});

			$api.byId('returnBtn').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				animationStart(function(){}, "main", "../html/main.html", info, true);
			});

		}

		displayPic(eventStatus);
		requestForData(eventId);
		dynamicWeb();
}

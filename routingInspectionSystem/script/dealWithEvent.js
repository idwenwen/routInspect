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
				var width = parseInt(img.width);
				var height = parseInt(img.height);
				var check = 0;
				if(width > height){
					check = 1
				}
				else {
					check = 2;
				}
				// alert("check:" + check + " width:" + img.width + " height:" + img.height);
				img.setAttribute("class", (check == 1 ? "picture1" : "picture2"));
				el.appendChild(img);
				if(photo){
					uploadPic.unshift(imgUrl);
					if(uploadPic >= 5){
						$api.byId('deleteBtn').setAttribute("style", "display:none;");
					}
				}
				el.addEventListener("click", function(e){
					e.preventDefault();
					e.stopPropagation();
					if(photo){
						target = id;
						deleteUrl = imgUrl;
						pidcheck = pid;
						$api.byId("deleteBtn").removeAttribute("style");
					}
					else {
						$api.byId('deleteBtn').setAttribute("style", "display:none;");
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
				el.setAttribute("style", "height:" + el.offsetWidth + "px;");
			}
		}

		//
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

		//请求相关数据内容
		var requestForData = function(id){
				//通过EventID获取事件内容。
				connectToService(commonURL + "?action=eventdetail",
					{
						values:{"id": id}
					}
					,function(ret){
						displayPic(eventStatus);
						addResponseExhibition(ret.data);
						// alert(JSON.stringify(ret));
						drawingmatch();
			    },
			    function(ret, err){
						api.sendEvent({
	              name: 'onlineoff'
	          });
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
			var reportuser = data.reportuserid;
			if(data.handluserid && data.handluserid != info.user.userid){
				$api.byId('responseList').setAttribute("style", "display:none;");
				$api.byId('completeStuff').setAttribute("style", "display:none;");
				$api.byId('accept').setAttribute("style", "display:none;");
				$api.byId('middle').setAttribute("style", "display:none;");
				$api.byId('hangup').setAttribute("style", "display:none;");
				$api.byId('statusmessage').removeAttribute("style");
			}
			if(reportuser == info.user.userid && eventStatus == 1 && data.typedepartmentid && data.typedepartmentid != info.user.departmentid){
				$api.byId('accept').setAttribute("style", "display:none;");
				$api.byId('statusmessage').removeAttribute("style");
			}
			if(delaycheck(data)){
				$api.byId('middle').setAttribute("style", "display:none;");
			}
			for(var i = 0 ; i < data.accident.length ; i++){
				addExhibitionPic(data.accident[i], "eventPhoto");
			}
			for(var i = 0 ; i < data.position.length ; i++){
				addExhibitionPic(data.position[i], "positionPhoto");
			}
			if(data.suspend && data.suspend.length > 0){
				addResponseRepair(data.suspend, data.state);
				$api.byId('responseMessage').removeAttribute("style");
			}
			if(data.repaired && data.repaired.length > 0){
				addResponseRepair(data.repaired, data.state, true);
				$api.byId('responseMessage').removeAttribute("style");
			}
			if(!(data.suspend && data.suspend.length > 0) && !(data.repaired && data.repaired.length > 0)) {
				$api.byId('responseMessage').setAttribute("style", "display:none;");
			}
		}

		var delaycheck = function(data){
			if(data.state == 2 || data.state == 32){
				if(!data.suspend){
					return false;
				}
				for(var i = 0 ; i < data.suspend.length ; i++){
					if(data.suspend[i].state == 8){
						return true;
					}
				}
				return false;
			}
			else {
				if(data.state == 16){
					return true;
				}
				else {
					return false;
				}
			}
		}

		var addResponseRepair = function(response, check, showing){
			for(var i = 0 ; i < response.length ; i ++){
				var strss = response[i].statename ? response[i].statename + "说明" : "处理说明";
				var pic = response[i].picture || [];
				var str = "<div class='message-list'>"+
					"<span class='message-title'>" + strss + ":</span>" +
					"<span class='message-content'>" + (response[i].requestcontent) + "</span>";
					var id = "response" + (i + 1);
					if(pic.length > 0){
						str += "<div class='message-photo'>";
						for(var j = 0 ; j < pic.length ; j++){
							var picstr =
								"<div class='list-photo' id=" + (id + "" + j) + ">"+
									"<img src=" + pic[j] + " id= " + (id + "img" + j) + " />"+
								"</div>";
							str += picstr;
						}
						str += "</div>";
					}
				str += "<span class='message-time'>"+ (response[i].requesttime) +"</span></div>";
				$api.append($api.byId("responseMessage"), str);
				for(var a = 0 ; a < pic.length ; a++){
					(function(){
						var elid = id+a;
						var imgid = id + "img" + a;
						var img = new Image();
						img.src = pic[a];
						var imgUrl = pic[a];
						var check = 0;
						img.onload = function(){
							if(img.width > img.height){
								check = 1;
							}
							else {
								check = 2;
							}
							$api.byId(imgid).setAttribute("class", (check == 1 ? "picture1" : "picture2"));
							$api.byId(elid).setAttribute("style", "height:" + $api.byId(elid).offsetWidth + "px;");
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
						}
					})();
				}

				//添加回复内容
				var state = check;
				var alertMsg = "";
				if((state == 32 || state == 2) && response[i].responsecontent){
					alertMsg = "审批结果:未通过";
				}
				else {
					alertMsg = "审批结果:已通过";
				}
				var str2 = "<div class='message-list'>"+
					"<span class='message-title'>" + ("审核人:" + response[i].responsename) + "</span>" +
					"<span class='message-content'>" + (response[i].responsecontent) +
					(showing ? ( "<br/>" + alertMsg ) : "") +
					"</span>" +
					"<span class='message-time'>"+ (response[i].responsetime) +"</span>" +
				"</div>";
				if(response[i].responsename){
					$api.append($api.byId("responseMessage"), str2);
				}
			}
		}
		//new addResponse
		var addResponse = function(data){
			for(var i = 0 ; i < data.length ; i++){
					var str = "<div class='message-list'>"+
						"<span class='message-title'>挂起说明:</span>" +
						"<span class='message-content'>" + (data[i].requestcontent) + "</span>" +
						"<span class='message-time'>"+ (data[i].requesttime) +"</span>" +
					"</div>";
					var str2 = "<div class='message-list'>"+
						"<span class='message-title'>" + ("审核人:" + data[i].responsename) + "</span>" +
						"<span class='message-content'>" + (data[i].responsecontent) + "</span>" +
						"<span class='message-time'>"+ (data[i].responsetime) +"</span>" +
					"</div>";
					$api.append($api.byId("responseMessage"), str);
					if(data[i].responsename){
						$api.append($api.byId("responseMessage"), str2);
					}
				}
		}


		//挂起状态请求
		var hangUp = function(){
			//TODO: 修改传递的参数内容
			var userid = info.user.userid;
			var value = $api.byId('inputReason').value;
			var delay = $api.byId('inputOne').value;
			connectToService(commonURL + "?action=eventsuspend",
				{
					values:{"userid": userid, "eventid": eventId, "explain": value, "delay":delay,  "type":"4" }
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
						animationStart(function(){}, "eventlist", "../html/eventlist.html", info ,true);
					}
				},
				function(ret, err){
					api.sendEvent({
              name: 'onlineoff'
          });
				}
			);
		}

		var delayTime = function(){
			//TODO:修改访问的内容接口
			var userid = info.user.userid;
			var value = $api.byId('inputReason2').value;
			var delay = $api.byId('inputTwo').value;
			connectToService(commonURL + "?action=eventsuspend",
				{
					values:{"userid": userid, "eventid": eventId, "explain": value, "delay":delay , "type":'8'}
				}
				,function(ret){
					if(ret.result){
						api.alert({
								title: '提示',
								msg: '延时申请已经提交，正在接受审核!',
						}, function(ret, err){
								if(err){
									alert(JSON.stringify(err));
								}
						});
						info.eventid = "";
						info.eventstatus = "";
						animationStart(function(){}, "eventlist", "../html/eventlist.html", info ,true);
					}
				},
				function(ret, err){
					api.sendEvent({
              name: 'onlineoff'
          });
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
								$api.byId('name').innerHTML = info.user.username;
								$api.byId('hangup').removeAttribute("style");
								$api.byId('accept').setAttribute("style", "display:none;");
								$api.byId('middle').removeAttribute("style");
								$api.byId('responseList').removeAttribute("style");
								$api.byId('completeStuff').removeAttribute("style");
							}
					},
				function(ret, err){
					api.sendEvent({
              name: 'onlineoff'
          });
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
				$api.byId('hangup').setAttribute("style", "display:none;");
				$api.byId('accept').removeAttribute("style");
				$api.byId('middle').setAttribute("style", "display:none;");
				$api.byId('statusmessage').setAttribute("style", "display:none;");
				$api.byId('responseMessage').setAttribute("style", "display:none;");
				$api.byId('responseList').setAttribute("style", "display:none;");
				$api.byId('completeStuff').setAttribute("style", "display:none;");
				$api.byId('statusmessage').innerHTML = "待接单";
			}
			else {
				$api.byId('accept').setAttribute("style", "display:none;");
				if(statusinfo == 2){
					$api.byId('responseMessage').setAttribute("style", "display:none;");
					$api.byId('responseList').removeAttribute("style");
					$api.byId('completeStuff').removeAttribute("style");
					$api.byId('middle').removeAttribute("style");
					$api.byId('hangup').removeAttribute("style");
					$api.byId('statusmessage').setAttribute("style", "display:none;");
					$api.byId('statusmessage').innerHTML = "处理中";
				}
				else if(statusinfo == 4){
					$api.byId('responseMessage').removeAttribute("style");
					$api.byId('responseList').setAttribute("style", "display:none;");
					$api.byId('completeStuff').setAttribute("style", "display:none;");
					$api.byId('statusmessage').removeAttribute("style");
					$api.byId('middle').setAttribute("style", "display:none;");
					$api.byId('hangup').setAttribute("style", "display:none;");
					$api.byId('statusmessage').innerHTML = "挂起-待审核";
				}
				else if(statusinfo == 8){
					$api.byId('responseMessage').removeAttribute("style");
					$api.byId('responseList').setAttribute("style", "display:none;");
					$api.byId('completeStuff').setAttribute("style", "display:none;");
					$api.byId('statusmessage').removeAttribute("style");
					$api.byId('middle').setAttribute("style", "display:none;");
					$api.byId('hangup').setAttribute("style", "display:none;");
					$api.byId('statusmessage').innerHTML = "延时-待审核";
				}
				else if(statusinfo == 32){
					$api.byId('responseMessage').removeAttribute("style");
					$api.byId('responseList').removeAttribute("style");
					$api.byId('completeStuff').removeAttribute("style");
					$api.byId('statusmessage').setAttribute("style", "display:none;");
					$api.byId('middle').removeAttribute("style");
					$api.byId('hangup').removeAttribute("style");
					$api.byId('statusmessage').innerHTML = "处理中";
				}
				else if(statusinfo == 64){
					$api.byId('responseMessage').removeAttribute("style");
					$api.byId('responseList').setAttribute("style", "display:none;");
					$api.byId('completeStuff').setAttribute("style", "display:none;");
					$api.byId('statusmessage').removeAttribute("style");
					$api.byId('middle').setAttribute("style", "display:none;");
					$api.byId('hangup').setAttribute("style", "display:none;");
					$api.byId('statusmessage').innerHTML = "待审核";
				}
				else if(statusinfo == 128){
					$api.byId('responseMessage').removeAttribute("style");
					$api.byId('responseList').setAttribute("style", "display:none;");
					$api.byId('completeStuff').setAttribute("style", "display:none;");
					$api.byId('statusmessage').removeAttribute("style");
					$api.byId('middle').setAttribute("style", "display:none;");
					$api.byId('hangup').setAttribute("style", "display:none;");
					$api.byId('statusmessage').innerHTML = "超时完成";
				}
			}
		}

		var drawingmatch = function(){
			var el = $api.byId('addResponsePic');
			el.setAttribute("style", "height:"+el.offsetWidth +'px;');
		}

		//完成相关的事件
		var complete = function(){
			var explain = $api.byId('responseEvent').value;
			if(!explain){
				alert("请输入反馈内容!");
				return false;
			}
			if(uploadPic.length == 0){
				alert("请上传处理情况照片!");
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
						    animationStart(function(){}, "eventlist", "../html/eventlist.html", info, true);
						});
					}
				},
				function(ret, err){
					api.sendEvent({
              name: 'onlineoff'
          });
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
				$api.byId('hangupReason2').setAttribute("style","display:none;");
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
				var delay = $api.byId('inputOne').value;
				if(!values){
					alert("请输入任务挂起的原因!");
					return false;
				}
				hangUp();
				$api.byId('blackMode').setAttribute("style","display:none;");
				$api.byId('hangupReason').setAttribute("style","display:none;");
			});

			$api.byId('middle').addEventListener('click', function(e){
				e.preventDefault();
				e.stopPropagation();
				$api.byId('hangupReason2').removeAttribute("style");
				$api.byId('blackMode').removeAttribute("style");
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
				animationStart(function(){}, "eventlist", "../html/eventlist.html", info, true);
			});

			$api.byId('inputOne').addEventListener("input", function(e){
				e.preventDefault();
				e.stopPropagation();
				//发送请求内容给后台请求延时
				var value = this.value;
				if(!parseInt(value)){
					this.value = value.slice(0, value.length - 1);
				}
				else {
					if(parseInt(value) > 30){
						this.value = 30;
					}
					else if(parseInt(value) < 0) {
						this.value = 0;
					}
				}
			});

			$api.byId('inputTwo').addEventListener("input", function(e){
				e.preventDefault();
				e.stopPropagation();
				//发送请求内容给后台请求延时
				var value = this.value;
				if(!parseInt(value)){
					this.value = value.slice(0, value.length - 1);
				}
				else {
					if(parseInt(value) > 56){
						this.value = 56;
					}
					else if(parseInt(value) < 0) {
						this.value = 0;
					}
				}
			});

			$api.byId('hangupCheck2').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				//发送请求内容给后台请求延时
				var values = $api.byId('inputReason2').value;
				var delay = $api.byId('inputTwo').value;
				if(!values){
					alert("请输入任务延时的原因!");
					return false;
				}
				delayTime();
				$api.byId('blackMode').setAttribute("style","display:none;");
				$api.byId('hangupReason2').setAttribute("style","display:none;");
			});

			$api.byId('deleteBtn').addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				$api.byId(pidcheck).removeChild($api.byId(target));
				for(var i = 0 ; i < uploadPic.length ; i++){
					if(uploadPic[i] == deleteUrl){
						uploadPic.splice(i, 1);
						break;
					}
				}
				if(uploadPic.length <= 5){
					$api.byId('deleteBtn').setAttribute("style", "height:" + $api.byId('deleteBtn').offset + "px;");
				}
				$api.byId('showingPhoto').setAttribute("style", "display:none;");
				$api.byId('blackMode').setAttribute("style", "display:none;");
			});

			api.addEventListener({
				name: 'keyback'
			}, function(ret, err) {
				animationStart(function(){}, "eventlist", "../html/eventlist.html", info, true);
			});

		}


		requestForData(eventId);
		dynamicWeb();
}

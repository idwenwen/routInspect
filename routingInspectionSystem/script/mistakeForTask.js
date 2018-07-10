apiready = function(){

		var info = api.pageParam.info;
    var history = info.history;
    info.history = "mistakeForTask";

    //将当前的页面设置为占用手机就全屏内容。
    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

		var taskinfo = info.taskdata;

		var initPage = function(){
			var state = taskinfo.state;
			var information = "正常结束";
			var response = taskinfo.reply;
			var username = taskinfo.username;
			var group = taskinfo.group;
			var members = "";
			var result = taskinfo.result;
			if(typeof result == "boolean"){
				if((state == 32 || state == 64 || state == 128) && result === false){
					information = "异常结束(" + taskinfo.statename + ")";
				}
				else if((state == 32 || state == 64 || state == 128) && typeof result != "boolean"){
					information = "待审核(" + taskinfo.statename + ")";
				}
			}
			if(group.length == 0){
				members = "无人员参与任务";
			}
			else {
				alert(JSON.stringify(group));
				group.forEach(function(item, index){
					if(!members){
						if(item.name != username){
							members += item.name;
						}
					}
					else{
						if(item.name != username){
							members += item.name;
						}
					}
				});
				if(members){
					members = " 组员：" + members;
				}
				members = "组长：" + taskinfo.username + members;
			}
			$api.byId('infoStatus').innerHTML = information;
			$api.byId('infoTitle').innerHTML = taskinfo.name;
			$api.byId('planStartTime').innerHTML = taskinfo.planstartime;
			$api.byId('planEndTime').innerHTML = taskinfo.planendtime;
			$api.byId('actualEndTime').innerHTML = taskinfo.finishtime ? taskinfo.finishtime : "未执行";
			$api.byId('infoContent').innerHTML = taskinfo.path;
			$api.byId('explain').innerHTML = taskinfo.explain ? taskinfo.explain : "未上报说明";
			$api.byId('groupcontent').innerHTML= members;
			if(!response){
				$api.byId('response').setAttribute("style", "display:none;");
			}
			else {
				$api.byId('responseContent').innerHTML = response;
			}
			if(typeof result == "number"){
				if(result){
					$api.byId('responseResult').innerHTML = "审核通过";
				}
				else{
					$api.byId('responseResult').innerHTML = "审核未通过";
				}
			}
			else {
				$api.byId('responser').setAttribute("style", "display:none;");
			}
		}

		alert(JSON.stringify(taskinfo));
		initPage();
}

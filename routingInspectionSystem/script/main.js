apiready = function(){
    var info = api.pageParam.info;
    var history = info.history ;
    info.history.page = "main";
    info.history.url = "../html/main.html";

    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

    var initShowing = info.mainShowing || "notice";
    var inited = false;

    //所有的message可查看项目具体跳转到相关的内容表页面detailMessage.html
    //相关通知内容内容通过不同色系内容表述可以点击与否。部分点击内容可跳转到巡检任务页面。并进行内容提交。
    //需要判断单钱的任务是否已经处于运行状态，在运行状态的话将会直接跳转到地图界面内容。
    //当我们提交的时候我们需要对于设置内容有一个确认回复形式。
    //事件提交页面内容，在巡检的过程之中始终是可以进行事件的提交的。
    //事件内容将会在待办事项之中进行展示，我们将可以在待办事项之中进行数据内容的检测和查看具体内容情况。待办事项之中也以分类的形式来进行内容的确定和页面跳转去的条件。

    //确定当前的message之中的类别;
    //待办事项展示
    var messageShowing = function(){
        var elet = $api.byId("topPartContent");
        var eleb = $api.byId("bottomPartContent");
        if(elet.getAttribute("class") == "content1"){
            return false;
        }
        else {
            info.mainShowing = 'message';
            elet.setAttribute("class", "content1");
            eleb.setAttribute("class", "content");
            var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
            var contentH = mainH - 130 - 10;
            elet.setAttribute("style", "height:" + contentH + "px;");
            $api.byId("bottomPart").setAttribute("style", "margin-top:" + (contentH + 8) + "px;");
            eleb.removeAttribute("style");
            if(parseInt($api.byId("messageNumber").innerHTML) == 0 && inited){
                api.alert({
                    title: '提示',
                    msg: '当前没有需要处理的事件内容',
                }, function(ret, err){
                    if(err){
                      alert(JSON.stringify(err));
                    }
                });
                return ;
            }
        }
    };

    //巡检消息展示
    var noticeShowing = function(){
        var elet = $api.byId("topPartContent");
        var eleb = $api.byId("bottomPartContent");
        if(eleb.getAttribute("class") == "content1"){
            return false;
        }
        else {
            info.mainShowing = 'notice';
            eleb.setAttribute("class", "content1");
            elet.setAttribute("class", "content");
            var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
            var contentH = mainH - 130 - 10;
            eleb.setAttribute("style", "height:" + contentH + "px;");
            $api.byId("bottomPart").removeAttribute("style");
            elet.removeAttribute("style");
            if(parseInt($api.byId("noticeNumber").innerHTML) == 0 && inited){
                api.alert({
                    title: '提示',
                    msg: '当前没有任何通知内容!',
                }, function(ret, err){
                    if(err){
                      alert(JSON.stringify(err));
                    }
                });
                return ;
            }
        }
    }


    var eventsType = ["inspectionTaskRelate",  "appearEventsRelate"];

    var noticeType = ["inspectionTask",  "taskMistaken"];

    var addMessage = function(messageId, name, status, information, leftTime, funcdescide){
      var showStatus  = "";
      if(status == 1){
        showStatus = "待接单";
      }
      else if(status == 4){
        showStatus = "挂起中";
      }
      else {
        showStatus = "处理中";
      }
      var date = new Date(leftTime.replace(/-/g,"/"));
      var nowDate = new Date();
    	var container = document.createElement("div");
        container.setAttribute("class", "eves-detail");
        container.innerHTML =
                "<span class='name-info'>" + ("" + name) + "</span>" +
                "<span class='task-status'>" + ("状态[" + showStatus + "]") + "</span>" +
                "<span class='task-info'>" + ( "说明:" + information ) + "</span>" +
                "<span class='task-time'>" + ( "" + leftTime ) + "</span>";
        $api.first($api.byId("topPartContent")).appendChild(container);
        container.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            funcdescide && funcdescide(e, messageId, name, status, information, leftTime);
        }, false);
    }

    var addNotcie = function(noticeId, type, time, name, information, routing, funcdescide){
    	var container = document.createElement("div");
        container.setAttribute("class", "notice-detail");
        container.setAttribute("type", "" + type);
        container.innerHTML = "<div class='notice-time'>" + ("" + time) + "</div>" +
            "<div class='notice-content'>"+
            "<span class='notice-name'>" + ("" + name) + "</span>" +
            (routing ? ("<span class='notice-routing'>" + ("" + routing) + "</span>") : "") +
            "<span class='notice-introduction'>" + ("" + information) + "</span>" +
            "</div>";
        $api.first($api.byId("bottomPartContent")) .appendChild(container);
        container.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            funcdescide && funcdescide(e, noticeId, type, time, name, information, routing);
        }, false)
    }

    var accordingToDatan = function(data){
      if(data.length){
        var num = data.length;
        $api.byId('noticeNumber').innerHTML = num;

        for(var i = 0 ; i < data.length ; i++){}
      }
      else {
        $api.byId('noticeNumber').innerHTML = 0;
        if(initShowing == "notice"){
          alert("没有新的通知");
        }
        inited = true;
      }
    }

    //待办列表内容相关
    var accordingToData = function(data){
      if(data.length){
        var num = data.length;
        $api.byId('messageNumber').innerHTML = num;

        for(var i = 0 ; i < data.length ; i++){
          //处理当前获取的数据内容
          var id = data[i].id;
          var name = data[i].reportname;
          var status = data[i].state;
          var information = data[i].explain;
          var leftTime = data[i].limittime;

          addMessage(id, name, status, information, leftTime,
            function(e, mid, mname, mstatus, minfo, mtime){
              //操作相关的info对象内容，并进行页面的内容的跳转。
              info.eventid = mid;
              info.eventstatus = mstatus;
              animationStart(function(){}, "dealWithEvent", "../html/dealWithEvent.html", info, true);
          })
        }
      }
      else {
        $api.byId('messageNumber').innerHTML = 0;
        if(initShowing == "message"){
          alert("没有需要处理的事件");
        }
        inited = true;
      }
    }

    //页面内容请求获取相关数据
    var request = function(){
      connectToService(commonURL + "?action=eventlist",
        {
          values: { "userid": info.user.userid }
        },
        function(ret){
          if(ret.result){
            accordingToData(ret.data);
          }
          else {
            alert("获取事件信息失败");
          }
        },
        function(ret){
          alert(JSON.stringify(ret.desc));
        }
      );
    }

    var dynamicPage = function(){
    	$api.byId("topPart").addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            messageShowing();
        }, false);

        $api.byId("bottomPart").addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            noticeShowing();
        }, false);

        if(initShowing == "notice"){
          noticeShowing();
        }
        else {
          messageShowing();
        }


        $api.byId('reportEve').addEventListener("click", function(e){
          e.preventDefault();
  				e.stopPropagation();
          animationStart(function(){}, "reportEvent", "../html/reportEvent.html", info, true);
        });

        $api.byId('returnBtn').addEventListener("click", function(e){
  				e.preventDefault();
  				e.stopPropagation();
  				animationStart(function(){}, "login", "../html/login.html", info, true);
  			});
    }

    request();

    addNotcie('n1', 1, "2018-5-29 11:28:40", "路线一", "[xxxx]相关巡检路线详细情况见...", "点1 -> 点2 -> 点3...");
    addNotcie('n2', 2, "2018-5-29 11:28:40", "警告通知", "漏检了巡检点");
    dynamicPage();
}

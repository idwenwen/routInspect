apiready = function(){
    var info = api.pageParam.info;
    var history = info.history ;
    info.history.page = "main";
    info.history.url = "../html/main.html";

    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

    var initShowing = info.mainShowing || "notice";

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
        }
    }


    var eventsType = ["inspectionTaskRelate",  "appearEventsRelate"];

    var noticeType = ["inspectionTask",  "taskMistaken"];

    var addMessage = function(messageId, name, status, information, leftTime, repTime, funcdescide){
      var showStatus  = "";
      if(status == 1){
        showStatus = "待接单";
      }
      else if(status == 4){
        showStatus = "挂起待审批";
      }
      else if(status == 8){
        showStatus = "延时待审批";
      }
      else if(status == 32){
        showStatus = "待处理";
      }
      else if(status == 64){
        showStatus = "待审核";
      }
      else {
        showStatus = "处理中";
      }
      var date = new Date(leftTime.replace(/-/g,"/"));
      var nowDate = new Date();
      var ms = (date.getTime() - nowDate.getTime()) / 1000 / 60;
      var time = Math.floor(ms / 60) + '小时' + Math.floor(ms%60) + '分钟';
      if(Math.floor(ms / 60) <= 0){
        time = "已超时";
      }
     	var container = document.createElement("div");
        container.setAttribute("class", "eves-detail");
        container.innerHTML =
                "<span class='name-info'>" + ("" + information) + "</span>" +
                "<span class='task-status'>" + ("状态[" + showStatus + "]") + "</span>" +
                "<span class='task-info'>" + ( "说明:" + repTime ) + "</span>" +
                "<span class='task-time'>" + ( "" + time ) + "</span>";
        $api.first($api.byId("topPartContent")).appendChild(container);
        container.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            funcdescide && funcdescide(e, messageId, name, status, information, leftTime);
        }, false);
    }

    var addNotcie = function(noticeId, time, name, information, routing, funcdescide){
    	var container = document.createElement("div");
        container.setAttribute("class", "notice-detail");
        container.innerHTML =
            "<div class='notice-content'>"+
            "<span class='notice-name'>" + ("" + name) + "</span>" +
            (routing ? ("<span class='notice-routing'>" + ("" + routing) + "</span>") : "") +
            "<span class='notice-introduction'>" + ("" + information) +
            "<span class='notice-time'>" + ("" + time) + "</span></span>" +
            "</div>";
        $api.first($api.byId("bottomPartContent")) .appendChild(container);
        container.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            funcdescide && funcdescide(e, noticeId, time, name, information, routing);
        }, false)
    }

    var havetask = false;
    var accordingToDatan = function(data){
      $api.first($api.byId("bottomPartContent")).innerHTML = "";
      if(data.length){
        var num = data.length;
        $api.byId('noticeNumber').innerHTML = num;

        for(var i = 0 ; i < data.length ; i++){
          //获取服务器护具内容，进行页面信息的展示
          (function(){
          var id = data[i].id;
          var name = data[i].name;
          var routing = data[i].path;
          var information = data[i].statename;
          var time = data[i].startime;
          var etime = data[i].endtime;
          var type = data[i].state
          var nowTime = new Date();
          var limitT = new Date(etime);
          var between = limitT.getTime() - nowTime.getTime();
          var left = "";
          if(between > 0){
            var lhour = Math.floor(between/1000/60/60);
            var lmin = Math.floor(between/1000/60) - lhour*60;
            left = "剩余"+lhour+"小时"+lmin+"分钟";
          }
          else {
            left = "已超时"
          }
          if(type == 2){
            havetask = true;
          }
          addNotcie(id, left, name, information, routing,
            function(e, id, time, name, information, routing){
              //依据type来进行页面的跳转。如果是进行之中的任务则直接跳转到地图页面.
              //如果是为开始跳转到inspectionRouting页面，警告跳转到处理界面。
              connectToService(commonURL + "?action=taskdetail",
                {
                  values:{"id": id}
                }
                ,function(ret){
                  //TODO:获取相关的数据之后进行内容展示和编写。
                  if(ret.result){
                    // alert(JSON.stringify(ret));
                    var rtype =ret.data.state;
                    if(rtype == 1){
                      if(havetask){
                        alert("您当前已经有正在进行的任务");
                        return false;
                      }
                      info.taskid = id;
                      info.taskdata = ret.data;
                      animationStart(function(){}, "inspectionTask" , "../html/inspectionTask.html" , info, true);
                    }
                    else if(rtype == 2){
                      info.taskid = id;
                      info.taskdata = ret.data;
                      info.start = true;
                      animationStart(function(){}, "taskMap" , "../html/taskMap.html" , info);
                    }
                    else if(rtype == 3){
                      info.taskid = id;
                      info.taskdata = ret.data;
                      animationStart(function(){}, "mistakeForTask" , "../html/mistakeForTask.html" , info, true);
                    }
                  }
                },
                function(ret, err){
                  alert(JSON.stringify(err));
                }
              );
            });
        })();
      }
    }
      else {
        $api.byId('noticeNumber').innerHTML = 0;
      }
    }

    //待办列表内容相关
    var accordingToData = function(data){
      $api.first($api.byId("topPartContent")).innerHTML = "";
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
          var repTime = data[i].reporttime;
          var bigcategoryname = data[i].bigcategoryname;
          var subcategoryname = data[i].subcategoryname;
          var types = bigcategoryname + "-" + subcategoryname;

          addMessage(id, name, status, types, leftTime, information,
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

      connectToService(commonURL + "?action=tasklist",
        {
          values: { "userid": info.user.userid }
        },
        function(ret){
          if(ret.result){
            accordingToDatan(ret.data);
          }
          else {
            alert("获取任务信息失败");
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

        //TODO：可能需要调回功能模块选择页面内容。
        $api.byId('returnBtn').addEventListener("click", function(e){
  				e.preventDefault();
  				e.stopPropagation();
          connectToService(commonURL + "?action=logout",
            {
              values: { "userid": info.user.userid }
            },
            function(ret){
              animationStart(function(){}, "login", "../html/login.html", info, true);
            },
            function(ret){
              alert(JSON.stringify(ret.desc));
            }
          );
  			});

        //TODO：可能需要调回功能模块选择页面内容。
        api.addEventListener({
          name: 'keyback'
        }, function(ret, err) {
          api.toLauncher();
        });
    }

    request();
    setInterval(function(){
      // alert("requesting");
      request();
    }, 10000);

    // addNotcie('n1', "2018-5-29 11:28:40", "路线一", "[xxxx]相关巡检路线详细情况见...", "点1 -> 点2 -> 点3...", function(e){
    //   animationStart(function(){}, "inspectionTask", "../html/inspectionTask.html", info, true);
    // });
    // addNotcie('n2', "2018-5-29 11:28:40", "警告通知", "漏检了巡检点", "",function(e){
    //   animationStart(function(){}, "mistakeForTask", "../html/mistakeForTask.html", info, true);
    // });
    dynamicPage();
}

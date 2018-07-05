apiready = function(){

  var info = api.pageParam.info;
  var history = info.history ;
  info.history.page = "noticelist";
  info.history.url = "../html/noticelist.html";
  var check = info.check || 1;
  var addcheck = check;

  var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
  $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

  var addNotcie = function(noticeId, time, name, information, routing, type,funcdescide){
    var parent = "";
    if(type == 2){
      parent = $api.byId('typelist2');
    }
    else if(type == 1){
      parent = $api.byId('typelist1');
    }
    else {
      parent = $api.byId('typelist3');
    }
    var container = document.createElement("div");
      container.setAttribute("class", "notice-detail");
      container.innerHTML =
          "<div class='notice-content'>"+
          "<span class='notice-name'>" + ("" + name) + "</span>" +
          (routing ? ("<span class='notice-routing'>" + ("" + routing) + "</span>") : "") +
          "<span class='notice-introduction'>" + ("" + information) +
          "<span class='notice-time'>" + ("" + time) + "</span></span>" +
          "</div>";
      parent.appendChild(container);
      container.addEventListener('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          funcdescide && funcdescide(e, noticeId, time, name, information, routing, type);
      }, false)
  }

  var havetask = false;
  var accordingToDatan = function(data){
    $api.byId('typelist3').innerHTML = "";
    $api.byId('typelist1').innerHTML = "";
    $api.byId('typelist2').innerHTML = "";
    if(data.length){
      var num = data.length;

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
        addNotcie(id, left, name, information, routing, type,
          function(e, id, time, name, information, routing, type){
            //依据type来进行页面的跳转。如果是进行之中的任务则直接跳转到地图页面.
            //如果是为开始跳转到inspectionRouting页面，警告跳转到处理界面。

            if(type == 1){
              if(havetask){
                alert("您当前已经有正在进行的任务");
                return false;
              }
            }

            var innerfunc = function(rtype, ret){
              info.check = addcheck;
              if(rtype == 1){
                info.taskid = id;
                info.taskdata = ret.data;
                animationStart(function(){}, "inspectionTask" , "../html/inspectionTask.html" , info, true);
              }
              else if(rtype == 2){
                var ref = false;
                if(info.taskid != id){
                  ref = true;
                }
                info.taskid = id;
                info.taskdata = ret.data;
                info.start = true;
                animationStart(function(){}, "taskMap" , "../html/taskMap.html" , info, ref );
              }
              else if(rtype == 3){
                info.taskid = id;
                info.taskdata = ret.data;
                animationStart(function(){}, "mistakeForTask" , "../html/mistakeForTask.html" , info, true);
              }
            }

            var taskdetails = $api.getStorage('taskdetails');
            var taskinfo = "";
            if(taskdetails){
              for(var i = 0; i < taskdetails.length; i++){
                if(taskdetails[i].id == id){
                  taskinfo = taskdetails[i].detail;
                  break;
                }
              }
            }
            else {
              taskdetails = [];
            }
            if(!taskinfo){
              connectToService(commonURL + "?action=taskdetail",
                {
                  values:{"id": id}
                }
                ,function(ret){
                  //TODO:获取相关的数据之后进行内容展示和编写。
                  if(ret.result){
                    var rtype =ret.data.state;
                    taskdetails.push({"id":id, "detail":ret});
                    $api.setStorage('taskdetails', taskdetails);
                    innerfunc(rtype, ret);
                  }
                },
                function(ret, err){
                  api.sendEvent({
                      name: 'onlineoff'
                  });
                }
              );
            }
            else {
              innerfunc(type, taskinfo);
            }
          });
      })();
    }
  }
  var eli = [];
  for(var i = 1 ; i < 4 ; i++){
    if($api.byId('typelist' + i).children.length == 0){
      eli.push(i);
    }
  }
  empty(eli);
  }

  var empty = function(arr)
  {
    arr.forEach(function(item, index){
      var message = "";
      if(item == 1){
        message = "当前无需要执行的任务";
      }
      else if(item == 2){
        message = "当前无正在执行的任务";
      }
      else {
        message = "当前没有异常结束的任务"
      }
      $api.byId('typelist'+item).innerHTML = "<div class='emptyclass'>" + message + "</div>";
    });
  }

  var request = function(callback){
    connectToService(commonURL + "?action=tasklist",
      {
        values: { "userid": info.user.userid }
      },
      function(ret){
        if(ret.result){
          accordingToDatan(ret.data);
          $api.byId('loading').setAttribute("style", "display:none;");
          callback && callback();
        }
        else {
          alert("获取任务信息失败");
        }
      },
      function(ret){
        request(callback);
      }
    );
  }

  var changelist = function(id){
    for(var i = 1; i < 4; i++){
      if(i == id){
        $api.byId('typelist' + i).removeAttribute("style");
        $api.byId('b' + i).setAttribute("class", "button-con b" + i +" colorchoose");
      }
      else {
        $api.byId('typelist' + i).setAttribute("style", "display:none;");
        $api.byId('b' + i).setAttribute("class", "button-con b" + i);
      }
    }
  }

  var dynamic = function(){
    $api.byId('b1').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      changelist(1);
      addcheck = 1;
    });

    $api.byId('b2').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      changelist(2);
      addcheck = 2;
    });

    $api.byId('b3').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      changelist(3);
      addcheck = 3;
    });

    $api.byId('returnBtn').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      animationStart(function(){}, "modellist", "../html/modellist.html", info);
    });

    api.addEventListener({
      name: 'keyback'
    }, function(ret, err) {
      animationStart(function(){}, "modellist", "../html/modellist.html", info);
    });
  }

  var initedPage = function(){
    dynamic();
    request();
    changelist(check);
    var refreshInterval = function(){
      setTimeout(function(){
        request(refreshInterval);
      },10000);
    }
    refreshInterval();
  }

  initedPage();
}

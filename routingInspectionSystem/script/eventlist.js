apiready = function(){
    var info = api.pageParam.info;
    var history = info.history ;
    info.history.page = "eventlist";
    info.history.url = "../html/eventlist.html";
    var check = info.check || 1;
    var addcheck = check;

    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

    var addMessage = function(messageId, name, status, information, leftTime, repTime, funcdescide){
      var showStatus  = "";
      var parent = "";
      if(status == 1){
        showStatus = "待接单";
        parent = $api.byId('typelist1');
      }
      else if(status == 4){
        showStatus = "挂起待审批";
        parent = $api.byId('typelist3');
      }
      else if(status == 8){
        showStatus = "延时待审批";
        parent = $api.byId('typelist3');
      }
      else if(status == 32){
        showStatus = "待处理";
        parent = $api.byId('typelist2');
      }
      else if(status == 64){
        showStatus = "待审核";
        parent = $api.byId('typelist3');
      }
      else {
        showStatus = "处理中";
        parent = $api.byId('typelist2');
      }
      var time = "";
      if(!leftTime){
        time = "无限时";
      }
      else {
        var date = new Date(leftTime.replace(/-/g,"/"));
        var nowDate = new Date();
        var ms = (date.getTime() - nowDate.getTime()) / 1000 / 60;
        time = Math.floor(ms / 60) + '小时' + Math.floor(ms%60) + '分钟';
        if(Math.floor(ms / 60) <= 0){
          time = "已超时";
        }
      }
     	var container = document.createElement("div");
        container.setAttribute("class", "eves-detail");
        container.innerHTML =
                "<span class='name-info'>" + ("" + information) + "</span>" +
                "<span class='task-status'>" + ("状态[" + showStatus + "]") + "</span>" +
                "<span class='task-info'>" + ( "说明:" + repTime ) + "</span>" +
                "<span class='task-time'>" + ( "" + time ) + "</span>";
        parent.appendChild(container);
        container.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            funcdescide && funcdescide(e, messageId, name, status, information, leftTime);
        }, false);
    }

    var accordingToData = function(data){
      $api.byId('typelist3').innerHTML = "";
      $api.byId('typelist1').innerHTML = "";
      $api.byId('typelist2').innerHTML = "";
      $api.byId('typelist4').innerHTML = "";
      if(data.length){
        var num = data.length;
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
              info.check = addcheck;
              animationStart(function(){}, "dealWithEvent", "../html/dealWithEvent.html", info, true);
          })
        }
      }
      var eli = [];
      for(var i = 1 ; i < 5 ; i++){
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
          message = "当前没有待处理的事件";
        }
        else if(item == 2){
          message = "当前没有正在处理的事件";
        }
        else if(item == 3){
          message = "当前没有需要审批的事件"
        }
        else {
          message = "当前没有处理完成的事件信息"
        }
        $api.byId('typelist'+item).innerHTML = "<div class='emptyclass'>" + message + "</div>";
      });
    }

    var request = function(){
      connectToService(commonURL + "?action=eventlist",
        {
          values: { "userid": info.user.userid }
        },
        function(ret){
          if(ret.result){
            accordingToData(ret.data);
            $api.byId('loading').setAttribute("style", "display:none;");
          }
        },
        function(ret){
          request();
        }
      );
    }

    var changelist = function(id){
      for(var i = 1; i < 5; i++){
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

      $api.byId('b4').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        changelist(4);
        addcheck = 4;
      });

      $api.byId('reportEve').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        info.check = 1;
        animationStart(function(){}, "reportEvent", "../html/reportEvent.html", info, true);
      });


      $api.byId('returnBtn').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        info.check = 1;
        animationStart(function(){}, "modellist", "../html/modellist.html", info);
      });

      api.addEventListener({
        name: 'keyback'
      }, function(ret, err) {
        info.check = 1;
        animationStart(function(){}, "modellist", "../html/modellist.html", info);
      });

    }

    var initedPage = function(){
      dynamic();
      request();
      changelist(check);
      setInterval(function(){
        request();
      })
    }

    initedPage();
}

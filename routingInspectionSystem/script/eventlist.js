apiready = function(){
    var info = api.pageParam.info;

    if(!info.history){info.history = {};}
    info.history.page = "eventlist";
    info.history.url = "../html/eventlist.html";
    var history = info.history ;
    var check = info.check || 1;
    var addcheck = check;

    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

    var addMessage = function(messageId, name, status, types, leftTime, repTime, information, road, handlename, funcdescide){
      var showStatus  = "";
      var parent = "";
      if(status == 1){
        showStatus = "待接单";
        parent = $api.byId('typelist1');
        cachelist.n.push({id:messageId, name:name});
        list1content[0]++;
      }
      else if(status == 2){
        showStatus = "处理中";
        parent = $api.byId('typelist2');
        list1content[1]++;
      }
      else if(status == 4){
        showStatus = "挂起待审批";
        parent = $api.byId('typelist3');
        cachelist.c.push({id:messageId, name:name});
        list1content[2]++;
      }
      else if(status == 8){
        showStatus = "延时待审批";
        parent = $api.byId('typelist3');
        cachelist.c.push({id:messageId, name:name});
        list1content[2]++;
      }
      else if(status == 16){
        showStatus = "待处理";
        parent = $api.byId('typelist2');
        list1content[1]++;
      }
      else if(status == 32){
        showStatus = "待处理";
        parent = $api.byId('typelist2');
        list1content[1]++;
      }
      else if(status == 64){
        showStatus = "待审核";
        parent = $api.byId('typelist3');
        cachelist.c.push({id:messageId, name:name});
        list1content[2]++;
      }
      else if(status == 128){
        showStatus = "超时完成";
        parent = $api.byId('typelist4');
      }
      else {
        showStatus = "已完成";
        parent = $api.byId('typelist4');
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
                "<span class='name-info'>" + ("" + types) + "</span>" +
                "<span class='number-info'>" + ("编号（" + messageId + "）") + "</span>" +
                "<span class='report-time'>" + ("上报人员：" + name) + "</span>" +
                "<span class='report-time'>" + ("所处路段：" + road) + "</span>" +
                "<span class='report-time'>" + ("上报时间：" + repTime) + "</span>" +
                "<span class='report-time' style='display:none;'>" + ("处理人员" + handlename) + "</span>" +
                "<span class='task-status'>" + ("状态（" + showStatus + "）") + "</span>" +
                "<span class='task-info'>" + ( "说明:" + information ) + "</span>" +
                "<span hidden='hidden'>" + ( leftTime ) + "</span>" +
                (parent.getAttribute("id") != "typelist4" ? ("<span class='task-time'>" + ( "" + time ) + "</span>") : "");
        parent.appendChild(container);
        screenForSure(container);
        container.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            funcdescide && funcdescide(e, messageId, name, status, types, leftTime, repTime, information);
        }, false);
    }

    var screenForSure = function(container){
       hidechoose(container);
       checkmyrequest(container);
       checkmyhandle(container);
    }

    var list1content = [0,0,0];
    var accordingToData = function(data){
      $api.byId('typelist3').innerHTML = "";
      $api.byId('typelist1').innerHTML = "";
      $api.byId('typelist2').innerHTML = "";
      $api.byId('typelist4').innerHTML = "";
      list1content = [0,0,0];
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
          var road = data[i].road;
          var handlename = data[i].handlname;

          addMessage(id, name, status, types, leftTime, repTime, information, road, handlename,
            function(e, mid, mname, mstatus, minfo, mtime){
              //操作相关的info对象内容，并进行页面的内容的跳转。
              info.eventid = mid;
              info.eventstatus = mstatus;
              info.check = addcheck;
              animationStart(function(){}, "dealWithEvent", "../html/dealWithEvent.html", info, true);
          });
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

    var request = function(callback){
      connectToService(commonURL + "?action=eventlist",
        {
          values: { "userid": info.user.userid }
        },
        function(ret){
          if(ret.result){
            accordingToData(ret.data);
            list1content.forEach(function(item, index){
              if(item == 0){
                $api.byId('bs'+(index+1)).setAttribute("hidden", "hidden");
              }else {
                $api.byId('bs'+(index+1)).removeAttribute("hidden");
                $api.byId('bs'+(index+1)).innerHTML = item + "";
              }
            });
            $api.byId('loading').setAttribute("style", "display:none;");
            callback && callback();
            notification();
          }
        },
        function(ret){
          request(callback);
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
      if(check == 1){
        changeShowing(false);
      }
      else {
        changeShowing(true);
      }
    }

    var UICalendar = api.require('UICalendar');

    var dynamic = function(){
      $api.byId('b1').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        changelist(1);
        recovery(addcheck);
        clearscreen();
        clearmycheck();
        addcheck = 1;
        $api.byId("b6").removeAttribute("style");
        $api.byId("b7").removeAttribute("style");
        changeShowing(false);
      });

      $api.byId('b2').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        changelist(2);
        recovery(addcheck);
        clearscreen();
        clearmycheck();
        addcheck = 2;
        $api.byId("b6").removeAttribute("style");
        $api.byId("b7").removeAttribute("style");
        changeShowing(true);
      });

      $api.byId('b3').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        changelist(3);
        recovery(addcheck);
        clearscreen();
        clearmycheck();
        addcheck = 3;
        $api.byId("b6").removeAttribute("style");
        $api.byId("b7").removeAttribute("style");
        changeShowing(true);
      });

      $api.byId('b4').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        changelist(4);
        recovery(addcheck);
        clearscreen();
        clearmycheck();
        addcheck = 4;
        $api.byId("b6").removeAttribute("style");
        $api.byId("b7").removeAttribute("style");
        changeShowing(true);
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

      $api.byId('b5').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $api.byId("searchboxdiv").removeAttribute("hidden");
      });

      $api.byId('b6').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        hidelist(recovery);
        if($api.byId('b6').getAttribute("style")){
          $api.byId('b6').removeAttribute("style");
          myrequest = false;
          recoveryfrommyrequest();
        }
        else {
          $api.byId("b6").setAttribute("style", "background-color:#336699;color:white");
          myrequest = true;
          hidelistforMy(checkmyrequest);
        }
      });

      $api.byId('b7').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        hidelist(recovery);
        if($api.byId('b7').getAttribute("style")){
          $api.byId('b7').removeAttribute("style");
          myhandle = false;
          recoveryfrommyhandle();
        }
        else {
          $api.byId("b7").setAttribute("style", "background-color:#336699;color:white");
          myhandle = true;
          hidelistforMy(checkmyhandle);
        }
      });

      $api.byId('blackgrounds').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $api.byId("searchboxdiv").setAttribute("hidden", "hidden");
      });

      $api.byId('blackgroundbig').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $api.byId("searchboxdivbig").setAttribute("hidden", "hidden");
      });

      $api.byId('blackgroundsmall').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $api.byId("searchboxdivsmall").setAttribute("hidden", "hidden");
      });

      $api.byId('blackgroundroad').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $api.byId("searchboxdivroad").setAttribute("hidden", "hidden");
      });

      $api.byId('search-type-big').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $api.byId('searchboxdivbig').removeAttribute("hidden", "hidden");
      });

      $api.byId("search-road").addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $api.byId('searchboxdivroad').removeAttribute("hidden");
      });

      $api.byId('searchroad').addEventListener("input", function(e){
        e.preventDefault();
        e.stopPropagation();
        var inputData = $api.byId('searchroad').value;
        var child = $api.byId('roadcontent').children;
        for(var i = 0 ; i < child.length ; i ++){
          if(!(child[i].innerHTML.match(inputData))){
            child[i].setAttribute("style", "display:none;");
          }
          else {
            child[i].removeAttribute("style");
          }
        }
      });


      $api.byId('searchbtn').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        //todo:依据编号
        screenData();
        hidelist(recovery);
        $api.byId('searchboxdiv').setAttribute("hidden", "hidden");
      });

      $api.byId('restbtn').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        //todo:依据编号
        clearscreen();
      });

      $api.byId('hst').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $api.byId('blackgroundsbody').removeAttribute("style");


        UICalendar.open({
            rect:{
              y:100
            },
            styles: {
                bg: 'rgba(255,255,255,1)',
                week: {
                    weekdayColor: '#3b3b3b',
                    weekendColor: '#a8d400',
                    size: 12
                },
                date: {
                    color: '#3b3b3b',
                    selectedColor: '#fff',
                    selectedBg: '#a8d500',
                    size: 12
                },
                today: {
                    color: 'rgb(230,46,37)',
                    bg: ''
                },
                specialDate: {
                    color: '#a8d500',
                    bg: 'widget://image/a.png'
                }
            },
            switchMode: 'vertical',
            fixedOn: api.frameName,
            fixed: false
        }, function(ret, err) {
            if (ret) {
                var str = ret.year + "-" + ret.month + '-' + ret.day;
                $api.byId('hst').value = str;
                if(ret.eventType == 'special' || ret.eventType == 'normal'){
                    UICalendar.close();
                    $api.byId('blackgroundsbody').setAttribute("style", "display:none;");
                }
            } else {
                alert(JSON.stringify(err));
                UICalendar.close();
                $api.byId('blackgroundsbody').setAttribute("style", "display:none;");
            }
        });
      });

      $api.byId('het').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $api.byId('blackgroundsbody').removeAttribute("style");

        UICalendar.open({
            rect:{
              y:100
            },
            styles: {
                bg: 'rgba(255,255,255,1)',
                week: {
                    weekdayColor: '#3b3b3b',
                    weekendColor: '#a8d400',
                    size: 12
                },
                date: {
                    color: '#3b3b3b',
                    selectedColor: '#fff',
                    selectedBg: '#a8d500',
                    size: 12
                },
                today: {
                    color: 'rgb(230,46,37)',
                    bg: '#aaa'
                },
                specialDate: {
                    color: '#a8d500',
                    bg: 'widget://image/a.png'
                }
            },
            switchMode: 'vertical',
            fixedOn: api.frameName,
            fixed: false
        }, function(ret, err) {
            if (ret) {
                var str = ret.year + "-" + ret.month + '-' + ret.day;
                $api.byId('het').value = str;
                if(ret.eventType == 'special' || ret.eventType == 'normal'){
                    UICalendar.close();
                    $api.byId('blackgroundsbody').setAttribute("style", "display:none;");
                }
            } else {
                alert(JSON.stringify(err));
                UICalendar.close();
                $api.byId('blackgroundsbody').setAttribute("style", "display:none;");
            }
        });
      });

      $api.byId('rst').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $api.byId('blackgroundsbody').removeAttribute("style");

        UICalendar.open({
            rect:{
              y:100
            },
            styles: {
                bg: 'rgba(255,255,255,1)',
                week: {
                    weekdayColor: '#3b3b3b',
                    weekendColor: '#a8d400',
                    size: 12
                },
                date: {
                    color: '#3b3b3b',
                    selectedColor: '#fff',
                    selectedBg: '#a8d500',
                    size: 12
                },
                today: {
                    color: 'rgb(230,46,37)',
                    bg: ''
                },
                specialDate: {
                    color: '#a8d500',
                    bg: 'widget://image/a.png'
                }
            },
            switchMode: 'vertical',
            fixedOn: api.frameName,
            fixed: false
        }, function(ret, err) {
            if (ret) {
                var str = ret.year + "-" + ret.month + '-' + ret.day;
                $api.byId('rst').value = str;
                if(ret.eventType == 'special' || ret.eventType == 'normal'){
                    UICalendar.close();
                    $api.byId('blackgroundsbody').setAttribute("style", "display:none;");
                }
            } else {
                alert(JSON.stringify(err));
                UICalendar.close();
                $api.byId('blackgroundsbody').setAttribute("style", "display:none;");
            }
        });
      });

      $api.byId('ret').addEventListener("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        $api.byId('blackgroundsbody').removeAttribute("style");

        UICalendar.open({
            rect:{
              y:100
            },
            styles: {
                bg: 'rgba(255,255,255,1)',
                week: {
                    weekdayColor: '#3b3b3b',
                    weekendColor: '#a8d400',
                    size: 12
                },
                date: {
                    color: '#3b3b3b',
                    selectedColor: '#fff',
                    selectedBg: '#a8d500',
                    size: 12
                },
                today: {
                    color: 'rgb(230,46,37)',
                    bg: ''
                },
                specialDate: {
                    color: '#a8d500',
                    bg: 'widget://image/a.png'
                }
            },
            switchMode: 'vertical',
            fixedOn: api.frameName,
            fixed: false
        }, function(ret, err) {
            if (ret) {
                var str = ret.year + "-" + ret.month + '-' + ret.day;
                $api.byId('ret').value = str;
                if(ret.eventType == 'special' || ret.eventType == 'normal'){
                    UICalendar.close();
                    $api.byId('blackgroundsbody').setAttribute("style", "display:none;");
                }
            } else {
                alert(JSON.stringify(err));
                UICalendar.close();
                $api.byId('blackgroundsbody').setAttribute("style", "display:none;");
            }
        });
      });

      $api.byId('blackgroundsbody').addEventListener("click", function(e){
        e.stopPropagation();
        e.preventDefault();
        UICalendar.close();
        $api.byId('blackgroundsbody').setAttribute("style", "display:none;");
      });



      api.addEventListener({
        name: 'keyback'
      }, function(ret, err) {
        info.check = 1;
        animationStart(function(){}, "modellist", "../html/modellist.html", info);
      });

    }

    var cachelist = {n:[], c:[]};
    var initedPage = function(){
      dynamic();
      request();
      changelist(check);
      var refreshInterval = function(){
        setTimeout(function(){
          cachelist = {n:[], c:[]};
          request(refreshInterval);
        },15000);
      }
      refreshInterval();
    }

    //存储当前的列表内容。
    var notification = function(data){
      api.sendEvent({
          name: 'notificationE',
          extra: {
              cachelist: cachelist
          }
      });
    }

    var gettypedata = function(){
      var data = $api.getStorage('eventclass');
			if(data){
				drawingDetail(data);
			}
			else {
				connectToService(commonURL + "?action=eventclass",
		    	null,function(ret){
	        	if(ret.result == true){
							$api.setStorage('eventclass', ret.data);
							drawingDetail(ret.data);
						}
			    },
			    function(ret){
	          alert(JSON.stringify(ret.desc));
			    }
				);
			}
    }

    var biglist = [];
    var smallList = [];
    var drawingDetail = function(data){
      data.forEach(function(item, index){
        biglist.push(item.name);
        var sl = [];
        item.items.forEach(function(item, index){
          sl.push(item.name);
        });
        smallList.push(sl);
      });
      addingbigType(biglist);
    }

    var addingbigType = function(list){
      $api.byId("bigtypecontent").innerHTML = "";
      list.forEach(function(item, index){
        var spanc = document.createElement("span");
        spanc.setAttribute("class", "type-de");
        spanc.setAttribute("id", "bigtype-"+index);
        spanc.innerHTML = item;
        spanc.addEventListener("click", function(e){
          e.preventDefault();
          e.stopPropagation();
          var showingsmall = smallList[index];
          addingSmallType(showingsmall);
          $api.byId("search-type-big").innerHTML = item;
          $api.byId('searchboxdivbig').setAttribute("hidden", "hidden");
          $api.byId('search-type-small').addEventListener("click", function(e){
            e.preventDefault();
            e.stopPropagation();
            $api.byId('searchboxdivsmall').removeAttribute("hidden", "hidden");
          });
          $api.byId('search-type-small').innerHTML = "请选择事项小类型";
          $api.byId('');

        });
        $api.byId('bigtypecontent').appendChild(spanc);
      });
    }

    var addingSmallType = function(data){
      $api.byId("smalltypecontent").innerHTML = "";
      data.forEach(function(item, index){
        var spanc = document.createElement("span");
        spanc.setAttribute("class", "type-de");
        spanc.setAttribute("id", "smalltyle-"+index);
        spanc.innerHTML = item;
        spanc.addEventListener("click", function(e){
          e.preventDefault();
          e.stopPropagation();
          $api.byId("search-type-small").innerHTML = item;
          $api.byId('searchboxdivsmall').setAttribute("hidden", "hidden");
        });
        $api.byId('smalltypecontent').appendChild(spanc);
      });
    }

    var getroad = function(){
      var data = $api.getStorage("eventroad");
      if(data){
        drawingDetailP(data);
      }
      else {
        connectToService(commonURL + "?action=eventroad",
          null,function(ret){
            if(ret.result == true){
              $api.setStorage('eventroad', ret.data);
              drawingDetailP(ret.data);
            }
          },
          function(ret){
            alert(JSON.stringify(ret.desc));
          }
        );
      }
    }

    var drawingDetailP = function(data){
      var roadlist = [];
      data.forEach(function(item, index){
        roadlist.push(item.name);
      });
      roadlist.forEach(function(item, index){
        var spanc = document.createElement("span");
        spanc.setAttribute("class", "type-de");
        spanc.setAttribute("id", "roadtype-"+index);
        spanc.innerHTML = item;
        spanc.addEventListener("click", function(e){
          e.preventDefault();
          e.stopPropagation();
          $api.byId('search-road').innerHTML = item;
          $api.byId('searchboxdivroad').setAttribute("hidden", "hidden");
        });
        $api.byId('roadcontent').appendChild(spanc);
      });
    }

    var snumber = "";
    var sroad = "";
    var sbtype = "";
    var sstype = "";
    var hstime = "";
    var hetime = "";
    var rstime = "";
    var retime = "";
    var screenData = function(){
      checkscreen = true;
      snumber = $api.byId('search-number').value;
      sroad = $api.byId('search-road').innerHTML;
      sbtype = $api.byId('search-type-big').innerHTML;
      sstype = $api.byId('search-type-small').innerHTML;
      hstime = $api.byId('hst').value;
      hetime = $api.byId('het').value;
      rstime = $api.byId('rst').value;
      retime = $api.byId('ret').value;
      if(sroad == "请选择事项路段") {
        sroad = "";
      }
      if(sbtype == "请选择事项大类型"){
        sbtype = "";
      }
      if(sstype == "请选择事项小类型"){
        sstype = "";
      }
    }

    var checkscreen = false;
    var clearscreen = function(){
      $api.byId('search-number').value = "";
      $api.byId('search-road').innerHTML = "请选择事项路段";
      $api.byId('search-type-big').innerHTML = "请选择事项大类型";
      $api.byId('search-type-small').innerHTML = "请选择事项小类型";
      $api.byId('hst').value = "";
      $api.byId('het').value = "";
      $api.byId('rst').value = "";
      $api.byId('ret').value = "";
      checkscreen = false;
    }

    var clearmycheck = function(){
      myrequest = false;
      myhandle = false;
    }

    var hidelist = function(func){
      var page = addcheck ? addcheck : 1;
      var list = $api.byId('typelist' + page).children;

      if(func){
        func(page);
      }

      for(var i = 0 ; i < list.length ; i ++){
        hidechoose(list[i]);
      }
    }

    var hidelistforMy = function(func){
      var page = addcheck ? addcheck : 1;
      var list = $api.byId('typelist' + page).children;
      for(var i = 0 ; i < list.length ; i ++){
        func(list[i]);
      }
    }

    var hidechoose = function(list){
      if(!checkscreen){
        return ;
      }
      var childs = list.children;
      var types = childs[0].innerHTML.split("-");
      var checkfinal = true;
      if(sbtype && sbtype != types[0]){
        checkfinal = false;
      }
      if(sstype && sstype != types[1] && checkfinal){
        checkfinal = false;
      }
      var num = childs[1].innerHTML;
      if(snumber && !num.match(snumber) && checkfinal){
        checkfinal = false;
      }
      var road = childs[3].innerHTML;
      if(sroad && !road.match(sroad) && checkfinal){
        checkfinal = false;
      }
      var repTime = new Date(childs[4].innerHTML.replace('上报时间：', '')).getTime();
      if((!hstime || repTime >= (new Date(hstime).getTime())) && checkfinal){
        checkfinal = false;
      }
      if((!hetime || repTime <= (new Date(hetime).getTime())) && checkfinal){
        checkfinal = false;
      }
      var limitTime  = new Date(childs[8].innerHTML).getTime();
      if((!rstime || limitTime >= (new Date(rstime).getTime())) && checkfinal){
        checkfinal = false;
      }
      if((!retime || limitTime <= (new Date(retime).getTime())) && checkfinal){
        checkfinal = false;
      }
      if(!checkfinal){
        list.setAttribute("hidden", "hidden");
      }
    }

    var myrequest = false;
    var checkmyrequest = function(list){
      if(!myrequest){
        return ;
      }
      var childs = list.children;
      if(childs.length < 6){
        return ;
      }
      var checkfinal = true;
      var checkmine = childs[2].innerHTML;
      var myname = myrequest ? info.user.name : "";
      if(myname && !checkmine.match(myname)){
        checkfinal = false;
      }
      if(!checkfinal){
        list.setAttribute("hidden", "hidden");
      }
    }

    var myhandle = false;
    var checkmyhandle = function(list){
      if(!myhandle){
        return ;
      }
      var childs = list.children;
      if(childs.length < 6){
        return ;
      }
      var checkfinal = true;
      var checkmine = childs[5].innerHTML; //需要修改
      var myname = myhandle ? info.user.name : "";
      if(myname && !checkmine.match(myname)){
        checkfinal = false;
      }
      if(!checkfinal){
        list.setAttribute("hidden", "hidden");
      }
    }

    var recoveryfrommyrequest = function(){
      hidelist(recovery);
      hidelistforMy(checkmyhandle);
    }

    var recoveryfrommyhandle = function(){
      hidelist(recovery);
      hidelistforMy(checkmyrequest);
    }

    var recoveryfromall = function(){
      hidelist(recovery);
    }

    var recovery = function(page){
      var list = $api.byId('typelist' + page).children;
      for(var i = 0 ; i < list.length; i ++){
        list[i].removeAttribute("hidden");
      }
    }

    var changeShowing = function(style){
      if(style){
        $api.byId('b5').setAttribute("class", "button-con-big-2 b5");
        $api.byId('b6').setAttribute("class", "button-con-big-2 b6");
        $api.byId('b7').setAttribute("class", "button-con-big-2 b7");
        $api.byId('b7').removeAttribute("style");
      }
      else {
        $api.byId('b5').setAttribute("class", "button-con-big b5");
        $api.byId('b6').setAttribute("class", "button-con-big b6");
        $api.byId('b7').setAttribute("class", "button-con-big b7");
        $api.byId('b7').setAttribute("style", "display:none;");
      }
    }

    initedPage();
    gettypedata();
    getroad();
}

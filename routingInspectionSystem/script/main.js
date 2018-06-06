apiready = function(){
    var info = api.pageParam;
    var history = info.history;
    info.history = "main";

    //所有的message可查看项目具体跳转到相关的内容表页面detailMessage.html
    //相关通知内容内容通过不同色系内容表述可以点击与否。部分点击内容可跳转到巡检任务页面。并进行内容提交。
    //需要判断单钱的任务是否已经处于运行状态，在运行状态的话将会直接跳转到地图界面内容。
    //当我们提交的时候我们需要对于设置内容有一个确认回复形式。
    //事件提交页面内容，在巡检的过程之中始终是可以进行事件的提交的。
    //事件内容将会在待办事项之中进行展示，我们将可以在待办事项之中进行数据内容的检测和查看具体内容情况。待办事项之中也以分类的形式来进行内容的确定和页面跳转去的条件。

    //确定当前的message之中的类别;
    var messageShowing = function(){
        var elet = $api.byId("topPartContent");
        var eleb = $api.byId("bottomPartContent");
        if(elet.getAttribute("class") == "content1"){
            return false;
        }
        else {
            elet.setAttribute("class", "content1");
            eleb.setAttribute("class", "content");
            var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
            var contentH = mainH - 130 - 10;
            elet.setAttribute("style", "height:" + contentH + "px;");
            $api.byId("bottomPart").setAttribute("style", "margin-top:" + (contentH + 8) + "px;");
            eleb.removeAttribute("style");
        }
    };

    var noticeShowing = function(){
        var elet = $api.byId("topPartContent");
        var eleb = $api.byId("bottomPartContent");
        if(eleb.getAttribute("class") == "content1"){
            return false;
        }
        else {
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

    var addMessage = function(messageId, type, headPic, name, status, info, leftTime){
    	var container = document.createElement("div");
        container.setAttribute("class", "eves-detail");
        container.setAttribute("type", "" + eventsType[(type-1)]);
        container.innerHTML = /*"<div class='head-pic'><img src=" + ("" + headPic) + "></div>"+*/
                "<span class='name-info'>" + ("" + name) + "</span>" +
                "<span class='task-status'>" + ("任务[ " + status + " ]") + "</span>" +
                "<span class='task-info'>" + ( "" + info ) + "</span>" +
                "<span class='task-time'>剩余" + ( "" + leftTime ) + "</span>";
        $api.first($api.byId("topPartContent")).appendChild(container);
        var funcdescide = null;
        info.messageId = messageId;
        info.noticeType = "";
        if(type == 1){
            if(status == "待执行"){
                funcdescide = function(){
                    animationStart(function(){}, "inspectionTask",
                        "./inspectionTask.html", info, true);
                }
            }
            else if(status == "进行中"){
                funcdescide = function(){
                    animationStart(function(){}, "taskMap", "./taskMap.html",
                        info, true);
                }
            }
            else if(status == "异常报告"){
                funcdescide = function(){
                    animationStart(function(){}, "mistakeForTask", "./mistakeForTask.html",
                        info, true);
                }
            }
        }
        else if(type == 2){
            funcdescide = function(){
                animationStart(function(){}, "dealWithEvent", "./dealWithEvent.html",
                    info, true);
            }
        }

        container.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            funcdescide();
        }, false);
    }

    var addNotcie = function(noticeId, type, time, name, info, routing){
    	var container = document.createElement("div");
        container.setAttribute("class", "notice-detail");
        container.setAttribute("type", "" + noticeType[(type-1)]);
        container.innerHTML = "<div class='notice-time'>" + ("" + time) + "</div>" +
            "<div class='notice-content'>"+
            "<span class='notice-name'>" + ("" + name) + "</span>" +
            (routing ? ("<span class='notice-routing'>" + ("" + routing) + "</span>") : "") +
            "<span class='notice-introduction'>" + ("" + info) + "</span>" +
            "</div>";
        $api.first($api.byId("bottomPartContent")) .appendChild(container);
        info.messageId = "";
        info.noticeType = noticeId;
        var funcdescide = null;
        if(type == 1){
            funcdescide = function(){
                animationStart(function(){}, "inspectionTask" ,"./inspectionTask.html",
                    info, true);
            }
        }
        else if(type == 2){
            funcdescide = function(){
                animationStart(function(){}, "mistakeForTask", "./mistakeForTask.html",
                    info, true);
            }
        }

        container.addEventListener('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            funcdescide();
        }, false)
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

        noticeShowing();
        var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
        $api.byId("main").setAttribute("style", "height:" + mainH + "px;");
        $api.byId('reportEve').addEventListener("click", function(){
          animationStart(function(){}, "reportEvent", "../html/reportEvent.html", info, true);
        });

    }

    addMessage('m1', 1 , "../icon/atm.png", "刘甫庚", "待执行", "【巡检任务】巡检重要路线", "1天");
    addMessage('m2', 1 , "../icon/atm.png", "庆朱楠", "进行中", "【巡检任务】巡检重要路线", "2天");
    addMessage('m3', 1 , "../icon/atm.png", "李福莲", "异常报告", "【任务超期】巡检人物超期确定", "1天");
    addMessage('m4', 2 , "../icon/atm.png", "刘甫庚", "待处理", "【上报事件】巡检事件待处理", "1天");

    addNotcie('n1', 1, "2018-5-29 11:28:40", "路线一", "[xxxx]相关巡检路线详细情况见...", "点1 -> 点2 -> 点3...");
    addNotcie('n2', 2, "2018-5-29 11:28:40", "警告通知", "漏检了巡检点");

    

    dynamicPage();
}

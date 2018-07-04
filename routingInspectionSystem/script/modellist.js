apiready = function(){
  var info = api.pageParam.info;
  var history = info.history ;
  info.history.page = "modellist";
  info.history.url = "../html/modellist.html";
  var refresh = {};

  var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
  $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

  var dynamicWeb = function(){

    $api.byId('events').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      var refreshPage = false;
      if(!refresh.events){
        refreshPage = true;
        refresh.events = true;
      }
      animationStart(function(){}, "eventlist", "../html/eventlist.html", info, refreshPage);
    });

    $api.byId('routing').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      var refreshPage = false;
      if(!refresh.routing){
        refreshPage = true;
        refresh.routing = true;
      }
      animationStart(function(){}, "noticelist", "../html/noticelist.html", info, refreshPage);
    });

    $api.byId('getgps').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      var refreshPage = false;
      if(!refresh.getgps){
        refreshPage = true;
        refresh.getgps = true;
      }
      animationStart(function(){}, "getgps", "../html/getgps.html", info, refreshPage);
    });

    $api.byId('fastReport').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      animationStart(function(){}, "reportEvent", "../html/reportEvent.html", info, true);
    });

    $api.byId('changeusers').addEventListener("click", function(e){
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
          api.sendEvent({
              name: 'onlineoff'
          });
        }
      );
    });

    api.addEventListener({
      name: 'keyback'
    }, function(ret, err) {
      api.toLauncher();
    });
  }

  dynamicWeb();
}

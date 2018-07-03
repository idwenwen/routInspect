apiready = function(){
  var info = api.pageParam.info;
  var history = info.history ;
  info.history.page = "modellist";
  info.history.url = "../html/modellist.html";

  var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
  $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

  var dynamicWeb = function(){

    $api.byId('events').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      animationStart(function(){}, "eventlist", "../html/eventlist.html", info, true);
    });

    $api.byId('routing').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      animationStart(function(){}, "noticelist", "../html/noticelist.html", info, true);
    });

    $api.byId('getgps').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      animationStart(function(){}, "getgps", "../html/getgps.html", info);
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

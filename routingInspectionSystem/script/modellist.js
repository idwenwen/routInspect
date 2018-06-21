apiready = function(){
  var info = api.pageParam.info;
  var history = info.history ;
  info.history.page = "modellist";
  info.history.url = "../html/modellist.html";

  var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
  $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

  var dynamicWeb = function(){
    $api.byId('routing').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPosition();
      animationStart(function(){}, "main", "../html/main.html", info, true);
    });

    $api.byId('getgps').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPosition();
      animationStart(function(){}, "getgps", "../html/getgps.html", info, true);
    });

    $api.byId('changeusers').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPosition();
      animationStart(function(){}, "login", "../html/login.html", info, true);
    });

    api.addEventListener({
      name: 'keyback'
    }, function(ret, err) {
      api.toLauncher();
    });
  }
}

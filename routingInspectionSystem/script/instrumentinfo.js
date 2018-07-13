apiready = function(){

  var info = api.pageParam.info;
  var history = info.history;
  var data = info.instrumentinfo;

  var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
  $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

  var setInformation = function(data){
    $api.byId('lastsignin').innerHTML = data.lastscantime ? data.lastscantime : "无";
    $api.byId('insname').innerHTML = data.name ? data.name : "无";
    $api.byId('insmodel').innerHTML = data.model ? data.model : "无";
    $api.byId('instype').innerHTML = data.bigcategory ? data.bigcategory : "无";
    $api.byId('instypesmall').innerHTML = data.subcategory ? data.subcategory : "无";
    $api.byId('insaddress').innerHTML = data.address ? data.address : "无";
    $api.byId('insstarttime').innerHTML = data.usedate ? data.usedate : "无";
    $api.byId('inscompany').innerHTML = data.company ? data.company : "无";
    $api.byId('exfactorydate').innerHTML = data.exfactorydate ? data.exfactorydate : "无";
    $api.byId('exfactoryno').innerHTML = data.exfactoryno ? data.exfactoryno : "无";
    $api.byId('remark').innerHTML = data.remark ? data.remark : "无";
  }

  var dynamicWeb = function(){
    $api.byId('returnBtn').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      animationStart(function(){}, "taskMap", "../html/taskMap.html", info, false);
    },false);

    api.addEventListener({
      name: 'keyback'
    }, function(ret, err) {
      animationStart(function(){}, "taskMap", "../html/taskMap.html", info, false);
    });
  }


  var initedPage = function(){
    data && setInformation(data);
    dynamicWeb();
  }

  initedPage();
}

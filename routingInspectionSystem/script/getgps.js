apiready = function(){
  var info = api.pageParam.info;
  var history = info.history ;
  var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
  $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

  var positioncache = [];

  var cacherequest = [];

  var addType = 2;

  var inited = false;
  var initMap = function(){
    var	layer =  new AMap.TileLayer({
        zooms:[3,19],    //可见级别
        visible:true,    //是否可见
        opacity:1,       //透明度
        zIndex:0         //叠加层级
    });
    map = new AMap.Map('mapContainer',{
        layers:[layer] //当只想显示标准图层时layers属性可缺省
    });
    map.on("complete", function(){
      api.addEventListener(
        {
          name: 'refreshmap'
        },
        function(ret, err){
          if( ret ){
            var pos = JSON.parse($api.getStorage('position'));
            pos = pos[0];
            if(!inited){
              usePos(pos[0], pos[1]);
              inited = true;
              positioncache = pos;
              api.sendEvent({
                  name: 'uploadgps'
              });
            }
            else {
              alert(pos);
              positioncache = pos;
              api.sendEvent({
                  name: 'uploadgps'
              });
            }
            $api.byId('blackmode').setAttribute("style", "display:none;");
            $api.byId('checkthisout').setAttribute("style", "display:none;");
          }else{

          }
        });
      }
    );
  }

  var userMark = null;
  var usePos = function(lat, lon){
    var param = {
      icon: '../icon/position-my.png',
      position:new AMap.LngLat(lat, lon),
      offset: new AMap.Pixel(-16, -30)
    }
    var markerup = new AMap.Marker(param);
    if(map){
      markerup.setMap(map);
      //定位当前的位置信息 //BUG:定位中心有问题
      setTimeout(function(){
        map.setZoomAndCenter(15, [lat, lon]);
      },500);
    }
    else{
      alert("map has not inited");
    }
    userMark = markerup;
  }

  var dynamicWeb = function(){
    $api.byId('upgps').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      $api.byId('blackMode').removeAttribute("style");
      $api.byId('gpsinfo').removeAttribute("style");
    });

    $api.byId('blackmode').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      $api.byId('blackmode').setAttribute("style", "display:none;");
      $api.byId('gpsinfo').setAttribute("style", "display:none;");
    });

    $api.byId("scannerOpen").addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      scannerOpen();
    });

    $api.byId("typegps").addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      $api.byId('typegps').setAttribute("class", "type1 colorchange");
      $api.byId('typeinstrument').setAttribute("class", "type2");
      addType = 2;
    })

    $api.byId("typeinstrument").addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      $api.byId('typeinstrument').setAttribute("class", "type2 colorchange");
      $api.byId('typegps').setAttribute("class", "type1");
      addType = 4;
    })

    $api.byId('checkinbutn').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      updateofgps();
    });

    $api.byId('returnBtn').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      animationStart(function(){}, "modellist", "../html/modellist.html", info);
    });

    $api.byId('blackMode').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      $api.byId("blackMode").setAttribute("style", "display:none;");
      $api.byId("gpsinfo").setAttribute("style", "display:none;");
    });

    api.addEventListener({
      name: 'keyback'
    }, function(ret, err) {
      animationStart(function(){}, "modellist", "../html/modellist.html", info);
    });
  }

  var FNScanner = api.require('FNScanner');
  var scannerOpen = function(){
    FNScanner.openView({
        autorotation: true
    }, function(ret, err) {
        if (ret) {
            if(ret.eventType == "success"){
              FNScanner.closeView();
              alert("success:" + ret.content);
            }
        } else {
            alert(JSON.stringify(err));
        }
    });
  }

  var requestInstrument = function(){

  }

  var updateofgps = function(){
    var name = $api.byId('forname').value;
    if(!name){
        alert("请为当前点取名");
        return false;
    }
    var val = {"type": addType, "name": name}
    if(positioncache.length == 0){
      cacherequest.push(val);
      api.addEventListener({
          name: 'uploadgps'
      }, function(ret, err){
          if(err){
            api.sendEvent({
                name: 'onlineoff'
            });
            return false;
          }
          cacherequest.forEach(function(item, index){
            var val = item;
            val.lon = positioncache[0];
            val.lat = positioncache[1];
            ask(val);
          });
          cacherequest = [];
          api.removeEventListener({
              name: 'uploadgps'
          })
      });
    }
    else{
      val.lon = positioncache[0];
      val.lat = positioncache[1];
      ask(val);
    }
    $api.byId('blackMode').setAttribute("style", "display:none;");
    $api.byId("gpsinfo").setAttribute("style", "display:none");
  }

  var ask = function(val, func){
    connectToService( commonURL + "?action=point",
      {
          values: val
      },
      function(ret){
        if(ret.result){
            func && func();
        }
        else {
          alert("请求数据出错，可能是网络不太好！");
        }
      },
      function(ret,err){
        api.sendEvent({
            name: 'onlineoff'
        });
      });
  }

  var initPage = function(){
    initMap();
    dynamicWeb();
  }

  initPage();
}

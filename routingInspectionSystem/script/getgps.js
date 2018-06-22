apiready = function(){
  var info = api.pageParam.info;
  var history = info.history ;
  var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
  $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

  var inited = false;
  var initMap = function(){
    var	layer =  new AMap.TileLayer({
        zooms:[3,16],    //可见级别
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
          name: 'postionChange'
        },
        function(ret, err){
          if( ret ){
            var pos = JSON.parse($api.getStorage('position'));
            pos = pos[0];
            if(inited){
              usePos(pos[0], pos[1]);
            }
            else {
              userMark.setPosition(new AMap.LngLat(pos[0], pos[1]));
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
      offset: new AMap.Pixel(-20, -30)
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

    $api.byId('blackMode').addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      $api.byId('blackMode').setAttribute("style", "display:none;");
      $api.byId('gpsinfo').setAttribute("style", "display:none;");
    });

  }

  var initPage = function(){
    initMap();
    dynamicWeb();
  }

  initPage();
}

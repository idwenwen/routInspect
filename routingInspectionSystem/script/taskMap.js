apiready = function(){
	
	var info = api.pageParam;
    var history = info.history;
    info.history = "main";

    //将当前的页面设置为占用手机就全屏内容。
    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");      
    
    var aMap = api.require('aMap');
	aMap.open({
	    rect: {
	        x: 0,
	        y: 0,
	        w: "auto",
	        h: "auto"
	    },
	    showUserLocation: true,
	    zoomLevel: 11,
	    center: {
	        lon: 116.4021310000,
	        lat: 39.9994480000
	    },
	    fixedOn: api.frameName,
	    fixed: true
	}, function(ret, err) {
	    if (ret.status) {
	        alert(JSON.stringify(ret));
	    } else {
	        alert(JSON.stringify(err));
	    }
	});

}
    
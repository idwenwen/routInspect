apiready = function(){

		var info = api.pageParam;
    var history = info.history;
    info.history = "reportEvent";

    //将当前的页面设置为占用手机就全屏内容。
    var mainH = api.winHeight - $api.offset($api.byId("header")).h - $api.offset($api.byId("footer")).h;
    $api.byId("main").setAttribute("style", "height:" + mainH + "px;");

		var dynamicWeb = function(){
				$api.byId("information").addEventListener("click", function(){
					$api.byId("blackMode").removeAttribute("style");
					$api.byId("checkTypeList").removeAttribute("style");
				})
				$api.byId("blackMode").addEventListener("click", function(){
					$api.byId("blackMode").setAttribute("style", "display:none;");
					$api.byId("checkTypeList").setAttribute("style", "display:none;");
				})
		}
		dynamicWeb();
}

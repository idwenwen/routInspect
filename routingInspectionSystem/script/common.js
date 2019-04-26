var commonURL = "https://dgj.itgwy.com.cn:7090/XiangAn/AppAPI.ashx";

// var commonURL = "http://csygj.liveej.com/AppAPI.ashx";

var transferToPage = function(pname, purl, info, reload){
	api.openWin({
		name: pname,
		url: purl,
		bounces: false,
		hScrollBarEnabled: false,
		scaleEnabled: false,
		animation: {
			type:"push",
			subType:"from_right",
			duration:500
		},
		/*rect:{
			x: 0,
			y: 0,
			w: "auto",
			h: "auto"
		},*/
		allowEdit: false,
		reload: reload || false,
		pageParam:{
			info: info
		}
	});
}

var connectToService = function(urls, data, success, fail, report){
	api.ajax({
			url: urls,
			method: 'post',
			data: data || "",
			timeout:3,
	}, function(ret, err) {
			if (ret) {
					success.call(null, ret, err);
			} else {
				fail.call(null, ret, err);
				if(!report){
					connectToService(urls, data, success, fail);
				}
				else {
					alert("当前网络环境不佳，反馈用时可能较长，请耐心等待");
				}
			}
	});
}

var animationStart = function(animations, name, url, info, reload){
	if(typeof(animations) != 'function'){
		console.log("参数不正确");
	}
	animations.call(this);
	transferToPage(name, url, info, reload);
}

var getPic = function(success, fail, targetWH){
	api.getPicture({
			sourceType: 'camera',
			encodingType: 'jpg',
			mediaValue: 'pic',
			destinationType: 'url',
			allowEdit: true,
			quality: 50,
			targetWidth: targetWH || 500,
			targetHeight: targetWH || 500,
			saveToPhotoAlbum: false
	}, function(ret, err) {
			if (ret) {
					// alert(JSON.stringify(ret));
					success.call(null, ret);
			} else {
					// alert(JSON.stringify(err));
					success.call(null, err);
			}
	});
}

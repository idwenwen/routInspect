	var commonURL = "https://dgj.itgwy.com.cn:7090/XiangAn/AppAPI.ashx";

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

	var connectToService = function(urls, data, success, fail){
		api.ajax({
		    url: urls,
		    method: 'post',
		    data: data || "",
				timeout:30,
		}, function(ret, err) {
		    if (ret) {
		        success.call(null, ret, err);
		    } else {
		    	connectToService(urls, data, success, fail);
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

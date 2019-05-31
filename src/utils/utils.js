import axios from 'axios'

// 判断对象的方法
export function isObject(val) {
    return val != null && typeof val === "object" && Array.isArray(val) === false;
}

// 获取url的值 传递过来的值
export function getQueryString(name) {
    return window.location.href.match(new RegExp("[?&]" + name + "=([^#?&]+)", "i")) ? decodeURIComponent(RegExp.$1) : "";
};

// 清理干净url值
export function clearPath(hospitalId,pId) {
  const url = window.location.href.split("?")[0];
  return `${url}?hospitalId=${getQueryString('hospitalId')}&pId=${getQueryString('pId')}`;
};

// 格式化电话号码
export function formatPhone(phone) {
  return (''+phone).substr(0, 3) + "****" + (''+phone).substr(7);
}


// 获取地理位置进行本地化显示
export function showPosition(success,fail) {
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function (position) {
      const latlon = position.coords.latitude+','+position.coords.longitude;
      success&&success(latlon)
    },function (positionError) {
      fail&&fail('无法获取经纬度')
    })
  }else {
    fail&&fail('该手机不支持定位，请打开GPS');
  }
}





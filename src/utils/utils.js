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

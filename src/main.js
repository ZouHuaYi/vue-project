import Vue from "vue";
import App from "./App.vue";
import layer from "@/plugin/layer"
import loading from "@/plugin/loading"
import store from './store'

Vue.config.productionTip = false;
import "lib-flexible";

import 'babel-polyfill'
import Es6Promise from 'es6-promise'
Es6Promise.polyfill()

if (window.location.href.indexOf('m3m.fengwoo.cn') > -1) {
    let url = window.location.href.replace('m3m.fengwoo.cn', 'admin.topmei3mei.com');
    window.location.href = url;
}

Vue.use(loading);
Vue.use(layer);

// 提示框文字居中的样式封装
Vue.prototype.$layerCenterMsg = function (content, time = 2) {
    Vue.layer.open({
        content: content,
        className: "layer-msg-center",
        skin: "msg",
        time: time
    });
};

Vue.layer.msg = function (content, time = 2) {
    Vue.layer.open({
        content: content,
        skin: "msg",
        time: time
    });
};

store.commit('getBrower');
store.dispatch('getShareUserData');

new Vue({
    store,
    render: h => h(App)
}).$mount("#app")
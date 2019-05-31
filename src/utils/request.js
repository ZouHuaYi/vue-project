import axios from 'axios'
import Vue from 'vue';
import { isObject } from './utils'

// const root = "http://admin.topmei3mei.com"http://test.topmei3mei.com; 192.168.2.236:8080/msm
const root = process.env.NODE_ENV == 'production' ? "" : "http://admin.topmei3mei.com";


let instance = axios.create({
    baseURL: root,
    timeout: 30000,
    transformRequest: [
        function transformRequest(data, headers) {
            if (isObject(data)) {
                headers["Content-Type"] = "application/json;charset=utf-8";
                return data;
            } else {
                let formData = JSON.parse(data);
                let keys2 = Object.keys(formData);
                headers["Content-Type"] = "application/x-www-form-urlencoded";
                return encodeURI(
                    keys2.map(name => `${name}=${formData[name]}`).join("&")
                );
            }
        }
    ]
});

function request(url, data, dataType = "form", type = "post") {
    return new Promise((resolve, reject) => {
        if (dataType == "form") {
            data = JSON.stringify(data);
        }
        instance[type](url, data)
            .then(data => {
                resolve(data.data);
            })
            .catch((err) => {
                Vue.loading.hide();
                Vue.prototype.$layerCenterMsg("网络开小差啦,请重试！");
                reject(err);
            });
    });
};

export default request;


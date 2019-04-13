import Vue from 'vue'
import Vuex from 'vuex';
import moduleJoin from './join';
import moduleQcode from './qcode';
import request from '@/utils/request';
import { getQueryString,clearPath } from '@/utils/utils';
import wx from "weixin-js-sdk";


Vue.use(Vuex);
const store = new Vuex.Store({
    modules: {
        join: moduleJoin,
        qcode: moduleQcode,
    },
    getters: {

    },
    state: {
        browerStatus: null,
        shareUserData: {},
        joinUserData:{},
        routeStatus: -1,    // 0：代表用户有推广二维码权限  1：用户没有登录没有注册 2：用户没有未购买套餐的时候 3：第一次注册的用户
        test: false,
        token:getQueryString('token')?getQueryString('token'):'',
        scan: getQueryString('scan') ? true : false,
        pPhone: getQueryString('pPhone') ? getQueryString('pPhone') : '',
        pId: getQueryString('pId') ? parseInt(getQueryString('pId')) : '',
        hospitalId: getQueryString('hospitalId') ? parseInt(getQueryString('hospitalId')) : "",
        unionId:null,
    },
    mutations: {
        getBrower(state) {
            let ua = navigator.userAgent.toLowerCase();
            console.log(ua);
            let app = /meishangmei/i;
            let wx = /MicroMessenger/i;
            state.browerStatus = app.test(ua) ? 'isApp' : (wx.test(ua) ? 'isWechat' : 'isWeb');

        },
        saveShareUserData(state, payload) {
            state.shareUserData = payload
        },
        changeRouteState(state, value) {
            state.routeStatus = value;
        },
        saveToken(state,token){
            state.token = token;
        },
        saveJoinUserData(state,data){
          state.joinUserData = data;
        },
        saveUnionId(state,data){
          state.unionId = data;
        },
    },
    actions: {
        // 获取父级的数据
        getShareUserData({ commit, state }, data) {
            Vue.layer.closeAll();
            let formData;
            if (data) {
                formData = {
                    pPhone: '',
                    pId: data.pId,
                    hospitalId: state.hospitalId,
                }
            } else {
                formData = {
                    pPhone: state.pPhone,
                    pId: state.pId,
                    hospitalId: state.hospitalId,
                }
            }
            request("/rest/team/getpUserAndHospital", formData).then(res => {
                if (res.messageCode == 900) {
                    commit('saveShareUserData', res.data)
                } else {
                    const msg = result.message ? res.message : "网络开小差啦！！！";
                    Vue.layer.msg(msg);
                }
            })
        },
        // 提前预判团队的时候
        prejudgeInTeam({ commit, state, dispatch }, payload) {           //token: this.token, hospitalId: hospitalId
          Vue.layer.closeAll();
            request('/rest/user/getUser', { ...payload }).then(res => {
                if (res.messageCode == 900 || res.messageCode == 1402) {
                    // 判断是否在团队中
                    if (res.data.isAllow == 1) {
                        // 判断是否购买该套餐
                        if (res.data.packageType != 0) {
                            // 用户有推广二维码权限
                            if (state.browerStatus === 'isApp' && state.scan) {
                                // 在app中打开的时候 直接显示二维码
                                dispatch('getShareUserData', { pId: res.data.userId, });
                                commit('changeRouteState', 0);
                            } else {
                                // 非app打开的时候
                                Vue.layer.open({
                                    btn: ["确认", "取消"],
                                    content: "您已在该团队中，点确定转跳到您的推广页",
                                    className: "layer-class-alert",
                                    shade: true,
                                    success: () => {},
                                    yes: () => {
                                        dispatch('getShareUserData', { pId: res.data.userId, });
                                        commit('changeRouteState', 0);
                                    }
                                });
                            }
                          let url = window.location.href.split("?")[0];
                          url = `${url}?hospitalId=${state.hospitalId}&pId=${res.data.userId}`;
                          history.pushState(null, "", url);
                          dispatch('getwxchatSignal');
                        } else {
                            //  用户没有推广二维码权限，需要购买套餐
                            Vue.layer.open({
                                btn: ["确认", "取消"],
                                content: "您已在该团队中,点确认将跳转到套餐购买页",
                                className: "layer-class-alert",
                                shade: true,
                                yes: (index, $layer) => {
                                    window.location.href = `https://axz20z.mlinks.cc/ABcN?type=8&id=''&name=${this.company}`;
                                }
                            });
                        }

                    } else {
                        // 用户不在该团队中的时候，点击按钮绑定该用户
                        // app 扫码进入
                        if (state.browerStatus === 'isApp' && state.scan==='scan') {
                            dispatch('getShareUserData', { pId: res.data.userId, });
                            commit('changeRouteState', 2);
                            return;
                        }
                        // 如果是自己打开的时候；
                        if (state.pId == res.data.userId) {
                            dispatch('getShareUserData', { pId: res.data.userId, });
                            commit('changeRouteState', 0);
                            return;
                        }
                        // 没有购买套餐的时候
                        dispatch('toTokenGetData',state.token);
                        commit('changeRouteState', 2)
                    }
                } else {
                    const msg = res.message ? res.message : "找不到该用户";
                    Vue.layer.msg(msg);
                }
            })
        },
        // 获取unionId
        getUnionId({commit,state,dispatch},code){
            dispatch('getwxchatSignal');
            request('/rest/user/getUnionId',{code:code}).then(res=>{
              if(res.messageCode==900 || res.messageCode==132){
                if(res.data.isLogined==1){
                  // 用户绑定微信
                  const token = res.data.token
                  dispatch('prejudgeInTeam',{token:token,hospitalId:state.hospitalId});
                  commit('saveToken',token);
                  dispatch('toTokenGetData',token);
                  commit('join/saveNowUser',res.data.user);
                }else{
                  // 用户未绑定的时候需要登录
                  commit('saveUnionId',res.data.unionid);
                  commit('changeRouteState',1);
                }
              } else {
                commit('changeRouteState',1);
              }
            })
        },
        // 通过微信获取数据用户
        toTokenGetData({commit},token){
          request('rest/user/token',{token:token}).then(res=>{
            if(res.messageCode==900){
              commit('saveJoinUserData',res.data);
              commit('join/saveNowUser',res.data);
            }else {
              const msg = res.message ? res.message : "该用户不存在";
              Vue.layer.msg(msg);
            }
          })
        },
        // 分享签名
        getwxchatSignal({dispatch}){
            request("/rest/user/getSign",{
              url:encodeURIComponent(window.location.href.split("#")[0])
            }).then(res=>{
              if(res.messageCode==900){
                dispatch('shareWxchat',res.data);
              }else {
                const msg = res.message ? res.message : "微信签名失败";
                Vue.layer.msg(msg);
              }
            })
        },
        // 分享设置
        shareWxchat({commit,state},data){
              const {appId,timestamp,nonceStr,signature} = data;
              wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: appId, // 必填，公众号的唯一标识
                timestamp: timestamp, // 必填，生成签名的时间戳
                nonceStr: nonceStr, // 必填，生成签名的随机串
                signature: signature, // 必填，签名，见附录1
                jsApiList: [
                  "onMenuShareTimeline",
                  "onMenuShareAppMessage",
                  "onMenuShareQQ"
                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
              });
              wx.ready(() => {
                const imgurl = window.location.protocol +"//" +document.domain +"/static/img/logo.png";
                const title = state.shareUserData.p_name + "向你推荐" + state.shareUserData.hospital_name;
                const desc = "美上美你美丽的财富，你身边美丽管家.";
              wx.onMenuShareTimeline({
                title: title, // 分享标题
                desc: desc, // 分享描述
                link: clearPath(), // 分享链接
                imgUrl: imgurl, // 分享图标
                success: function() {
                  // 用户确认分享后执行的回调函数
                },
                cancel: function() {
                  // 用户取消分享后执行的回调函数
                }
              });
              wx.onMenuShareAppMessage({
                title: title, // 分享标题
                desc: desc, // 分享描述
                link: clearPath(), // 分享链接
                imgUrl: imgurl, // 分享图标
                type: "", // 分享类型,music、video或link，不填默认为link
                dataUrl: "", // 如果type是music或video，则要提供数据链接，默认为空
                success: function(res) {
                  // 用户确认分享后执行的回调函数
                  console.log(res);
                },
                cancel: function() {
                  // 用户取消分享后执行的回调函数
                }
              });
              wx.onMenuShareQQ({
                title: title, // 分享标题
                desc: desc, // 分享描述
                link: clearPath(), // 分享链接
                imgUrl: imgurl, // 分享图标
                success: function() {
                  // 用户确认分享后执行的回调函数
                },
                cancel: function() {
                  // 用户取消分享后执行的回调函数
                }
              });
            });
        }
    }
})

export default store;

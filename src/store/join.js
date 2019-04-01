
import Vue from 'vue';
import request from '@/utils/request';
import {formatPhone} from '@/utils/utils';

const moduleJoin = {
    namespaced: true,
    state: {
        nowUser: {},
        showLayer:false,
        alertText:'3秒后前往购买页',
    },
    getters:{
      newPhone(state){
        return formatPhone(state.nowUser.phone);
      }
    },
    mutations: {
        saveNowUser(state, data) {
            state.nowUser = data;
        },
        changeLayerPassword(state,value){
            state.showLayer = value;
        },
        changeAlertText(state,value){
            state.alertText = value;
        },
    },
    actions: {
        // 提交验证码 登录
        postLoginRegister({ commit, dispatch, rootState }, payload) { // phone: phone,code: vcode
            request('/rest/user/login_by_code', { ...payload }).then(res => {
                Vue.loading.hide();
                if (res.messageCode == 129) {
                    // 第一次注册的时候 需要设置密码
                    commit('changeLayerPassword',true);
                    commit('saveToken',res.data.token,{root:true});
                    dispatch('bindUnicodeFun',{id:res.data.id});
                } else if (res.messageCode == 900) {
                    // 绑定上一级操作
                    dispatch('prejudgeInTeam', { token: res.data.token, hospitalId: rootState.hospitalId }, { root: true });
                    commit('saveNowUser', res.data);
                    commit('saveToken',res.data.token,{root:true});
                    dispatch('bindUnicodeFun',{id:res.data.id});
                } else {
                    let msg = result.message ? result.message : "验证码错误";
                    Vue.layer.msg(msg);
                }
            })
        },
        // 微信绑定
        bindUnicodeFun({rootState}, data) { // wechat:code,unionId:code,id,action:0
            if(rootState.unionId===null) return;
              request('/rest/user/open_bind_unbundled', {
                wechat:rootState.unionId,
                unionId:rootState.unionId,
                id:data.id,
                action:0,
              }).then(res => {});
        },
        // 设置密码
        improvePassword({ commit, dispatch }, payload) { //token: this.token,password: password
            Vue.layer.closeAll();
            commit('changeLayerPassword',false);
            request('/rest/user/improve_password', { ...payload }).then(res => {
              if(res.messageCode==900){
                // commit('changeRouteState',3,{root:true});
                dispatch('bindParent');
              }else {
                const msg = passw.message ? passw.message : "密码设置失败！";
                Vue.layer.msg(msg);
              }
            })
        },
        // 绑定上父级
        bindParent({ commit, dispatch ,rootState}) { //pPhone: this.pPhone,pId: this.pId ? parseInt(this.pId) : "",token: this.token,hospitalId: this.hospitalId
          Vue.layer.closeAll();
            request('/rest/team/bind/token', {
              pPhone:rootState.pPhone,
              pId:rootState.pId,
              token:rootState.token,
              hospitalId:rootState.hospitalId,
            }).then(res => {
                if (res.messageCode == 900) {
                    // 第一次绑定 肯定没有购买套餐 跳转购买
                  commit('changeRouteState',3,{root:true});
                  dispatch('hrefToApp');
                } else if (res.messageCode == 1409) {
                    // 曾经绑定过 判断是否有分享二维码的权限
                    dispatch('prejudgeInTeam', {}, { root: true });
                } else if (res.messageCode == 1402) {
                    // 该分享者没有权利发展下级
                    Vue.layer.msg(`没有权限发展下级，绑定失败。`);
                } else {
                    // 绑定失败
                    const msg = res.message ? res.message : "绑定上一级失败，请重试！";
                    Vue.layer.msg(msg);
                }
            })
        },
        // 跳转qpp
        hrefToApp({commit,rootState}){
          let timp = null;
          let numtime = 3;
          clearInterval(timp);
          timp = setInterval(() => {
              numtime -= 1;
              commit('changeAlertText',`${numtime}秒后前往购买页`);
              if (numtime <= 0) {
                clearInterval(timp);
                const hospitalId = rootState.hospitalId ? rootState.hospitalId : 0;
                window.location.href = `https://axz20z.mlinks.cc/ABcN?type=8&id=${hospitalId}`;
              }
            }, 1000);
        },
    }
}

export default moduleJoin;

import Vue from 'vue';
import request from '@/utils/request';


const moduleQcode = {
    namespaced: true,
    state: {
      Userpackage:{},
      hospitalList:[],
      showHospitalList:[],
      packageMapList:[],
    },
    mutations: {
      savePackageType(state,data){
        state.Userpackage = data
      },
      saveHospitalList(state,data){
        state.hospitalList = data;
      },
      saveShowHospitalList(state,data){
        state.showHospitalList = data;
      },
      savePackageMapList(state,data){
        state.packageMapList = data;
      }
    },
    actions: {
      getPackageTypeData({commit,rootState}){
        request('/rest/distribution/main/push/package',{token:rootState.token}).then( res => {
          if(res.messageCode==900){
            commit('savePackageType',{
              locking: res.data.locking,
              relateAccount: res.data.relateAccount,
              serviceImgUrl:res.data.serviceImgUrl
            });
            commit('saveHospitalList',res.data.hospitalList);
            commit('saveShowHospitalList',res.data.showHospitalList);
            commit('savePackageMapList',res.data.packageMapList);
          }else {
            const msg = result.message ? result.message : "无法获取套餐信息";
            Vue.layer.msg(msg);
          }
        })
      },
      addPackageList({commit},payload){ // token,id,hosiptal,title,price
        request('/rest/business/relateuser/service/product/addOrUpdate',{...payload}).then(res=>{
          console.log(res)
        })
      }
    }
}

export default moduleQcode;

import Vue from 'vue';
import request from '@/utils/request';


const moduleQcode = {
    namespaced: true,
    state: {
      Userpackage:{},
      hospitalList:[],
      showHospitalList:[],
      packageMapList:[],
      newDefaultIndex:0,
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
      },
      saveDefaultIndex(state,data){
        state.newDefaultIndex = data==-1?0:data;
      },
    },
    actions: {
      getPackageTypeData({commit,rootState}){
        request('/rest/distribution/main/push/package',{token:rootState.token}).then( res => {
          Vue.layer.closeAll();
          if(res.messageCode==900){
            commit('savePackageType',{
              locking: res.data.locking,
              relateAccount: res.data.relateAccount,
              serviceImgUrl:res.data.serviceImgUrl
            });
            commit('savePackageMapList',res.data.packageMapList);
            if(rootState.areaJion.city){
              let defindex = -1;
              (res.data.packageMapList).forEach((item,index)=>{
                if(item.area.indexOf(rootState.areaJion.province+rootState.areaJion.city)>-1){
                defindex = index;
                return;
              }
            })
              if(defindex==-1){
                (res.data.packageMapList).forEach((item,index)=>{
                  if(item.area.indexOf(rootState.areaJion.province)>-1){
                  defindex = index;
                  return;
                }
              })
              }
              commit('saveDefaultIndex',defindex);
            }else {
              commit('saveDefaultIndex',0);
            }

          }else {
            const msg = res.message ? res.message : "无法获取套餐信息";
            Vue.layer.msg(msg);
          }
        })
      },
      // 获取已经选择的项目
      selectServerData({commit,rootState}){
        request('/rest/distribution/user_configure_product_list',{token:rootState.token}).then(res=>{
          if(res.messageCode==900){
            commit('saveShowHospitalList',res.data);
          }else{
            const msg = res.message ? res.message : "无法获取套餐信息";
            Vue.layer.msg(msg);
          }
        });
      },
      // 获取医院数据
      getHospitalData({commit,rootState}){
        request('/rest/distribution/user_product_list',{token:rootState.token}).then(res=>{
          if(res.messageCode==900){
            commit('saveHospitalList',res.data);
          }else{
            const msg = res.message ? res.message : "无法获取套餐信息";
            Vue.layer.msg(msg);
          }
        })
      },
      // 保存添加列表
      addPackageList({commit},payload){ // token,id,hosiptal,title,price
        request('/rest/business/relateuser/service/product/addOrUpdate',{...payload}).then(res=>{
          console.log(res)
        })
      }
    }
}

export default moduleQcode;

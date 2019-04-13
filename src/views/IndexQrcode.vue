<template>
    <div class="container">
        <div class="qrcode-header">
            <div class="header-box">
                <div class="header-name">
                    <div class="atver">
                        <img :src="user.p_avatar" alt=""/>
                    </div>
                    <div class="title">
                        <span>推广人</span>
                        <span>{{user.p_name}}</span>
                    </div>
                </div>
                <div class="qrcode-img">
                    <div class="qrcode">
                        <vue-qr
                            class="ecode"
                            :text="url"
                            :margin="0"
                            :size="800"
                            :logoSrc="logoSrc"
                            :logoScale="0.2"
                        ></vue-qr>
                    </div>
                </div>
                <div class="package" @click="selectPackageShow">
                      <span>{{packageMapList[newShowPackageTypeIndex]?packageMapList[newShowPackageTypeIndex].title:''}}</span>
                      <img src="../assets/down.png" alt="">
                </div>
            </div>
        </div>
        <div class="package-box" v-if="packageMapList.length>0">
          <div>
            <img class="package-img" :src="packageMapList[newShowPackageTypeIndex]?packageMapList[newShowPackageTypeIndex].description[0]:defaultBgkImg" alt=""></div>
            <div class="package-four">
                <div class="four-box">
                    <img class="f-img" :src="Userpackage.serviceImgUrl" alt=""/>
                    <div class="f-box">
                      <div class="pack" v-for="item in showHospitalList">
                          <div class="p-tit">{{item.name}}</div>
                          <div class="address" v-if="item.phone">
                            <a :href="'tel:'+item.phone"><img src="../assets/phone_1.png" alt=""/> {{item.phone}}</a>
                          </div>
                          <div class="address" v-if="item.address">
                            <a><img src="../assets/addree.png" alt=""/> {{item.address}}</a>
                          </div>
                          <div class="pack-list">
                              <div class="pack-item" v-for="it in item.productMapList">
                                 <div class="pack-left">
                                      {{it.title}}
                                 </div>
                                  <div class="pack-right">
                                      &yen; <span class="yen">{{it.price}}</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <a class="add-package-btn" @click="projectManagement" href="javascript:;">项目管理</a>
                  </div>
                </div>
            </div>
        </div>
        <div class="footer">
            <img src="../assets/foor.png" alt="">
        </div>
        <div v-if="makShow" class="footer-mak">
            <div class="hidden-mak" @click="selectPackageHidden"></div>
            <transition name="footer-fade">
                <div class="hidden-alter" v-if="alterShow">
                    <div class="alter-tit">精选套餐 <img class="alter-down" src="../assets/down.png" alt=""></div>
                    <div class="alter-list">
                        <div @click="selectPackageType(key)" class="alter-item" :class="{'active':newShowPackageTypeIndex===key}" v-for="(item,key) in packageMapList">
                            {{item.title?item.title:''}}
                            <img v-if="newShowPackageTypeIndex===key" src="../assets/select.png" alt="" />
                        </div>
                    </div>
                </div>
            </transition>
            <div class="edit-alter" v-if="editeShow">
                <div class="edit-center">
                  <div class="edit-project">
                    <div class="edit-list-all" v-for="(item,key) in hospitalList">
                        <div class="edit-title">
                          <span>{{item.name}}</span>
                          <a class="add-adit" href="javascript:;" @click="addNewProject(item.id,key)">新建项目 +</a>
                        </div>
                        <div class="edit-cover">
                          <div class="edit-list">
                            <div class="edit-item" :class="{'active':projectSelectId.indexOf(it.id)>-1}" v-for="it in item.productMapList" @click="selectProjectHandle(item.id,it.id)">
                              <div class="e-left">
                                {{it.title}}
                              </div>
                              <div class="e-right">
                                &yen; <span>{{it.price}}</span>
                              </div>
                              <!--<a class="btn-delete"  @click="deleteProject(it.id)" href="javascript:;">x</a>-->
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="finish-footer">
                      <a class="edit-finsh" @click="comfigProject" href="javascript:;">完成</a>
                    </div>
                </div>

            </div>
            <div class="input-alter" v-if="inuptShow">
              <div class="input-title">新建项目</div>
              <div class="input-center">
                <div class="inp-grow">
                  <input type="text" v-model.trim="projectTitle" placeholder="请输入医美项目" />
                </div>
                <div class="inp-grow">
                  <input type="number" v-model.trim="projectPrice" placeholder="请输入项目价格" />
                </div>
                <div class="btn-grow">
                  <a class="off" href="javascript:;" @click="cancelClik">取消</a>
                  <a class="ok" href="javascript:;" @click="postNewProject">确认</a>
                </div>
              </div>
            </div>
        </div>
    </div>
</template>
<script>
    import VueQr from "vue-qr";
    import logo from "../assets/ic_logo.png";
    import {mapState,mapActions} from "vuex";
    import {getQueryString,clearPath} from '@/utils/utils';
    import defaultBgkImg from '../assets/pag.png';
    import request from '@/utils/request';


    export default{
        components: {
            VueQr
        },
        computed:{
          ...mapState({
              user: state=>state.shareUserData,
              Userpackage: state=>state.qcode.Userpackage,
              hospitalList: state=>state.qcode.hospitalList,
              showHospitalList: state=>state.qcode.showHospitalList,
              packageMapList: state=>state.qcode.packageMapList,
              token: state=>state.token,
          })
        },
        data(){
            return{
                makShow:false,
                alterShow:false,
                editeShow:false,
                inuptShow:false,
                url: '',
                logoSrc:logo,
                newShowPackageTypeIndex:0,
                defaultBgkImg:defaultBgkImg,
                projectTitle:'',
                projectPrice:'',
                projectSelectArr:{},
                projectSelectId:[],
            }
        },
        methods:{
            ...mapActions([
                'qcode/getPackageTypeData',
                'qcode/addPackageList',
            ]),
            selectPackageShow(){
                this.makShow = true;
                setTimeout(()=>{
                    this.alterShow = true;
                },100);
            },
            selectPackageHidden(){
                this.alterShow = false;
                this.makShow = false;
                this.editeShow = false;
                this.inuptShow = false;
            },
            selectPackageType(val){
              this.newShowPackageTypeIndex = val;
              this.selectPackageHidden();
            },
            projectManagement(){
              this.$layer.closeAll();
              if(this.Userpackage.locking===false&&this.Userpackage.relateAccount===true){
                this.makShow = true;
                this.editeShow = true;
              }else if(this.Userpackage.locking===true&&this.Userpackage.relateAccount===true){
                this.$layer.msg('亲！项目选定后30天后才允许再次修改。')
              }else{
                this.$layer.msg('亲！你没有权限对美容项目进行管理')
              }
            },
            addNewProject(pId,key){
              this.editeShow = false;
              this.inuptShow = true;
              this.hosiptalId = pId;
            },
            postNewProject(){
                // token,id,hosiptal,title,price
                const {projectTitle,projectPrice,hosiptalId,token} = this;
                if(!projectTitle){
                  this.$layer.msg('商品名称不能为空');
                  return;
                }
                if(!projectPrice){
                  this.$layer.msg('商品价格不能为空');
                  return;
                }

                request('/rest/business/relateuser/service/product/addOrUpdate',{
                  token:token,
                  id:'',
                  hospitalId:hosiptalId,
                  title:projectTitle,
                  price:projectPrice,
                }).then(res=>{
                    if(res.messageCode!==900){
                      this.$layer.msg(res.message?res.message:'添加项目失败');
                    }
                    this.editeShow = true;
                    this.inuptShow = false;
                    this.projectTitle = '';
                    this.projectPrice = '';
                    this['qcode/getPackageTypeData'](getQueryString('pId'));
                })
            },
            selectProjectHandle(pId,id){
              if(this.projectSelectArr[pId]){
                const index = this.projectSelectArr[pId].indexOf(id);
                if(index>-1){
                  this.projectSelectArr[pId].splice(index,1);
                }else {
                  if(this.projectSelectArr[pId].length>=2){
                    this.projectSelectArr[pId].shift();
                    this.projectSelectArr[pId].push(id);
                  }else {
                    this.projectSelectArr[pId].push(id);
                  }
                }
              }else {
                this.projectSelectArr[pId] = [];
                this.projectSelectArr[pId].push(id);
              }
              this.projectSelectId = [];
              for(let i in this.projectSelectArr){
                if(this.projectSelectArr[i].length>0){
                  this.projectSelectId = this.projectSelectId.concat(this.projectSelectArr[i])
                }
              }
            },
            comfigProject(){
              if(this.projectSelectId!=0){
                request('/rest/distribution/save/user_product',{
                  productIds:JSON.stringify(this.projectSelectId),
                  limitDays:'',
                  token:this.token,
                }).then(res=>{
                  if(res.messageCode==900){
                    this['qcode/getPackageTypeData'](getQueryString('pId'));
                  }else {
                    this.$layer.msg(res.message?res.message:'项目管理失败');
                  }
                })
              }
              this.selectPackageHidden();
            },
            deleteProject(id){
              request('/rest/business/product/update_status',{
                id:id,
                status:status,
              }).then(res=>{
                if(res.messageCode==900){
                  this['qcode/getPackageTypeData'](getQueryString('pId'));
                  this.projectSelectArr={};
                  this.projectSelectId=[];
                }else {
                  this.$layer.msg(res.message?res.message:'删除失败');
                }
              })
            },
            cancelClik(){
                this.editeShow = true;
                this.inuptShow = false;
             },
        },
        created(){
            this['qcode/getPackageTypeData']();
            document.getElementsByTagName("title")[0].innerHTML = "推广二维码";
            this.url = clearPath();
        },
    }
</script>
<style lang="less">
    .qrcode-img{
        width: 100%;
        .qrcode{
            width: 280px;
            margin: 0 auto;
            box-sizing:border-box;
                .ecode {
                    width: 100%;
                    padding: 0;
                    background: #ffffff;
                    border: 10px solid #ffffff;
                    img{
                        display: block;
                        width: 100%;
                    }
                }
            }
        }
</style>
<style lang="less" scoped>
    .footer-fade-enter,.footer-fade-leave-to{
        transform: translateY(100%);
    }
    .footer-fade-enter-active{
        transition: all 0.3s ease;
    }
    .footer-mak{
        width: 100%;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 10000;
        .hidden-mak{
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            position: absolute;
            top:0;
            left: 0;
        }
        .hidden-alter{
            position: absolute;
            width: 100%;
            height: 70%;
            bottom: 0;
            background: #ffffff;
            .alter-tit{
                width: 100%;
                text-align: center;
                padding: 10px 30px;
                box-sizing: border-box;
                font-size: 28px;
                font-weight:600;
                .alter-down{
                    width: 24px;
                    transform: rotate(180deg);
                }
            }
            .alter-list{
                width: 100%;
                padding: 30px 40px;
                box-sizing: border-box;
                font-size: 30px;
                .alter-item{
                    font-size: 30px;
                    height: 32px;
                    line-height: 32px;
                    padding-bottom: 16px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #cccccc;
                    position: relative;
                    color:#999999;
                    img{
                        position: absolute;
                        width: 30px;
                        height: 30px;
                        right: 0;
                        top: 2px;
                    }
                    &.active{
                        color: #15cebc;
                     }
                }
            }
        }
        .input-alter{
            position: absolute;
            width: 86%;
            background: #ffffff;
            top:50%;
            left: 50%;
            transform: translate(-50%,-50%);
            box-sizing: border-box;
            .input-center{
              width: 100%;
              box-sizing: border-box;
              padding: 0 35px;
            }
            .input-title{
              width: 100%;
              height: 85px;
              line-height: 85px;
              background: #fafafa;
              text-align: center;
              font-size: 30px;
              color: #666666;
            }
            .inp-grow{
              width: 100%;
              margin-top:40px;
              input{
                display: block;
                width: 100%;
                height: 76px;
                line-height: 76px;
                background: #ececee;
                border: none;
                outline: none;
                box-sizing: border-box;
                padding: 0 20px;
              }
            }
        }
        .btn-grow{
          width: 100%;
          display: flex;
          justify-content: space-between;
          padding:40px 0;
          a{
            display: block;
            width: 200px;
            height: 72px;
            text-align: center;
            line-height: 72px;
            border-radius: 10px;
            font-size: 30px;
            &.off{
              border: 1px solid #c6c6c6;
             }
            &.ok{
              background: #14cebc;
              color: #ffffff;
             }
          }
        }

        .edit-alter{
            position: absolute;
            width: 86%;
            height: 70%;
            background: #ffffff;
            top:50%;
            left: 50%;
            transform: translate(-50%,-50%);
            border-radius: 30px;
            padding: 60px 40px 30px;
            box-sizing: border-box;
            .edit-project{
              flex: 1;
              width: 100%;
              height: 100%;
              overflow-y: auto;
            }
            .edit-center{
              display: flex;
              width: 100%;
              height: 100%;
              flex-direction: column;
              align-content: space-between;
            }
            .edit-list-all{
              padding-bottom: 40px;
            }
            .edit-cover{
              flex: 1;
              width: 100%;
              overflow-y: auto;
            }
            .edit-title{
                width:100%;
                height: 36px;
                line-height:36px;
                padding-bottom: 40px;
                span{
                    font-size: 32px;
                }
                .add-adit{
                    float: right;
                    font-size: 24px;
                    color: #f62856;
                }
            }
            .finish-footer{
                width: 100%;
                padding: 40px 0 30px;
            }
            .edit-finsh{
                display: block;
                margin: 0 auto;
                width: 450px;
                height: 80px;
                line-height: 80px;
                text-align: center;
                background: #00ceba;
                color: #ffffff;
                border-radius: 20px;
            }
            .edit-list{
                .edit-item:nth-child(1){
                    border-top: 1px solid #cccccc;
                }
                .edit-item{
                    padding: 20px 0;
                    border-bottom: 1px solid #cccccc;
                    position: relative;
                    &.active{
                        background: rgba(160,247,224,0.2);
                     }
                     .btn-delete{
                       position: absolute;
                       top: 0;
                       right: 0;
                       width: 30px;
                       height: 30px;
                       background: rgba(0,0,0,0.3);
                       border-radius: 50%;
                       color: #ffffff;
                       font-size: 20px;
                       text-align: center;
                       line-height: 25px;
                     }
                    .e-left{
                        width: 70%;
                        box-sizing: border-box;
                        padding: 0 10px;
                        font-size: 24px;
                        color: #333;
                    }
                    .e-right{
                        position: absolute;
                        right: 35px;
                        top: 16px;
                        color: #666666;
                        span{
                            color: #15cebc;
                            font-size: 30px;
                        }
                    }
                }
            }
        }
    }
    .container{
        width:100%;
        min-height: 100vh;
        background-color: #14cebc;
        padding-top: 60px;
    }
    .address{
      width:100%;
      padding: 5px 0;
      color: #666666;
      font-size: 26px;
      img{
        width: 24px;
        height:24px;
      }
    }
    .qrcode-header{
        position: relative;
        width: 86%;
        height: 620px;
        background: #92e8df;
        border-radius: 30px 30px;
        margin: 0 auto;
        .header-box{
            width: 100%;
            height: 600px;
            background: #ffffff;
            border-radius: 30px 30px;
        }
        .header-name{
            width: 100%;
            box-sizing: border-box;
            padding: 50px 50px 40px;
            display: flex;
            .atver{
                margin-right:20px;
                img{
                    display: block;
                    width: 106px;
                    height: 106px;
                    border-radius: 50%;
                }
            }
            .title{
                span{
                    display: block;
                    &:nth-of-type(1){
                        font-size: 24px;
                        color: #666666;
                        line-height: 30px;
                        padding: 14px 0 12px;
                     }
                    &:nth-of-type(2){
                        font-size: 30px;
                        line-height: 32px;
                        font-weight: 700;
                     }
                }
            }
        }
    }
    .package{
        position: absolute;
        width: 100%;
        left: 0;
        z-index: 1000;
        bottom: 60px;
        text-align: center;
        padding:0 30px;
        box-sizing:border-box;
        color:#625e5e;
        span{
            display: inline-block;
            font-size: 30px;
            max-width: 80%;
            overflow: hidden;
            white-space: nowrap;
            vertical-align: middle;
        }
        img{
            width: 30px;
            margin-left: 8px;
            vertical-align: middle;
        }
    }
    .package-box{
        position: relative;
        width: 100%;
        margin-top:-200px;
        .package-img{
            display: block;
            width: 100%;
        }
        .package-four{
            width: 100%;
            background-color: #d5fffb;
            background-image:url("../assets/four_bgk.png");
            background-size:100%;
            .four-box{
                width: 80%;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-sizing:border-box;
                padding-bottom:60px;
                .f-img{
                    display: block;
                    width: 100%;
                }
                .f-box{
                  width: 100%;
                  padding-top: 20px;
                }
                .add-package-btn{
                    width: 240px;
                    margin: 0 auto;
                    text-align: center;
                    display: block;
                    padding: 12px 0;
                    font-size: 28px;
                    background: #ffc159;
                    border-radius: 30px;
                    line-height: 38px;
                    color: #ffffff;
                }
            }
        }
        .pack{
            width: 100%;
            box-sizing: border-box;
            padding: 0 60px 30px;
            .p-tit{
                font-size: 28px;
                font-weight: 600;
            }
            .pack-list{
                width: 100%;
                margin-top: 16px;
            }
            .pack-item{
                width:100%;
                border:1px solid #15cebc;
                overflow:hidden;
                padding:10px;
                position:relative;
                margin-bottom:10px;
                .pack-left{
                    width: 65%;
                }
                .pack-right{
                    position: absolute;
                    text-align: right;
                    right: 10px;
                    top:10px;
                    color:#666666;
                    .yen{
                        color: #15cebc;
                        font-size: 30px;
                    }
                }
            }
        }
    }
    .footer{
        width: 100%;
        background: #b0f5ef;
        img{
            display: block;
            width: 100%;
        }
    }

</style>

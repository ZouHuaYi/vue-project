<template>
     <div class="pages">
    <div class="container">
      <div class="content">
        <div class="cont-top">
          <div class="t-header">
            <div class="logo">
              <img :src="user.p_avatar" ref="avatar" alt>
            </div>
            <div class="text">
              <span class="tit">推广人</span>
              <h5>{{user.p_name}}</h5>
            </div>
          </div>
          <div class="t-center">
            <img :src="user.hospital_logo" alt srcset>
          </div>
          <div class="t-footer">
            <span>{{user.hospital_name}}</span>
            <div class="tf-img">
                <img src="../assets/imgs.jpg" />
            </div>
          </div>
        </div>
        <div class="cont-midden">
          <span class="circle lt"></span>
          <span class="circle rt"></span>
        </div>
        <div class="cont-bottom">
          <transition name="fadeUp" v-if="routeStatus==1">
            <div class="b-item">
              <div class="form-ground">
                <input
                  type="tel"
                  @blur="scrollToTop"
                  @input="inputPhone(11,'phone')"
                  v-model.trim="phone"
                  placeholder="请输入您的手机号"
                >
              </div>
              <div class="form-vcode">
                <input
                  @blur="scrollToTop"
                  type="tel"
                  @input="inputPhone(6,'vcode')"
                  v-model.trim="vcode"
                  ref="vcheckmak"
                  placeholder="请输入验证码"
                >
                <a
                  class="btn-code no-touch"
                  href="javascript:;"
                  :class="disabledStatus?'on':''"
                  @click="clickSendVcode"
                >{{vcodeText}}</a>
              </div>
              <div class="btn-join">
                <a class="btn-input hover no-touch" @click="postVcode" href="javascript:;">加入我们</a>
              </div>
            </div>
          </transition>
          <transition name="fadeUp" >
            <div class="b-item" v-if="routeStatus==2">
              <div class="zh title">当前登陆账号</div>
              <div class="zh phone">{{newPhone}}</div>
              <div class="btn-join">
                <a class="btn-input hover no-touch" @click="bindParent" href="javascript:;">加入我们</a>
              </div>
            </div>
          </transition>
          <transition name="fadeUp">
            <div class="b-item alert" v-if="routeStatus==3">
              <div class="al al-text">你已成功加入团队</div>
              <div class="al al-time">{{alertText}}</div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <layer
        class="toast-box"
        v-model="showLayer"
        @sure="passwYesFn"
        :btn="['确定']"
        :title="['注册成功,请先完善密码','background:#15CEBC;color:#ffffff;']"
      >
        <div class="toast-content">
          <input type="password" @blur="scrollToTop" v-model.trim="password" placeholder="请输入您的密码" />
          <input type="password" @blur="scrollToTop" v-model.trim="repassword" placeholder="再次确认您的密码" />
        </div>
      </layer>
  </div>
</template>

<script>
import logo from "../assets/ic_logo.png";
import defaultname from "../assets/default.png";
import {mapState,mapActions,mapGetters } from "vuex";
import request from '@/utils/request';

export default{
    data(){
        return{
            vcodeText: "获取验证码",
            phone:'',
            vcode:'',
            disabledStatus:false,
            repassword:'',
            password:'',
        }
    },
    computed:{
        ...mapState({
            user: state => state.shareUserData,
            token: state => state.token,
            routeStatus: state => state.routeStatus,
            showLayer: state => state.join.showLayer,
            alertText: state => state.join.alertText,
        }),
        ...mapGetters({
              newPhone:'join/newPhone'
          })
    },
    methods:{
        ...mapActions([
            'join/postLoginRegister',
            'join/improvePassword',
            'join/bindParent',
        ]),
        // 限制 input 输入字数
        inputPhone(val, key) {
          this[key] = this[key].substr(0, val);
        },
        // 收起键盘回滚
        scrollToTop(){
            clearTimeout(this.timWin);
            this.timWin = setTimeout(()=>{
                window.scroll(0,0);
            },500);
        },
        // 点击发送验证码
        async clickSendVcode() {
            const phone = this.phone;
            const reg = /^1\d{10}$/;
            let time = 59;
            this.$layer.closeAll();
            if (!phone) {
                this.$layer.msg("手机号码不能为空");
                return;
            }
            if (this.disabledStatus) return; // 不能多次点击验证码
            this.disabledStatus = true;
            this.$loading.show("正在发送");
            const result =  await request('/rest/user/send_code', {phone:phone,type:5});
            this.$loading.hide();
            if (result) {
                if (result.messageCode == 900) {
                this.$layer.msg("验证码发送成功");
                this.$refs.vcheckmak.focus();
                // 倒计时开始
                this.vcodeText = `${time}s后重试`;
                let t = setInterval(() => {
                    time--;
                    this.vcodeText = `${time}s后重试`;
                    if (time === 0) {
                    clearInterval(t);
                    this.vcodeText = "发送验证码";
                    this.disabledStatus = false;
                    }
                }, 1000);
                } else {
                const msg = result.message ? result.message : "发送失败";
                this.$layer.msg(msg);
                this.disabledStatus = false;
                }
            } else {
                this.disabledStatus = false;
            }
        },
        async postVcode(){
            const phone = this.phone;
            const vcode = this.vcode;
            const reg = /^1\d{10}$/;
            this.$layer.closeAll();
            if (!phone) {
                this.$layer.msg("手机号码不能为空");
                return;
            }
            if (!reg.test(phone)) {
                this.$layer.msg("手机号码格式不正确");
                return;
            }
            if (!vcode) {
                this.$layer.msg("验证码不能为空");
                return;
            }
            if ((vcode + "").length != 6) {
                this.$layer.msg("验证码格式不正确");
                return;
            }
            this.$loading.show("正在提交");
            this['join/postLoginRegister']({phone:phone,code:vcode});

        },
        // 第一注册完善密码；
        passwYesFn(){
          const {password,repassword,phone} = this;
          this.$layer.closeAll();
          if (!password) {
            this.$layerCenterMsg("密码不能为空");
            return;
          }
          if (!repassword) {
            this.$layerCenterMsg("再次输入密码不能为空");
            return;
          }
          if ("" + password.length < 6) {
            this.$layerCenterMsg("设置密码要6位数以上");
            return;
          }
          if(password === repassword){
            this['join/improvePassword']({token:this.token,password:password});
          } else {
            this.$layerCenterMsg("两次输入的密码不一致");
          }
        },
        // 绑定父级
        bindParent(){
        console.log('join/bindParent');
          this['join/bindParent']();
        }
    },
    created(){

    },
    mounted() {
        this.$refs.avatar.onerror = () => {
            this.p_avatar = defaultname;
        };
  }
}
</script>
<style lang="less">
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
}
.pages{
  position:relative;
  width:100%;
  height:100%;
}
.layui-m-layer{
  position:absolute !important;
  width:100%;
  height:100vh;
}
a.no-touch {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
input {
  outline: none;
  box-shadow: none;
  -webkit-appearance: none !important;
}
input:focus {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-user-modify: read-write-plaintext-only;
}
[contenteditable="true"],
input,
textarea {
  -webkit-user-select: auto !important;
  -khtml-user-select: auto !important;
  -moz-user-select: auto !important;
  -ms-user-select: auto !important;
  -o-user-select: auto !important;
  user-select: auto !important;
}
.qrcode {
  width: 56%;
  margin: 0 auto;
  padding-top: 16px;
  padding-bottom: 24px;
  .ecode {
    width: 100%;
    padding: 0;
    background: #ffffff;
    border: 10px solid #ffffff;
    img {
      display: block;
      width: 100%;
    }
  }
}
.toast-box {
  .layui-m-layercont {
    padding: 40px 40px;
  }
  input {
    width: 100%;
    height: 70px;
    line-height: 70px;
    border: none;
    outline: none;
    text-align: center;
    font-size: 50px;
    &::-webkit-input-placeholder {
      font-size: 28px;
    }
    &:last-child {
      border-top: 1px solid #323232;
    }
  }
}
</style>



<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
  background: #14cebc;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: 0.5px;
}
.content {
  width: 87%;
  // min-height: 84%;
  padding-bottom: 30px;
  min-height: 1050px;
  background: #ffffff;
  border-radius: 32px;
}
.cont-top {
  display: flex;
  flex-direction: column;
  min-height: 50%;
  justify-content: center;
  .t-header {
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: 37px;
    box-sizing: border-box;
    .logo {
      width: 108px;
      height: 108px;
      border-radius: 50% 50%;
      overflow: hidden;
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
    }
    .text {
      padding-left: 20px;
      .tit {
        display: block;
        font-size: 28px;
        line-height: 24px;
        padding-top: 17px;
      }
      h5 {
        height: 30px;
        padding-top: 17px;
        line-height: 30px;
        font-size: 30px;
        font-weight: 600;
      }
    }
  }
  .t-center {
    width: 40%;
    margin: 0 auto;
    max-height: 240px;
    overflow: hidden;
    padding-bottom: 10px;
    img {
      display: block;
      width: 100%;
    }
  }
  .t-footer {
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    font-size: 36px;
    color: #000000;
    line-height: 36px;
    padding-top: 10px;
    padding-bottom: 10px;
    span {
      display: block;
      padding-top: 10px;
      font-size:28px;
    }
    .tf-img{
        width:80%;
        margin:0 auto;
        padding-top:50px;
        img{
            display:block;
            width:100%;
        }
    }
  }
}
.cont-midden {
  width: 100%;
  height: 64px;
  position: relative;
  &::after {
    position: absolute;
    content: " ";
    width: 100%;
    top: 50%;
    border-bottom: 1px dashed #eacc20;
    left: 0;
    z-index: 1;
  }
  .circle {
    position: absolute;
    width: 64px;
    height: 64px;
    background: #14cebc;
    border-radius: 50%;
    top: 0;
    z-index: 2;
    &.lt {
      left: -32px;
    }
    &.rt {
      right: -32px;
    }
  }
}
.cont-bottom {
  padding-bottom: 30px;
  .b-item {
    width: 80%;
    margin: 0 auto;
    font-size: 36px;
    input {
      letter-spacing: 1px;
      outline: none;
      font-size: 32px;
      &::-webkit-input-placeholder {
        color: #666666;
        letter-spacing: 0.5px;
      }
    }
    .form-ground {
      width: 100%;
      height: 90px;
      padding-top: 24px;
      line-height: 90px;
      input {
        display: block;
        width: 100%;
        height: 100%;
        border: 1px solid #e2e2e2;
        box-sizing: border-box;
        padding-left: 64px;
        border-radius: 12px;
        background-color: #d0f5f2;
        background-image: url(../assets/phone.png);
        background-repeat: no-repeat;
        background-position: 24px center;
        background-size: 22px 32px;
      }
    }
    .form-vcode {
      display: flex;
      justify-content: space-between;
      height: 90px;
      line-height: 90px;
      padding-top: 30px;
      input {
        display: block;
        width: 56%;
        height: 100%;
        border: 1px solid #e2e2e2;
        box-sizing: border-box;
        padding-left: 64px;
        border-radius: 12px;
        // outline: none;
        background-color: #d0f5f2;
        background-image: url(../assets/mc.png);
        background-repeat: no-repeat;
        background-position: 20px center;
        background-size: 30px 20px;
      }
      a.btn-code {
        width: 40%;
        height: 100%;
        text-align: center;
        border: 1px solid #e2e2e2;
        border-radius: 12px;
        font-size: 28px;
        box-sizing: border-box;
        &.on {
          color: #999999;
        }
      }
    }
    .btn-join {
      width: 100%;
      padding-top: 30px;
      height: 90px;
      line-height: 90px;
      a.btn-input {
        display: block;
        width: 100%;
        height: 90px;
        line-height: 90px;
        background: #14cebc;
        text-align: center;
        font-size: 32px;
        color: #ffffff;
        border-radius: 12px;
      }
    }
    .zh {
      width: 100%;
      text-align: center;
      padding-top: 36px;
      font-size: 36px;
      line-height: 36px;
      color: #323232;
      &.phone {
        padding-bottom: 30px;
      }
    }
    &.alert {
      text-align: center;
      .al-text {
        text-align: center;
        padding-top: 80px;
        font-size: 48px;
        font-weight: 500;
        background: linear-gradient(to bottom, #f9f5b6, #53a0bc);
        -webkit-background-clip: text;
        color: transparent;
      }
      .al-time {
        display: inline-block;
        padding: 15px 40px;
        border-radius: 40px;
        background: #03d0bc;
        font-size: 30px;
        color: #ffffff;
        margin-top: 30px;
        box-shadow: 0px 10px 10px rgba(3, 208, 188, 0.22);
      }
    }
  }
}
</style>

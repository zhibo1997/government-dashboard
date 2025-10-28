<template>
  <ResponsiveWrapper :base-width="4096" :base-height="1920">
    <div class="login-container">
      <div class="login-bg">
        <img src="@/assets/img/login/form_bg.png" alt="登录背景" />
      </div>
      <div class="login-title">
        <img src="@/assets/img/login/title.png" alt="登录标题" />
      </div>
      <div class="login-card">
        <n-form ref="formRef" :show-require-mark="false" label-placement="left" :model="formData" :rules="rules"
          class="login-form">
          <n-form-item path="username" :show-feedback="false" label="账号：" class="form-item">
            <n-input v-model:value="formData.username" placeholder="" size="large" class="login-input">
            </n-input>
          </n-form-item>

          <n-form-item path="password" :show-feedback="false" label="密码：" class="form-item">
            <n-input v-model:value="formData.password" type="password" placeholder="" size="large" class="login-input">
            </n-input>
          </n-form-item>
        </n-form>
        <n-button type="primary" size="large" :loading="loading" class="login-button" @click="handleLogin">
          登录
        </n-button>
      </div>
      <span></span>
    </div>
  </ResponsiveWrapper>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { createDiscreteApi } from "naive-ui";
import { PersonOutline, LockClosedOutline } from "@vicons/ionicons5";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import {loginService} from "@/services/loginService";
import ResponsiveWrapper from "@/components/ResponsiveWrapper.vue";

const { message } = createDiscreteApi(["message"]);

const router = useRouter();
const authStore = useAuthStore();

// 表单引用
const formRef = ref(null);

// 表单数据
const formData = ref({
  username: "",
  password: "",
});

// 加载状态
const loading = ref(false);

// 表单验证规则
const rules = {
  username: [
    { required: true, message: "请输入账户名", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
  ],
};
onMounted(()=>{
  loginService.getPublicKey();
})
// 登录处理
const handleLogin = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;
    const result = await loginService.login(formData.value);

    if (result && result.token) {
      // 保存登录状态
      authStore.login({
        username: formData.value.username,
        token: result.token,
        ...result
      });

      message.success("登录成功！");

      // 获取重定向路径
      const redirect = router.currentRoute.value.query.redirect || '/';

      // 直接跳转，不使用setTimeout
      await router.push(redirect);
    } else {
      message.error("登录失败！");
    }
  } catch (error) {
    console.error("登录错误:", error);
    if (Array.isArray(error) && error.length) {
      // 表单验证错误
      message.error("请检查输入信息");
    } else {
      message.error(error?.message || "登录失败，请重试！");
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  background-image: url("@/assets/img/login/backend_1.png");
  background-size: 100% 100%;

  // 背景图片容器
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("@/assets/img/login/backend_2.png");
    background-size: 100% 100%;
    opacity: 0.7;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 1;
  }

  .login-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2226px;
    height: 1014px;
    z-index: 1;
    // 水平居中
    transform: translate(-50%, -50%);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .login-title {
    z-index: 10;
    position: relative;
    height: 88px;
    margin-top: 120px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .login-card {
    width: 900px;
    height: 818px;
    position: relative;

    background-image: url("@/assets/img/login/form.png");
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 12px;
    padding: 60px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    z-index: 10;
    align-items: center;

    .login-form {
      margin-top: 30px;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;


      .form-item {
        margin-bottom: 50px;
        background-image: url("@/assets/img/login/form_input.png");

        width: 533px;
        height: 88px;
        background-size: 100% 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep() {
        .n-form-item-label {
          color: #fff;
          font-size: 36px;
        }

        .n-input__input-el {
          color: #fff;
        }
      }

      .login-input {
        background-position: center;
        background-repeat: no-repeat;
        border: none !important;
        outline: none !important;
        background-color: transparent;
        color: #fff;
        width: 320px;
        font-size: 36px;
      }

    }

    .login-button {
      width: 328px;
      height: 76px;
      font-size: 36px;
      font-weight: 500;
      background-image: url("../assets/img/login/button.png");
      background-size: 100% 100%;
      background-position: center;
      background-repeat: no-repeat;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      color: #fff;
      background-color: transparent;
      margin-top: 60px;

      &:hover {
        opacity: 0.9;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }

      &:active {
        opacity: 0.8;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }

      &:focus {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }

      // 深度选择器移除Naive UI默认样式
      :deep(.n-button) {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }

      :deep(.n-button__border) {
        display: none !important;
      }

      :deep(.n-button__state-border) {
        display: none !important;
      }
    }
  }
}
</style>

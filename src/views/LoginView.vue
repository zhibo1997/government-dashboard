<template>
  <div class="login-container">
    <div class="login-bg">
      <img src="../assets/images/bg-box.webp" alt="登录背景" />
    </div>
    <div class="login-title">
      <img src="../assets/images/title.png" alt="登录标题" />
    </div>
    <div class="login-card">
      <n-form ref="formRef" :model="formData" :rules="rules" class="login-form">
        <n-form-item path="username" class="form-item">
          <n-input
            v-model:value="formData.username"
            placeholder=""
            size="large"
            class="login-input"
          >
            <template #prefix>
              <n-icon :component="PersonOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item path="password" class="form-item">
          <n-input
            v-model:value="formData.password"
            type="password"
            placeholder=""
            size="large"
            class="login-input"
          >
            <template #prefix>
              <n-icon :component="LockClosedOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item class="form-item">
          <n-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </n-button>
        </n-form-item>
      </n-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { createDiscreteApi } from "naive-ui";
import { PersonOutline, LockClosedOutline } from "@vicons/ionicons5";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { loginService } from "@/services/loginService";

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

// 登录处理
const handleLogin = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;

    // 调用登录服务
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  // 背景图片容器
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("@/assets/images/login-bg.png");
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(3px);
    z-index: 1;
  }

  .login-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1000px;
    height: 460px;
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
    height: 60px;
    margin-top: 20px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  :deep() {
    .n-input__input-el {
      background: transparent !important;
      background-color: transparent !important;
      color: #ffffff !important;
      border: none !important;
      box-shadow: none !important;

      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }

      &:hover {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
      }

      &:focus {
        background: transparent !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
    }
  }
  .login-card {
    width: 420px;
    height: 380px;
    z-index: 10;
    position: relative;
    margin-top: 20vh;

    background-image: url("../assets/images/bg-input-box.webp");
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 12px;
    padding: 60px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .login-form {
      margin-top: 30px;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      .form-item {
        margin-bottom: 24px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .login-input {
        background-image: url("../assets/images/bg-input.webp");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border: none !important;
        outline: none !important;
        width: 250px;
        background-color: transparent;
        color: #fff;

        :deep(.n-input) {
          background: transparent !important;
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
          outline: none !important;

          &:hover {
            background: transparent !important;
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
          }

          &:focus {
            background: transparent !important;
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
          }

          &:focus-within {
            background: transparent !important;
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
          }

          .n-input-wrapper {
            background: transparent !important;
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
          }

          .n-input__input {
            background: transparent !important;
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
          }

          .n-input__state-border {
            display: none !important;
            border: none !important;
          }

          .n-input__border {
            display: none !important;
            border: none !important;
          }

          .n-input__suffix {
            background: transparent !important;
            outline: none !important;
          }

          .n-input__prefix {
            color: rgba(255, 255, 255, 0.8);
            background: transparent !important;
            outline: none !important;
          }
        }
      }

      .login-button {
        width: 150px;
        height: 35px;
        font-size: 16px;
        font-weight: 500;
        background-image: url("../assets/images/bg-button.webp");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        color: #fff;
        background-color: transparent;

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
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    padding: 16px;

    .login-card {
      padding: 40px 24px;
    }
  }
}
</style>

<template>
  <div class="login-container">
    <div class="login-bg">
      <img src="../assets/images/bg-box.webp" alt="登录背景">
    </div>
    <div class="login-card">
      <a-form
        :model="formData"
        :rules="rules"
        @finish="handleLogin"
        @finishFailed="handleLoginFailed"
        layout="vertical"
        class="login-form"
      >
        <a-form-item name="username" class="form-item">
          <a-input
            v-model:value="formData.username"
            placeholder="请输入账户"
            size="large"
            :prefix="h(UserOutlined)"
            class="login-input"
          />
        </a-form-item>

        <a-form-item name="password" class="form-item">
          <a-input-password
            v-model:value="formData.password"
            placeholder="请输入密码"
            size="large"
            :prefix="h(LockOutlined)"
            class="login-input"
          />
        </a-form-item>

        <a-form-item class="form-item">
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            class="login-button"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, h } from "vue";
import { message } from "ant-design-vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { loginService } from "../services/loginService";

const router = useRouter();
const authStore = useAuthStore();

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
    { min: 3, max: 20, message: "账户名长度应为3-20个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度应为6-20个字符", trigger: "blur" },
  ],
};

// 登录处理
const handleLogin = async (values) => {
  loading.value = true;

  try {
    // 调用登录服务
    const result = await loginService.login(values.username, values.password);

    if (result.success) {
      // 保存登录状态
      authStore.login({
        username: values.username,
        token: result.token,
      });

      message.success("登录成功！");

      // 跳转到主页面
      router.push("/");
    } else {
      message.error(result.message || "登录失败！");
    }
  } catch (error) {
    console.error("登录错误:", error);
    message.error("登录失败，请重试！");
  } finally {
    loading.value = false;
  }
};

// 登录失败处理
const handleLoginFailed = (errorInfo) => {
  console.log("登录表单验证失败:", errorInfo);
};
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #888;
  padding: 20px;
  .login-bg{
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1000px;
    height: 460px;
    z-index: 1;
    // 水平居中
    transform: translate(-50%, -50%);
    img{
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .login-card {
    width: 420px;
    height: 380px;
    z-index: 10;
    position: relative;

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
        border: none;
        width: 250px;
        background-color: transparent;

        :deep(.ant-input) {
          background: transparent;
          border: none;
          color: #fff;

          &::placeholder {
            color: rgba(255, 255, 255, 0.6);
          }
        }

        :deep(.ant-input-prefix) {
          color: rgba(255, 255, 255, 0.8);
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
        border: none;
        color: #fff;
        background-color: transparent;

        &:hover {
          opacity: 0.9;
        }

        &:active {
          opacity: 0.8;
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

<template>
  <div>
    <el-button plain @click="dialogFormVisible = true">Login / Register</el-button>

    <el-dialog v-model="dialogFormVisible" width="450px">
      <el-tabs v-model="activeTab" stretch>
        <el-tab-pane label="Login" name="login">
          <div class="form-container">
            <el-form
              :model="loginForm"
              :rules="loginRules"
              ref="loginFormRef"
              class="auth-form"
              label-position="top"
              :label-width="0"
            >
              <el-form-item prop="username" label=" ">
                <el-input v-model="loginForm.username" autocomplete="off" placeholder="Username" />
              </el-form-item>
              <el-form-item prop="password" label=" ">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  show-password
                  placeholder="Password"
                />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Register" name="register">
          <div class="form-container">
            <el-form
              :model="registerForm"
              :rules="registerRules"
              ref="registerFormRef"
              class="auth-form"
              label-position="top"
              :label-width="0"
            >
              <el-form-item prop="username" label=" ">
                <el-input
                  v-model="registerForm.username"
                  autocomplete="off"
                  placeholder="Username"
                />
              </el-form-item>
              <el-form-item prop="password" label=" ">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  show-password
                  placeholder="Password"
                />
              </el-form-item>
              <el-form-item prop="confirmPassword" label=" ">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  show-password
                  placeholder="Confirm Password"
                />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" v-if="activeTab === 'login'" @click="handleLogin">
            Login
          </el-button>
          <el-button type="primary" v-else @click="handleRegister"> Register </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const dialogFormVisible = ref(false)
const activeTab = ref<'login' | 'register'>('login')
const formLabelWidth = '100px'

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
})

const loginRules: FormRules = {
  username: [{ required: true, message: 'Please input username', trigger: 'blur' }],
  password: [{ required: true, message: 'Please input password', trigger: 'blur' }],
}

const loginFormRef = ref<FormInstance>()

const handleLogin = () => {
  loginFormRef.value?.validate((valid) => {
    if (valid) {
      console.log('Logging in:', loginForm)
      dialogFormVisible.value = false
    }
  })
}

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})

const registerRules: FormRules = {
  username: [{ required: true, message: 'Please input username', trigger: 'blur' }],
  password: [{ required: true, message: 'Please input password', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: 'Please confirm password', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('Passwords do not match'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const registerFormRef = ref<FormInstance>()

const handleRegister = () => {
  registerFormRef.value?.validate((valid) => {
    if (valid) {
      console.log('Registering:', registerForm)
      dialogFormVisible.value = false
    }
  })
}
</script>

<style scoped>
:deep(.el-dialog) {
  border-radius: 20px;
  width: 450px !important;
  max-width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  background-color: #fafafa;
}

:deep(.el-dialog__footer) {
  display: flex;
  justify-content: center;
}

:deep(.el-button) {
  width: 200px;
  border-radius: 20px;
}

:deep(.el-input__inner) {
  border-radius: 50px !important;
  padding: 5px 15px;
}

.form-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.auth-form {
  width: 80%;
  max-width: 320px;
}

:deep(.el-form-item__label) {
  height: 0;
  padding: 0;
  overflow: hidden;
}

:deep(.el-form-item__content) {
  margin-left: 0 !important;
}

:deep(.el-form-item) {
  margin-bottom: 0px;
}
</style>

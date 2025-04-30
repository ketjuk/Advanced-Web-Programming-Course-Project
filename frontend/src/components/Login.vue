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
              <el-form-item prop="captcha" label=" ">
                <div style="display: flex; align-items: center">
                  <el-input
                    v-model="loginForm.captcha"
                    placeholder="Enter Captcha"
                    style="flex: 1; margin-right: 10px"
                  />
                  <canvas
                    ref="captchaCanvas"
                    width="100"
                    height="40"
                    @click="refreshCaptcha"
                    style="cursor: pointer; border: 1px solid #ccc; border-radius: 5px"
                  ></canvas>
                </div>
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
              <el-form-item prop="captcha" label=" ">
                <div style="display: flex; align-items: center">
                  <el-input
                    v-model="registerForm.captcha"
                    placeholder="Enter Captcha"
                    style="flex: 1; margin-right: 10px"
                  />
                  <canvas
                    ref="registerCaptchaCanvas"
                    width="100"
                    height="40"
                    @click="refreshRegisterCaptcha"
                    style="cursor: pointer; border: 1px solid #ccc; border-radius: 5px"
                  ></canvas>
                </div>
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
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const dialogFormVisible = ref(false)
const activeTab = ref<'login' | 'register'>('login')

const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  _id: '',
})

const loginRules: FormRules = {
  username: [{ required: true, message: 'Please input username', trigger: 'blur' }],
  password: [{ required: true, message: 'Please input password', trigger: 'blur' }],
  captcha: [{ required: true, message: 'Please enter captcha', trigger: 'blur' }],
}

const loginFormRef = ref<FormInstance>()

const handleLogin = async () => {
  loginFormRef.value?.validate(async (valid) => {
    if (valid) {
      if (loginForm.captcha !== captchaCode.value) {
        ElMessage.error('Incorrect captcha')
        refreshCaptcha()
        return
      }

      try {
        const response = await axios.post('http://localhost:3000/log_in', {
          username: loginForm.username,
          password: loginForm.password,
          code: loginForm.captcha,
          _id: loginForm._id,
        })

        if (!response.data.success) {
          throw new Error(response.data.message || 'Login failed')
        }

        ElMessage.success('Login successful')
        dialogFormVisible.value = false
        loginFormRef.value?.resetFields()
      } catch (error: any) {
        ElMessage.error(error.message || 'Login failed')
        refreshCaptcha()
      }
    }
  })
}

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  captcha: '',
  _id: '',
  code: '',
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
  captcha: [{ required: true, message: 'Please enter captcha', trigger: 'blur' }],
}

const registerFormRef = ref<FormInstance>()

const handleRegister = async () => {
  registerFormRef.value?.validate(async (valid) => {
    if (valid) {
      if (registerForm.captcha !== registerCaptchaCode.value) {
        ElMessage.error('Incorrect captcha')
        refreshRegisterCaptcha()
        return
      }

      try {
        const response = await axios.post('http://localhost:3000/sign_up', {
          username: registerForm.username,
          password: registerForm.password,
          _id: registerForm._id,
          code: registerForm.captcha,
        })

        if (!response.data.success) {
          throw new Error(response.data.message || 'Registration failed')
        }

        ElMessage.success('Registration successful')
        dialogFormVisible.value = false
        registerFormRef.value?.resetFields()
      } catch (error: any) {
        ElMessage.error(error.message || 'Registration failed')
        refreshRegisterCaptcha()
      }
    }
  })
}

watch(dialogFormVisible, (visible) => {
  if (visible) {
    if (activeTab.value === 'login') {
      fetchCaptchaCode()
    } else {
      fetchRegisterCaptchaCode()
    }
    loginFormRef.value?.resetFields()
    registerFormRef.value?.resetFields()
  }
})

watch(activeTab, (tab) => {
  if (tab === 'login') {
    loginFormRef.value?.resetFields()
    fetchCaptchaCode()
  } else if (tab === 'register') {
    registerFormRef.value?.resetFields()
    fetchRegisterCaptchaCode()
  }
})

const captchaCode = ref('')
const captchaCanvas = ref<HTMLCanvasElement>()

const drawCaptcha = () => {
  console.log('Drawing captcha:', captchaCode.value)
  if (!captchaCanvas.value) return
  const ctx = captchaCanvas.value.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, 100, 40)
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, 100, 40)

  ctx.font = '24px Arial'
  ctx.fillStyle = '#333'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(captchaCode.value, 50, 20)

  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.8)`
    ctx.beginPath()
    ctx.moveTo(Math.random() * 100, Math.random() * 40)
    ctx.lineTo(Math.random() * 100, Math.random() * 40)
    ctx.stroke()
  }
}

const fetchCaptchaCode = async () => {
  const res = await fetch('http://localhost:3000/request_code')
  const data = await res.json()
  console.log('Data received:', data)
  captchaCode.value = data.data.code
  loginForm._id = data.data._id
  drawCaptcha()
}

const refreshCaptcha = () => {
  fetchCaptchaCode()
}

const registerCaptchaCode = ref('')
const registerCaptchaCanvas = ref<HTMLCanvasElement>()

const drawRegisterCaptcha = () => {
  if (!registerCaptchaCanvas.value) return
  const ctx = registerCaptchaCanvas.value.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, 100, 40)
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, 100, 40)

  ctx.font = '24px Arial'
  ctx.fillStyle = '#333'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(registerCaptchaCode.value, 50, 20)

  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.8)`
    ctx.beginPath()
    ctx.moveTo(Math.random() * 100, Math.random() * 40)
    ctx.lineTo(Math.random() * 100, Math.random() * 40)
    ctx.stroke()
  }
}

const fetchRegisterCaptchaCode = async () => {
  const res = await fetch('http://localhost:3000/request_code')
  const data = await res.json()
  registerCaptchaCode.value = data.data.code
  drawRegisterCaptcha()
}

const refreshRegisterCaptcha = async () => {
  const res = await fetch('http://localhost:3000/request_code')
  const result = await res.json()

  if (result.success) {
    const captcha = result.data
    registerCaptchaCode.value = captcha.code
    registerForm._id = captcha._id
    drawRegisterCaptcha()
  }
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
  margin-bottom: 15px;
}
</style>

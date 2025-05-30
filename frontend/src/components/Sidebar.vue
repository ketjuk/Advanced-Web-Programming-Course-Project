<template>
  <div class="sidebar">
    <!-- 顶部菜单 -->
    <el-menu :default-active="active" class="menu-top" @select="handleSelect">
      <el-menu-item index="/">
        <el-icon><Compass /></el-icon>
        <span>Discovery</span>
      </el-menu-item>
      <el-menu-item index="/create">
        <el-icon><Edit /></el-icon>
        <span>Post</span>
      </el-menu-item>
      <el-menu-item index="/notification">
        <el-icon><Bell /></el-icon>
        <span>Notification</span>
      </el-menu-item>
      <el-menu-item index="/user" v-if="isLoggedIn">
        <el-icon><User /></el-icon>
        <span>User</span>
      </el-menu-item>
    </el-menu>

    <!-- 未登录时显示登录按钮 -->
    <div class="login-section" v-if="!isLoggedIn">
      <Login @login-success="handleLoginSuccess" ref="loginRef" />
    </div>

    <div class="spacer"></div>

    <!-- 底部菜单 -->
    <el-menu class="menu-bottom" @select="handleSelect">
      <el-menu-item index="/more" @click="handleLogout">
        <el-icon><More /></el-icon>
        <span>Logout</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Compass, Edit, Bell, User, More } from '@element-plus/icons-vue'
import Login from '@/components/Login.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const active = ref(route.path)
watch(
  () => route.path,
  (newPath) => {
    active.value = newPath
  },
)

const isLoggedIn = ref(false)
const loginRef = ref(null)
const isMobileView = ref(false)

const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  isLoggedIn.value = !!token
}

const handleLoginSuccess = (userData: { username: string; token: string }) => {
  if (userData.token) {
    localStorage.setItem('token', userData.token)
    localStorage.setItem('username', userData.username)
    isLoggedIn.value = true
    ElMessage.success(`Welcome back, ${userData.username}!`)
  } else {
    ElMessage.error('Login failed: no token received.')
  }
}

const checkViewport = () => {
  isMobileView.value = window.innerWidth <= 850
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  isLoggedIn.value = false
  router.push('/')
  ElMessage.success('Logged out successfully')
}

const handleSelect = (index: string) => {
  router.push(index)
}

onMounted(() => {
  checkLoginStatus()
  checkViewport()
  window.addEventListener('resize', checkViewport)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkViewport)
})
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  background-color: #f4f4f4;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  padding-top: 60px;
  box-sizing: border-box;
  z-index: 10;
}

.menu-top {
  border-right: none;
}

.login-section {
  padding: 15px;
  margin-bottom: 10px;
}

.spacer {
  flex-grow: 1;
}

.menu-bottom {
  border-right: none;
}

.login-section :deep(.el-button) {
  width: 100%;
}

:deep(.el-menu) {
  border-right: none !important;
}

@media screen and (max-width: 850px) {
  .sidebar {
    width: 100%;
    height: 60px;
    position: fixed;
    top: auto;
    bottom: 0;
    padding-top: 0;
    flex-direction: row;
    background-color: #f4f4f4;
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);
  }

  .menu-top {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  :deep(.el-menu--horizontal) {
    border-bottom: none;
  }

  :deep(.el-menu-item) {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    line-height: normal;
    height: 60px;
    padding: 5px 0 !important;
  }

  :deep(.el-icon) {
    margin-right: 0 !important;
    margin-bottom: 2px;
  }

  :deep(.el-menu-item span) {
    font-size: 12px;
  }

  .login-section {
    display: none;
  }

  :deep(.el-menu-item:last-child) {
    margin-right: 10px !important;
  }
}
</style>

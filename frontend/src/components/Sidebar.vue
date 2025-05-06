<template>
  <div class="sidebar">
    <!-- 顶部菜单 -->
    <el-menu :default-active="active" class="menu-top" @select="handleSelect">
      <el-menu-item index="1">
        <el-icon><Compass /></el-icon>
        <span>Discovery</span>
      </el-menu-item>
      <el-menu-item index="2">
        <el-icon><Edit /></el-icon>
        <span>Post</span>
      </el-menu-item>
      <el-menu-item index="3">
        <el-icon><Bell /></el-icon>
        <span>Notification</span>
      </el-menu-item>
      <!-- 只有在登录后才显示用户中心 -->
      <el-menu-item index="4" v-if="isLoggedIn">
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
      <el-menu-item index="5">
        <el-icon><More /></el-icon>
        <span>More</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Compass, Edit, Bell, User, More } from '@element-plus/icons-vue'
import Login from '@/components/Login.vue'
import { ElMessage } from 'element-plus'

const active = ref('1')
const isLoggedIn = ref(false)
const loginRef = ref(null)
const isMobileView = ref(false)

// 检查用户登录状态
const checkLoginStatus = () => {
  // 从localStorage获取登录信息
  const token = localStorage.getItem('token')
  isLoggedIn.value = !!token
}

// 处理登录成功
const handleLoginSuccess = (userData) => {
  // 如果有 token 就保存，否则提示登录失败
  if (userData.token) {
    localStorage.setItem('token', userData.token)
    localStorage.setItem('username', userData.username)

    // 更新状态
    isLoggedIn.value = true

    ElMessage.success(`Welcome back, ${userData.username}!`)
  } else {
    ElMessage.error('Login failed: no token received.')
  }
}

// 检查是否为移动视图
const checkViewport = () => {
  isMobileView.value = window.innerWidth <= 850
}

// 处理菜单项选择
const handleSelect = (index: string) => {
  active.value = index
}

// 组件挂载时检查登录状态和视图大小
onMounted(() => {
  checkLoginStatus()
  checkViewport()
  window.addEventListener('resize', checkViewport)
})

// 组件卸载时移除事件监听
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

/* 确保按钮样式一致 */
.login-section :deep(.el-button) {
  width: 100%;
}

/* 移除Element Plus默认边框 */
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

  /* 在移动视图中隐藏登录按钮 */
  .login-section {
    display: none;
  }

  /* More菜单项右侧间距 */
  :deep(.el-menu-item:last-child) {
    margin-right: 10px !important;
  }
}
</style>

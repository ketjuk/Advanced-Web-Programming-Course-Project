<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import ArticleWrapper from './homeComponent/ArticleWrapper.vue'
import ArticleType from './homeComponent/ArticleType.vue'
import { ElButton } from 'element-plus'
import { API_GetCode, API_Login, API_Signup } from '@/api'
import Sidebar from '@/components/Sidebar.vue'

const test = async () => {
 
  const res = await API_Login({ username: 'test', password: 'test' })
  console.log(res)
  // const res = await API_Signup({ username: 'test', password: 'test' })
  // console.log(res)
}
</script>

<template>
  <div class="main">

    <div class="left">
      <Sidebar />
    </div>
    <div class="right">
      <!-- <ElButton @click="test">test</ElButton> -->
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.main {
  display: flex;
  flex-direction: row;
  flex: 1;
}

.right {
  flex: 1;
  padding: 2px 16px;
  padding-bottom: 60px;
 
}

.left {
  width: 200px;
}

.sidebar {
  width: 200px;
  height: 100vh;
  background-color: #f4f4f4;
  padding-top: 60px;
  position: fixed;
  top: 0;
  left: 0;
}

.el-menu {
  width: 100%;
  height: 100%;
  border-right: none;
  display: flex;
  flex-direction: column;
}

.more-item {
  margin-top: auto;
  text-align: center;
}

@media screen and (max-width: 850px) {
  .main {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: 60px;
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    padding-top: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 1000;
  }

  .el-menu {
    flex-direction: row;
    width: 100%;
    height: 100%;
    justify-content: space-around;
  }

  .el-menu-item {
    flex: 1;
    height: 100%;
    text-align: center;
    line-height: 60px;
  }

  .more-item {
    position: static !important;
  }

  .right {
    margin-left: 0;
    padding-bottom: 60px;
  }

  :deep(.el-menu-item:last-child) {
    margin-right: 20px !important;
    padding-right: 20px !important;
  }
}
</style>

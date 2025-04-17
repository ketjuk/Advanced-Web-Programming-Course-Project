<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import ArticleWrapper from './homeComponent/ArticleWrapper.vue'
import ArticleType from './homeComponent/ArticleType.vue'
import { ElButton } from 'element-plus'
import { API_GetCode, API_Login, API_Signup } from '@/api'

const test = async () => {
  try {
    const data = await API_GetCode()
    console.log(data)
  } catch (error) {}
}

const test2 = async () => {
  const data = await API_Login({ password: '123', username: '123' })
  console.log(data)
}
const test3 = async () => {
  try {
    const data = await API_Signup()
    console.log(data)
  } catch (error) {}
}
</script>

<template>
  <div class="wrapper">
    <div class="header">header</div>
    <div>
      <ElButton type="primary" @click="test">test code</ElButton>
      <ElButton type="primary" @click="test2">test login</ElButton>
      <ElButton type="primary" @click="test3">test signup</ElButton>
    </div>
    <div class="main">
      <!-- <div class="left">left</div> -->
      <div class="right">
        <ArticleType />
        <ArticleWrapper />
      </div>
    </div>
  </div>
  <div>123</div>
  <Navbar msg="导航条" />
</template>

<style scoped>
.wrapper {
  width: 100%;
  min-height: 100vh;
  background-color: wheat;
  display: flex;
  flex-direction: column;
}
.header {
  width: 100%;
  height: 80px;
  background-color: #ddd;
}
.main {
  display: flex;
  min-height: 100vh;
}
/* .left{
  position: sticky;
  top: 0;
  flex: 0 0 200px;
  background-color: #bbb;
} */
.right {
  margin-left: 200px;
  flex: 1;
}

@media screen and (max-width: 850px) {
  .right {
    margin-left: 0;
  }
}
</style>

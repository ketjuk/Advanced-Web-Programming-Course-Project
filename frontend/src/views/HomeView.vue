<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import ArticleWrapper from './homeComponent/ArticleWrapper.vue';
import ArticleType from './homeComponent/ArticleType.vue';
</script>

<template>
  <div class="wrapper">
    <div class="header">header</div>
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
  background-color:wheat;
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
.right{
  margin-left: 200px;
  flex: 1;
}

@media screen and (max-width: 850px) {

  
  .right {
    margin-left: 0;
  }
  
}
</style>

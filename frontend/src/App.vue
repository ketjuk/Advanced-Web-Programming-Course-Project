<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import Login from './components/Login.vue'
</script>

<template>
  <div class="body">
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
      <Login />
    </div>
    <RouterView />
  </div>
</template>

<style scoped>
.body {
  width: 100%;
  background-color: #ccc;
}
</style>

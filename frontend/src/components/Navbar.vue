<script setup lang="ts">
import NavbarItem from './NavbarItem.vue'
import img from '@/assets/logo.svg'
import { ref } from 'vue'
const items = ref([
  { msg: 'Home', icon: img },
  { msg: 'About', icon: img },
  { msg: 'Contact', icon: img },
])
const activeIndex = ref(0)
const changeActiveIndex = (index: number) => {
  console.log('itemClick', index)
  activeIndex.value = index
}
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="navbar">
    <div class="navitem_wrapper">
      <NavbarItem
        :activate="index == activeIndex"
        :changeActiveIndex="changeActiveIndex"
        :index="index"
        v-for="(item, index) in items"
        :key="index"
        :msg="item.msg"
        :icon="item.icon"
      />
    </div>
  </div>
</template>

<style scoped>
.navbar {
  width: 100%;
  height: 50px;
  background-color: #eee;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 0;
}
.navitem_wrapper {
  display: flex;
  justify-content: space-around;
  width: 100%;
}
</style>

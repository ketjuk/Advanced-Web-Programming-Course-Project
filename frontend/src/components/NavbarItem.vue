<script setup lang="ts">
const props = defineProps<{
  msg: string
  icon: string
  activate: boolean
  changeActiveIndex: (index: number) => void
  index: number
}>()
const itemClick = () => {
  props.changeActiveIndex(props.index)
}
</script>

<template>
  <div @click="itemClick" class="navbar_item" :class="{ active: props.activate }">
    <!-- <img :src="icon" alt="123"> -->
    <div class="wrap">
      <div class="img_warp"><img :src="props.icon" alt="123" /></div>
      <div class="green">{{ msg }}</div>
    </div>
  </div>
</template>

<style scoped>
.navbar_item {
  display: flex;
  flex: 1;
  height: 50px;
  background-color: aqua;
}
.navbar_item.active {
  background-color: #ccc;
  color: red;
}
.wrap {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  height: 50px;
}
.img_warp {
  height: 50px;
}
</style>

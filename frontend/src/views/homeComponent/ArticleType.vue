<script setup lang="ts">
import { ref } from 'vue'

const scrollRef = ref<HTMLElement | null>(null)
let isDown = false
let startX = 0
let scrollLeft = 0

function startDrag(e: MouseEvent) {
  isDown = true
  scrollRef.value!.classList.add('dragging')
  startX = e.pageX - scrollRef.value!.offsetLeft
  scrollLeft = scrollRef.value!.scrollLeft
}

function stopDrag() {
  isDown = false
  scrollRef.value!.classList.remove('dragging')
}

function onDrag(e: MouseEvent) {
  if (!isDown) return
  e.preventDefault()
  const x = e.pageX - scrollRef.value!.offsetLeft
  console.log(e.pageX, startX)
  const walk = (x - startX) * 1 // velocity
  scrollRef.value!.scrollLeft = scrollLeft - walk
}
type itemType = {
  name: string
  url: string
}
const typeArray: itemType[] = [
  {
    name: '全部',
    url: '/article/all',
  },
  {
    name: '前端',
    url: '/article/frontend',
  },
  {
    name: '后端',
    url: '/article/backend',
  },
  {
    name: '其他',
    url: '/article/other',
  },
  {
    name: '全部',
    url: '/article/all',
  },
  {
    name: '前端',
    url: '/article/frontend',
  },
  {
    name: '后端',
    url: '/article/backend',
  },
  {
    name: '其他',
    url: '/article/other',
  },
]
</script>

<template>
  <div
    class="type-container"
    ref="scrollRef"
    @mousedown="startDrag"
    @mouseup="stopDrag"
    @mouseleave="stopDrag"
    @mousemove="onDrag"
  >
    <div v-for="(item, index) in typeArray" :key="index" class="type-item">
      {{ item.name }}
    </div>
  </div>
</template>

<style scoped>
.type-container {
  width: 100%;
  height: 40px;
  background-color: aqua;
  white-space: nowrap;
  overflow-y: hidden;
  user-select: none;
}

@media screen and (max-width: 850px) {
  .type-container {
    cursor: grab;
  }
  .dragging {
    cursor: grabbing;
  }
}
.type-item {
  display: inline-block;
  height: 100%;
  width: 80px;
  margin: 0 10px;
  line-height: 40px;
  text-align: center;
}
</style>

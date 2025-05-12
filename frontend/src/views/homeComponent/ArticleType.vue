<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const scrollRef = ref<HTMLElement | null>(null)
let isDragging = false
let startX = 0
let scrollLeft = 0

// 拖拽行为
function startDrag(e: MouseEvent) {
  isDragging = true
  scrollRef.value?.classList.add('dragging')
  startX = e.pageX - scrollRef.value!.offsetLeft
  scrollLeft = scrollRef.value!.scrollLeft
}

function stopDrag() {
  isDragging = false
  scrollRef.value?.classList.remove('dragging')
}

function onDrag(e: MouseEvent) {
  if (!isDragging) return
  e.preventDefault()
  const x = e.pageX - scrollRef.value!.offsetLeft
  const walk = (x - startX) * 1
  scrollRef.value!.scrollLeft = scrollLeft - walk
}

onMounted(() => {
  window.addEventListener('mouseup', stopDrag)
})
onBeforeUnmount(() => {
  window.removeEventListener('mouseup', stopDrag)
})

type CategoryItem = { name: string }

const categories: CategoryItem[] = [
  { name: 'All' },
  { name: 'Travel' },
  { name: 'Food' },
  { name: 'Lifestyle' },
  { name: 'Photography' },
  { name: 'Health' },
  { name: 'Fashion' },
  { name: 'Books' },
  { name: 'Movies' },
  { name: 'Music' },
  { name: 'Inspiration' },
  { name: 'Other' },
]
</script>

<template>
  <div class="category-wrapper">
    <div
      class="type-container"
      ref="scrollRef"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseleave="stopDrag"
    >
      <div
        v-for="(item, index) in categories"
        :key="index"
        class="type-item"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 避免顶部遮挡，留出空间 */
.category-wrapper {
  margin-bottom: 2px; /* 可根据 Navbar 实际高度调整 */
}

/* 外层容器 */
.type-container {
  width: 100%;
  height: 44px;
  background-color: #f9f9f9;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  user-select: none;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-bottom: 1px solid #e0e0e0;
  scroll-behavior: smooth;
}

.dragging {
  cursor: grabbing !important;
}

/* 分类项样式 */
.type-item {
  flex: 0 0 auto;
  padding: 6px 14px;
  margin-right: 10px;
  background-color: #ffffff;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.type-item:hover {
  background-color: #e8f3ff;
  color: #409eff;
}

@media screen and (max-width: 850px) {
  .type-container {
    cursor: grab;
  }
}
</style>

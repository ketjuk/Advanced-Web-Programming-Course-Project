<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watchEffect, reactive } from 'vue'
import ArticleItem from './ArticleItem.vue'
const someArticleArray = [
  {
    title: 'Article 1',
    content: 'This is the content of article 1.',
  },
  {
    title: 'Article 2',
    content: 'This is the content of article 2.',
  },
  {
    title: 'Article 3',
    content: 'This is the content of article 3.',
  },
  {
    title: 'Article 4',
    content: 'This is the content of article 4.',
  },
  {
    title: 'Article 5',
    content: 'This is the content of article 5.',
  },
]
const wrapperRef = ref<HTMLInputElement | null>(null)
const articleListRef = ref<HTMLInputElement | null>(null)
const wrapperWidth = ref(0)
const isLoadingData = ref(false)
const articleList = reactive([
  {
    title: 'Article 1',
    content: 'This is the content of article 1.',
  },
  {
    title: 'Article 2',
    content: 'This is the content of article 2.',
  },
  {
    title: 'Article 3',
    content: 'This is the content of article 3.',
  },
  {
    title: 'Article 1',
    content: 'This is the content of article 1.',
  },
  {
    title: 'Article 2',
    content: 'This is the content of article 2.',
  },
  {
    title: 'Article 3',
    content: 'This is the content of article 3.',
  },
])
function calculateLayout(newData: boolean = false) {
  if (wrapperRef?.value?.childNodes) {
    console.log('watch', wrapperWidth.value)
    const width = wrapperWidth.value
    const distance = 20
    let columnArr: number[] = [],
      itemWidth = 0
    if (width > 990) {
      columnArr = [0, 0, 0, 0]
      itemWidth = (width - 3 * distance) / 4
    } else if (width > 620) {
      columnArr = [0, 0, 0]
      itemWidth = (width - 2 * distance) / 3
    } else {
      columnArr = [0, 0]
      itemWidth = (width - distance) / 2
    }
    const elementChildren = Array.from(wrapperRef.value!.childNodes).filter(
      (node) => node.nodeType === 1,
    )

    for (let i of elementChildren as HTMLElement[]) {
      const smallesetIndex = columnArr.indexOf(Math.min(...columnArr))
      i.dataset.calculated = 'done'
      i.style.width = itemWidth + 'px'
      i.style.left = itemWidth * smallesetIndex + smallesetIndex * distance + 'px'
      i.style.top = columnArr[smallesetIndex] + 'px'
      columnArr[smallesetIndex] += (i as HTMLElement).clientHeight + distance
    }
    wrapperRef.value!.style.height = Math.max(...columnArr) + 'px'
  }
}
function calculateWidth() {
  console.log('Window resized')
  if (wrapperRef.value) {
    wrapperWidth.value = wrapperRef.value.clientWidth
    console.log('Wrapper width:', wrapperWidth.value)
  }
  calculateLayout()
}
async function scrolling() {
  if (isLoadingData.value) return
  if (
    document.documentElement.scrollTop + document.documentElement.clientHeight + 200 >
    parseInt(wrapperRef.value!.style.height)
  ) {
    isLoadingData.value = true
    await new Promise((resolve) => {
      setTimeout(() => {
        console.log('Load more articles')
        articleList.push(...someArticleArray)
        resolve(true)
      }, 0)
    })
    console.log(articleList)
    calculateLayout()
    isLoadingData.value = false
  }
}

onMounted(() => {
  calculateWidth()
  window.addEventListener('resize', calculateWidth)
  window.addEventListener('scroll', scrolling)
})
onBeforeUnmount(() => {
  console.log('Component is about to be unmounted')
  window.removeEventListener('resize', calculateWidth)
  window.removeEventListener('scroll', scrolling)
})
</script>

<template>
  <div ref="wrapperRef" class="article-wrapper">
    <div
      ref="articleListRef"
      class="active-item"
      v-for="(article, index) in articleList"
      :key="index"
    >
      <ArticleItem :title="article.title" :content="article.content" />
    </div>
    <ArticleItem :title="'123'" :content="'2'"></ArticleItem>
  </div>
</template>

<style scoped>
.article-wrapper {
  width: 100%;
  box-sizing: border-box;
  position: relative;
  min-height: 100vh;
  padding-left: 200px;
  padding-left: 0;
}
.active-item {
  position: absolute;
  height: 350px;
  background-color: #aaa;
}
</style>

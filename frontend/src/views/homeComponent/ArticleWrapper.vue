<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, reactive, nextTick } from 'vue';
import ArticleItem from './ArticleItem.vue';
import { API_BrowseArticle } from '@/api';

interface ArticleCard {
  article_id: string;
  title: string;
  author: {
    username: string;
    image: string;
  };
  likes: number;
  createdAt: string;
  image: string;
}

const wrapperRef = ref<HTMLDivElement | null>(null);
const wrapperWidth = ref(0);
const isLoadingData = ref(false);
const scrollLock = ref(false); // 🔒 防止重复触发
const articleList = reactive<ArticleCard[]>([]);
const start = ref(0);
const limit = 25;

const fetchArticles = async () => {
  isLoadingData.value = true;
  try {
    const res = await API_BrowseArticle({ sort_by: 'time', start: start.value, limit });
    if (res.success && res.data) {
      articleList.push(...res.data.articles);
      start.value += res.data.articles.length;
      await nextTick();
      waitForImagesAndLayout();
    }
  } catch (err) {
    console.error('Failed to fetch articles:', err);
  } finally {
    isLoadingData.value = false;
  }
};

function waitForImagesAndLayout() {
  const images = wrapperRef.value?.querySelectorAll('img');
  if (!images || images.length === 0) {
    calculateLayout();
    return;
  }

  let loaded = 0;
  const total = images.length;

  images.forEach((img) => {
    if ((img as HTMLImageElement).complete) {
      loaded++;
    } else {
      img.addEventListener('load', onImageLoad, { once: true });
      img.addEventListener('error', onImageLoad, { once: true });
    }
  });

  function onImageLoad() {
    loaded++;
    if (loaded === total) {
      calculateLayout();
    }
  }

  if (loaded === total) {
    calculateLayout();
  }
}

function calculateLayout() {
  if (!wrapperRef.value) return;
  const width = wrapperWidth.value;
  const distance = 20;
  let columnArr: number[] = [], itemWidth = 0;

  if (width > 990) {
    columnArr = [0, 0, 0, 0];
    itemWidth = (width - 3 * distance) / 4;
  } else if (width > 620) {
    columnArr = [0, 0, 0];
    itemWidth = (width - 2 * distance) / 3;
  } else {
    columnArr = [0, 0];
    itemWidth = (width - distance) / 2;
  }

  const children = Array.from(wrapperRef.value.childNodes).filter(
    (node) => node.nodeType === 1
  );

  for (let i of children as HTMLElement[]) {
    const smallestIndex = columnArr.indexOf(Math.min(...columnArr));
    i.style.width = itemWidth + 'px';
    i.style.left = itemWidth * smallestIndex + smallestIndex * distance + 'px';
    i.style.top = columnArr[smallestIndex] + 'px';
    columnArr[smallestIndex] += i.clientHeight + distance;
  }

  wrapperRef.value.style.height = Math.max(...columnArr) + 'px';
}

function calculateWidth() {
  if (wrapperRef.value) {
    wrapperWidth.value = wrapperRef.value.clientWidth;
  }
  calculateLayout();
}

async function handleScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const scrollHeight = document.documentElement.scrollHeight;
  const buffer = 450;

  if (scrollLock.value || isLoadingData.value) return;

  if (scrollTop + windowHeight >= scrollHeight - buffer) {
    scrollLock.value = true;
    await fetchArticles();
    setTimeout(() => {
      scrollLock.value = false;
    }, 150); // 可调整间隔时间
  }
}

onMounted(() => {
  calculateWidth();
  window.addEventListener('resize', calculateWidth);
  window.addEventListener('scroll', handleScroll);
  fetchArticles();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', calculateWidth);
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div ref="wrapperRef" class="article-wrapper">
    <div
      class="active-item"
      v-for="article in articleList"
      :key="article.article_id"
    >
      <ArticleItem
        :title="article.title"
        :author="article.author.username"
        :likes="article.likes"
        :created-at="article.createdAt"
        :image="article.image"
      />
    </div>
  </div>
</template>

<style scoped>
.article-wrapper {
  width: 100%;
  position: relative;
  min-height: 100vh;
}
.active-item {
  position: absolute;
  background-color: #f4f4f4;
}
</style>

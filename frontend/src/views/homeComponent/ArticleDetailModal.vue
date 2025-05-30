<template>
  <div class="article-detail-modal">
    <div class="card">
      <button class="close-btn" @click="$emit('close')">✖</button>

      <!-- Title -->
      <h2 class="title">{{ article.title }}</h2>

      <!-- Element Plus Carousel -->
      <el-carousel :interval="5000" arrow="always" height="450px" class="carousel">
        <el-carousel-item v-for="(img, idx) in article.image" :key="idx">
          <img
            :src="getImageUrl(img)"
            @error="(e: any) => (e.target.src = errorImage)"
            class="slide-img"
          />
        </el-carousel-item>
      </el-carousel>

      <!-- Meta Info -->
      <div class="meta">
        <img
          :src="article.author.image || errorImage"
          @error="(e: any) => (e.target.src = errorImage)"
          class="avatar"
        />
        <span>{{ article.author.username }}</span>
        <span class="date">{{ article.createdAt.slice(0, 10) }}</span>
      </div>

      <!-- Likes -->
      <p class="likes">❤️ {{ article.likes }}</p>

      <!-- Content -->
      <div class="content">{{ article.content || 'No content available.' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElCarousel, ElCarouselItem } from 'element-plus'
import 'element-plus/es/components/carousel/style/css'
import 'element-plus/es/components/carousel-item/style/css'

import errorImage from '@/assets/error.jpg'
import { API_GetArticleDetail } from '@/api'

const props = defineProps<{ articleId: string }>()

const article = ref({
  title: '',
  image: [] as string[],
  author: { username: '', image: '' },
  createdAt: '',
  likes: 0,
  content: '',
})

onMounted(async () => {
  const res = await API_GetArticleDetail(props.articleId)
  if (res.success) {
    article.value = res.data.article
  }
})

// 拼接图片完整地址
function getImageUrl(img: string) {
  return img ? `http://localhost:3000${img}` : errorImage
}
</script>

<style scoped>
.article-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  z-index: 999;
  overflow-y: auto;
  padding: 24px;
  box-sizing: border-box;
  margin-left: 200px;
}
@media screen and (max-width: 850px) {
  .article-detail-modal {
    margin-left: 16px;
    padding-right: 16px;
  }
}

.card {
  max-width: 720px;
  margin: 0 auto;
  position: relative;
  padding-bottom: 40px;
}

.close-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 50%;
  cursor: pointer;
  width: 32px;
  height: 32px;
  font-size: 18px;
  line-height: 30px;
  text-align: center;
  z-index: 1000;
}

.carousel {
  width: 100%;
  margin: 16px 0;
}

.slide-img {
  width: 100%;
  height: 450px;
  object-fit: cover;
  border-radius: 8px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.title {
  font-size: 24px;
  font-weight: bold;
}

.likes {
  font-size: 16px;
  margin: 8px 0;
  color: #e25555;
}

.content {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}
</style>

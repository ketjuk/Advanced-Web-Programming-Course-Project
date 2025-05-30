<template>
  <div class="article-detail-modal">
    <div class="card">
      <button class="close-btn" @click="$emit('close')">✖</button>

      <!-- 文章标题 -->
      <h2 class="title">{{ article?.title }}</h2>

      <!-- 图片轮播 -->
      <el-carousel :interval="5000" arrow="always" height="450px" class="carousel">
        <el-carousel-item v-for="(img, idx) in article?.image" :key="idx">
          <img :src="getImageUrl(img)" @error="onError" class="slide-img" />
        </el-carousel-item>
      </el-carousel>

      <!-- 作者信息 -->
      <div class="meta">
        <img :src="article?.author.image || errorImage" @error="onError" class="avatar" />
        <span class="username">{{ article?.author.username }}</span>
        <span class="date">{{ article?.createdAt.slice(0, 10) }}</span>
      </div>

      <!-- 点赞 -->
      <p class="likes">
        <el-button @click="toggleLike" type="danger" size="small">
          <span v-if="liked">❤️</span>
          <span v-else>🤍</span>
          {{ article?.likes }}
        </el-button>
      </p>

      <!-- 文章内容 -->
      <div class="content">{{ article?.author.username || 'No content available.' }}</div>

      <!-- 评论列表 -->
      <h3>Comments</h3>
      <div class="comment-list">
        <CommentItem
          v-for="comment in comments"
          :key="comment._id"
          :comment="comment"
          @deleted="fetchArticleDetail"
          @replied="fetchArticleDetail"
        />
      </div>

      <!-- 新增评论输入框 -->
      <div class="new-comment">
        <el-input v-model="newComment" placeholder="Add a comment..." @keyup.enter="submitComment" />
        <el-button type="primary" @click="submitComment" style="margin-top: 10px;">Post</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElInput, ElButton, ElCarousel, ElCarouselItem } from 'element-plus'
import CommentItem from './CommentItem.vue'
import errorImage from '@/assets/error.jpg'

import {
  API_GetArticleDetail,
  API_LikeArticle,
  API_UnlikeArticle,
  API_CreateComment
} from '@/api'

import type { ArticleDetailRes, BrowseCommentRes } from '../../../../backend/src/types/response'

const props = defineProps<{ articleId: string }>()

const article = ref<ArticleDetailRes['article'] | null>(null)
const comments = ref<BrowseCommentRes[]>([])
const liked = ref(false)
const newComment = ref('')

onMounted(() => {
  fetchArticleDetail()
})

async function fetchArticleDetail() {
  const res = await API_GetArticleDetail(props.articleId)
  if (res.success) {
    article.value = res.data.article
    comments.value = res.data.comments
    liked.value = res.data.liked
  }
}

function getImageUrl(img: string) {
  return img ? `http://127.0.0.1:3000${img}` : errorImage
}

function onError(e: any) {
  e.target.src = errorImage
}

async function toggleLike() {
  if (!article.value) return
  try {
    if (!liked.value) {
      await API_LikeArticle(props.articleId)
      article.value.likes++
      ElMessage.success('Liked successfully!')
    } else {
      await API_UnlikeArticle(props.articleId)
      article.value.likes--
      ElMessage.success('Unliked successfully!')
    }
    liked.value = !liked.value
  } catch (err: any) {
    ElMessage.error(err.message || 'Failed')
  }
}

async function submitComment() {
  if (!newComment.value.trim() || !article.value) return
  try {
    await API_CreateComment(props.articleId, newComment.value.trim())
    newComment.value = ''
    await fetchArticleDetail()
    ElMessage.success('Comment posted successfully!')
  } catch (err: any) {
    ElMessage.error(err.message || 'Failed')
  }
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
.carousel { width: 100%; margin: 16px 0; }
.slide-img { width: 100%; height: 450px; object-fit: cover; border-radius: 8px; }
.meta { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 16px; color: #666; }
.username, .date { font-weight: bold; font-size: 18px; }
.avatar { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
.title { font-size: 24px; font-weight: bold; }
.likes { font-size: 16px; margin: 8px 0; color: #e25555; }
.content { font-size: 15px; line-height: 1.6; color: #333; }
.comment-list { margin-top: 20px; }
.new-comment { margin-top: 20px; }
</style>

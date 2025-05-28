<template>
  <div class="user-page">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="articles.length === 0" class="no-posts">
      You haven't published any posts yet.
    </div>
    <div v-else class="articles-list">
      <div
        v-for="article in articles"
        :key="article.article_id"
        class="article-card"
        @click="openArticleDetail(article.article_id)"
      >
        <div class="article-image">
          <img :src="article.image || getDefaultImage()" :alt="article.title" />
        </div>
        <div class="article-content">
          <h2>{{ article.title }}</h2>
          <p class="date">{{ formatDate(article.createdAt) }}</p>
        </div>
      </div>
    </div>

    <!-- Article Detail Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-button" @click="closeModal">&times;</button>
        <div v-if="articleDetailLoading" class="loading">Loading...</div>
        <div v-else-if="articleDetailError" class="error">{{ articleDetailError }}</div>
        <div v-else-if="articleDetail" class="article-detail">
          <div class="article-image">
            <img :src="articleDetail.image || getDefaultImage()" :alt="articleDetail.title" />
          </div>
          <div class="article-info">
            <h2>{{ articleDetail.title }}</h2>
            <p class="date">{{ formatDate(articleDetail.createdAt) }}</p>
            <div class="article-content">
              <p>{{ articleDetail.content }}</p>
            </div>
            <div class="article-stats">
              <span class="likes">❤️ {{ articleDetail.likes }} likes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import axios from 'axios'

interface Article {
  article_id: string
  title: string
  createdAt: string
  image?: string
}

interface ArticleDetail {
  article_id: string
  title: string
  content: string
  createdAt: string
  image?: string
  likes: number
}

export default defineComponent({
  name: 'UserView',
  setup() {
    const articles = ref<Article[]>([])
    const loading = ref(true)
    const error = ref('')
    const showModal = ref(false)
    const articleDetail = ref<ArticleDetail | null>(null)
    const articleDetailLoading = ref(false)
    const articleDetailError = ref('')

    const fetchUserArticles = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          error.value = 'Please log in to view your posts'
          return
        }

        const response = await axios.get('http://localhost:3000/get_user_articles', {
          headers: {
            Authentication: token,
          },
        })

        if (response.data.success) {
          articles.value = response.data.data.articles
        } else {
          error.value = 'Failed to fetch articles'
        }
      } catch (err) {
        error.value = 'Error loading articles'
        console.error('Error fetching articles:', err)
      } finally {
        loading.value = false
      }
    }

    const fetchArticleDetail = async (articleId: string) => {
      articleDetailLoading.value = true
      articleDetailError.value = ''
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          articleDetailError.value = 'Please log in to view article details'
          return
        }

        const response = await axios.post(
          'http://localhost:3000/article_detail',
          { article_id: articleId },
          { headers: { Authentication: token } },
        )

        if (response.data.success) {
          articleDetail.value = response.data.data.article
        } else {
          articleDetailError.value = 'Failed to fetch article details'
        }
      } catch (err) {
        articleDetailError.value = 'Error loading article details'
        console.error('Error fetching article details:', err)
      } finally {
        articleDetailLoading.value = false
      }
    }

    const openArticleDetail = async (articleId: string) => {
      showModal.value = true
      await fetchArticleDetail(articleId)
    }

    const closeModal = () => {
      showModal.value = false
      articleDetail.value = null
    }

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    const getDefaultImage = () => {
      const randomNum = Math.floor(Math.random() * 8) + 1
      return `http://localhost:3000/upload/${randomNum}.jpg`
    }

    onMounted(() => {
      fetchUserArticles()
    })

    return {
      articles,
      loading,
      error,
      formatDate,
      getDefaultImage,
      showModal,
      articleDetail,
      articleDetailLoading,
      articleDetailError,
      openArticleDetail,
      closeModal,
    }
  },
})
</script>

<style scoped>
.user-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

.loading,
.error,
.no-posts {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #dc3545;
}

.articles-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.article-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-2px);
}

.article-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-content {
  padding: 15px;
}

.article-card h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2em;
}

.date {
  color: #666;
  font-size: 0.9em;
  margin: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 20px;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  z-index: 1;
}

.close-button:hover {
  color: #333;
}

.article-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  padding: 20px;
}

.article-detail .article-image {
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.article-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.article-info h2 {
  font-size: 1.8em;
  margin: 0;
}

.article-info .date {
  color: #666;
  font-size: 1em;
}

.article-info .article-content {
  font-size: 1.1em;
  line-height: 1.6;
  color: #333;
}

.article-stats {
  margin-top: 20px;
  color: #666;
}

.likes {
  font-size: 1.1em;
}

@media (max-width: 768px) {
  .article-detail {
    grid-template-columns: 1fr;
  }

  .article-detail .article-image {
    height: 300px;
  }
}
</style>

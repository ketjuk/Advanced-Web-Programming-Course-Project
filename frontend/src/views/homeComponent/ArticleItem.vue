<script setup lang="ts">
const props = defineProps<{
  title: string
  author: string
  authorAvatar: string
  likes: number
  createdAt: string
  coverImage: string
}>()

// 获取随机默认图片
const getRandomImage = () => {
  const randomNum = Math.floor(Math.random() * 8) + 1
  return `http://localhost:3000/uploads/${randomNum}.jpg`
}

// 封面图加载失败处理
const handleCoverError = (e: Event) => {
  const target = e.target as HTMLImageElement
  const randomNum = Math.floor(Math.random() * 8) + 1
  const timestamp = Date.now()
  target.src = `http://localhost:3000/uploads/${randomNum}.jpg?retry=${timestamp}`
}

// 头像加载失败处理
const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  const randomNum = Math.floor(Math.random() * 8) + 1
  const timestamp = Date.now()
  target.src = `http://localhost:3000/uploads/${randomNum}.jpg?retry=${timestamp}`
}
</script>

<template>
  <div class="article-item" @click="$emit('click')">
    <!-- 封面图 -->
    <img
      :src="`http://localhost:3000${coverImage}`"
      alt="cover"
      class="cover"
      @error="handleCoverError"
    />

    <!-- 标题 -->
    <div class="title">{{ title }}</div>

    <!-- 信息栏 -->
    <div class="info-bar">
      <div class="author-info">
        <img
          :src="authorAvatar ? `http://localhost:3000${authorAvatar}` : getRandomImage()"
          alt="avatar"
          class="avatar"
          @error="handleAvatarError"
        />
        <span class="author-name">{{ author }}</span>
      </div>
      <div class="likes">❤️ {{ likes }}</div>
      <div class="date">{{ new Date(createdAt).toLocaleDateString() }}</div>
    </div>
  </div>
</template>

<style scoped>
.article-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  box-sizing: border-box;
}

.cover {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 6px;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 8px 0 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
}
</style>

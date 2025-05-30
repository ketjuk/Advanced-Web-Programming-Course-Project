<script setup lang="ts">
const props = defineProps<{
  title: string
  author: string
  authorAvatar: string
  likes: number
  createdAt: string
  coverImage: string
}>()
</script>

<template>
  <div class="article-item" @click="$emit('click')">
    <!-- Cover image -->
    <img
      :src="`http://localhost:3000${coverImage}` || '/default-cover.png'"
      alt="cover"
      class="cover"
    />

    <!-- Title -->
    <div class="title">{{ title }}</div>

    <!-- Info bar -->
    <div class="info-bar">
      <div class="author-info">
        <img :src="authorAvatar || '/default-avatar.png'" alt="avatar" class="avatar" />
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

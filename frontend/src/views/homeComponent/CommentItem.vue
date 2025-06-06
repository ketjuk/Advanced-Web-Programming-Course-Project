<template>
  <div class="comment-item">
    <!-- 一级评论 -->
    <div class="comment-header">
      <img :src="comment.author.image || errorImage" class="avatar" @error="onError" />
      <span>{{ comment.author.username }}</span>
      <span class="date">{{ comment.createdAt.slice(0, 10) }}</span>
      <el-button v-if="comment.isMine" @click="deleteComment" type="danger" size="small">Delete</el-button>
    </div>

    <div class="comment-content">{{ comment.content }}</div>

    <!-- 回复框 -->
    <div v-if="replying" class="reply-box">
      <el-input v-model="replyContent" placeholder="Write a reply..." @keyup.enter="submitReply" />
      <el-button type="primary" @click="submitReply" size="small">Reply</el-button>
      <el-button @click="replying = false" type="info" size="small">Cancel</el-button>
    </div>

    <el-button v-else @click="replying = true" type="text" size="small">Reply</el-button>

    <!-- 二级评论 -->
    <div class="replies">
      <div class="reply-item" v-for="reply in comment.replies" :key="reply._id">
        <img :src="reply.author.image || errorImage" class="avatar" @error="onError" />
        <span class="author" style="margin-right: 5px;">{{ reply.author.username }}</span>
        <span class="date">{{ reply.createdAt.slice(0, 10) }}</span>
        <div class="reply-content">{{ reply.content }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import errorImage from '@/assets/error.jpg'

import { API_DeleteComment, API_CreateReply } from '@/api'
import type { BrowseCommentRes } from '../../../../backend/src/types/response'

const props = defineProps<{ comment: BrowseCommentRes }>()
const emit = defineEmits(['deleted', 'replied'])

const replying = ref(false)
const replyContent = ref('')

function onError(e: any) {
  e.target.src = errorImage
}

async function deleteComment() {
  try {
    await API_DeleteComment(props.comment._id)
    ElMessage.success('Deleted')
    emit('deleted')  // 通知父组件刷新
  } catch (err: any) {
    ElMessage.error(err?.message || 'Failed')
  }
}

async function submitReply() {
  if (!replyContent.value.trim()) return
  try {
    await API_CreateReply(props.comment._id, replyContent.value.trim())
    replyContent.value = ''
    replying.value = false
    ElMessage.success('Replied!')
    emit('replied')  // 通知父组件刷新
  } catch (err: any) {
    ElMessage.error(err?.message || 'Failed')
  }
}
</script>

<style scoped>
.comment-item {
  border: 1px solid #eee;
  padding: 10px;
  margin: 10px 0;
  border-radius: 6px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  margin: 10px 0;
  font-size: 15px;
}

.reply-box {
  margin-top: 8px;
}

.replies {
  margin-left: 30px;
  margin-top: 10px;
}

.reply-item {
  border-top: 1px dashed #ddd;
  padding-top: 5px;
  margin-top: 5px;
}

.reply-content {
  margin-left: 30px;
  font-size: 14px;
}

.author {
  font-weight: bold;
}
</style>

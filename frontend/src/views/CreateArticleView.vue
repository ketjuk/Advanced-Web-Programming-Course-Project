<template>
  <div class="max-w-2xl mx-auto p-4">

    <el-card>
      <template #header>Create New Article</template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" status-icon>
        <el-form-item label="Title" prop="title">
          <el-input v-model="form.title" placeholder="Enter article title" />
        </el-form-item>

        <el-form-item label="Category" prop="category">
          <el-input v-model="form.category" placeholder="Enter category tag" />
        </el-form-item>

        <el-form-item label="Content" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="Enter article content"
          />
        </el-form-item>

        <!-- 完整上传组件 -->
        <el-form-item label="Images">
          <el-upload
            class="upload-demo"
            action=""
            list-type="picture-card"
            :file-list="fileList"
            :http-request="customUpload"
            :on-remove="handleRemove"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="submitForm">Submit</el-button>
          <el-button @click="resetForm">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElMessage, UploadRequestOptions } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { API_CreateArticle, API_UploadFile, API_DeleteFile } from '@/api'
import type { CreateArticleBody } from '../../../backend/src/types/request'

const router = useRouter()

// 表单初始化
const form = ref<CreateArticleBody>({
  title: '',
  category: '',
  content: '',
  image: []
})

// 核心 fileList，统一绑定
const fileList = ref<{ name: string; url: string }[]>([])

// 表单校验规则
const rules = {
  title: [{ required: true, message: 'Title is required', trigger: 'blur' }],
  category: [{ required: true, message: 'Category is required', trigger: 'blur' }],
  content: [{ required: true, message: 'Content is required', trigger: 'blur' }],
}

const formRef = ref<InstanceType<typeof ElForm>>()
const loading = ref(false)

// 提交逻辑
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await API_CreateArticle(form.value)
        if (res.success) {
          ElMessage.success('Article created successfully!')
          router.push('/')
        } else {
          ElMessage.error(res.error || 'Article creation failed')
        }
      } catch {
        ElMessage.error('Request failed. Please try again.')
      } finally {
        loading.value = false
      }
    }
  })
}

// 重置逻辑
const resetForm = () => {
  form.value = { title: '', category: '', content: '', image: [] }
  fileList.value = []
}


// 上传逻辑：上传成功后手动同步 fileList & form.image
const customUpload = async (options: UploadRequestOptions) => {
  const { file, onSuccess, onError } = options

  try {
    const res = await API_UploadFile(file as File)
    if (res.success) {
      const url = res.data.file_url
      console.log('File uploaded successfully:', url)
      /* --- 关键一行：把当前 file 的 url 改成服务器返回的 url --- */
      ;(file as any).url = url

      fileList.value.push({ name: file.name, url })
      form.value.image?.push(url)

      onSuccess?.(res, file as any)
    } else {
      ElMessage.error(res.error || 'File upload failed')
      onError?.(new Error(res.error))
    }
  } catch (err) {
    ElMessage.error('File upload error')
    onError?.(err as Error)
  }
}

const handleRemove = async (file: any) => {
  const idx = fileList.value.findIndex(f => f.name === file.name)   // 用 name 或 uid
  console.log('Removing file at index:', fileList.value, file.url)

  if (idx !== -1) {
    try {
      const res = await API_DeleteFile(fileList.value[idx].url)      // 传真正的服务器 url
      if (res.success) {
        fileList.value.splice(idx, 1)
        form.value.image?.splice(idx, 1)
      } else {
        ElMessage.error(res.error || 'File deletion failed')
      }
    } catch {
      ElMessage.error('Server deletion failed')
    }
  }
}

</script>




<style scoped>
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}
.image-item {
  position: relative;
}
.preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 6px;
}
</style>

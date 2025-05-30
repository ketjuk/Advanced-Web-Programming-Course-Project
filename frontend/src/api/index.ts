import axios from 'axios'
import type {
  DeleteFileBody,
  UploadFileBody,
  ArticleDetailBody,
  BrowseArticleBody,
  CreateArticleBody,
  LoginBody,
  SignupBody,
  CreateCommentBody,
  DeleteCommentBody,
  CreateReplyBody,
  LikeArticleBody,
  UnlikeArticleBody
} from '../../../backend/src/types/request'

import type {
  DeleteFileRessponse,
  UploadFileResponse,
  ArticleDetailResponse,
  BrowseArticlesResponse,
  CreateArticleResponse,
  APIResponse,
  CodeResponse,
  LoginResponse,
  SignupResponse,
  CreateCommentResponse,
  DeleteCommentResponse,
  CommentReplyResponse,
  LikeArticleResponse,
  UnlikeArticleResponse,
} from '../../../backend/src/types/response'

// 配置 axios 实例
const API_URL = 'http://127.0.0.1:3000/'

const logRequest = (config: any) => {
  console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || '')
  return config
}

const logResponse = (response: any) => {
  console.log(`Response: ${response.status} ${response.config.url}`, response.data)
  return response
}

const logError = (error: any) => {
  const res = error.response
  console.error('API Error:', res?.status, res?.data || error.message)
  return Promise.resolve(res)
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authentication'] = token
  }
  return logRequest(config)
}, logError)

api.interceptors.request.use(logRequest, logError)
api.interceptors.response.use(logResponse, logError)

// 登录注册
export const API_Login = async (data: LoginBody): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/log_in', data)
  return response.data
}

export const API_Signup = async (data: SignupBody): Promise<SignupResponse> => {
  const response = await api.post<SignupResponse>('/sign_up', data)
  return response.data
}

export const API_GetCode = async (): Promise<CodeResponse> => {
  const response = await api.get<CodeResponse>('/request_code')
  return response.data
}

// 文章接口
export const API_CreateArticle = async (data: CreateArticleBody): Promise<CreateArticleResponse> => {
  const response = await api.post<CreateArticleResponse>('/create_article', data)
  return response.data
}

export const API_BrowseArticle = async (
  body: BrowseArticleBody
): Promise<BrowseArticlesResponse> => {
  const response = await api.post<BrowseArticlesResponse>('/browse_article', body)
  return response.data
}

export const API_GetArticleDetail = async (
  article_id: string
): Promise<ArticleDetailResponse> => {
  const response = await api.post<ArticleDetailResponse>('/article_detail', {
    article_id,
  } as ArticleDetailBody)
  return response.data
}

// 文件上传删除
export const API_UploadFile = async (file: File): Promise<UploadFileResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<UploadFileResponse>('/upload_file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const API_DeleteFile = async (file_url: string): Promise<DeleteFileRessponse> => {
  const response = await api.delete<DeleteFileRessponse>('/delete_file', { data: { file_url } })
  return response.data
}

// 点赞接口
export const API_LikeArticle = async (article_id: string): Promise<LikeArticleResponse> => {
  const body: LikeArticleBody = { article_id }
  const response = await api.post<LikeArticleResponse>('/like_article', body)
  return response.data
}

export const API_UnlikeArticle = async (article_id: string): Promise<UnlikeArticleResponse> => {
  const body: UnlikeArticleBody = { article_id }
  const response = await api.post<UnlikeArticleResponse>('/unlike_article', body)
  return response.data
}

// 评论接口
export const API_CreateComment = async (
  article_id: string,
  content: string
): Promise<CreateCommentResponse> => {
  const body: CreateCommentBody = { article_id, content }
  const response = await api.post<CreateCommentResponse>('/create_comment', body)
  return response.data
}

export const API_DeleteComment = async (comment_id: string): Promise<DeleteCommentResponse> => {
  const body: DeleteCommentBody = { comment_id }
  const response = await api.post<DeleteCommentResponse>('/delete_comment', body)
  return response.data
}

export const API_CreateReply = async (
  comment_id: string,
  content: string
): Promise<CommentReplyResponse> => {
  const body: CreateReplyBody = { comment_id, content }
  const response = await api.post<CommentReplyResponse>('/create_reply', body)
  return response.data
}

// 获取评论列表（注意：你需要提供这个接口）
export const API_GetComments = async (article_id: string): Promise<ArticleDetailResponse> => {
  const response = await api.post<ArticleDetailResponse>('/article_detail', { article_id })
  return response.data
}

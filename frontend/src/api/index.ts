import axios from 'axios';


import type {DeleteFileBody, UploadFileBody,ArticleDetailBody,BrowseArticleBody ,CreateArticleBody,LoginBody, SignupBody } from '../../../backend/src/types/request';
import type {DeleteFileRessponse,UploadFileResponse,ArticleDetailResponse,BrowseArticlesResponse,CreateArticleResponse, APIResponse, CodeResponse, LoginResponse, SignupResponse } from '../../../backend/src/types/response';
const API_URL = 'http://127.0.0.1:3000/';


// Create request/response logger
const logRequest = (config: any) => {
  console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
  return config;
};

const logResponse = (response: any) => {
  console.log(`Response: ${response.status} ${response.config.url}`, response.data);
  return response;
};

const logError = (error: any) => {
  const res = error.response;
  console.error('API Error:', res?.status, res?.data || error.message);
  return Promise.resolve(res); // 返回整个 response，让调用方能拿到 data
};


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authentication'] = token;
  }
  return logRequest(config);
}, logError);
// Add request/response logging
api.interceptors.request.use(logRequest, logError);
api.interceptors.response.use(logResponse, logError);

export const API_Login = async (data: LoginBody): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/log_in', data);
  console.log('Login response:', response);
  return response.data
};

export const API_Signup = async (data: SignupBody): Promise<SignupResponse> => {
  const response = await api.post<SignupResponse>('/sign_up', data);
  return response.data;
}
export const API_GetCode = async (): Promise<CodeResponse> => {
  const response = await api.get<CodeResponse>('/request_code');
  return response.data;
}

export const API_CreateArticle = async (data: CreateArticleBody): Promise<CreateArticleResponse> => {
  const response = await api.post<CreateArticleResponse>('/create_article', data);
  return response.data;
};

export const API_BrowseArticle = async (
  body: BrowseArticleBody
): Promise<BrowseArticlesResponse> => {
  const response = await api.post<BrowseArticlesResponse>('/browse_article', body);
  return response.data;
};

export const API_GetArticleDetail = async (
  article_id: string
): Promise<ArticleDetailResponse> => {
  const response = await api.post<ArticleDetailResponse>('/article_detail', {
    article_id,
  } as ArticleDetailBody);
  return response.data;
};

export const API_UploadFile = async (file: File): Promise<UploadFileResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<UploadFileResponse>('/upload_file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const API_DeleteFile = async (file_url: string): Promise<DeleteFileRessponse> => {
  const response = await api.delete<DeleteFileRessponse>('/delete_file', { data: { file_url } })
  return response.data
}



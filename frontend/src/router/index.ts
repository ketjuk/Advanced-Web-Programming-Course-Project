import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ArticleHome from '@/views/homeComponent/ArticleHome.vue'
import CreateArticleView from '@/views/CreateArticleView.vue'
import NotificationView from '@/views/NotificationView.vue'
import UserView from '@/views/User.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      children: [
        {
          path: '',
          name: 'article-home',
          component: ArticleHome,
        },
        {
          path: 'create',
          name: 'create-article',
          component: CreateArticleView,
        },
        {
          path: 'notification',
          name: 'notification',
          component: NotificationView,
        },
        {
          path: 'user',
          name: 'user',
          component: UserView,
        },
      ],
    },
  ],
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import PageLogin from  '@/components/Login/PageLogin.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: PageLogin
    },
  ],
})

export default router

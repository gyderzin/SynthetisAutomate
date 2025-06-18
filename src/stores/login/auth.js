import { defineStore } from 'pinia'
import api from '@/service/http.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: null,
    token: localStorage.getItem('token') || '',
    error: '',
  }),
  actions: {
    async login(username,password) {
      try {
        const params = new URLSearchParams()
        params.append('username', username)
        params.append('password', password)
        const response = await api.post('/auth/login', params)

        this.token = response.data.access_token
        localStorage.setItem('token', this.token)

        this.error = ''
        return true
      } catch (err) {
        console.log('Erro de login: ' + err)
        this.error = 'Usuário ou senha inválidos'
        return false
      }
    },
  },
})

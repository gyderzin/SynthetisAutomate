<template>
  <div class="login-wrapper">
    <v-card class="login-card" elevation="10">
      <!-- Centralização manual da imagem -->
      <div class="centralizar-div">
        <v-img src="/logo-jirau.png" alt="Logo Jirau" class="logo-img" cover />
      </div>

      <v-card-text>
        <v-form @submit.prevent="handleLogin" ref="form">
          <v-text-field v-model="username" label="Usuário" prepend-icon="mdi-account" required
            class="mb-4"></v-text-field>

          <v-text-field v-model="password" label="Senha" type="password" prepend-icon="mdi-lock" required
            class="mb-4"></v-text-field>

          <v-btn type="submit" color="primary" block size="large">
            Entrar
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/login/auth';
export default {
  data: () => ({
    username: '',
    password: ''
  }),
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
  methods: {
    async handleLogin() {
      await this.auth.login(this.username, this.password).then((payload) => {
        if(payload) {
          console.log('true')
        } else {
          console.log('false')
        }
      })
      if (this.auth.token) {
        console.log('Token JWT:', this.auth.token);
        alert('logado com sucesso')
        // Redirecionar para rota protegida, etc.
      } else {
        console.log(this.auth.error);
      }
    },
  }
}
</script>

<style scoped>
.login-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 420px;
  min-width: 320px;
  padding: 1.5rem 1.2rem;
  border-radius: 12px;
}

.centralizar-div {
  display: flex;
  justify-content: center;
}

/* Imagem responsiva */
.logo-img {
  max-width: 200px;
  width: 100%;
  height: auto;
  margin-bottom: 1rem;
}
</style>

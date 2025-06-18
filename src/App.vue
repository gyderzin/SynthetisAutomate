<script setup>
import {RouterView } from 'vue-router'
</script>

<template>
  <v-container>
    <RouterView />
  </v-container>
</template>


<style>
/* Importando as fontes */
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');

/* Aplicando as fontes globais */
body {
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
  color: #222;
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
}

/* Estilizando títulos com fonte elegante */
h1, h2, h3, h4, h5, h6 {
  font-family: 'DM Serif Display', serif;
  font-weight: normal;
  margin: 0.5em 0;
  color: #111;
}

/* Estilizando botões (opcional) */
button {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
}

/* Estilização para inputs também usarem Inter */
input, textarea, select {
  font-family: 'Inter', sans-serif;
}
</style>

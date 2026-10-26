import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { setupHttpInterceptors } from './api/setupHttpInterceptors'
import router from './router'

const app = createApp(App)

app.use(createPinia())
setupHttpInterceptors()
app.use(router)

app.mount('#app')

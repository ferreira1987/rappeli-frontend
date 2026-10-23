import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import {
  fetchCsrfCookie,
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  registerRequest,
} from '@/api/auth'
import type { LoginCredentials, RegisterCredentials, User } from '@/types/auth'
import { getErrorMessage } from '@/utils/errors'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const bootstrapped = ref(false)
  const loading = ref(false)
  const lastError = ref<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null)

  async function bootstrap(): Promise<void> {
    if (bootstrapped.value) {
      return
    }

    try {
      user.value = await fetchCurrentUser()
    } catch {
      user.value = null
    } finally {
      bootstrapped.value = true
    }
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    loading.value = true
    lastError.value = null

    try {
      await fetchCsrfCookie()
      await loginRequest(credentials)
      user.value = await fetchCurrentUser()
    } catch (error) {
      user.value = null
      lastError.value = getErrorMessage(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function register(credentials: RegisterCredentials): Promise<void> {
    loading.value = true
    lastError.value = null

    try {
      user.value = await registerRequest(credentials)
      bootstrapped.value = true
    } catch (error) {
      user.value = null
      lastError.value = getErrorMessage(error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    loading.value = true
    lastError.value = null

    try {
      await fetchCsrfCookie()
      await logoutRequest()
    } catch {
      // Session may already be gone; still clear local state.
    } finally {
      user.value = null
      loading.value = false
    }
  }

  return {
    user,
    bootstrapped,
    loading,
    lastError,
    isAuthenticated,
    bootstrap,
    login,
    register,
    logout,
  }
})

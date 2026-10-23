import { http } from '@/api/http'
import type { LoginCredentials, User } from '@/types/auth'

export async function fetchCsrfCookie(): Promise<void> {
  await http.get('/sanctum/csrf-cookie')
}

export async function loginRequest(credentials: LoginCredentials): Promise<void> {
  await http.post('/api/login', {
    email: credentials.email,
    password: credentials.password,
    remember: credentials.remember ?? false,
  })
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await http.get<User>('/api/me')
  return data
}

export async function logoutRequest(): Promise<void> {
  await http.post('/api/logout')
}

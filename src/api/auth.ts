import { http } from '@/api/http'
import type { LoginCredentials, RegisterCredentials, User } from '@/types/auth'

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
  const { data } = await http.get<{ user: User }>('/api/me')
  return data.user
}

export async function logoutRequest(): Promise<void> {
  await http.post('/api/logout')
}

export async function registerRequest(credentials: RegisterCredentials): Promise<User> {
  await fetchCsrfCookie()
  const { data } = await http.post<{ user: User }>('/api/register', {
    name: credentials.name,
    email: credentials.email,
    password: credentials.password,
    password_confirmation: credentials.password_confirmation,
    terms_accepted: credentials.terms_accepted,
  })
  return data.user
}

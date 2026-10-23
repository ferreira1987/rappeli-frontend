import { http } from '@/api/http'
import type { LoginCredentials, RegisterCredentials, User } from '@/types/auth'

// TODO(backend): implement POST /api/register in rappeli-backend (Sanctum-compatible payload).

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

export async function registerRequest(credentials: RegisterCredentials): Promise<void> {
  await fetchCsrfCookie()
  await http.post('/api/register', {
    name: credentials.name,
    email: credentials.email,
    password: credentials.password,
    password_confirmation: credentials.password_confirmation,
  })
}

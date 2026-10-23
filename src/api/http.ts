import axios from 'axios'

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match?.[1] != null ? decodeURIComponent(match[1]) : null
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

http.interceptors.request.use((config) => {
  const xsrf = readCookie('XSRF-TOKEN')
  if (xsrf) {
    config.headers['X-XSRF-TOKEN'] = xsrf
  }
  return config
})

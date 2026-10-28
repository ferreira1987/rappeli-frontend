import axios from 'axios'

export function getApiErrorCode(error: unknown): string | null {
  if (!axios.isAxiosError(error)) {
    return null
  }
  const code = (error.response?.data as { code?: string })?.code
  return typeof code === 'string' ? code : null
}

export function getValidationErrors(error: unknown): Record<string, string> | null {
  if (!axios.isAxiosError(error) || error.response?.status !== 422) {
    return null
  }

  const errors = (error.response.data as { errors?: Record<string, string[]> })?.errors
  if (!errors) {
    return null
  }

  const mapped: Record<string, string> = {}
  for (const [field, messages] of Object.entries(errors)) {
    const first = messages?.[0]
    if (first) {
      mapped[field] = first
    }
  }

  return Object.keys(mapped).length > 0 ? mapped : null
}

const GENERIC_SERVER_MESSAGES = [/^server error$/i, /^internal server error$/i]

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> }

    if (status === 500) {
      return 'Ocorreu um erro no servidor. Tente novamente em instantes.'
    }

    if (data?.message) {
      const message = data.message
      if (GENERIC_SERVER_MESSAGES.some((pattern) => pattern.test(message.trim()))) {
        return 'Ocorreu um erro no servidor. Tente novamente em instantes.'
      }
      return data.message
    }
    const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0]
    if (firstFieldError) {
      return firstFieldError
    }
    if (status === 422) {
      return 'Verifique os dados informados e tente novamente.'
    }
    if (status === 401) {
      return 'E-mail ou senha inválidos.'
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Não foi possível concluir a operação. Tente novamente.'
}

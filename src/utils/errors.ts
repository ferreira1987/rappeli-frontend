import axios from 'axios'

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

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> }
    if (data?.message) {
      return data.message
    }
    const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0]
    if (firstFieldError) {
      return firstFieldError
    }
    if (error.response?.status === 422) {
      return 'Verifique os dados informados e tente novamente.'
    }
    if (error.response?.status === 401) {
      return 'E-mail ou senha inválidos.'
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Não foi possível concluir a operação. Tente novamente.'
}

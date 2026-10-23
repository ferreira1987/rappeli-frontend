import axios from 'axios'

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

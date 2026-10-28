import type { User } from '@/types/auth'

export function isCompanyAdministrator(user: User | null | undefined): boolean {
  return user?.role === 'administrador'
}

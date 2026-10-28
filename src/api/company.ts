import { http } from '@/api/http'
import { unwrapData } from '@/api/resource'
import type { Company, CompanyUpdatePayload } from '@/types/company'

export async function fetchCompany(): Promise<Company> {
  const { data } = await http.get<unknown>('/api/company')
  return unwrapData<Company>(data)
}

export async function updateCompany(payload: CompanyUpdatePayload): Promise<Company> {
  const form = new FormData()
  form.append('name', payload.name.trim())
  form.append('cnpj', payload.cnpj.replace(/\D/g, ''))
  form.append('phone', payload.phone.replace(/\D/g, ''))
  if (payload.logo) {
    form.append('logo', payload.logo)
  }

  const { data } = await http.put<unknown>('/api/company', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapData<Company>(data)
}

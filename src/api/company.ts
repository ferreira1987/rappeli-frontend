import { http } from '@/api/http'
import type { Company, CompanyResponse, CompanyUpdatePayload } from '@/types/company'

function parseCompanyResponse(data: CompanyResponse): Company | null {
  if (data && typeof data === 'object' && 'company' in data && data.company === null) {
    return null
  }
  return data as Company
}

export async function fetchCompany(): Promise<Company | null> {
  const { data } = await http.get<CompanyResponse>('/api/company')
  return parseCompanyResponse(data)
}

export async function updateCompany(payload: CompanyUpdatePayload): Promise<Company> {
  const form = new FormData()
  form.append('name', payload.name.trim())
  form.append('cnpj', payload.cnpj.replace(/\D/g, ''))
  form.append('phone', payload.phone.replace(/\D/g, ''))
  if (payload.logo) {
    form.append('logo', payload.logo)
  }

  const { data } = await http.put<Company>('/api/company', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export type Company = {
  id: number
  name: string
  cnpj: string | null
  phone: string | null
  logo_url: string | null
}

export type CompanyUpdatePayload = {
  name: string
  cnpj: string
  phone: string
  logo?: File | null
}

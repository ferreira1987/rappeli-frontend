export interface Contact {
  id: number
  phone: string
  display_name: string | null
  marketing_opt_in: boolean
  created_at?: string | null
}

export interface ContactImportResult {
  created: number
  updated: number
  skipped: number
}

export interface StoreContactPayload {
  phone: string
  display_name?: string | null
  marketing_opt_in?: boolean
}

export interface UpdateContactPayload {
  phone?: string
  display_name?: string | null
  marketing_opt_in?: boolean
}

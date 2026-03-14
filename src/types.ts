export type IdentifierType = 'NIF' | 'NIE' | 'CIF' | 'IBAN' | 'AUTO'

export interface ValidationItem {
  value: string
  type: IdentifierType
}

export interface ValidationResult {
  valid: boolean
  type: IdentifierType
  input: string
  formatted: string | null
  errors: string[]
  /** Solo presente en CIF válidos */
  entity_type?: string
}

export interface BatchResult {
  index: number
  value: string
  requested_type: IdentifierType
  detected_type: IdentifierType
  valid: boolean
  formatted: string | null
  errors: string[]
  entity_type?: string
}

export interface BatchResponse {
  total: number
  valid_count: number
  invalid_count: number
  results: BatchResult[]
}

export interface TrialResponse {
  total: number
  valid_count: number
  invalid_count: number
  results: ValidationResult[]
}

export interface ValixOptions {
  apiKey: string
  /** Por defecto: https://api.getvalix.io */
  baseUrl?: string
}

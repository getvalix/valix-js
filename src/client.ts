import { ValixError, ValixRateLimitError, ValixAuthError } from './errors.js'
import type {
  ValixOptions,
  ValidationItem,
  IdentifierType,
  BatchResponse,
} from './types.js'

const DEFAULT_BASE_URL = 'https://api.getvalix.io'

export class Valix {
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor(options: ValixOptions) {
    this.apiKey = options.apiKey
    this.baseUrl = options.baseUrl?.replace(/\/$/, '') ?? DEFAULT_BASE_URL
  }

  /**
   * Valida un único identificador fiscal con detección automática de tipo.
   */
  async validate(value: string): Promise<BatchResponse['results'][0]> {
    const response = await this.batch([{ value, type: 'AUTO' }])
    return response.results[0]
  }

  /**
   * Valida hasta 100 identificadores en una sola llamada.
   */
  async batch(items: ValidationItem[]): Promise<BatchResponse> {
    return this.post<BatchResponse>('/v1/validate/batch', { items })
  }

  /** Valida un NIF (persona física española). */
  async validateNIF(value: string): Promise<BatchResponse['results'][0]> {
    const response = await this.batch([{ value, type: 'NIF' }])
    return response.results[0]
  }

  /** Valida un NIE (extranjero residente en España). */
  async validateNIE(value: string): Promise<BatchResponse['results'][0]> {
    const response = await this.batch([{ value, type: 'NIE' }])
    return response.results[0]
  }

  /** Valida un CIF (persona jurídica española). */
  async validateCIF(value: string): Promise<BatchResponse['results'][0]> {
    const response = await this.batch([{ value, type: 'CIF' }])
    return response.results[0]
  }

  /** Valida un IBAN español (ES + 22 dígitos). */
  async validateIBAN(value: string): Promise<BatchResponse['results'][0]> {
    const response = await this.batch([{ value, type: 'IBAN' }])
    return response.results[0]
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      await this.handleError(response)
    }

    return response.json() as Promise<T>
  }

  private async handleError(response: Response): Promise<never> {
    if (response.status === 401 || response.status === 403) {
      throw new ValixAuthError()
    }
    if (response.status === 429) {
      throw new ValixRateLimitError()
    }
    let code = 'UNKNOWN_ERROR'
    let message = `Error ${response.status}`
    try {
      const body = (await response.json()) as { code?: string; error?: string }
      if (body.code) code = body.code
      if (body.error) message = body.error
    } catch {}
    throw new ValixError(message, code, response.status)
  }
}

/**
 * Valida hasta 5 identificadores sin necesidad de API key.
 * Límite de 50 validaciones por día por IP.
 */
export async function trial(
  items: Array<{ value: string; type?: IdentifierType }>,
  baseUrl = DEFAULT_BASE_URL
) {
  const normalizedItems = items.map((item) => ({
    value: item.value,
    type: item.type ?? 'AUTO',
  }))

  const response = await fetch(
    `${baseUrl.replace(/\/$/, '')}/v1/validate/trial`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: normalizedItems }),
    }
  )

  if (response.status === 429) throw new ValixRateLimitError()

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      code?: string
      error?: string
    }
    throw new ValixError(
      body.error ?? `Error ${response.status}`,
      body.code ?? 'UNKNOWN_ERROR',
      response.status
    )
  }

  return response.json()
}

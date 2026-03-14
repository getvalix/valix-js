export class ValixError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number
  ) {
    super(message)
    this.name = 'ValixError'
  }
}

export class ValixRateLimitError extends ValixError {
  constructor() {
    super(
      'Límite diario de prueba alcanzado. Suscríbete en https://getvalix.es para acceso ilimitado.',
      'RATE_LIMIT_EXCEEDED',
      429
    )
    this.name = 'ValixRateLimitError'
  }
}

export class ValixAuthError extends ValixError {
  constructor() {
    super('API key inválida o ausente.', 'UNAUTHORIZED', 401)
    this.name = 'ValixAuthError'
  }
}

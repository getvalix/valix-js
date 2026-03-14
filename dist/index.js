// src/errors.ts
var ValixError = class extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "ValixError";
  }
};
var ValixRateLimitError = class extends ValixError {
  constructor() {
    super(
      "L\xEDmite diario de prueba alcanzado. Suscr\xEDbete en https://getvalix.es para acceso ilimitado.",
      "RATE_LIMIT_EXCEEDED",
      429
    );
    this.name = "ValixRateLimitError";
  }
};
var ValixAuthError = class extends ValixError {
  constructor() {
    super("API key inv\xE1lida o ausente.", "UNAUTHORIZED", 401);
    this.name = "ValixAuthError";
  }
};

// src/client.ts
var DEFAULT_BASE_URL = "https://api.getvalix.io";
var Valix = class {
  constructor(options) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl?.replace(/\/$/, "") ?? DEFAULT_BASE_URL;
  }
  /**
   * Valida un único identificador fiscal con detección automática de tipo.
   */
  async validate(value) {
    const response = await this.batch([{ value, type: "AUTO" }]);
    return response.results[0];
  }
  /**
   * Valida hasta 100 identificadores en una sola llamada.
   */
  async batch(items) {
    return this.post("/v1/validate/batch", { items });
  }
  /** Valida un NIF (persona física española). */
  async validateNIF(value) {
    const response = await this.batch([{ value, type: "NIF" }]);
    return response.results[0];
  }
  /** Valida un NIE (extranjero residente en España). */
  async validateNIE(value) {
    const response = await this.batch([{ value, type: "NIE" }]);
    return response.results[0];
  }
  /** Valida un CIF (persona jurídica española). */
  async validateCIF(value) {
    const response = await this.batch([{ value, type: "CIF" }]);
    return response.results[0];
  }
  /** Valida un IBAN español (ES + 22 dígitos). */
  async validateIBAN(value) {
    const response = await this.batch([{ value, type: "IBAN" }]);
    return response.results[0];
  }
  async post(path, body) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      await this.handleError(response);
    }
    return response.json();
  }
  async handleError(response) {
    if (response.status === 401 || response.status === 403) {
      throw new ValixAuthError();
    }
    if (response.status === 429) {
      throw new ValixRateLimitError();
    }
    let code = "UNKNOWN_ERROR";
    let message = `Error ${response.status}`;
    try {
      const body = await response.json();
      if (body.code) code = body.code;
      if (body.error) message = body.error;
    } catch {
    }
    throw new ValixError(message, code, response.status);
  }
};
async function trial(items, baseUrl = DEFAULT_BASE_URL) {
  const normalizedItems = items.map((item) => ({
    value: item.value,
    type: item.type ?? "AUTO"
  }));
  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/v1/validate/trial`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: normalizedItems })
    }
  );
  if (response.status === 429) throw new ValixRateLimitError();
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ValixError(
      body.error ?? `Error ${response.status}`,
      body.code ?? "UNKNOWN_ERROR",
      response.status
    );
  }
  return response.json();
}
export {
  Valix,
  ValixAuthError,
  ValixError,
  ValixRateLimitError,
  trial
};

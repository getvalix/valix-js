# valix

SDK oficial de [Valix](https://getvalix.es) para validar identificadores fiscales españoles: **NIF, NIE, CIF e IBAN**.

```bash
npm install @valix/sdk
```

## Quickstart

```typescript
import { Valix } from 'valix'

const valix = new Valix({ apiKey: 'vx_live_...' })

const result = await valix.validate('12345678Z')
// { valid: true, detected_type: 'NIF', formatted: '12345678-Z', errors: [] }
```

## Probar sin API key

```typescript
import { trial } from 'valix'

const result = await trial([
  { value: '12345678Z' },
  { value: 'X1234567L' },
])

console.log(result.valid_count) // 2
```

El endpoint trial permite hasta **50 validaciones por día** sin necesidad de registro. Ideal para evaluar el servicio antes de suscribirse.

---

## Instalación

```bash
# npm
npm install @valix/sdk

# pnpm
pnpm add @valix/sdk

# yarn
yarn add @valix/sdk
```

Requiere **Node.js 18+** (usa `fetch` nativo). Compatible con todos los bundlers modernos (Vite, webpack, esbuild).

---

## Uso con API key

Obtén tu API key en [getvalix.es](https://getvalix.es).

### Validación con detección automática de tipo

```typescript
import { Valix } from 'valix'

const valix = new Valix({ apiKey: 'vx_live_...' })

await valix.validate('12345678Z')    // NIF detectado automáticamente
await valix.validate('X1234567L')    // NIE detectado automáticamente
await valix.validate('A12345674')    // CIF detectado automáticamente
await valix.validate('ES9121000418450200051332')  // IBAN detectado
```

### Forzar el tipo

```typescript
await valix.validateNIF('12345678Z')
await valix.validateNIE('X1234567L')
await valix.validateCIF('A12345674')
await valix.validateIBAN('ES9121000418450200051332')
```

### Validación en lote (hasta 100 identificadores)

```typescript
const response = await valix.batch([
  { value: '12345678Z', type: 'AUTO' },
  { value: 'X1234567L', type: 'NIE' },
  { value: 'A12345674', type: 'CIF' },
  { value: 'ES9121000418450200051332', type: 'IBAN' },
])

console.log(response.total)         // 4
console.log(response.valid_count)   // 4
console.log(response.invalid_count) // 0

for (const result of response.results) {
  console.log(`${result.value}: ${result.valid ? '✓' : '✗'} (${result.detected_type})`)
}
```

---

## Formato de respuesta

Cada resultado incluye:

```typescript
{
  valid: boolean          // true si el identificador es válido
  detected_type: string  // 'NIF' | 'NIE' | 'CIF' | 'IBAN'
  value: string          // valor original enviado
  formatted: string | null  // formato oficial (ej: '12345678-Z') o null si inválido
  errors: string[]       // mensajes de error (vacío si válido)
  entity_type?: string   // solo en CIF válidos (ej: 'SOCIEDAD_ANONIMA')
}
```

---

## Manejo de errores

```typescript
import { Valix, ValixError, ValixRateLimitError, ValixAuthError } from 'valix'

const valix = new Valix({ apiKey: 'vx_live_...' })

try {
  const result = await valix.validate('12345678Z')
} catch (error) {
  if (error instanceof ValixAuthError) {
    console.error('API key inválida')
  } else if (error instanceof ValixRateLimitError) {
    console.error('Límite de plan alcanzado')
  } else if (error instanceof ValixError) {
    console.error(`Error ${error.status}: ${error.message} (${error.code})`)
  }
}
```

Los errores de validación (NIF inválido, etc.) **no lanzan excepciones** — se devuelven como `{ valid: false, errors: [...] }`. Las excepciones solo ocurren ante errores de red, autenticación o límites de plan.

---

## TypeScript

El paquete incluye tipos completos. No necesitas instalar `@types/valix`.

```typescript
import type { ValidationItem, BatchResponse, IdentifierType } from 'valix'

const items: ValidationItem[] = [
  { value: '12345678Z', type: 'NIF' },
  { value: 'X1234567L', type: 'NIE' },
]

const response: BatchResponse = await valix.batch(items)
```

---

## Uso en el servidor (Next.js, Express, etc.)

```typescript
// app/api/checkout/route.ts (Next.js App Router)
import { Valix } from 'valix'

const valix = new Valix({ apiKey: process.env.VALIX_API_KEY! })

export async function POST(request: Request) {
  const { nif } = await request.json()

  const result = await valix.validateNIF(nif)
  if (!result.valid) {
    return Response.json({ error: 'NIF inválido' }, { status: 400 })
  }

  // continuar con el checkout...
}
```

---

## Planes y límites

| Plan | Validaciones/mes |
|---|---|
| Trial (sin registro) | 50/día |
| Starter | 10.000 |
| Pro | 100.000 |
| Enterprise | 1.000.000 |

Ver precios en [getvalix.es/#precios](https://getvalix.es/#precios).

---

## Licencia

MIT — ver [LICENSE](./LICENSE).

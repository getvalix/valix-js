type IdentifierType = 'NIF' | 'NIE' | 'CIF' | 'IBAN' | 'AUTO';
interface ValidationItem {
    value: string;
    type: IdentifierType;
}
interface ValidationResult {
    valid: boolean;
    type: IdentifierType;
    input: string;
    formatted: string | null;
    errors: string[];
    /** Solo presente en CIF válidos */
    entity_type?: string;
}
interface BatchResult {
    index: number;
    value: string;
    requested_type: IdentifierType;
    detected_type: IdentifierType;
    valid: boolean;
    formatted: string | null;
    errors: string[];
    entity_type?: string;
}
interface BatchResponse {
    total: number;
    valid_count: number;
    invalid_count: number;
    results: BatchResult[];
}
interface TrialResponse {
    total: number;
    valid_count: number;
    invalid_count: number;
    results: ValidationResult[];
}
interface ValixOptions {
    apiKey: string;
    /** Por defecto: https://api.getvalix.io */
    baseUrl?: string;
}

declare class Valix {
    private readonly apiKey;
    private readonly baseUrl;
    constructor(options: ValixOptions);
    /**
     * Valida un único identificador fiscal con detección automática de tipo.
     */
    validate(value: string): Promise<BatchResponse['results'][0]>;
    /**
     * Valida hasta 100 identificadores en una sola llamada.
     */
    batch(items: ValidationItem[]): Promise<BatchResponse>;
    /** Valida un NIF (persona física española). */
    validateNIF(value: string): Promise<BatchResponse['results'][0]>;
    /** Valida un NIE (extranjero residente en España). */
    validateNIE(value: string): Promise<BatchResponse['results'][0]>;
    /** Valida un CIF (persona jurídica española). */
    validateCIF(value: string): Promise<BatchResponse['results'][0]>;
    /** Valida un IBAN español (ES + 22 dígitos). */
    validateIBAN(value: string): Promise<BatchResponse['results'][0]>;
    private post;
    private handleError;
}
/**
 * Valida hasta 5 identificadores sin necesidad de API key.
 * Límite de 50 validaciones por día por IP.
 */
declare function trial(items: Array<{
    value: string;
    type?: IdentifierType;
}>, baseUrl?: string): Promise<any>;

declare class ValixError extends Error {
    readonly code: string;
    readonly status: number;
    constructor(message: string, code: string, status: number);
}
declare class ValixRateLimitError extends ValixError {
    constructor();
}
declare class ValixAuthError extends ValixError {
    constructor();
}

export { type BatchResponse, type BatchResult, type IdentifierType, type TrialResponse, type ValidationItem, type ValidationResult, Valix, ValixAuthError, ValixError, type ValixOptions, ValixRateLimitError, trial };

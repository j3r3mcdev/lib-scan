/**
 * ─────────────────────────────────────────────────────────────
 *  ScanError — Erreurs fonctionnelles du moteur de scan
 * ─────────────────────────────────────────────────────────────
 */

export type ScanErrorCode =
  | "CONFIG_ERROR"
  | "PIPELINE_ERROR"
  | "DETECTOR_ERROR"
  | "ADAPTER_ERROR"
  | "REGISTRY_ERROR";

export interface ScanErrorContext {
  stage?: string;
  detectorId?: string;
  adapterId?: string;
  presetId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Erreur normalisée pour tout le moteur de scan.
 * Permet un logging structuré et une remontée propre côté service.
 */
export class ScanError extends Error {
  readonly code: ScanErrorCode;
  readonly context?: ScanErrorContext;
  readonly cause?: unknown;

  constructor(
    message: string,
    code: ScanErrorCode = "PIPELINE_ERROR",
    options: {
      context?: ScanErrorContext;
      cause?: unknown;
    } = {},
  ) {
    super(message);
    this.name = "ScanError";
    this.code = code;
    this.context = options.context;
    this.cause = options.cause;

    // Fix pour l’héritage Error en TS/JS
    Object.setPrototypeOf(this, ScanError.prototype);
  }

  static config(message: string, context?: ScanErrorContext): ScanError {
    return new ScanError(message, "CONFIG_ERROR", { context });
  }

  static pipeline(message: string, context?: ScanErrorContext): ScanError {
    return new ScanError(message, "PIPELINE_ERROR", { context });
  }

  static detector(
    message: string,
    detectorId?: string,
    context?: ScanErrorContext,
  ): ScanError {
    return new ScanError(message, "DETECTOR_ERROR", {
      context: { ...context, detectorId },
    });
  }

  static adapter(
    message: string,
    adapterId?: string,
    context?: ScanErrorContext,
  ): ScanError {
    return new ScanError(message, "ADAPTER_ERROR", {
      context: { ...context, adapterId },
    });
  }

  static registry(message: string, context?: ScanErrorContext): ScanError {
    return new ScanError(message, "REGISTRY_ERROR", { context });
  }
}

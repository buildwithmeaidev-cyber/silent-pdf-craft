// src/errors/FeatureDisabledError.ts
export class FeatureDisabledError extends Error {
  constructor(toolKind: string) {
    super(`Feature disabled: tool "${toolKind}" is not allowed by current feature flags`);
    this.name = 'FeatureDisabledError';
  }
}

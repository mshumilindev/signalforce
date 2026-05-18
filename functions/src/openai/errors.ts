export class DigestContentValidationError extends Error {
  readonly issues: readonly string[];

  constructor(message: string, issues: readonly string[] = []) {
    super(message);
    this.name = 'DigestContentValidationError';
    this.issues = issues;
  }
}

export class DigestGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DigestGenerationError';
  }
}

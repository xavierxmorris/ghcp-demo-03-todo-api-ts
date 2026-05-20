export class NotFoundError extends Error {
  constructor(public readonly resource: string, public readonly id: string) {
    super(`${resource} ${id} not found`);
    this.name = 'NotFoundError';
  }
}

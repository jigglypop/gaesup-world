/** Stands in for Vite's `?worker&inline` constructors under jest, where no worker can start; tests drive the logic directly. */
export default class InlineWorkerStub {
  constructor() {
    throw new Error('Inline workers do not run under jest');
  }
}

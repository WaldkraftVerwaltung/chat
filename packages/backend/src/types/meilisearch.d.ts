// Ambient module declaration for meilisearch ESM package.
// Needed because meilisearch v0.57+ is ESM-only with no "main" field,
// which prevents TypeScript (moduleResolution: node) from locating its types.
declare module 'meilisearch' {
  export class Meilisearch {
    constructor(config: { host: string; apiKey?: string });
    index<T = Record<string, unknown>>(uid: string): Index<T>;
  }
  export class Index<T = Record<string, unknown>> {
    uid: string;
    addDocuments(documents: T[]): Promise<unknown>;
    deleteDocument(id: string): Promise<unknown>;
    search(query: string, options?: Record<string, unknown>): Promise<unknown>;
    updateFilterableAttributes(attrs: string[]): Promise<unknown>;
    updateSortableAttributes(attrs: string[]): Promise<unknown>;
    updateSearchableAttributes(attrs: string[]): Promise<unknown>;
  }
}

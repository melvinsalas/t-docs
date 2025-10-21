/**
 * Shared type definitions used across the worker.
 *
 * The goal of centralising these interfaces is to avoid circular imports and
 * provide a single source of truth for the contract between the different
 * modules. Keeping this module small helps ensure type information stays
 * lightweight and easy to discover for contributors.
 */

/**
 * Bindings injected by the Cloudflare Workers runtime.
 * - `R2` stores the binary PDF assets.
 * - `DB` persists document metadata and tags in D1.
 * - `PENDING` tracks short-lived jobs (currently unused but reserved).
 * - `PUBLIC_READ` toggles if downloads require authentication.
 */
export interface Env {
    R2: R2Bucket
    DB: D1Database
    PENDING: KVNamespace
    PUBLIC_READ: string
}

/**
 * Shape of the metadata stored for each PDF document.
 *
 * This mirrors the `documents` table and represents the unified view of the
 * file stored in R2 plus the descriptive attributes used for search.
 */
export type DocMeta = {
    version: number
    id: string
    file_name: string
    r2_key: string
    uploaded_at: string
    year: number
    tags: string[]
    description?: string
    size: number
    content_type: string
    checksum: string
}

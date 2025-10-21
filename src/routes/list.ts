import { Env } from "../types"
import { json } from "../utils"

/**
 * Return a paginated list of documents respecting optional filters.
 *
 * Supports:
 * - Year filter (`year`).
 * - Exact tag match (`tag`).
 * - Keyset pagination via `after_uploaded_at` and `after_id`.
 */
export async function listDocuments(params: URLSearchParams, env: Env) {
    const year = params.get("year")
    const tag = params.get("tag")
    const limit = Math.max(1, Math.min(Number(params.get("limit") || 50), 100))
    const afterUploaded = params.get("after_uploaded_at")
    const afterId = params.get("after_id")

    const where: string[] = []
    const bindParams: unknown[] = []

    if (year) {
        where.push("d.year = ?")
        bindParams.push(Number(year))
    }
    if (tag) {
        where.push(`EXISTS (SELECT 1 FROM document_tags t WHERE t.doc_id = d.id AND t.tag = ?)`)
        bindParams.push(tag)
    }
    if (afterUploaded && afterId) {
        // Keyset pagination keeps the query scale linear even with large tables.
        where.push(`(d.uploaded_at < ? OR (d.uploaded_at = ? AND d.id < ?))`)
        bindParams.push(afterUploaded, afterUploaded, afterId)
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""
    const sql = `
        SELECT d.id, d.file_name, d.r2_key, d.uploaded_at, d.year,
               d.tags_json, d.description, d.size, d.content_type, d.checksum
        FROM documents d
        ${whereSql}
        ORDER BY d.uploaded_at DESC, d.id DESC
        LIMIT ?;
    `

    const rows = await env.DB.prepare(sql).bind(...bindParams, limit).all()

    const docs = (rows.results || []).map((row: any) => ({
        id: row.id,
        file_name: row.file_name,
        r2_key: row.r2_key,
        uploaded_at: row.uploaded_at,
        year: row.year,
        tags: JSON.parse(row.tags_json),
        description: row.description,
        size: row.size,
        content_type: row.content_type,
        checksum: row.checksum
    }))

    const nextCursor = docs.length
        ? { after_uploaded_at: docs[docs.length - 1].uploaded_at, after_id: docs[docs.length - 1].id }
        : null

    return json({ docs, next: nextCursor })
}

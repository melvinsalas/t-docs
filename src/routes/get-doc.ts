import { DocMeta, Env } from "../types"
import { json } from "../utils"

/**
 * Retrieve the metadata of a single document by identifier.
 */
export async function getDocument(id: string, env: Env) {
    const row = await env.DB.prepare(
        `SELECT * FROM documents WHERE id = ?`
    ).bind(id).first<any>()

    if (!row) {
        return json({ error: "not found" }, 404)
    }

    const doc: DocMeta = {
        version: row.version,
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
    }

    return json({ doc })
}

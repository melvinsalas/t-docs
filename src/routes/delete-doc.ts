import { Env } from "../types"
import { json } from "../utils"

/**
 * Delete a document and its associated storage objects.
 */
export async function deleteDocument(id: string, env: Env) {
    const row = await env.DB
        .prepare(`SELECT r2_key FROM documents WHERE id = ?`)
        .bind(id)
        .first<{ r2_key: string }>()

    if (!row) {
        return json({ error: "not found" }, 404)
    }

    // Remove both the PDF and the metadata sidecar in a single call.
    await env.R2.delete([row.r2_key, row.r2_key.replace(/\.pdf$/i, ".meta.json")])
    await env.DB.prepare(`DELETE FROM documents WHERE id = ?`).bind(id).run()

    return json({ ok: true })
}

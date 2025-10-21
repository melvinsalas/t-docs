import { Env } from "../types"
import { json } from "../utils"

/**
 * Partially update document metadata.
 *
 * Accepted keys: `description`, `tags`, `year`, `file_name`.
 * Tags are normalised into the `document_tags` table to maintain the join
 * used by the listing endpoint.
 */
export async function updateDocument(id: string, req: Request, env: Env) {
    const body = await req.json()
    const updates: string[] = []
    const params: unknown[] = []

    if (typeof body.description === "string") {
        updates.push("description = ?")
        params.push(body.description)
    }

    if (Array.isArray(body.tags)) {
        updates.push("tags_json = ?")
        params.push(JSON.stringify(body.tags))

        // Rebuild the tag join table to keep filters in sync.
        await env.DB.prepare(`DELETE FROM document_tags WHERE doc_id = ?`).bind(id).run()
        for (const tag of body.tags) {
            await env.DB.prepare(`INSERT INTO document_tags (doc_id, tag) VALUES (?, ?)`).bind(id, tag).run()
        }
    }

    if (typeof body.year === "number") {
        updates.push("year = ?")
        params.push(body.year)
    }

    if (typeof body.file_name === "string") {
        updates.push("file_name = ?")
        params.push(body.file_name)
    }

    if (!updates.length) {
        return json({ ok: true })
    }

    params.push(id)

    await env.DB.prepare(`UPDATE documents SET ${updates.join(", ")} WHERE id = ?`).bind(...params).run()
    return json({ ok: true })
}

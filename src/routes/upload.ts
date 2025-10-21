import { Env } from "../types"
import { json, safeParseTags, sanitizeSlug, sha256Hex } from "../utils"

/**
 * Handle multipart uploads coming from the browser.
 *
 * Responsibilities:
 * - Persist the binary payload in R2.
 * - Record searchable metadata in D1.
 * - Store denormalised tag entries for efficient filters.
 */
export async function uploadDocument(req: Request, env: Env) {
    const form = await req.formData()
    const file = form.get("file") as File | null
    if (!file) {
        return json({ error: "file is required" }, 400)
    }

    // Normalise optional metadata fields provided by the frontend.
    const year = Number(form.get("year") ?? new Date().getUTCFullYear())
    const description = (form.get("description") as string) || ""
    const tagsRaw = (form.get("tags") as string) || "[]"
    const tags = Array.isArray(tagsRaw) ? tagsRaw : safeParseTags(tagsRaw)

    const id = crypto.randomUUID()
    const uploadedAt = new Date().toISOString()
    const fileName = file.name || "document.pdf"
    const contentType = "application/pdf"
    const size = file.size

    const slug = sanitizeSlug(fileName.replace(/\.pdf$/i, ""))
    const r2Key = `documentos/${year}/${slug}-${id}.pdf`

    const arrayBuffer = await file.arrayBuffer()
    const checksum = await sha256Hex(arrayBuffer)

    // Persist the binary payload in R2 so it can be streamed back later.
    await env.R2.put(r2Key, arrayBuffer, {
        httpMetadata: { contentType },
        customMetadata: { id }
    })

    // Store a lightweight JSON sidecar with contextual metadata.
    await env.R2.put(r2Key.replace(/\.pdf$/i, ".meta.json"), JSON.stringify({
        description,
        tags,
        uploaded_at: uploadedAt,
        checksum,
        size,
        content_type: contentType,
        year
    }), {
        httpMetadata: { contentType: "application/json" }
    })

    // Insert the authoritative metadata row in D1.
    await env.DB.prepare(`
        INSERT INTO documents (
            id, version, file_name, r2_key, uploaded_at,
            year, tags_json, description, size, content_type, checksum
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
        id,
        1,
        fileName,
        r2Key,
        uploadedAt,
        year,
        JSON.stringify(tags),
        description,
        size,
        contentType,
        checksum
    ).run()

    // Denormalise tags for efficient filtering via EXISTS queries.
    for (const tag of tags) {
        await env.DB.prepare(`
            INSERT INTO document_tags (doc_id, tag) VALUES (?, ?)
        `).bind(id, tag).run()
    }

    // Ensure any pending KV markers are cleared once the upload succeeds.
    await env.PENDING.delete(`upload:${id}`)

    return json({ ok: true, id })
}

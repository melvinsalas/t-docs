import { Env } from "../types"
import { json } from "../utils"

/**
 * Stream the binary PDF from R2 to the client.
 *
 * The response defaults to inline display; callers can force a download by
 * appending `?download=1` to the generated URL.
 */
export async function downloadDocument(id: string, env: Env) {
    // Hook point for future authentication:
    // if (env.PUBLIC_READ !== "true") { ... }

    const row = await env.DB
        .prepare(`SELECT r2_key, file_name, content_type FROM documents WHERE id = ?`)
        .bind(id)
        .first<any>()

    if (!row) {
        return json({ error: "not found" }, 404)
    }

    const object = await env.R2.get(row.r2_key)
    if (!object) {
        return json({ error: "missing R2 object" }, 404)
    }

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set("content-type", row.content_type || "application/pdf")

    // Allow callers to force download behaviour without an additional query.
    const isDownload = new URLSearchParams(new URL(`http://x${row.r2_key}`).search).get("download") === "1"
    headers.set(
        "content-disposition",
        `${isDownload ? "attachment" : "inline"}; filename="${row.file_name}"`
    )

    headers.set("Cache-Control", "no-store")

    return new Response(object.body, { headers })
}

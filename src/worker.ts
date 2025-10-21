import { buildCorsHeaders, withCors } from "./cors"
import { deleteDocument, downloadDocument, getDocument, listDocuments, updateDocument, uploadDocument } from "./routes"
import { Env } from "./types"
import { json } from "./utils"

/**
 * Entry point for the Cloudflare Worker.
 *
 * The file focuses on request orchestration and delegates business logic to
 * the modules under `routes/`. This split keeps individual handlers narrow and
 * makes the codebase easier to navigate for contributors.
 */
export default {
    async fetch(req: Request, env: Env, _ctx: ExecutionContext) {
        // `_ctx` is reserved for background tasks via waitUntil when needed.
        // OPTIONS requests are CORS preflight checks performed by browsers.
        if (req.method === "OPTIONS") {
            const headers = buildCorsHeaders(req.headers.get("Origin"))
            return new Response(null, { status: 204, headers })
        }

        try {
            const response = await routeRequest(req, env)
            return withCors(response, req)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "internal error"
            const resp = json({ error: message }, 500)
            return withCors(resp, req)
        }
    }
}

/**
 * Lightweight router that matches HTTP method + path combinations.
 */
async function routeRequest(req: Request, env: Env) {
    const url = new URL(req.url)
    const { pathname, searchParams } = url

    if (req.method === "POST" && pathname === "/upload") {
        return uploadDocument(req, env)
    }

    if (req.method === "GET" && pathname === "/list") {
        return listDocuments(searchParams, env)
    }

    if (req.method === "GET" && pathname.startsWith("/doc/")) {
        const id = pathname.split("/").pop()!
        return getDocument(id, env)
    }

    if (req.method === "GET" && pathname.startsWith("/download/")) {
        const id = pathname.split("/").pop()!
        return downloadDocument(id, env)
    }

    if ((req.method === "PUT" || req.method === "PATCH") && pathname.startsWith("/doc/")) {
        const id = pathname.split("/").pop()!
        return updateDocument(id, req, env)
    }

    if (req.method === "DELETE" && pathname.startsWith("/doc/")) {
        const id = pathname.split("/").pop()!
        return deleteDocument(id, env)
    }

    return new Response("Not found", { status: 404 })
}

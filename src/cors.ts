import { ALLOWED_ORIGINS } from "./config"

/**
 * Compute the CORS headers for a given request origin.
 *
 * The logic intentionally defaults to `*` when the origin is not part of the
 * allow-list so that unauthenticated tooling (like curl) can still interact
 * with the API. Restrict this behaviour if your deployment requires strict
 * origin validation.
 */
export function buildCorsHeaders(origin: string | null) {
    let allowOrigin = "*"
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        allowOrigin = origin
    }
    return {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
    }
}

/**
 * Attach CORS headers to the provided response while preserving existing ones.
 *
 * This helper keeps the fetch handler neat and ensures the policy is applied
 * uniformly across every endpoint.
 */
export function withCors(resp: Response, req: Request) {
    const headers = new Headers(resp.headers)
    const cors = buildCorsHeaders(req.headers.get("Origin"))
    for (const [key, value] of Object.entries(cors)) {
        headers.set(key, value)
    }
    return new Response(resp.body, { status: resp.status, headers })
}

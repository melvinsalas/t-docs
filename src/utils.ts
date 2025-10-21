/**
 * Helpers shared by multiple route handlers.
 *
 * Keeping utility functions together avoids duplication while offering a
 * discoverable surface for contributors. Each function includes a short
 * explanation of its intended usage.
 */

/**
 * Create a JSON response with the provided HTTP status code.
 */
export function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "content-type": "application/json" }
    })
}

/**
 * Sanitise arbitrary strings so they can be safely used as part of R2 object
 * keys. It lowercases the input, strips non-alphanumeric characters and trims
 * leading/trailing separators.
 */
export function sanitizeSlug(input: string) {
    return input
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80)
}

/**
 * Parse a JSON-encoded string of tags, ensuring the output is always an array
 * of strings even when the input is malformed.
 */
export function safeParseTags(raw: string): string[] {
    try {
        const value = JSON.parse(raw)
        return Array.isArray(value) ? value.map(String) : []
    } catch {
        return []
    }
}

/**
 * Compute the SHA-256 checksum of a binary payload and return its hexadecimal
 * representation. Used to detect duplicated uploads.
 */
export async function sha256Hex(ab: ArrayBuffer) {
    const hash = await crypto.subtle.digest("SHA-256", ab)
    const bytes = new Uint8Array(hash)
    return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("")
}

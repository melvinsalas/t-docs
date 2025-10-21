/**
 * Configuration values that may vary between deployments.
 *
 * In open-source projects it is common to keep defaults here while allowing
 * downstream forks to override them through environment variables.
 */

/**
 * Origins allowed to perform cross-origin requests against the API.
 *
 * During development you typically add the local dev server URLs here. For
 * production you should replace the placeholder domain with the public URL of
 * your Pages or Worker site.
 */
export const ALLOWED_ORIGINS = [
    "http://localhost:8080",   // Ejemplo para desarrollo (Vite)
    "http://127.0.0.1:5500",   // Ejemplo para Live Server
    "http://127.0.0.1:8080",   // Compatibilidad adicional
    "https://tusitio.com",     // Sustituye por tu dominio real
    "https://pdf-manager.pages.dev"
]

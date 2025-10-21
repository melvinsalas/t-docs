Dev environment

backend npx wrangler dev
frontend npx serve public -l 8080


# Crea la base si aún no existe (una vez)
wrangler d1 create pdfmeta

# Aplica migraciones localmente (usa tu migrations/0001_init.sql)
wrangler d1 migrations apply pdfmeta --local

PRAGMA foreign_keys = ON;

CREATE TABLE documents (
  id TEXT PRIMARY KEY,                       -- mismo que tu JSON
  version INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  uploaded_at TEXT NOT NULL,                 -- ISO8601
  year INTEGER NOT NULL,
  tags_json TEXT NOT NULL,                   -- JSON string de ["factura", ...]
  description TEXT,
  size INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  checksum TEXT NOT NULL                     -- "sha256:..."
);

-- índice por año + fecha para listados rápidos
CREATE INDEX idx_documents_year_uploaded ON documents(year, uploaded_at DESC);

-- índice por uploaded_at para paginación por tiempo
CREATE INDEX idx_documents_uploaded ON documents(uploaded_at DESC, id);

-- tabla de tags normalizados para búsquedas exactas por tag
CREATE TABLE document_tags (
  doc_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (doc_id, tag),
  FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX idx_document_tags_tag ON document_tags(tag);

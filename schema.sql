CREATE TABLE IF NOT EXISTS pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente TEXT NOT NULL,
  contacto TEXT,
  morada TEXT,
  data TEXT,
  entrega TEXT,
  estado TEXT DEFAULT 'Pendente',
  obs TEXT
);
CREATE TABLE IF NOT EXISTS linhas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  qtd INTEGER NOT NULL DEFAULT 1,
  preco REAL NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ix_linhas_pedido ON linhas(pedido_id);

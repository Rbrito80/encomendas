CREATE TABLE IF NOT EXISTS encomendas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente TEXT NOT NULL,
  contacto TEXT,
  tipo TEXT NOT NULL,
  qtd INTEGER NOT NULL DEFAULT 1,
  preco REAL NOT NULL DEFAULT 0,
  data TEXT,
  entrega TEXT,
  estado TEXT DEFAULT 'Pendente',
  obs TEXT
);

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const caminhoBanco = path.join(__dirname, 'catalogo_geek.db');
const db = new DatabaseSync(caminhoBanco);

db.exec(`
  CREATE TABLE IF NOT EXISTS livros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE,
    title TEXT NOT NULL,
    author_name TEXT NOT NULL,
    first_publish_year INTEGER,
    edition_count INTEGER DEFAULT 1,
    cover_url TEXT,
    origem TEXT DEFAULT 'Banco SQLite'
  );

  CREATE TABLE IF NOT EXISTS favoritos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE,
    title TEXT NOT NULL,
    author_name TEXT,
    first_publish_year INTEGER,
    edition_count INTEGER DEFAULT 1,
    cover_i INTEGER,
    cover_url TEXT
  );
`);

const inserirInicial = db.prepare(`
  INSERT OR IGNORE INTO livros (key, title, author_name, first_publish_year, edition_count, cover_url)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const livrosIniciais = [
  ['/db/1', 'O Senhor dos Anéis: A Sociedade do Anel', 'J.R.R. Tolkien', 1954, 120, 'https://covers.openlibrary.org/b/id/14627060-M.jpg'],
  ['/db/2', 'Duna (Crônicas de Duna)', 'Frank Herbert', 1965, 85, 'https://covers.openlibrary.org/b/id/11153217-M.jpg'],
  ['/db/3', 'The Witcher: O Último Desejo', 'Andrzej Sapkowski', 1993, 42, 'https://covers.openlibrary.org/b/id/10521270-M.jpg'],
  ['/db/4', 'Neuromancer (Cyberpunk)', 'William Gibson', 1984, 60, 'https://covers.openlibrary.org/b/id/12693910-M.jpg']
];

for (const livro of livrosIniciais) {
  inserirInicial.run(...livro);
}

db.close();
console.log('Banco SQLite catalogo_geek.db gerado e populado com sucesso!');

const express = require('express');
const cors = require('cors');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ====================================================================
// 1. CONEXÃO E CRIAÇÃO DO BANCO DE DADOS SQLITE
// ====================================================================
const caminhoBanco = path.join(__dirname, 'catalogo_geek.db');
const db = new DatabaseSync(caminhoBanco);

// Criação das tabelas no SQLite
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

// Popula (Seed) o banco com alguns livros Geek caso esteja vazio
const totalLivros = db.prepare('SELECT COUNT(*) as total FROM livros').get();
if (totalLivros.total === 0) {
  const inserirInicial = db.prepare(`
    INSERT INTO livros (key, title, author_name, first_publish_year, edition_count, cover_url)
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
  console.log('Banco SQLite populado com livros Geek iniciais!');
}

// ====================================================================
// 2. ROTAS DA API REST (CRUD COMPLETO)
// ====================================================================

// Status da API
app.get('/', (req, res) => {
  res.json({
    status: 'Online',
    mensagem: 'API Backend Catálogo Geek + SQLite funcionando!',
  });
});

// [GET] Listar livros cadastrados no Banco de Dados SQLite
app.get('/livros', (req, res) => {
  try {
    const busca = req.query.q ? `%${req.query.q}%` : '%';
    const rows = db
      .prepare('SELECT * FROM livros WHERE title LIKE ? OR author_name LIKE ? ORDER BY id DESC')
      .all(busca, busca);

    // Formata no mesmo padrão que o frontend espera
    const formatados = rows.map((item) => ({
      id: item.id,
      key: item.key,
      title: item.title,
      author_name: [item.author_name],
      first_publish_year: item.first_publish_year,
      edition_count: item.edition_count,
      cover_url: item.cover_url,
      origem: 'Banco SQLite',
    }));

    res.json(formatados);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// [POST] Cadastrar um novo livro Geek no Banco de Dados SQLite
app.post('/livros', (req, res) => {
  try {
    const { title, author_name, first_publish_year, cover_url } = req.body;
    if (!title || !author_name) {
      return res.status(400).json({ erro: 'Título e autor são obrigatórios!' });
    }

    const key = `/db/${Date.now()}`;
    const ano = parseInt(first_publish_year, 10) || 2026;
    const capa =
      cover_url && cover_url.trim() !== ''
        ? cover_url.trim()
        : 'https://via.placeholder.com/150x220.png?text=Livro+Geek';

    const stmt = db.prepare(`
      INSERT INTO livros (key, title, author_name, first_publish_year, cover_url)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(key, title, author_name, ano, capa);

    res.status(201).json({
      id: info.lastInsertRowid,
      key,
      title,
      author_name: [author_name],
      first_publish_year: ano,
      cover_url: capa,
      origem: 'Banco SQLite',
    });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// [DELETE] Excluir um livro cadastrado no Banco SQLite
app.delete('/livros/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM livros WHERE id = ?').run(req.params.id);
    res.json({ mensagem: 'Livro removido do banco com sucesso!' });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// [GET] Listar favoritos salvos no Banco de Dados SQLite
app.get('/favoritos', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM favoritos ORDER BY id DESC').all();
    const formatados = rows.map((item) => ({
      key: item.key,
      title: item.title,
      author_name: [item.author_name || 'Desconhecido'],
      first_publish_year: item.first_publish_year,
      edition_count: item.edition_count,
      cover_i: item.cover_i,
      cover_url: item.cover_url,
    }));
    res.json(formatados);
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// [POST] Salvar um favorito no Banco de Dados SQLite
app.post('/favoritos', (req, res) => {
  try {
    const { key, title, author_name, first_publish_year, edition_count, cover_i, cover_url } = req.body;
    const autorTexto = Array.isArray(author_name) ? author_name[0] : author_name || 'Desconhecido';

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO favoritos (key, title, author_name, first_publish_year, edition_count, cover_i, cover_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      key,
      title,
      autorTexto,
      first_publish_year || null,
      edition_count || 1,
      cover_i || null,
      cover_url || null
    );

    res.status(201).json({ mensagem: 'Salvo no banco SQLite com sucesso!' });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// [DELETE] Remover um favorito ou limpar todos do Banco SQLite
app.delete('/favoritos', (req, res) => {
  try {
    const { key } = req.query;
    if (key) {
      db.prepare('DELETE FROM favoritos WHERE key = ?').run(key);
    } else {
      db.prepare('DELETE FROM favoritos').run();
    }
    res.json({ mensagem: 'Favorito removido do SQLite!' });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`🚀 Backend Node.js + SQLite rodando na porta ${PORT}`);
  console.log(`📱 Acesse no PC: http://localhost:${PORT}`);
  console.log(`📱 Acesse no Celular (Wi-Fi): http://192.168.0.172:${PORT}`);
  console.log('====================================================');
});

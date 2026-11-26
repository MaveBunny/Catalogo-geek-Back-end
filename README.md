# 🎮 Catálogo Geek - Back-end (Node.js + Express + SQLite)

API REST desenvolvida em **Node.js + Express** com banco de dados relacional **SQLite (`catalogo_geek.db`)** para alimentar o aplicativo mobile **Catálogo Geek** em React Native + Expo.

## 🗄️ Estrutura do Banco de Dados (SQLite)
O arquivo `catalogo_geek.db` é criado e populado automaticamente ao iniciar o servidor, contendo duas tabelas:
- **`livros`**: Armazena os livros Geek cadastrados no catálogo (`id`, `key`, `title`, `author_name`, `first_publish_year`, `edition_count`, `cover_url`, `origem`).
- **`favoritos`**: Armazena os livros favoritados pelo usuário sincronizados com o aplicativo (`id`, `key`, `title`, `author_name`, `first_publish_year`, `edition_count`, `cover_i`, `cover_url`).

## 🛣️ Rotas da API (Endpoints)
- `GET /` — Status da API
- `GET /livros` — Lista todos os livros do banco SQLite (suporta filtro `?q=termo`)
- `POST /livros` — Cadastra um novo livro Geek no banco SQLite
- `DELETE /livros/:id` — Remove um livro do banco SQLite
- `GET /favoritos` — Lista os livros favoritos salvos no banco
- `POST /favoritos` — Salva um livro favorito no banco
- `DELETE /favoritos` — Remove um favorito (`?key=...`) ou limpa todos

## ▶️ Como executar
```bash
npm install
npm start
```
O servidor iniciará na porta `3000` (`http://localhost:3000`).

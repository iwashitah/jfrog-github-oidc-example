// vulnerable-app.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());

// データベース初期化
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE users (id INT, username TEXT, password TEXT, email TEXT)");
  db.run("INSERT INTO users VALUES (1, 'admin', 'admin123', 'admin@example.com')");
  db.run("INSERT INTO users VALUES (2, 'user', 'user123', 'user@example.com')");
});

// 【脆弱】SQLインジェクションの脆弱性あり
app.get('/api/user', (req, res) => {
  const username = req.query.username;
  
  // ユーザー入力を直接SQL文に連結（脆弱）
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  
  console.log('Executing query:', query);
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ users: rows });
  });
});

app.listen(3000, () => {
  console.log('Vulnerable app running on http://localhost:3000');
});

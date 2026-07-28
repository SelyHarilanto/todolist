// server.js
import express from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;
const app = express();

// Connexion PostgreSQL
const pool = new Pool({
  user: 'postgres',         
  password: '280906', 
  host: 'localhost',
  port: 5432,
  database: 'tododb'
});

app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ ok: true });
});

// --- ROUTES API ---

// Récupérer toutes les tâches
app.get('/api/todos', async (req, res) => {
  try {
    const allTodos = await pool.query('SELECT * FROM todos ORDER BY todo_id ASC');
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// Ajouter une tâche
app.post('/api/todos', async (req, res) => {
  try {
    const description = typeof req.body?.description === 'string'
      ? req.body.description.trim()
      : '';
    const priority = typeof req.body?.priority === 'string' && ['faible', 'moyenne', 'élevée'].includes(req.body.priority)
      ? req.body.priority
      : 'moyenne';

    if (!description) {
      return res.status(400).json({ error: 'La description est requise.' });
    }

    const newTodo = await pool.query(
      'INSERT INTO todos (description, completed, priority) VALUES ($1, false, $2) RETURNING *',
      [description, priority]
    );

    return res.status(201).json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Modifier le statut (coché/décoché)
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const updatedTodo = await pool.query(
      'UPDATE todos SET completed = $1 WHERE todo_id = $2 RETURNING *',
      [completed, id]
    );
    res.json(updatedTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// Supprimer une tâche
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM todos WHERE todo_id = $1', [id]);
    res.json({ message: 'Tâche supprimée !' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

app.listen(3000, () => {
  console.log('API Express sur http://localhost:3000');
  console.log('Routes enregistrées:', ['/test', '/api/todos', '/api/todos/:id']);
});
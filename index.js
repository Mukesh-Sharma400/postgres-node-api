const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

// Middleware to parse JSON bodies
app.use(express.json());

// GET all rows from the example_table
app.get('/users', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM example_table');
    const data = result.rows;
    client.release();
    res.json(data);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET a specific row by ID
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM example_table WHERE id = $1', [id]);
    const data = result.rows[0];
    client.release();
    res.json(data);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST a new row to the example_table
app.post('/users', async (req, res) => {
  const { name, age, email } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO example_table (name, age, email) VALUES ($1, $2, $3) RETURNING *', [name, age, email]);
    const data = result.rows[0];
    client.release();
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT (update) an existing row by ID
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('UPDATE example_table SET name = $1, age = $2, email = $3 WHERE id = $4 RETURNING *', [name, age, email, id]);
    const data = result.rows[0];
    client.release();
    res.json(data);
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE a row by ID
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    await client.query('DELETE FROM example_table WHERE id = $1', [id]);
    client.release();
    res.status(204).send(); // No content
  } catch (err) {
    console.error('Error deleting data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
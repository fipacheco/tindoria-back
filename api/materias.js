const express = require('express');
const supabase = require('../db');
const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Endpoint para retornar todas as linhas da tabela "materia"
app.get('/api/materias', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Materias')
      .select('*');

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint para retornar as informações de uma materia pelo ID
app.get('/api/materias/:id', async (req, res) => {
  const materiaId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('Materias')
      .select('*')
      .eq('id', materiaId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Materia not found' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = app;

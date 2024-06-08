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

// Rota para obter todos os alunos
app.get('/api/alunos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Alunos')
      .select('*');

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      return res.status(200).json({ alunos: data });
    } else {
      return res.status(404).json({ error: 'Nenhum aluno encontrado' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao obter alunos', details: e.message });
  }
});

// Rota para validar o login de um aluno (via POST)
app.post('/api/alunos/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const { data, error } = await supabase
      .from('Alunos')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      return res.status(200).json({ message: 'Login válido', aluno: data });
    } else {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Erro ao validar o login do aluno', details: e.message });
  }
});

// Rota para cadastrar novos alunos (via POST)
app.post('/api/alunos/cadastro', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  try {
    const { data: existingEmail, error: emailError } = await supabase
      .from('Alunos')
      .select('email')
      .eq('email', email)
      .single();

    if (existingEmail && !emailError) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao verificar email existente', details: e.message });
  }

  try {
    const { data, error } = await supabase
      .from('Alunos')
      .insert([{ name, email, password }])
      .select();

    if (error) {
      return res.status(500).json({ error: 'Não foi possível cadastrar o aluno', details: error.message });
    }

    return res.status(201).json({ message: 'Aluno cadastrado com sucesso', aluno: data });
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao cadastrar o aluno', details: e.message });
  }
});

// Rota para obter dados de um aluno com base no ID
app.get('/api/alunos/:id', async (req, res) => {
  const alunoId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('Alunos')
      .select('*')
      .eq('id', alunoId)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      return res.status(200).json({ aluno: data });
    } else {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao obter informações do aluno', details: e.message });
  }
});

// Rota para atualizar os dados de um aluno com base no ID (via PATCH)
app.patch('/api/alunos/:id', async (req, res) => {
  const alunoId = req.params.id;
  const { name, email, password, bio, semestre, avatar, linkURL, linkDiscord, linkYoutube, linkTwitter, linkInstagram } = req.body;

  try {
    const existingEmail = await supabase
      .from('Alunos')
      .select('id')
      .eq('email', email)
      .neq('id', alunoId)
      .single();

    if (existingEmail.data) {
      return res.status(400).json({ error: 'Email já cadastrado para outro aluno' });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  try {
    const { data, error } = await supabase
      .from('Alunos')
      .update({ name, email, password, bio, semestre, avatar, linkURL, linkDiscord, linkYoutube, linkTwitter, linkInstagram })
      .eq('id', alunoId)
      .select();

    if (error) {
      return res.status(500).json({ error: 'Erro ao atualizar os dados do aluno', details: error.message });
    }

    if (data != null) {
      return res.status(200).json({ message: 'Dados do aluno atualizados com sucesso', aluno: data });
    } else {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao atualizar os dados do aluno', details: e.message });
  }
});

module.exports = app;

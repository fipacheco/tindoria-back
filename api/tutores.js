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

// Rota para obter todos os tutores
app.get('/api/tutores', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Tutores')
      .select('*');

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      return res.status(200).json({ tutors: data });
    } else {
      return res.status(404).json({ error: 'Nenhum tutor encontrado' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao obter tutores', details: e.message });
  }
});

// Rota para validar o login de um tutor (via POST)
app.post('/api/tutores/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const { data, error } = await supabase
      .from('Tutores')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      return res.status(200).json({ message: 'Login válido', tutor: data });
    } else {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Erro ao validar o login do tutor', details: e.message });
  }
});

// Rota para cadastrar novos tutores (via POST)
app.post('/api/tutores/cadastro', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  try {
    const { data: existingEmail, error: emailError } = await supabase
      .from('Tutores')
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
      .from('Tutores')
      .insert([{ name, email, password }])
      .select();

    if (error) {
      return res.status(500).json({ error: 'Não foi possível cadastrar o tutor', details: error.message });
    }

    return res.status(201).json({ message: 'Tutor cadastrado com sucesso', tutor: data });
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao cadastrar o tutor', details: e.message });
  }
});

// Rota para obter dados de um tutor com base no ID
app.get('/api/tutores/:id', async (req, res) => {
  const tutorId = req.params.id;

  try {
    const { data, error } = await supabase
      .from('Tutores')
      .select('*')
      .eq('id', tutorId)
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      const subjectsIds = data.subjects || [];
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('Materias')
        .select('*')
        .in('id', subjectsIds);

      if (subjectsError) {
        return res.status(500).json({ error: 'Erro ao obter informações das matérias', details: subjectsError });
      }

      data.subjectsData = subjectsData;

      return res.status(200).json({ tutor: data });
    } else {
      return res.status(404).json({ error: 'Tutor não encontrado' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao obter informações do tutor', details: e.message });
  }
});

// Rota para atualizar os dados de um tutor com base no ID (via PATCH)
app.patch('/api/tutores/:id', async (req, res) => {
  const tutorId = req.params.id;
  const { name, email, password, bio, semestre, instituicaoDeEnsino, subjects, quantidadeAlunos, avatar, linkURL, linkDiscord, linkYoutube, linkTwitter, linkInstagram } = req.body;

  let uniqueSubjects = subjects ? [...new Set(subjects)] : null;

  try {
    const existingEmail = await supabase
      .from('Tutores')
      .select('id')
      .eq('email', email)
      .neq('id', tutorId)
      .single();

    if (existingEmail.data) {
      return res.status(400).json({ error: 'Email já cadastrado para outro tutor' });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  try {
    const { data, error } = await supabase
      .from('Tutores')
      .update({ name, email, password, bio, semestre, instituicaoDeEnsino, subjects: uniqueSubjects, quantidadeAlunos, avatar, linkURL, linkDiscord, linkYoutube, linkTwitter, linkInstagram })
      .eq('id', tutorId)
      .select();

    if (error) {
      return res.status(500).json({ error: 'Erro ao atualizar os dados do tutor', details: error.message });
    }

    if (data != null) {
      return res.status(200).json({ message: 'Dados do tutor atualizados com sucesso', tutor: data });
    } else {
      return res.status(404).json({ error: 'Tutor não encontrado' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao atualizar os dados do tutor', details: e.message });
  }
});

module.exports = app;

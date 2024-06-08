const supabase = require('../db');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    // Verifica se os campos obrigatórios estão presentes
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    // Verifica se o email já está cadastrado
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

    // Cadastra o novo aluno
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
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}

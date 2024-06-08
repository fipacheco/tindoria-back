const supabase = require('../db');

export default async function handler(req, res) {
  if (req.method === 'POST') {
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
    } catch (error) {
      res.status(500).json({ error: 'Erro ao validar o login do aluno' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}

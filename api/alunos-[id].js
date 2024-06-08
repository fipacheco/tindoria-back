const supabase = require('../db');

export default async function handler(req, res) {
  const alunoId = req.query.id;

  if (req.method === 'GET') {
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
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao obter informações do aluno' });
    }
  }

  if (req.method === 'PATCH') {
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
        return res.status(500).json({ error: 'Erro ao atualizar os dados do aluno' });
      }

      if (data != null) {
        return res.status(200).json({ message: 'Dados do aluno atualizados com sucesso', aluno: data });
      } else {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar os dados do aluno' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}

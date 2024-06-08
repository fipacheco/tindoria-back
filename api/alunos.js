const supabase = require('../db');

export default async function handler(req, res) {
  if (req.method === 'GET') {
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
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Método ${req.method} não permitido`);
  }
}

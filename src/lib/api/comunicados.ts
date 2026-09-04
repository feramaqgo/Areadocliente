import { supabase } from '../supabase';
import { getReadIds } from '../leituraComunicados';
import { Atualizacao } from '../../types';

interface ClientAnnouncementRow {
  id: string;
  titulo: string;
  conteudo: string;
  created_at: string;
}

export async function fetchAtualizacoes(): Promise<Atualizacao[]> {
  if (!supabase) throw new Error('Supabase não configurado (ver src/lib/supabase.ts).');

  const { data, error } = await supabase
    .from('client_announcements')
    .select('id, titulo, conteudo, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const readIds = getReadIds();
  return (data as ClientAnnouncementRow[]).map((row) => ({
    id: row.id,
    titulo: row.titulo,
    conteudo: row.conteudo,
    data_publicacao: row.created_at,
    lida: readIds.has(row.id),
  }));
}

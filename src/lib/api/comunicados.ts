import { supabase } from '../supabase';
import { Atualizacao } from '../../types';

interface ClientAnnouncementRow {
  id: string;
  titulo: string;
  conteudo: string;
  created_at: string;
}

// Leitura ainda é rastreada localmente (localStorage) porque
// client_announcement_reads exige sessão autenticada — inerte até a
// autenticação de clientes existir (ver docs/INTEGRACAO_CRM.md).
const READ_STORAGE_KEY = 'feramaq_atualizacoes_lidas';

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(ids)));
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

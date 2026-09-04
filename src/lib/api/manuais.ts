import { supabase } from '../supabase';
import { Manual } from '../../types';

interface ManualRow {
  id: string;
  titulo: string;
  descricao: string | null;
  modelo_compativel: string | null;
  categoria: Manual['categoria'] | null;
  storage_path: string;
  tamanho_bytes: number | null;
}

function formatBytes(bytes: number | null): string {
  if (!bytes || bytes <= 0) return '—';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function mapRow(row: ManualRow, client: NonNullable<typeof supabase>): Manual {
  const { data } = client.storage.from('manuais').getPublicUrl(row.storage_path);
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao || '',
    modelo_compativel: row.modelo_compativel || '',
    categoria: row.categoria || 'Operação',
    tamanho_pdf: formatBytes(row.tamanho_bytes),
    url_pdf: data.publicUrl,
  };
}

export async function fetchManuais(): Promise<Manual[]> {
  if (!supabase) throw new Error('Supabase não configurado (ver src/lib/supabase.ts).');

  const { data, error } = await supabase
    .from('manuals')
    .select('id, titulo, descricao, modelo_compativel, categoria, storage_path, tamanho_bytes')
    .order('titulo', { ascending: true });

  if (error) throw error;
  return (data as ManualRow[]).map((row) => mapRow(row, supabase));
}

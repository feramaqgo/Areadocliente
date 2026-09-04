// Estado de leitura dos comunicados. Fica separado de lib/api/comunicados.ts
// de propósito: isto é só localStorage e precisa estar disponível de imediato,
// enquanto o módulo de rede (e o cliente Supabase junto) carrega sob demanda.
// Quando a autenticação de cliente existir, isto vira client_announcement_reads
// — ver docs/INTEGRACAO_CRM.md.
const READ_STORAGE_KEY = 'feramaq_atualizacoes_lidas';

export function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Modo privativo ou storage cheio: perder a marcação de lido é aceitável,
    // travar a interface não é.
  }
}

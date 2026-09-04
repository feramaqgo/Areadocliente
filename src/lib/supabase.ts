import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// storageKey própria do Portal do Cliente: se este app e outros projetos
// Feramaq (LP, CRM) rodarem no mesmo domínio, chaves de sessão iguais fazem
// um login sobrescrever o outro.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'portal-cliente-auth',
        },
      })
    : null;

if (!supabase) {
  // Não lançamos erro aqui de propósito: a maior parte do Portal (Chamados,
  // Orçamentos, Máquinas) ainda roda em dados mockados e não depende do
  // Supabase. Um erro no import travaria o app inteiro por causa só das
  // duas features que já usam dado real (Manuais, Comunicados). Configure
  // VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY em .env.local (dev) ou nas
  // Environment Variables do Vercel (produção) — veja .env.example.
  console.error(
    'Supabase não configurado: faltam VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Manuais e Comunicados ficarão vazios até isso ser corrigido.'
  );
}

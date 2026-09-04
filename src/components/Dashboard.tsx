import React from 'react';
import { 
  FileText, 
  Wrench, 
  Cpu, 
  Download, 
  ChevronRight, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Compass
} from 'lucide-react';
import { Maquina, Chamado, Orcamento, Relatorio } from '../types';

interface DashboardProps {
  maquinas: Maquina[];
  chamados: Chamado[];
  orcamentos: Orcamento[];
  relatorios: Relatorio[];
  empresaNome?: string;
  onNavigate: (route: string, entityId?: string) => void;
}

interface AtividadeRecente {
  id: string;
  codigo: string;
  referencia: string;
  data: Date;
  dataLabel: string;
  status: string;
  rota: string;
}

// 'YYYY-MM-DD' com o construtor Date é interpretado como UTC, o que exibe o
// dia anterior em fuso negativo (BRT). Forçar hora local evita isso.
function parseDataEmissao(dataIso: string): Date {
  return new Date(`${dataIso}T00:00:00`);
}

export default function Dashboard({
  maquinas,
  chamados,
  orcamentos,
  relatorios,
  empresaNome,
  onNavigate
}: DashboardProps) {
  // Compute metrics
  const totalMaquinas = maquinas.length;
  const activeMaquinas = maquinas.filter(m => m.status === 'Operacional').length;
  const openChamados = chamados.filter(c => c.status !== 'Concluído').length;
  const pendingQuotes = orcamentos.filter(o => o.status === 'Pendente').length;
  const reportsCount = relatorios.length;
  const maquinasComPendencia = totalMaquinas - activeMaquinas;
  const chamadosUrgentes = chamados.filter(c => c.urgencia === 'Urgente' && c.status !== 'Concluído').length;

  // Atividades recentes reais: chamados e orçamentos do cliente, do mais
  // recente para o mais antigo.
  const atividadesRecentes: AtividadeRecente[] = [
    ...chamados.map(c => {
      const data = new Date(c.atualizado_em);
      return {
        id: c.id,
        codigo: c.codigo,
        referencia: c.maquina_modelo,
        data,
        dataLabel: data.toLocaleString('pt-BR', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        status: c.status,
        rota: 'chamados'
      };
    }),
    ...orcamentos.map(o => {
      const data = parseDataEmissao(o.data_emissao);
      return {
        id: o.id,
        codigo: o.codigo,
        referencia: o.referencia,
        data,
        dataLabel: data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: `Orçamento ${o.status}`,
        rota: 'orcamentos'
      };
    })
  ]
    .sort((a, b) => b.data.getTime() - a.data.getTime())
    .slice(0, 5);

  const getStatusBadgeClass = (status: string) => {
    if (status.includes('Recusado') || status === 'Aguardando Peça') {
      return 'bg-red-100 text-red-800 border border-red-200';
    }
    if (status === 'Em Atendimento' || status === 'Em Andamento') {
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    }
    if (status.includes('Pendente') || status === 'Aberto') {
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
    return 'bg-green-100 text-green-800 border border-green-200';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hello / Welcome header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-extrabold text-[#1a1c1c] tracking-tight">
          Olá{empresaNome ? `, ${empresaNome}` : ''}.
        </h1>
        <div className="flex items-center gap-2 text-sm text-[#54595F] font-medium">
          <span
            className={`w-2.5 h-2.5 rounded-full block animate-pulse ${
              maquinasComPendencia > 0
                ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
            }`}
          ></span>
          <span>
            {totalMaquinas === 0
              ? 'Nenhum equipamento cadastrado para esta conta.'
              : maquinasComPendencia > 0
                ? `${maquinasComPendencia} de ${totalMaquinas} equipamentos precisam de atenção.`
                : 'Todos os seus equipamentos estão operacionais.'}
          </span>
        </div>
      </header>

      {/* Quick Action Shortcuts */}
      <section className="flex flex-wrap gap-3">
        <button 
          onClick={() => onNavigate('chamados-novo')}
          className="bg-[#ff6801] hover:bg-[#ff6801]/90 text-white font-semibold text-sm px-5 py-3 rounded-lg flex items-center gap-2 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
        >
          <Wrench className="w-4 h-4" />
          <span>Abrir Novo Chamado</span>
        </button>
        <button 
          onClick={() => onNavigate('manuais-pecas')}
          className="bg-white border-2 border-[#54595F] hover:bg-[#f3f3f3] text-[#54595F] font-semibold text-sm px-5 py-3 rounded-lg flex items-center gap-2 transition-all active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Baixar Manual Técnico</span>
        </button>
        <button 
          onClick={() => onNavigate('manuais-pecas')}
          className="bg-white border-2 border-[#54595F] hover:bg-[#f3f3f3] text-[#54595F] font-semibold text-sm px-5 py-3 rounded-lg flex items-center gap-2 transition-all active:scale-[0.98]"
        >
          <Wrench className="w-4 h-4" />
          <span>Solicitar Peças</span>
        </button>
      </section>

      {/* KPIs Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Maquinas */}
        <div 
          onClick={() => onNavigate('maquinas')}
          className="bg-white p-5 rounded-xl border border-[#eeeeee] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-[#54595F] uppercase tracking-wider">Máquinas Ativas</span>
            <div className="p-2 bg-[#f3f3f3] rounded-lg text-[#ff6801] group-hover:bg-[#ff6801]/10 transition-colors">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-headline font-extrabold text-[#1a1c1c]">{activeMaquinas}</span>
            <span className="text-xs text-[#54595F] mb-1">/ {totalMaquinas} Total</span>
          </div>
        </div>

        {/* Card 2: Chamados */}
        <div 
          onClick={() => onNavigate('chamados')}
          className="bg-white p-5 rounded-xl border border-[#eeeeee] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-[#54595F] uppercase tracking-wider">Chamados Abertos</span>
            {chamadosUrgentes > 0 && (
              <div className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-[10px] rounded uppercase flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full block animate-ping"></span>
                Urgente
              </div>
            )}
          </div>
          <div className="flex items-end gap-2">
            <span className={`text-4xl font-headline font-extrabold ${openChamados > 0 ? 'text-red-600' : 'text-[#1a1c1c]'}`}>
              {openChamados}
            </span>
            <span className="text-xs text-[#54595F] mb-1">Em atendimento</span>
          </div>
        </div>

        {/* Card 3: Orçamentos */}
        <div 
          onClick={() => onNavigate('orcamentos')}
          className="bg-white p-5 rounded-xl border border-[#eeeeee] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-[#54595F] uppercase tracking-wider">Orçamentos Pendentes</span>
            <div className="p-2 bg-[#f3f3f3] rounded-lg text-[#54595F] group-hover:bg-[#ff6801]/10 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-headline font-extrabold text-[#1a1c1c]">{pendingQuotes}</span>
            <span className="text-xs text-[#54595F] mb-1">Aguardando aprovação</span>
          </div>
        </div>

        {/* Card 4: Relatórios */}
        <div 
          onClick={() => onNavigate('relatorios')}
          className="bg-white p-5 rounded-xl border border-[#eeeeee] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-[#54595F] uppercase tracking-wider">Relatórios do Mês</span>
            <div className="p-2 bg-[#f3f3f3] rounded-lg text-[#54595F] group-hover:bg-[#ff6801]/10 transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-headline font-extrabold text-[#1a1c1c]">{reportsCount}</span>
            <span className="text-xs text-[#54595F] mb-1">Gerados este mês</span>
          </div>
        </div>
      </section>

      {/* Recent Activities Section */}
      <section className="bg-white rounded-xl shadow-sm border border-[#eeeeee] overflow-hidden">
        <div className="p-4 border-b border-[#eeeeee] flex justify-between items-center bg-[#f9f9f9]">
          <h2 className="text-lg font-headline font-bold text-[#1a1c1c]">Atividades Recentes</h2>
          <button 
            onClick={() => onNavigate('chamados')}
            className="text-xs text-[#ff6801] hover:underline font-semibold flex items-center gap-0.5"
          >
            <span>Ver todas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {atividadesRecentes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#54595F] text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Código</th>
                  <th className="py-3 px-4 font-semibold">Referência</th>
                  <th className="py-3 px-4 font-semibold">Data</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee] text-xs">
                {atividadesRecentes.map((item) => (
                  <tr
                    key={`${item.rota}-${item.id}`}
                    onClick={() => onNavigate(item.rota, item.id)}
                    className="hover:bg-[#f9f9f9] transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-bold text-[#1a1c1c]">{item.codigo}</td>
                    <td className="py-3.5 px-4">{item.referencia}</td>
                    <td className="py-3.5 px-4 text-[#54595F]">{item.dataLabel}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <ChevronRight className="w-5 h-5 inline-block text-[#54595F] group-hover:text-[#ff6801] group-hover:translate-x-0.5 transition-all" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <Clock className="w-10 h-10 text-[#54595F] mx-auto opacity-40" />
            <h3 className="text-sm font-bold text-[#1a1c1c] mt-3">Nenhuma atividade recente</h3>
            <p className="text-xs text-[#54595F] mt-1">
              Chamados e orçamentos da sua conta aparecem aqui assim que forem abertos.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

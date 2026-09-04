import React, { useState } from 'react';
import { 
  Search, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Download, 
  ChevronLeft, 
  Calendar, 
  DollarSign, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Orcamento } from '../types';

interface OrcamentosProps {
  orcamentos: Orcamento[];
  selectedOrcamentoId: string | null;
  onSelectOrcamento: (id: string | null) => void;
  onUpdateQuoteStatus: (id: string, status: 'Aprovado' | 'Recusado') => void;
}

export default function Orcamentos({
  orcamentos,
  selectedOrcamentoId,
  onSelectOrcamento,
  onUpdateQuoteStatus
}: OrcamentosProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendente' | 'Aprovado' | 'Recusado'>('Todos');

  const filteredOrcamentos = orcamentos.filter(o => {
    const matchesSearch = o.codigo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.maquina_modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.maquina_serie.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeQuote = orcamentos.find(o => o.id === selectedOrcamentoId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Aprovado':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Recusado':
      default:
        return 'bg-red-100 text-red-800 border border-red-200';
    }
  };

  const handleDownloadPDF = (o: Orcamento) => {
    alert(`Iniciando download da Proposta Comercial: ${o.codigo} - ${o.referencia}.\nEste PDF foi gerado pelo CRM integrado e assinado via Supabase Storage.`);
  };

  // Quote detail view
  if (selectedOrcamentoId && activeQuote) {
    return (
      <div className="flex flex-col gap-6">
        {/* Detail Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#eeeeee]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onSelectOrcamento(null)}
              className="p-1 rounded bg-white border border-[#eeeeee] hover:bg-[#f3f3f3]"
            >
              <ChevronLeft className="w-5 h-5 text-[#54595F]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#ff6801]">{activeQuote.codigo}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${getStatusBadge(activeQuote.status)}`}>
                  {activeQuote.status}
                </span>
              </div>
              <h1 className="text-2xl font-headline font-extrabold text-[#1a1c1c] tracking-tight mt-0.5">{activeQuote.referencia}</h1>
            </div>
          </div>

          <div className="text-right text-sm">
            <span className="text-[#54595F] block">Valor Total B2B</span>
            <span className="font-headline font-extrabold text-[#ff6801] text-2xl">
              {activeQuote.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        {/* Detailed Breakdown Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main breakdown items */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#eeeeee] shadow-sm p-6 flex flex-col gap-6">
            <div>
              <h3 className="font-headline font-bold text-base text-[#1a1c1c] pb-2 border-b border-[#f3f3f3]">Itens da Proposta Técnica</h3>
              
              <div className="divide-y divide-[#eeeeee] text-xs mt-3">
                <div className="py-3 flex justify-between">
                  <div>
                    <span className="font-bold text-[#1a1c1c] block">Serviço Técnico de Engenharia Mecânica</span>
                    <span className="text-[#54595F] block mt-0.5">Mão de obra especializada para calibração, setup e substituição de vedações</span>
                  </div>
                  <span className="font-extrabold text-[#1a1c1c]">R$ 4.500,00</span>
                </div>

                <div className="py-3 flex justify-between">
                  <div>
                    <span className="font-bold text-[#1a1c1c] block">Peças Genuínas Feramaq</span>
                    <span className="text-[#54595F] block mt-0.5">Fuso de esferas recirculantes, vedações raspadoras de nitrila e fluido hidráulico sintético</span>
                  </div>
                  <span className="font-extrabold text-[#1a1c1c]">
                    {(activeQuote.valor_total - 4500).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div className="py-3.5 flex justify-between bg-slate-50 px-3 rounded-lg font-bold text-sm text-[#1a1c1c] mt-4">
                  <span>Subtotal da Proposta</span>
                  <span>{activeQuote.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>
            </div>

            {/* Terms / Delivery times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-[#eeeeee]">
              <div>
                <span className="text-[10px] text-[#54595F] font-bold uppercase tracking-wider block">Condições de Pagamento</span>
                <span className="font-bold text-[#1a1c1c] block mt-1">Faturado em 28/56 dias B2B direto</span>
              </div>
              <div>
                <span className="text-[10px] text-[#54595F] font-bold uppercase tracking-wider block">Prazo de Entrega das Peças</span>
                <span className="font-bold text-[#1a1c1c] block mt-1">Imediato (CD São Paulo)</span>
              </div>
            </div>
          </div>

          {/* Side Info & Action panel */}
          <div className="flex flex-col gap-4">
            {/* Action Card if Pending */}
            {activeQuote.status === 'Pendente' ? (
              <div className="bg-[#f3f3f3] p-5 rounded-xl border border-[#e2bfb1] flex flex-col gap-4 shadow-sm">
                <div className="flex gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#ff6801] shrink-0" />
                  <div>
                    <h3 className="font-headline font-bold text-sm text-[#1a1c1c]">Decisão Comercial</h3>
                    <p className="text-[11px] text-[#54595F] mt-1 leading-relaxed">
                      Esta proposta foi aprovada pela nossa engenharia comercial com tarifas reduzidas.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button 
                    onClick={() => onUpdateQuoteStatus(activeQuote.id, 'Aprovado')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 shadow"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Aprovar Orçamento</span>
                  </button>

                  <button 
                    onClick={() => onUpdateQuoteStatus(activeQuote.id, 'Recusado')}
                    className="w-full bg-white border border-red-200 text-red-700 hover:bg-red-50 font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Recusar Orçamento</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-xl border border-[#eeeeee] text-xs flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-green-600" />
                  <span className="font-bold text-[#1a1c1c]">Orçamento com Status Resolvido</span>
                </div>
                <p className="text-[#54595F] leading-relaxed">
                  Esta proposta comercial foi resolvida como <strong>{activeQuote.status}</strong> pelo seu gestor em {new Date(activeQuote.data_emissao).toLocaleDateString()}. O financeiro foi comunicado.
                </p>
              </div>
            )}

            {/* Download proposal PDF widget */}
            <div className="bg-white rounded-xl border border-[#eeeeee] shadow-sm p-4 flex flex-col gap-3">
              <span className="text-[10px] text-[#54595F] uppercase font-bold tracking-widest block">Proposta Oficial PDF</span>
              
              <button 
                onClick={() => handleDownloadPDF(activeQuote)}
                className="w-full bg-white text-[#54595F] border border-[#e2bfb1] font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-4 h-4 text-[#ff6801]" />
                <span>Baixar Proposta Assinada</span>
              </button>
            </div>

            {/* Related machine details */}
            <div className="bg-white rounded-xl border border-[#eeeeee] shadow-sm p-4 text-xs">
              <span className="text-[10px] text-[#54595F] uppercase font-bold tracking-widest block">Equipamento Destino</span>
              <strong className="text-[#1a1c1c] block mt-1.5">{activeQuote.maquina_modelo}</strong>
              <span className="text-[#54595F] block mt-0.5">SÉRIE: <strong className="text-[#1a1c1c]">{activeQuote.maquina_serie}</strong></span>
              <span className="text-[#54595F] block">Data Emissão: <strong className="text-[#1a1c1c]">{new Date(activeQuote.data_emissao).toLocaleDateString()}</strong></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Listing View
  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-[#54595F] font-bold uppercase tracking-wider">Faturamento e Custos</span>
        <h1 className="text-2xl font-headline font-extrabold text-[#1a1c1c] tracking-tight">Orçamentos Comercial B2B</h1>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-4 rounded-xl border border-[#eeeeee] shadow-sm flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-[#54595F]" />
          <input 
            type="text" 
            placeholder="Pesquisar por código, referência de manutenção ou série do equipamento..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 border border-[#e2bfb1] rounded-lg text-sm placeholder-[#54595F] focus:outline-none focus:border-[#ff6801]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['Todos', 'Pendente', 'Aprovado', 'Recusado'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                statusFilter === st 
                  ? 'bg-[#ff6801] text-white border-[#ff6801]' 
                  : 'bg-white border-[#eeeeee] text-[#54595F] hover:bg-[#f3f3f3]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes Table List */}
      {filteredOrcamentos.length > 0 ? (
        <div className="bg-white rounded-xl border border-[#eeeeee] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#54595F] text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Código</th>
                  <th className="py-3 px-4 font-semibold">Referência do Serviço</th>
                  <th className="py-3 px-4 font-semibold">Máquina / Série</th>
                  <th className="py-3 px-4 font-semibold">Data Emissão</th>
                  <th className="py-3 px-4 font-semibold text-right">Valor Total</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee] text-xs">
                {filteredOrcamentos.map((o) => (
                  <tr 
                    key={o.id} 
                    onClick={() => onSelectOrcamento(o.id)}
                    className="hover:bg-[#f9f9f9] cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-4 font-bold text-[#ff6801] font-mono group-hover:underline">{o.codigo}</td>
                    <td className="py-4 px-4 font-bold text-[#1a1c1c]">{o.referencia}</td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-[#1a1c1c] block">{o.maquina_modelo}</span>
                      <span className="text-[#54595F] text-[10px] block font-mono mt-0.5">SÉRIE: {o.maquina_serie}</span>
                    </td>
                    <td className="py-4 px-4 text-[#54595F]">{new Date(o.data_emissao).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-right font-extrabold text-[#1a1c1c]">
                      {o.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-[#eeeeee]">
          <FileText className="w-12 h-12 text-[#54595F] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[#1a1c1c] mt-4">Nenhum orçamento comercial localizado</h3>
          <p className="text-xs text-[#54595F] mt-1.5">Ajuste os filtros de status ou critérios de pesquisa.</p>
        </div>
      )}
    </div>
  );
}

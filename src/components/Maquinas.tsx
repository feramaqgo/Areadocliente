import React, { useState } from 'react';
import { 
  Search, 
  Cpu, 
  Clock, 
  Wrench, 
  BookOpen, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Activity, 
  MapPin, 
  ShieldAlert,
  Sliders,
  Sparkles
} from 'lucide-react';
import { Maquina, Chamado, Orcamento } from '../types';

interface MaquinasProps {
  maquinas: Maquina[];
  chamados: Chamado[];
  orcamentos: Orcamento[];
  selectedMaquinaId: string | null;
  onSelectMaquina: (id: string | null) => void;
  onNavigate: (route: string) => void;
}

export default function Maquinas({
  maquinas,
  chamados,
  orcamentos,
  selectedMaquinaId,
  onSelectMaquina,
  onNavigate
}: MaquinasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todas' | 'Operacional' | 'Em Manutenção' | 'Aguardando Peça' | 'Desativada'>('Todas');

  const filteredMaquinas = maquinas.filter(m => {
    const matchesSearch = m.modelo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.serie.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.linha.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todas' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeMaquina = maquinas.find(m => m.id === selectedMaquinaId);
  const activeMaquinaChamados = chamados.filter(c => c.maquina_id === selectedMaquinaId);
  const activeMaquinaOrcamentos = orcamentos.filter(o => o.maquina_id === selectedMaquinaId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Operacional':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Em Manutenção':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Aguardando Peça':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Desativada':
      default:
        return 'bg-slate-100 text-[#54595F] border border-slate-200';
    }
  };

  // Detailed view
  if (selectedMaquinaId && activeMaquina) {
    return (
      <div className="flex flex-col gap-6">
        {/* Back and Title Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#eeeeee]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onSelectMaquina(null)}
              className="p-1 rounded bg-white border border-[#eeeeee] hover:bg-[#f3f3f3]"
            >
              <ChevronLeft className="w-5 h-5 text-[#54595F]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#ff6801] font-bold uppercase tracking-wider">{activeMaquina.linha}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${getStatusBadge(activeMaquina.status)}`}>
                  {activeMaquina.status}
                </span>
              </div>
              <h1 className="text-2xl font-headline font-extrabold text-[#1a1c1c] tracking-tight mt-0.5">{activeMaquina.modelo}</h1>
            </div>
          </div>

          <div className="text-right text-sm">
            <span className="text-[#54595F] block">Série do Equipamento</span>
            <span className="font-headline font-extrabold text-[#1a1c1c] text-lg">{activeMaquina.serie}</span>
          </div>
        </div>

        {/* Dynamic Content Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Machine Photo Gallery & Specifications (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Main Product Frame Card */}
            <div className="bg-white rounded-xl border border-[#eeeeee] overflow-hidden shadow-sm flex flex-col md:flex-row">
              <div className="w-full md:w-2/5 h-60 bg-[#f3f3f3] relative shrink-0">
                <img 
                  src={activeMaquina.imagem_url} 
                  alt={activeMaquina.modelo}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-black/75 text-white font-mono text-[10px] px-2 py-1 rounded">
                  ETIQUETA FERAMAQ
                </span>
              </div>

              {/* Main parameters header */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#54595F] mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#ff6801]" />
                    <span>{activeMaquina.localizacao}</span>
                  </div>
                  <h3 className="font-headline font-bold text-base text-[#1a1c1c]">{activeMaquina.modelo}</h3>
                  <p className="text-xs text-[#54595F] mt-1.5 leading-relaxed">
                    Maquinário industrial de alta resistência mecânica para demandas produtivas continuas de pavimentação, injeção de concreto e bombeamento denso.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#f3f3f3]">
                  <div>
                    <span className="text-[10px] text-[#54595F] uppercase block">Horímetro Acumulado</span>
                    <span className="text-lg font-headline font-extrabold text-[#ff6801] mt-0.5 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {activeMaquina.horimetro} h
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#54595F] uppercase block">Garantia Técnica</span>
                    <span className="text-xs font-bold text-[#1a1c1c] mt-1 block">
                      Até {new Date(activeMaquina.garantia_ate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Industrial Specs Sheet Table */}
            <div className="bg-white rounded-xl border border-[#eeeeee] shadow-sm p-6">
              <h3 className="font-headline font-bold text-base text-[#1a1c1c] mb-4 flex items-center gap-2 pb-2 border-b border-[#f3f3f3]">
                <Activity className="w-4.5 h-4.5 text-[#ff6801]" />
                Especificações Técnicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#eeeeee]">
                  <span className="text-[#54595F] font-semibold">Fabricante</span>
                  <span className="font-bold text-[#1a1c1c]">{activeMaquina.fabricante}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#eeeeee]">
                  <span className="text-[#54595F] font-semibold">Ano de Fabricação</span>
                  <span className="font-bold text-[#1a1c1c]">{activeMaquina.ano_fabricacao}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#eeeeee]">
                  <span className="text-[#54595F] font-semibold">Data de Aquisição</span>
                  <span className="font-bold text-[#1a1c1c]">{new Date(activeMaquina.data_compra).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#eeeeee]">
                  <span className="text-[#54595F] font-semibold">Última Manutenção Preventiva</span>
                  <span className="font-bold text-[#1a1c1c]">{new Date(activeMaquina.ultima_manutencao).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#eeeeee]">
                  <span className="text-[#54595F] font-semibold">Potência Nominal do Motor</span>
                  <span className="font-bold text-[#1a1c1c]">{activeMaquina.potencia_motor}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#eeeeee]">
                  <span className="text-[#54595F] font-semibold">Peso Bruto Total</span>
                  <span className="font-bold text-[#1a1c1c]">{activeMaquina.peso_bruto}</span>
                </div>
                {Object.entries(activeMaquina.specs).map(([label, valor]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-[#eeeeee]">
                    <span className="text-[#54595F] font-semibold">{label}</span>
                    <span className="font-bold text-[#1a1c1c]">{valor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Machine Associated Actions & Mini Lists (1 col) */}
          <div className="flex flex-col gap-5">
            {/* Fast Trigger Actions Cards */}
            <div className="bg-[#f3f3f3] p-5 rounded-xl border border-[#e2bfb1]/30 flex flex-col gap-3">
              <span className="text-[10px] text-[#54595F] uppercase font-bold tracking-widest">Ações Rápidas do Equipamento</span>
              
              <button 
                onClick={() => onNavigate('chamados-novo')}
                className="w-full bg-[#ff6801] hover:bg-[#ff6801]/90 text-white font-bold text-xs py-3 rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                <span>Solicitar Reparo Emergencial</span>
              </button>

              <button 
                onClick={() => onNavigate('manuais-pecas')}
                className="w-full bg-white text-[#54595F] border border-[#e2bfb1] font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50"
              >
                <BookOpen className="w-4 h-4 text-[#ff6801]" />
                <span>Ver Manuais e Desenhos</span>
              </button>
            </div>

            {/* Related active tickets history list */}
            <div className="bg-white rounded-xl border border-[#eeeeee] shadow-sm overflow-hidden">
              <div className="p-3 bg-[#f9f9f9] border-b border-[#eeeeee] flex justify-between items-center">
                <span className="text-xs font-headline font-bold text-[#54595F] uppercase">Chamados Associados ({activeMaquinaChamados.length})</span>
              </div>
              {activeMaquinaChamados.length > 0 ? (
                <div className="divide-y divide-[#eeeeee] max-h-56 overflow-y-auto">
                  {activeMaquinaChamados.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => onNavigate('chamados')}
                      className="p-3 hover:bg-[#f9f9f9] cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between text-[10px] font-mono font-bold text-[#ff6801]">
                        <span>{c.codigo}</span>
                        <span>{new Date(c.criado_em).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#1a1c1c] mt-1 truncate">{c.titulo}</h4>
                      <span className="text-[9px] mt-1 inline-block bg-slate-100 border px-1.5 py-0.5 rounded text-[#54595F]">{c.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-[#54595F]">
                  Nenhum chamado pendente para esta máquina.
                </div>
              )}
            </div>

            {/* Related Quotes */}
            <div className="bg-white rounded-xl border border-[#eeeeee] shadow-sm overflow-hidden">
              <div className="p-3 bg-[#f9f9f9] border-b border-[#eeeeee]">
                <span className="text-xs font-headline font-bold text-[#54595F] uppercase">Orçamentos Vinculados ({activeMaquinaOrcamentos.length})</span>
              </div>
              {activeMaquinaOrcamentos.length > 0 ? (
                <div className="divide-y divide-[#eeeeee]">
                  {activeMaquinaOrcamentos.map((o) => (
                    <div 
                      key={o.id} 
                      onClick={() => onNavigate('orcamentos')}
                      className="p-3 hover:bg-[#f9f9f9] cursor-pointer transition-colors flex justify-between items-center"
                    >
                      <div>
                        <span className="text-[10px] font-mono text-[#ff6801] font-bold block">{o.codigo}</span>
                        <span className="text-xs font-bold text-[#1a1c1c] truncate max-w-[150px] block mt-0.5">{o.referencia}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-[#1a1c1c] block">
                          {o.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-[9px] text-[#54595F]">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-[#54595F]">
                  Sem orçamentos abertos para esta máquina.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard machinery portfolio list
  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-[#54595F] font-bold uppercase tracking-wider">Parque de Máquinas</span>
        <h1 className="text-2xl font-headline font-extrabold text-[#1a1c1c] tracking-tight">Meus Equipamentos</h1>
      </div>

      {/* Dynamic Search / Status filters */}
      <div className="bg-white p-4 rounded-xl border border-[#eeeeee] shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-[#54595F]" />
          <input 
            type="text" 
            placeholder="Buscar por número de série, modelo ou linha..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 border border-[#e2bfb1] rounded-lg text-sm placeholder-[#54595F] focus:outline-none focus:border-[#ff6801]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-11 px-3 bg-white border border-[#e2bfb1] rounded-lg text-sm text-[#1a1c1c] focus:outline-none"
        >
          <option value="Todas">Todos os Status</option>
          <option value="Operacional">Operacional</option>
          <option value="Em Manutenção">Em Manutenção</option>
          <option value="Aguardando Peça">Aguardando Peça</option>
          <option value="Desativada">Desativada</option>
        </select>
      </div>

      {/* Grid of Machinery */}
      {filteredMaquinas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaquinas.map((m) => (
            <div 
              key={m.id}
              onClick={() => onSelectMaquina(m.id)}
              className="bg-white rounded-xl border border-[#eeeeee] shadow-sm overflow-hidden hover:shadow-md hover:border-[#ff6801]/30 transition-all cursor-pointer flex flex-col group"
            >
              <div className="h-44 bg-[#f3f3f3] relative overflow-hidden">
                <img 
                  src={m.imagem_url} 
                  alt={m.modelo}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-black/75 text-white font-mono text-[9px] px-2 py-0.5 rounded">
                  {m.serie}
                </span>
                <span className={`absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${getStatusBadge(m.status)}`}>
                  {m.status}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-[#ff6801] font-bold uppercase tracking-wider">{m.linha}</span>
                  <h3 className="font-headline font-bold text-sm text-[#1a1c1c] mt-0.5 line-clamp-1 group-hover:text-[#ff6801] transition-colors">
                    {m.modelo}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#54595F] mt-2">
                    <MapPin className="w-3.5 h-3.5 text-[#54595F]/70" />
                    <span className="truncate">{m.localizacao}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-[#f3f3f3] text-[10px] text-[#54595F]">
                  <div>
                    <span>HORÍMETRO</span>
                    <strong className="block text-xs text-[#1a1c1c] mt-0.5">{m.horimetro} horas</strong>
                  </div>
                  <div>
                    <span>GARANTIA</span>
                    <strong className="block text-xs text-[#1a1c1c] mt-0.5">{new Date(m.garantia_ate).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-[#eeeeee]">
          <Cpu className="w-12 h-12 text-[#54595F] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[#1a1c1c] mt-4">Nenhum equipamento localizado</h3>
          <p className="text-xs text-[#54595F] mt-1.5">Redefina os critérios da busca ou filtros de status.</p>
        </div>
      )}
    </div>
  );
}

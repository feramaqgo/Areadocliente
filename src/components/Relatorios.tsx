import React, { useState } from 'react';
import { Search, BarChart2, Download, Filter, Calendar } from 'lucide-react';
import { Relatorio, Maquina } from '../types';

interface RelatoriosProps {
  relatorios: Relatorio[];
  maquinas: Maquina[];
}

export default function Relatorios({ relatorios, maquinas }: RelatoriosProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Todos' | 'Operacional' | 'Eficiência' | 'Manutenção' | 'Telemetria'>('Todos');
  const [maquinaFilter, setMaquinaFilter] = useState<string>('Todos');

  const filteredReports = relatorios.filter(r => {
    const matchesSearch = r.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.maquina_serie.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'Todos' || r.tipo === typeFilter;
    const matchesMaquina = maquinaFilter === 'Todos' || r.maquina_id === maquinaFilter;
    return matchesSearch && matchesType && matchesMaquina;
  });

  const handleDownload = (r: Relatorio) => {
    alert(`Iniciando download do relatório: ${r.titulo}.\nEste arquivo de telemetria IoT foi compilado e assinado via Supabase Storage.`);
  };

  const getReportTypeBadge = (tipo: string) => {
    switch (tipo) {
      case 'Eficiência':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Telemetria':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Manutenção':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Operacional':
      default:
        return 'bg-slate-100 text-[#54595F] border border-slate-200';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-[#54595F] font-bold uppercase tracking-wider">Telemetria & Big Data</span>
        <h1 className="text-2xl font-headline font-extrabold text-[#1a1c1c] tracking-tight">Relatórios de Eficiência e Operações</h1>
      </div>

      {/* Filters Panel */}
      <div className="bg-white p-4 rounded-xl border border-[#eeeeee] shadow-sm flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-[#54595F]" />
          <input 
            type="text" 
            placeholder="Pesquisar relatórios por título ou número de série do equipamento..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 border border-[#e2bfb1] rounded-lg text-sm placeholder-[#54595F] focus:outline-none focus:border-[#ff6801]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Filter by Report Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a1c1c] uppercase tracking-wide">Tipo de Análise</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="h-10 px-3 bg-white border border-[#e2bfb1] rounded-lg text-xs focus:outline-none focus:border-[#ff6801]"
            >
              <option value="Todos">Todos os Tipos de Relatórios</option>
              <option value="Operacional">Operacional Geral</option>
              <option value="Eficiência">Eficiência de Bombeamento</option>
              <option value="Manutenção">Históricos de Manutenção</option>
              <option value="Telemetria">Dados de Telemetria IoT</option>
            </select>
          </div>

          {/* Filter by Linked Machine */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#1a1c1c] uppercase tracking-wide">Vincular Equipamento</label>
            <select
              value={maquinaFilter}
              onChange={(e) => setMaquinaFilter(e.target.value)}
              className="h-10 px-3 bg-white border border-[#e2bfb1] rounded-lg text-xs focus:outline-none focus:border-[#ff6801]"
            >
              <option value="Todos">Todas as Máquinas do Parque</option>
              {maquinas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.serie} - {m.modelo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Listing Table */}
      {filteredReports.length > 0 ? (
        <div className="bg-white rounded-xl border border-[#eeeeee] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#54595F] text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Nome do Relatório Técnico</th>
                  <th className="py-3 px-4 font-semibold">Número de Série</th>
                  <th className="py-3 px-4 font-semibold">Tipo</th>
                  <th className="py-3 px-4 font-semibold">Data Gerado</th>
                  <th className="py-3 px-4 font-semibold text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee] text-xs">
                {filteredReports.map((r) => (
                  <tr 
                    key={r.id} 
                    className="hover:bg-[#f9f9f9] transition-colors group"
                  >
                    <td className="py-4 px-4 font-bold text-[#1a1c1c] group-hover:text-[#ff6801] transition-colors flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-[#ff6801] shrink-0" />
                      <span>{r.titulo}</span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-[#1a1c1c]">{r.maquina_serie}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getReportTypeBadge(r.tipo)}`}>
                        {r.tipo}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#54595F] font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(r.data_gerado).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => handleDownload(r)}
                        className="p-1.5 text-[#54595F] hover:text-[#ff6801] hover:bg-[#f3f3f3] rounded-lg transition-colors"
                        title="Fazer download"
                      >
                        <Download className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-[#eeeeee]">
          <BarChart2 className="w-12 h-12 text-[#54595F] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[#1a1c1c] mt-4">Nenhum relatório técnico encontrado</h3>
          <p className="text-xs text-[#54595F] mt-1.5">Redefina os filtros ou ajuste o termo da pesquisa.</p>
        </div>
      )}
    </div>
  );
}

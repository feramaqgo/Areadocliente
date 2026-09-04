import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  Download, 
  FileText, 
  Wrench, 
  ShoppingBag, 
  CheckCircle, 
  X, 
  ArrowRight,
  Info
} from 'lucide-react';
import { Manual, Peca, Maquina } from '../types';

interface ManuaisPecasProps {
  manuais: Manual[];
  pecas: Peca[];
  maquinas: Maquina[];
  onRequestQuote: (peca: Peca, quantidade: number, maquinaId: string) => void;
}

export default function ManuaisPecas({
  manuais,
  pecas,
  maquinas,
  onRequestQuote
}: ManuaisPecasProps) {
  const [activeTab, setActiveTab] = useState<'manuais' | 'pecas'>('manuais');
  
  // Search & Filter States for Manuals
  const [manualSearch, setManualSearch] = useState('');
  const [manualCategory, setManualCategory] = useState<'Todos' | 'Elétrica' | 'Mecânica' | 'Hidráulica' | 'Operação'>('Todos');

  // Search & Filter States for Parts
  const [partSearch, setPartSearch] = useState('');
  const [partCategory, setPartCategory] = useState<'Todas' | 'Mecânica' | 'Hidráulica' | 'Elétrica'>('Todas');

  // Dialog State
  const [selectedPartForQuote, setSelectedPartForQuote] = useState<Peca | null>(null);
  const [quoteQuantity, setQuoteQuantity] = useState<number>(1);
  const [quoteMaquinaId, setQuoteMaquinaId] = useState<string>(maquinas[0]?.id || '');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Manuals filtering
  const filteredManuals = manuais.filter(m => {
    const matchesSearch = m.titulo.toLowerCase().includes(manualSearch.toLowerCase()) || 
                          m.descricao.toLowerCase().includes(manualSearch.toLowerCase()) ||
                          m.modelo_compativel.toLowerCase().includes(manualSearch.toLowerCase());
    const matchesCategory = manualCategory === 'Todos' || m.categoria === manualCategory;
    return matchesSearch && matchesCategory;
  });

  // Parts filtering
  const filteredParts = pecas.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(partSearch.toLowerCase()) || 
                          p.descricao.toLowerCase().includes(partSearch.toLowerCase()) || 
                          p.codigo.toLowerCase().includes(partSearch.toLowerCase());
    const matchesCategory = partCategory === 'Todas' || p.categoria === partCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (manual: Manual) => {
    alert(`Iniciando download do arquivo: ${manual.titulo} (${manual.tamanho_pdf}).\nO arquivo foi gerado e assinado via Supabase Storage.`);
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartForQuote) return;

    onRequestQuote(selectedPartForQuote, quoteQuantity, quoteMaquinaId);
    
    // Close & show success toast
    setSelectedPartForQuote(null);
    setQuoteQuantity(1);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 5000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Subtabs Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eeeeee] pb-4">
        <div>
          <span className="text-xs text-[#54595F] font-bold uppercase tracking-wider">Biblioteca Industrial</span>
          <h1 className="text-2xl font-headline font-extrabold text-[#1a1c1c] tracking-tight">Manuais & Peças Genuínas</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#f3f3f3] p-1 rounded-xl border border-[#eeeeee]">
          <button
            onClick={() => setActiveTab('manuais')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'manuais' 
                ? 'bg-white text-[#ff6801] shadow-sm' 
                : 'text-[#54595F] hover:text-[#ff6801]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Manuais Técnicos</span>
          </button>
          <button
            onClick={() => setActiveTab('pecas')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'pecas' 
                ? 'bg-white text-[#ff6801] shadow-sm' 
                : 'text-[#54595F] hover:text-[#ff6801]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Catálogo de Peças</span>
          </button>
        </div>
      </div>

      {/* SUCCESS TOAST BAR */}
      {showSuccessToast && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <span className="text-sm font-bold text-green-800">Solicitação de Peça Registrada com Sucesso!</span>
              <p className="text-xs text-green-700 mt-0.5">Um orçamento com status "Pendente" foi adicionado ao seu registro de faturamento.</p>
            </div>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-green-800 hover:text-green-950 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB CONTENT: MANUALS */}
      {activeTab === 'manuais' && (
        <div className="flex flex-col gap-6">
          {/* Manual Search & Category Pills */}
          <div className="bg-white p-4 rounded-xl border border-[#eeeeee] shadow-sm flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-[#54595F]" />
              <input 
                type="text" 
                placeholder="Pesquisar por títulos de manuais, esquemas ou modelos compatíveis..." 
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 border border-[#e2bfb1] rounded-lg text-sm placeholder-[#54595F] focus:outline-none focus:border-[#ff6801]"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['Todos', 'Elétrica', 'Mecânica', 'Hidráulica', 'Operação'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setManualCategory(cat as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    manualCategory === cat 
                      ? 'bg-[#ff6801] text-white border-[#ff6801]' 
                      : 'bg-white border-[#eeeeee] text-[#54595F] hover:bg-[#f3f3f3]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List of Manuals */}
          {filteredManuals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredManuals.map((man) => (
                <div 
                  key={man.id}
                  className="bg-white p-5 rounded-xl border border-[#eeeeee] shadow-sm flex flex-col justify-between group hover:border-[#ff6801]/30 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-slate-100 border border-slate-200 text-[#54595F] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {man.categoria}
                      </span>
                      <span className="text-[10px] text-[#54595F] font-mono">{man.tamanho_pdf}</span>
                    </div>

                    <h3 className="font-headline font-bold text-sm text-[#1a1c1c] mt-3 group-hover:text-[#ff6801] transition-colors leading-snug">
                      {man.titulo}
                    </h3>
                    <p className="text-xs text-[#54595F] line-clamp-3 mt-2 leading-relaxed">
                      {man.descricao}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#f3f3f3] flex items-center justify-between">
                    <span className="text-[10px] text-[#54595F]">COMPATÍVEL: <strong className="text-[#1a1c1c]">{man.modelo_compativel}</strong></span>
                    
                    <button 
                      onClick={() => handleDownload(man)}
                      className="bg-[#f3f3f3] hover:bg-[#ff6801]/10 text-[#54595F] hover:text-[#ff6801] p-2 rounded-lg transition-colors"
                      title="Fazer download do PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-xl border border-[#eeeeee]">
              <BookOpen className="w-12 h-12 text-[#54595F] mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-[#1a1c1c] mt-4">Nenhum manual técnico localizado</h3>
              <p className="text-xs text-[#54595F] mt-1.5">Redefina os termos da busca.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PARTS CATALOG */}
      {activeTab === 'pecas' && (
        <div className="flex flex-col gap-6">
          {/* Parts Search & Category filter */}
          <div className="bg-white p-4 rounded-xl border border-[#eeeeee] shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-[#54595F]" />
              <input 
                type="text" 
                placeholder="Pesquisar peças por nome, código SKU ou modelo compatível..." 
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 border border-[#e2bfb1] rounded-lg text-sm placeholder-[#54595F] focus:outline-none focus:border-[#ff6801]"
              />
            </div>

            <select
              value={partCategory}
              onChange={(e) => setPartCategory(e.target.value as any)}
              className="h-11 px-3 bg-white border border-[#e2bfb1] rounded-lg text-sm text-[#1a1c1c] focus:outline-none focus:border-[#ff6801]"
            >
              <option value="Todas">Todas as Categorias</option>
              <option value="Mecânica">Peças Mecânicas</option>
              <option value="Hidráulica">Componentes Hidráulicos</option>
              <option value="Elétrica">Peças Elétricas / Motores</option>
            </select>
          </div>

          {/* Parts Grid */}
          {filteredParts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredParts.map((peca) => (
                <div 
                  key={peca.id}
                  className="bg-white rounded-xl border border-[#eeeeee] shadow-sm overflow-hidden flex flex-col justify-between group hover:border-[#ff6801]/30 hover:shadow-md transition-all"
                >
                  <div className="h-40 bg-[#f3f3f3] relative shrink-0 overflow-hidden">
                    <img 
                      src={peca.imagem_url} 
                      alt={peca.nome}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-black/75 text-white font-mono text-[9px] px-2 py-0.5 rounded">
                      {peca.codigo}
                    </span>
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-[#ff6801] font-bold uppercase tracking-wider">{peca.categoria}</span>
                      <h3 className="font-headline font-bold text-sm text-[#1a1c1c] mt-0.5 line-clamp-1 group-hover:text-[#ff6801] transition-colors leading-tight">
                        {peca.nome}
                      </h3>
                      <p className="text-[11px] text-[#54595F] line-clamp-2 mt-1 leading-relaxed">
                        {peca.descricao}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#f3f3f3] flex flex-col gap-2">
                      <span className="text-[9px] text-[#54595F]">COMPATÍVEL COM: <strong className="text-[#1a1c1c] block text-[10px] truncate">{peca.modelo_compativel}</strong></span>
                      
                      <button 
                        onClick={() => setSelectedPartForQuote(peca)}
                        className="w-full bg-[#f3f3f3] hover:bg-[#ff6801] text-[#54595F] hover:text-white font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Solicitar Cotação</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-xl border border-[#eeeeee]">
              <ShoppingBag className="w-12 h-12 text-[#54595F] mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-[#1a1c1c] mt-4">Nenhuma peça localizada</h3>
              <p className="text-xs text-[#54595F] mt-1.5">Ajuste os filtros de busca ou SKU.</p>
            </div>
          )}
        </div>
      )}

      {/* OVERLAY DIALOG MODAL FOR PARTS REQUEST */}
      {selectedPartForQuote && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#e2bfb1] animate-scale-up">
            <div className="p-4 bg-[#f9f9f9] border-b border-[#eeeeee] flex justify-between items-center">
              <span className="text-xs font-headline font-bold text-[#54595F] uppercase tracking-wider">Solicitação de Peça</span>
              <button 
                onClick={() => setSelectedPartForQuote(null)}
                className="p-1 rounded bg-white border border-[#eeeeee] text-[#54595F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuoteSubmit} className="p-5 flex flex-col gap-4">
              <div className="flex gap-3 bg-[#f3f3f3] p-3 rounded-lg border border-[#e2bfb1]/30">
                <div className="w-16 h-16 rounded bg-white shrink-0 overflow-hidden border border-[#eeeeee]">
                  <img src={selectedPartForQuote.imagem_url} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-[#ff6801] font-bold">{selectedPartForQuote.codigo}</span>
                  <h4 className="text-xs font-bold text-[#1a1c1c] truncate">{selectedPartForQuote.nome}</h4>
                  <span className="text-[10px] text-[#54595F] block truncate mt-0.5">Para: {selectedPartForQuote.modelo_compativel}</span>
                </div>
              </div>

              {/* Select target Machine */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#1a1c1c]">Vincular ao Equipamento do Parque (Número de Série)</label>
                <select
                  value={quoteMaquinaId}
                  onChange={(e) => setQuoteMaquinaId(e.target.value)}
                  className="h-10 px-3 bg-white border border-[#e2bfb1] rounded-lg text-xs focus:outline-none focus:border-[#ff6801]"
                  required
                >
                  {maquinas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.serie} - {m.modelo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select quantity */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#1a1c1c]">Quantidade Necessária</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={quoteQuantity}
                  onChange={(e) => setQuoteQuantity(Number(e.target.value))}
                  className="h-10 px-3 border border-[#e2bfb1] rounded-lg text-xs focus:outline-none focus:border-[#ff6801]"
                  required
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-lg text-[10px] text-[#54595F] leading-relaxed flex gap-2 border border-amber-200">
                <Info className="w-4 h-4 text-[#ff6801] shrink-0 mt-0.5" />
                <span>
                  O envio registrará uma cotação automática no sistema. Nossa equipe comercial analisará a solicitação de peças genuínas para faturar com desconto exclusivo B2B.
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setSelectedPartForQuote(null)}
                  className="px-3.5 py-1.5 text-xs font-bold text-[#54595F] hover:bg-[#f3f3f3] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#ff6801] hover:bg-[#ff6801]/95 text-white font-bold text-xs px-4 py-2 rounded-lg"
                >
                  Confirmar e Gerar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

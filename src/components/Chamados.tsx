import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Wrench, 
  MessageSquare, 
  Paperclip, 
  Send, 
  ChevronLeft, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  User,
  Activity,
  Image as ImageIcon
} from 'lucide-react';
import { Chamado, Maquina, ChamadoMensagem, ChamadoAnexo } from '../types';

interface ChamadosProps {
  chamados: Chamado[];
  maquinas: Maquina[];
  mensagens: ChamadoMensagem[];
  anexos: ChamadoAnexo[];
  onAddChamado: (chamado: Partial<Chamado>, fileList?: FileList) => void;
  onAddMensagem: (chamadoId: string, msg: string, files?: FileList) => void;
  selectedChamadoId: string | null;
  onSelectChamado: (id: string | null) => void;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export default function Chamados({
  chamados,
  maquinas,
  mensagens,
  anexos,
  onAddChamado,
  onAddMensagem,
  selectedChamadoId,
  onSelectChamado,
  currentRoute,
  onNavigate
}: ChamadosProps) {
  // Local state for listing filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Aberto' | 'Em Atendimento' | 'Aguardando Peça' | 'Concluído'>('Todos');
  const [urgencyFilter, setUrgencyFilter] = useState<'Todas' | 'Normal' | 'Urgente'>('Todas');

  // New ticket state
  const [newMaquinaId, setNewMaquinaId] = useState(maquinas[0]?.id || '');
  const [newTitulo, setNewTitulo] = useState('');
  const [newUrgencia, setNewUrgencia] = useState<'Normal' | 'Urgente'>('Normal');
  const [newCategoria, setNewCategoria] = useState('Mecânica');
  const [newDescricao, setNewDescricao] = useState('');
  const [newFiles, setNewFiles] = useState<FileList | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Live message state
  const [chatMessage, setChatMessage] = useState('');
  const [chatFiles, setChatFiles] = useState<FileList | null>(null);

  // Filtered tickets
  const filteredChamados = chamados.filter(c => {
    const matchesSearch = c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.maquina_modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.maquina_serie.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'Todas' || c.urgencia === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const activeTicket = chamados.find(c => c.id === selectedChamadoId);
  const activeMessages = mensagens.filter(m => m.chamado_id === selectedChamadoId);
  const activeAttachments = anexos.filter(a => a.chamado_id === selectedChamadoId);

  const handleOpenTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitulo || !newDescricao) return;

    const chosenMaquina = maquinas.find(m => m.id === newMaquinaId);
    if (!chosenMaquina) return;

    onAddChamado({
      titulo: newTitulo,
      descricao: newDescricao,
      urgencia: newUrgencia,
      categoria: newCategoria,
      maquina_id: chosenMaquina.id,
      maquina_serie: chosenMaquina.serie,
      maquina_modelo: chosenMaquina.modelo
    }, newFiles || undefined);

    // Reset form
    setNewTitulo('');
    setNewDescricao('');
    setNewFiles(null);
    onNavigate('chamados');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() && !chatFiles) return;
    if (!selectedChamadoId) return;

    onAddMensagem(selectedChamadoId, chatMessage, chatFiles || undefined);
    setChatMessage('');
    setChatFiles(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aberto':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Em Atendimento':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Aguardando Peça':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Concluído':
      default:
        return 'bg-green-100 text-green-800 border border-green-200';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    return urgency === 'Urgente'
      ? 'bg-red-100 text-red-700 font-extrabold uppercase text-[10px] px-2 py-0.5 rounded border border-red-200'
      : 'bg-slate-100 text-[#54595F] font-bold text-[10px] px-2 py-0.5 rounded border border-slate-200';
  };

  // If showing new call screen
  if (currentRoute === 'chamados-novo') {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('chamados')}
            className="p-1 rounded bg-white border border-[#eeeeee] hover:bg-[#f3f3f3]"
          >
            <ChevronLeft className="w-5 h-5 text-[#54595F]" />
          </button>
          <div>
            <span className="text-xs text-[#54595F] font-bold uppercase tracking-wider">Novo Atendimento</span>
            <h1 className="text-2xl font-headline font-extrabold text-[#1a1c1c] tracking-tight">Solicitar Abertura de Chamado</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Panel */}
          <form onSubmit={handleOpenTicketSubmit} className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#eeeeee] shadow-sm flex flex-col gap-5">
            {/* Machine Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#1a1c1c]">Máquina Vinculada (Gravada via Série)</label>
              <select 
                value={newMaquinaId}
                onChange={(e) => setNewMaquinaId(e.target.value)}
                className="h-11 px-3 bg-white border border-[#e2bfb1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6801]/20 focus:border-[#ff6801]"
              >
                {maquinas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.serie} - {m.modelo} ({m.localizacao})
                  </option>
                ))}
              </select>
            </div>

            {/* Title / Subject */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#1a1c1c]">Título do Chamado / Resumo da Falha</label>
              <input 
                type="text" 
                placeholder="Ex.: Vazamento de óleo hidráulico no pistão"
                value={newTitulo}
                onChange={(e) => setNewTitulo(e.target.value)}
                className="h-11 px-3 border border-[#e2bfb1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6801]/20 focus:border-[#ff6801]"
                required
              />
            </div>

            {/* Urgency & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#1a1c1c]">Nível de Urgência</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewUrgencia('Normal')}
                    className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg border transition-all ${
                      newUrgencia === 'Normal' 
                        ? 'bg-[#f3f3f3] border-[#54595F] text-[#1a1c1c]' 
                        : 'bg-white border-[#eeeeee] text-[#54595F] hover:bg-[#f9f9f9]'
                    }`}
                  >
                    Normal (Operacional)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUrgencia('Urgente')}
                    className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg border transition-all ${
                      newUrgencia === 'Urgente' 
                        ? 'bg-red-50 border-red-500 text-red-700 font-bold shadow-sm' 
                        : 'bg-white border-[#eeeeee] text-[#54595F] hover:bg-red-50/30'
                    }`}
                  >
                    Urgente (Máquina Parada)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#1a1c1c]">Categoria Técnica</label>
                <select 
                  value={newCategoria}
                  onChange={(e) => setNewCategoria(e.target.value)}
                  className="h-11 px-3 bg-white border border-[#e2bfb1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6801]/20 focus:border-[#ff6801]"
                >
                  <option value="Mecânica">Mecânica de Fluidos</option>
                  <option value="Hidráulica">Sistema Hidráulico</option>
                  <option value="Elétrica">Parte Elétrica / Sensores</option>
                  <option value="Software">Comando Numérico (CNC)</option>
                  <option value="Manutenção">Revisão Periódica / Peças</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#1a1c1c]">Descrição Detalhada do Problema</label>
              <textarea 
                rows={5}
                placeholder="Por favor, relate o que ocorreu, códigos de erro exibidos na tela de comando físico e ruídos constatados na operação do maquinário."
                value={newDescricao}
                onChange={(e) => setNewDescricao(e.target.value)}
                className="p-3 border border-[#e2bfb1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6801]/20 focus:border-[#ff6801] resize-none"
                required
              />
            </div>

            {/* File Drag-and-Drop Area */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#1a1c1c]">Anexos / Fotos da Peça ou Falha</label>
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isDragOver 
                    ? 'border-[#ff6801] bg-[#ff6801]/5' 
                    : 'border-[#e2bfb1] bg-slate-50 hover:bg-slate-100/70'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files.length > 0) {
                    setNewFiles(e.dataTransfer.files);
                  }
                }}
              >
                <input 
                  type="file" 
                  id="file-upload" 
                  multiple 
                  className="hidden" 
                  onChange={(e) => setNewFiles(e.target.files)}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Paperclip className="w-8 h-8 text-[#54595F]" />
                  <span className="text-sm font-bold text-[#ff6801] hover:underline">Arraste arquivos ou clique para selecionar</span>
                  <span className="text-xs text-[#54595F]">Tamanho máximo do lote: 15MB. Formatos aceitos: JPG, PNG, PDF</span>
                </label>
                {newFiles && (
                  <div className="mt-4 p-2 bg-white border border-[#eeeeee] rounded-lg text-xs flex flex-wrap gap-2 justify-center">
                    {Array.from(newFiles).map((file: File, idx) => (
                      <span key={idx} className="bg-[#f3f3f3] text-[#1a1c1c] px-2 py-1 rounded border font-medium flex items-center gap-1">
                        <FileText className="w-3 h-3 text-[#54595F]" />
                        {file.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#eeeeee]">
              <button
                type="button"
                onClick={() => onNavigate('chamados')}
                className="px-4 py-2 text-sm font-bold text-[#54595F] hover:bg-[#f3f3f3] rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-[#ff6801] hover:bg-[#ff6801]/90 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-sm"
              >
                Enviar Chamado à Feramaq
              </button>
            </div>
          </form>

          {/* Guidelines Sidebar info */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#f3f3f3] p-5 rounded-xl border border-[#e2bfb1]/30">
              <h3 className="font-headline font-bold text-sm text-[#1a1c1c] flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-[#ff6801]" />
                SLA de Atendimento
              </h3>
              <p className="text-xs text-[#54595F] mt-2.5 leading-relaxed">
                Nossos analistas técnicos analisam chamados marcados como <strong>Urgente (Máquina Parada)</strong> em no máximo <strong>2 horas úteis</strong>.
              </p>
              <p className="text-xs text-[#54595F] mt-2 leading-relaxed">
                Chamados de nível <strong>Normal</strong> têm resposta garantida em até <strong>12 horas úteis</strong>.
              </p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-[#eeeeee]">
              <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-[#54595F]">Requisitos de Envio</h4>
              <ul className="text-xs text-[#54595F] mt-3 flex flex-col gap-2 list-disc list-inside">
                <li>Série gravada fisicamente visível na placa</li>
                <li>Foto nítida da etiqueta de fabricação</li>
                <li>Dados de telemetria se aplicável</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If viewing a detailed ticket (Chat view!)
  if (selectedChamadoId && activeTicket) {
    return (
      <div className="flex flex-col gap-5 h-full">
        {/* Back and Status header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#eeeeee]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onSelectChamado(null)}
              className="p-1 rounded bg-white border border-[#eeeeee] hover:bg-[#f3f3f3]"
            >
              <ChevronLeft className="w-5 h-5 text-[#54595F]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#1a1c1c]">{activeTicket.codigo}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${getStatusBadge(activeTicket.status)}`}>
                  {activeTicket.status}
                </span>
                {getUrgencyBadge(activeTicket.urgencia)}
              </div>
              <h1 className="text-xl font-headline font-extrabold text-[#1a1c1c] mt-0.5">{activeTicket.titulo}</h1>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-[#54595F] block">Série Vinculada: <strong className="text-[#1a1c1c]">{activeTicket.maquina_serie}</strong></span>
            <span className="text-[#54595F] block">Modelo: <strong className="text-[#1a1c1c]">{activeTicket.maquina_modelo}</strong></span>
          </div>
        </div>

        {/* 2-Column Split: Chat (Left) & Ticket Metadata/Timeline (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start flex-1">
          {/* Chat Panel */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#eeeeee] shadow-sm flex flex-col h-[550px]">
            {/* Chat header */}
            <div className="p-3 bg-[#f9f9f9] border-b border-[#eeeeee] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="text-xs font-bold text-[#54595F] uppercase">Suporte Técnico Conectado</span>
              </div>
              <span className="text-[11px] text-[#54595F] font-mono">ID Externo: {activeTicket.id_externo || 'N/A'}</span>
            </div>

            {/* Chat Stream messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {/* Ticket Description as the initial message */}
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-[#ff6801]/10 flex items-center justify-center font-bold text-xs text-[#ff6801] shrink-0 border border-[#ff6801]/20">
                  C
                </div>
                <div className="bg-[#f3f3f3] text-[#1a1c1c] p-3 rounded-xl rounded-tl-none text-xs flex flex-col gap-1.5 shadow-sm border border-[#eeeeee]">
                  <div className="flex justify-between items-center gap-6">
                    <span className="font-bold text-[#1a1c1c]">Julio Santos (Operador)</span>
                    <span className="text-[10px] text-[#54595F]">Mensagem Inicial</span>
                  </div>
                  <p className="leading-relaxed">{activeTicket.descricao}</p>
                </div>
              </div>

              {/* Thread Messages */}
              {activeMessages.map((msg) => {
                const isSupport = msg.tipo_usuario === 'suporte';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex items-start gap-2.5 max-w-[85%] ${isSupport ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                      isSupport 
                        ? 'bg-[#54595F] text-white border-[#54595F]' 
                        : 'bg-[#dee3ea] text-[#1a1c1c] border-[#dee3ea]'
                    }`}>
                      {msg.usuario_nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className={`p-3 rounded-xl text-xs flex flex-col gap-1 shadow-sm ${
                      isSupport 
                        ? 'bg-[#ff6801] text-white rounded-tr-none' 
                        : 'bg-[#f3f3f3] text-[#1a1c1c] rounded-tl-none border border-[#eeeeee]'
                    }`}>
                      <div className="flex justify-between items-center gap-6">
                        <span className="font-extrabold">{msg.usuario_nome}</span>
                        <span className={`text-[9px] ${isSupport ? 'text-orange-100' : 'text-[#54595F]'}`}>
                          {new Date(msg.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="leading-relaxed">{msg.mensagem}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attachment preview if selected */}
            {chatFiles && (
              <div className="px-4 py-2 bg-[#f9f9f9] border-t border-[#eeeeee] flex flex-wrap gap-2 text-xs">
                {Array.from(chatFiles).map((f: File, idx) => (
                  <span key={idx} className="bg-white border border-[#e2bfb1] text-[#1a1c1c] font-medium px-2 py-1 rounded flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-[#ff6801]" />
                    {f.name}
                  </span>
                ))}
              </div>
            )}

            {/* Chat Send Area */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#eeeeee] bg-white flex gap-2">
              <input 
                type="file" 
                id="chat-file-upload" 
                multiple 
                className="hidden" 
                onChange={(e) => setChatFiles(e.target.files)}
              />
              <label 
                htmlFor="chat-file-upload" 
                className="p-2.5 rounded-lg border border-[#e2bfb1] text-[#54595F] hover:text-[#ff6801] hover:bg-[#f3f3f3] cursor-pointer transition-colors"
                title="Adicionar fotos"
              >
                <Paperclip className="w-4 h-4" />
              </label>

              <input 
                type="text" 
                placeholder="Digite sua mensagem de suporte..." 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-grow h-10 px-3 bg-[#f3f3f3] border border-[#e2bfb1] rounded-lg text-xs focus:outline-none focus:border-[#ff6801]"
              />

              <button 
                type="submit"
                className="bg-[#ff6801] hover:bg-[#ff6801]/95 text-white font-bold h-10 w-10 rounded-lg flex items-center justify-center shadow transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Ticket Specs sidebar info & Live Attachments list */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-[#eeeeee] shadow-sm overflow-hidden">
              <div className="p-3 bg-[#f9f9f9] border-b border-[#eeeeee]">
                <h3 className="text-xs font-headline font-bold text-[#54595F] uppercase tracking-wider">Histórico do Chamado</h3>
              </div>
              <div className="p-4 flex flex-col gap-4 text-xs">
                <div className="flex gap-2.5">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[#1a1c1c] block">Chamado Aberto</span>
                    <span className="text-[#54595F] block mt-0.5">Criado via painel do cliente em {new Date(activeTicket.criado_em).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[#1a1c1c] block">Técnico Atribuído</span>
                    <span className="text-[#54595F] block mt-0.5">Redirecionado para engenharia especializada da Feramaq</span>
                  </div>
                </div>
              </div>
            </div>

            {/* List of attachments sent */}
            <div className="bg-white rounded-xl border border-[#eeeeee] shadow-sm overflow-hidden">
              <div className="p-3 bg-[#f9f9f9] border-b border-[#eeeeee]">
                <h3 className="text-xs font-headline font-bold text-[#54595F] uppercase tracking-wider">Anexos Vinculados ({activeAttachments.length})</h3>
              </div>
              {activeAttachments.length > 0 ? (
                <div className="p-3 flex flex-col gap-2">
                  {activeAttachments.map((anx) => (
                    <a 
                      key={anx.id} 
                      href={anx.url_arquivo} 
                      target="_blank" 
                      rel="referrer"
                      className="flex items-center gap-2 p-2 bg-slate-50 border border-[#eeeeee] rounded-lg hover:border-[#ff6801] transition-all group"
                    >
                      <ImageIcon className="w-4 h-4 text-[#ff6801] shrink-0" />
                      <div className="flex-1 min-w-0 text-[11px]">
                        <span className="font-bold text-[#1a1c1c] truncate block group-hover:text-[#ff6801]">{anx.nome_arquivo}</span>
                        <span className="text-[#54595F] block text-[9px]">{anx.tamanho_arquivo}</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-[#54595F]">
                  Nenhum anexo associado a este chamado.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, standard ticket listing screen
  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#54595F] font-bold uppercase tracking-wider">Atendimento de Suporte</span>
          <h1 className="text-2xl font-headline font-extrabold text-[#1a1c1c] tracking-tight">Meus Chamados</h1>
        </div>
        <button 
          onClick={() => onNavigate('chamados-novo')}
          className="bg-[#ff6801] hover:bg-[#ff6801]/90 text-white font-bold text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 self-start shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Solicitar Novo Chamado</span>
        </button>
      </div>

      {/* Filter Options Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#eeeeee] shadow-sm flex flex-col gap-4">
        {/* Search Input bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-[#54595F]" />
          <input 
            type="text" 
            placeholder="Filtrar por código de chamado, título ou modelo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 border border-[#e2bfb1] rounded-lg text-sm placeholder-[#54595F] focus:outline-none focus:border-[#ff6801]"
          />
        </div>

        {/* Categories / Status filtering pills */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {['Todos', 'Aberto', 'Em Atendimento', 'Aguardando Peça', 'Concluído'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  statusFilter === status 
                    ? 'bg-[#ff6801] text-white border-[#ff6801]' 
                    : 'bg-white border-[#eeeeee] text-[#54595F] hover:bg-[#f3f3f3]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Urgencies dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#54595F] font-semibold">Urgência:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value as any)}
              className="h-8 px-2 bg-white border border-[#eeeeee] rounded-md text-xs font-semibold focus:outline-none"
            >
              <option value="Todas">Todas</option>
              <option value="Normal">Normal</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of calls */}
      {filteredChamados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChamados.map((c) => (
            <div 
              key={c.id}
              onClick={() => onSelectChamado(c.id)}
              className="bg-white p-5 rounded-xl border border-[#eeeeee] hover:border-[#ff6801]/30 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start gap-4">
                <span className="text-xs font-bold text-[#ff6801] font-mono">{c.codigo}</span>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${getStatusBadge(c.status)}`}>
                    {c.status}
                  </span>
                  {getUrgencyBadge(c.urgencia)}
                </div>
              </div>

              <div className="mt-3 flex-1">
                <h3 className="font-headline font-bold text-sm text-[#1a1c1c] line-clamp-2 leading-snug group-hover:text-[#ff6801] transition-colors">
                  {c.titulo}
                </h3>
                <p className="text-xs text-[#54595F] line-clamp-3 mt-1.5 leading-relaxed">
                  {c.descricao}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f3f3f3] flex justify-between items-center text-[10px] text-[#54595F]">
                <span>MÁQ: <strong className="text-[#1a1c1c]">{c.maquina_serie}</strong></span>
                <span>{new Date(c.criado_em).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-[#eeeeee]">
          <Wrench className="w-12 h-12 text-[#54595F] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[#1a1c1c] mt-4">Nenhum chamado localizado</h3>
          <p className="text-xs text-[#54595F] mt-1.5">Experimente ajustar os filtros ou pesquisar com termos diferentes.</p>
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  mockEmpresas,
  mockUsuarios,
  mockMaquinas,
  mockChamados,
  mockMensagens,
  mockAnexos,
  mockOrcamentos,
  mockPecas,
  mockRelatorios,
  mockLogs
} from './data';
import { Usuario, Empresa, Maquina, Chamado, ChamadoMensagem, ChamadoAnexo, Orcamento, Manual, Peca, Relatorio, Atualizacao, LogAtividade } from './types';
import { fetchManuais } from './lib/api/manuais';
import { fetchAtualizacoes, saveReadIds } from './lib/api/comunicados';

// Component Imports
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Chamados from './components/Chamados';
import Maquinas from './components/Maquinas';
import ManuaisPecas from './components/ManuaisPecas';
import Orcamentos from './components/Orcamentos';
import Relatorios from './components/Relatorios';
import PerfilConfig from './components/PerfilConfig';
import Anuncios from './components/Anuncios';

export default function App() {
  // Authentication & Navigation Route States
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [currentAuthState, setAuthState] = useState<'login' | 'primeiro-acesso' | 'recuperar-senha'>('login');

  // Active Entity Selections
  const [selectedMaquinaId, setSelectedMaquinaId] = useState<string | null>(null);
  const [selectedChamadoId, setSelectedChamadoId] = useState<string | null>(null);
  const [selectedOrcamentoId, setSelectedOrcamentoId] = useState<string | null>(null);

  // Core Persistent State Pools
  const [empresas, setEmpresas] = useState<Empresa[]>(mockEmpresas);
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios);
  const [maquinas, setMaquinas] = useState<Maquina[]>(mockMaquinas);
  const [chamados, setChamados] = useState<Chamado[]>(mockChamados);
  const [mensagens, setMensagens] = useState<ChamadoMensagem[]>(mockMensagens);
  const [anexos, setAnexos] = useState<ChamadoAnexo[]>(mockAnexos);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(mockOrcamentos);
  const [manuais, setManuais] = useState<Manual[]>([]);
  const [pecas, setPecas] = useState<Peca[]>(mockPecas);
  const [relatorios, setRelatorios] = useState<Relatorio[]>(mockRelatorios);
  const [atualizacoes, setAtualizacoes] = useState<Atualizacao[]>([]);
  const [logs, setLogs] = useState<LogAtividade[]>(mockLogs);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('feramaq_user');
    const savedChamados = localStorage.getItem('feramaq_chamados');
    const savedMensagens = localStorage.getItem('feramaq_mensagens');
    const savedAnexos = localStorage.getItem('feramaq_anexos');
    const savedOrcamentos = localStorage.getItem('feramaq_orcamentos');
    const savedUsuarios = localStorage.getItem('feramaq_usuarios');

    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedChamados) setChamados(JSON.parse(savedChamados));
    if (savedMensagens) setMensagens(JSON.parse(savedMensagens));
    if (savedAnexos) setAnexos(JSON.parse(savedAnexos));
    if (savedOrcamentos) setOrcamentos(JSON.parse(savedOrcamentos));
    if (savedUsuarios) setUsuarios(JSON.parse(savedUsuarios));
  }, []);

  // Manuais e Comunicados já vêm do Supabase real (não dependem de login
  // de cliente, que ainda está pendente — ver docs/INTEGRACAO_CRM.md).
  useEffect(() => {
    fetchManuais()
      .then(setManuais)
      .catch((err) => console.error('Falha ao carregar manuais do Supabase:', err));

    fetchAtualizacoes()
      .then(setAtualizacoes)
      .catch((err) => console.error('Falha ao carregar comunicados do Supabase:', err));
  }, []);

  // Save changes helper
  const saveStateToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Login handler
  const handleLoginSuccess = (user: Usuario) => {
    setCurrentUser(user);
    saveStateToLocalStorage('feramaq_user', user);
    setCurrentRoute('dashboard');

    // Register log
    const newLog: LogAtividade = {
      id: `log-${Date.now()}`,
      usuario_id: user.id,
      usuario_nome: user.nome,
      acao: 'LOGIN',
      detalhes: `Usuário ${user.nome} acessou o portal com sucesso.`,
      criado_em: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('feramaq_user');
    setAuthState('login');
  };

  // Navigation controller with entity resetting
  const handleNavigate = (route: string, entityId?: string) => {
    setCurrentRoute(route);
    
    // Reset specific states depending on navigation targets
    if (route === 'dashboard') {
      setSelectedMaquinaId(null);
      setSelectedChamadoId(null);
      setSelectedOrcamentoId(null);
    } else if (route === 'maquinas') {
      setSelectedChamadoId(null);
      setSelectedOrcamentoId(null);
      if (entityId) setSelectedMaquinaId(entityId);
    } else if (route === 'chamados') {
      setSelectedMaquinaId(null);
      setSelectedOrcamentoId(null);
      if (entityId) setSelectedChamadoId(entityId);
    } else if (route === 'orcamentos') {
      setSelectedMaquinaId(null);
      setSelectedChamadoId(null);
      if (entityId) setSelectedOrcamentoId(entityId);
    }
  };

  // Open / Add new ticket
  const handleAddChamado = (newTicket: Partial<Chamado>, fileList?: FileList) => {
    if (!currentUser) return;

    const codeNum = 8000 + chamados.length + 1;
    const ticketId = `ch-${Date.now()}`;
    const generatedTicket: Chamado = {
      id: ticketId,
      codigo: `#CH-${codeNum}`,
      titulo: newTicket.titulo || '',
      descricao: newTicket.descricao || '',
      categoria: newTicket.categoria || 'Geral',
      status: 'Aberto',
      urgencia: newTicket.urgencia || 'Normal',
      maquina_id: newTicket.maquina_id || '',
      maquina_serie: newTicket.maquina_serie || '',
      maquina_modelo: newTicket.maquina_modelo || '',
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      id_externo: `EXT-CH-${codeNum}`,
      origem: 'PORTAL_CLIENTE'
    };

    // If file attachments exist, register them
    const newAnexosList: ChamadoAnexo[] = [...anexos];
    if (fileList && fileList.length > 0) {
      Array.from(fileList).forEach((file, index) => {
        newAnexosList.push({
          id: `anx-${Date.now()}-${index}`,
          chamado_id: ticketId,
          nome_arquivo: file.name,
          tamanho_arquivo: `${Math.round(file.size / 1024)} KB`,
          url_arquivo: '#',
          tipo_mime: file.type,
          criado_em: new Date().toISOString()
        });
      });
      setAnexos(newAnexosList);
      saveStateToLocalStorage('feramaq_anexos', newAnexosList);
    }

    const updatedChamados = [generatedTicket, ...chamados];
    setChamados(updatedChamados);
    saveStateToLocalStorage('feramaq_chamados', updatedChamados);

    // Register Activity log
    const newLog: LogAtividade = {
      id: `log-${Date.now()}`,
      usuario_id: currentUser.id,
      usuario_nome: currentUser.nome,
      acao: 'CHAMADO_CRIADO',
      detalhes: `Chamado ${generatedTicket.codigo} criado para máquina ${generatedTicket.maquina_serie}.`,
      criado_em: new Date().toISOString()
    };
    setLogs([newLog, ...logs]);
  };

  // Send message in ticket chat (with automated response!)
  const handleAddMensagem = (chamadoId: string, text: string, files?: FileList) => {
    if (!currentUser) return;

    const msgId = `msg-${Date.now()}`;
    const newMsg: ChamadoMensagem = {
      id: msgId,
      chamado_id: chamadoId,
      usuario_nome: currentUser.nome,
      usuario_avatar: undefined,
      mensagem: text,
      criado_em: new Date().toISOString(),
      tipo_usuario: 'cliente'
    };

    // Register attachment if present
    const newAnexosList: ChamadoAnexo[] = [...anexos];
    if (files && files.length > 0) {
      Array.from(files).forEach((f, idx) => {
        newAnexosList.push({
          id: `anx-${Date.now()}-${idx}`,
          chamado_id: chamadoId,
          nome_arquivo: f.name,
          tamanho_arquivo: `${Math.round(f.size / 1024)} KB`,
          url_arquivo: '#',
          tipo_mime: f.type,
          criado_em: new Date().toISOString()
        });
      });
      setAnexos(newAnexosList);
      saveStateToLocalStorage('feramaq_anexos', newAnexosList);
    }

    const updatedMsgs = [...mensagens, newMsg];
    setMensagens(updatedMsgs);
    saveStateToLocalStorage('feramaq_mensagens', updatedMsgs);

    // Update ticket update field
    const updatedChamados = chamados.map(c => 
      c.id === chamadoId 
        ? { ...c, atualizado_em: new Date().toISOString(), status: c.status === 'Aberto' ? 'Em Atendimento' : c.status } as Chamado
        : c
    );
    setChamados(updatedChamados);
    saveStateToLocalStorage('feramaq_chamados', updatedChamados);

    // Simulated technician response for immersive, alive feeling!
    setTimeout(() => {
      const techMsgId = `msg-${Date.now() + 1}`;
      const techMsg: ChamadoMensagem = {
        id: techMsgId,
        chamado_id: chamadoId,
        usuario_nome: 'Carlos Silva (Especialista Feramaq)',
        usuario_avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByx9Y5xXoobqxayXa4Mq0kkOO4IuA4kpThVmcIJnsCtidcqIVTWK5bTISp2R5tGKlDPTEb0COEcmrnDq1DfTNRATYho7xsC-NlkVDt80LoK76oSlfGJQXuimp76Y7BqKKLA0MiEPbeNcnfMmHUK0uT1NReZLWYStDsaJnIssnmEKJf6OFFeuyXuChIikC-vcQpQIKk3qjVC2heS2KuKr3l1NGPQj6qGdO9ZyhP9bc0tLncH1QR4LQSejBWrE1cKWbQycrZoLAxle_1',
        mensagem: 'Olá! Recebemos sua mensagem em nosso terminal de engenharia. Nossa equipe de manutenção já está avaliando as especificações técnicas da sua máquina no banco de dados e responderá em breve.',
        criado_em: new Date().toISOString(),
        tipo_usuario: 'suporte'
      };
      setMensagens(prev => {
        const withTech = [...prev, techMsg];
        saveStateToLocalStorage('feramaq_mensagens', withTech);
        return withTech;
      });
    }, 2000);
  };

  // Add parts quote (adds new Pendente quote)
  const handleRequestQuote = (peca: Peca, qty: number, maquinaId: string) => {
    if (!currentUser) return;

    const matchedMaq = maquinas.find(m => m.id === maquinaId);
    if (!matchedMaq) return;

    const codeNum = 3000 + orcamentos.length + 1;
    const estimatedVal = qty * 450; // dynamic estimate

    const newQuote: Orcamento = {
      id: `orc-${Date.now()}`,
      codigo: `#ORC-2023-${codeNum}`,
      maquina_id: matchedMaq.id,
      maquina_serie: matchedMaq.serie,
      maquina_modelo: matchedMaq.modelo,
      referencia: `Peça: ${peca.nome} (Qtd: ${qty})`,
      data_emissao: new Date().toISOString().split('T')[0],
      valor_total: estimatedVal,
      status: 'Pendente',
      id_externo: `EXT-ORC-${codeNum}`,
      origem: 'CRM_SALES'
    };

    const updatedQuotes = [newQuote, ...orcamentos];
    setOrcamentos(updatedQuotes);
    saveStateToLocalStorage('feramaq_orcamentos', updatedQuotes);

    // Register log
    const newLog: LogAtividade = {
      id: `log-${Date.now()}`,
      usuario_id: currentUser.id,
      usuario_nome: currentUser.nome,
      acao: 'ORCAMENTO_SOLICITADO',
      detalhes: `Solicitado orçamento de peças ${newQuote.codigo} para máquina ${matchedMaq.serie}.`,
      criado_em: new Date().toISOString()
    };
    setLogs([newLog, ...logs]);
  };

  // Update quote status (Approve / Refuse)
  const handleUpdateQuoteStatus = (quoteId: string, newStatus: 'Aprovado' | 'Recusado') => {
    if (!currentUser) return;

    const updated = orcamentos.map(o => 
      o.id === quoteId ? { ...o, status: newStatus } : o
    );
    setOrcamentos(updated);
    saveStateToLocalStorage('feramaq_orcamentos', updated);

    // Log Activity
    const targetQuote = orcamentos.find(o => o.id === quoteId);
    const newLog: LogAtividade = {
      id: `log-${Date.now()}`,
      usuario_id: currentUser.id,
      usuario_nome: currentUser.nome,
      acao: newStatus === 'Aprovado' ? 'ORCAMENTO_APROVADO' : 'ORCAMENTO_RECUSADO',
      detalhes: `Orçamento comercial ${targetQuote?.codigo} foi ${newStatus.toLowerCase()} pelo gestor.`,
      criado_em: new Date().toISOString()
    };
    setLogs([newLog, ...logs]);
  };

  // Add / Remove Users (Cliente Admin team manager)
  const handleAddUser = (newUserParams: Partial<Usuario>) => {
    const id = `usr-${Date.now()}`;
    const completeUser: Usuario = {
      id,
      nome: newUserParams.nome || '',
      email: newUserParams.email || '',
      telefone: newUserParams.telefone || '',
      cargo: newUserParams.cargo || '',
      active: true,
      role: (newUserParams.role as any) || 'cliente_user',
      empresa_id: newUserParams.empresa_id || 'emp-1'
    };

    const updated = [...usuarios, completeUser];
    setUsuarios(updated);
    saveStateToLocalStorage('feramaq_usuarios', updated);
  };

  const handleRemoveUser = (userId: string) => {
    const updated = usuarios.filter(u => u.id !== userId);
    setUsuarios(updated);
    saveStateToLocalStorage('feramaq_usuarios', updated);
  };

  // Toggle Read on Announcement notifications
  // O conteúdo vem do Supabase (client_announcements); o estado de leitura
  // por enquanto só é local (client_announcement_reads exige sessão
  // autenticada — ver docs/INTEGRACAO_CRM.md).
  const handleToggleRead = (id: string) => {
    const updated = atualizacoes.map(item =>
      item.id === id ? { ...item, lida: !item.lida } : item
    );
    setAtualizacoes(updated);
    saveReadIds(new Set(updated.filter(item => item.lida).map(item => item.id)));
  };

  // Mark all notifications as read when opening dropdown
  const handleMarkNotificationsRead = () => {
    const updated = atualizacoes.map(item => ({ ...item, lida: true }));
    setAtualizacoes(updated);
    saveReadIds(new Set(updated.map(item => item.id)));
  };

  // Unread announcements count
  const unreadCount = atualizacoes.filter(item => !item.lida).length;

  // Active Company linked to current user
  const activeCompany = empresas.find(e => e.id === currentUser?.empresa_id) || empresas[0];

  // Route router switcher rendering block
  const renderRouteView = () => {
    switch (currentRoute) {
      case 'dashboard':
        return (
          <Dashboard 
            maquinas={maquinas}
            chamados={chamados}
            orcamentos={orcamentos}
            relatorios={relatorios}
            onNavigate={handleNavigate}
          />
        );
      case 'chamados':
      case 'chamados-novo':
      case 'chamado-detalhe':
        return (
          <Chamados 
            chamados={chamados}
            maquinas={maquinas}
            mensagens={mensagens}
            anexos={anexos}
            onAddChamado={handleAddChamado}
            onAddMensagem={handleAddMensagem}
            selectedChamadoId={selectedChamadoId}
            onSelectChamado={(id) => {
              setSelectedChamadoId(id);
              if (id) {
                setCurrentRoute('chamado-detalhe');
              } else {
                setCurrentRoute('chamados');
              }
            }}
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
          />
        );
      case 'maquinas':
      case 'maquina-detalhe':
        return (
          <Maquinas 
            maquinas={maquinas}
            chamados={chamados}
            orcamentos={orcamentos}
            selectedMaquinaId={selectedMaquinaId}
            onSelectMaquina={(id) => {
              setSelectedMaquinaId(id);
              if (id) {
                setCurrentRoute('maquina-detalhe');
              } else {
                setCurrentRoute('maquinas');
              }
            }}
            onNavigate={handleNavigate}
          />
        );
      case 'manuais-pecas':
        return (
          <ManuaisPecas 
            manuais={manuais}
            pecas={pecas}
            maquinas={maquinas}
            onRequestQuote={handleRequestQuote}
          />
        );
      case 'orcamentos':
      case 'orcamento-detalhe':
        return (
          <Orcamentos 
            orcamentos={orcamentos}
            selectedOrcamentoId={selectedOrcamentoId}
            onSelectOrcamento={(id) => {
              setSelectedOrcamentoId(id);
              if (id) {
                setCurrentRoute('orcamento-detalhe');
              } else {
                setCurrentRoute('orcamentos');
              }
            }}
            onUpdateQuoteStatus={handleUpdateQuoteStatus}
          />
        );
      case 'relatorios':
        return (
          <Relatorios 
            relatorios={relatorios}
            maquinas={maquinas}
          />
        );
      case 'perfil':
      case 'configuracoes':
        return (
          <PerfilConfig 
            currentUser={currentUser}
            usuarios={usuarios}
            empresa={activeCompany}
            onAddUser={handleAddUser}
            onRemoveUser={handleRemoveUser}
            currentRoute={currentRoute}
          />
        );
      case 'atualizacoes':
        return (
          <Anuncios 
            atualizacoes={atualizacoes}
            onToggleRead={handleToggleRead}
          />
        );
      default:
        return (
          <Dashboard 
            maquinas={maquinas}
            chamados={chamados}
            orcamentos={orcamentos}
            relatorios={relatorios}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  // If not logged in, show authentication portal
  if (!currentUser) {
    return (
      <Auth 
        onLoginSuccess={handleLoginSuccess}
        maquinas={maquinas}
        usuarios={usuarios}
        currentAuthState={currentAuthState}
        setAuthState={setAuthState}
      />
    );
  }

  // Else, render with Layout shell frame
  return (
    <Layout
      currentUser={currentUser}
      currentRoute={currentRoute}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      unreadCount={unreadCount}
      onMarkNotificationsRead={handleMarkNotificationsRead}
    >
      {renderRouteView()}
    </Layout>
  );
}


import React, { useState } from 'react';
import { 
  Building, 
  User, 
  Users, 
  Lock, 
  Plus, 
  X, 
  CheckCircle, 
  Mail, 
  Phone, 
  Bell, 
  Shield,
  Save,
  Trash2
} from 'lucide-react';
import { Usuario, Empresa } from '../types';

interface PerfilConfigProps {
  currentUser: Usuario | null;
  usuarios: Usuario[];
  empresa: Empresa | null;
  onAddUser: (user: Partial<Usuario>) => void;
  onRemoveUser: (id: string) => void;
  currentRoute: string;
}

export default function PerfilConfig({
  currentUser,
  usuarios,
  empresa,
  onAddUser,
  onRemoveUser,
  currentRoute
}: PerfilConfigProps) {
  // If we are on configurations route
  const isConfigRoute = currentRoute === 'configuracoes';

  // State for user registration form
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserCargo, setNewUserCargo] = useState('');
  const [newUserRole, setNewUserRole] = useState<'cliente_admin' | 'cliente_user'>('cliente_user');

  // Change password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Notification preferences states
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  const companyUsers = usuarios.filter(u => u.empresa_id === empresa?.id);
  const isClientAdmin = currentUser?.role === 'cliente_admin';

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserCargo) return;

    onAddUser({
      nome: newUserName,
      email: newUserEmail,
      telefone: newUserPhone || '(11) 99999-9999',
      cargo: newUserCargo,
      role: newUserRole,
      empresa_id: empresa?.id || 'emp-1',
      active: true
    });

    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserCargo('');
    setNewUserRole('cliente_user');
    setShowAddUserModal(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('A nova senha e a confirmação não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaved(true);
    setTimeout(() => {
      setConfigSaved(false);
    }, 4000);
  };

  // RENDER FOR NOTIFICATION CONFIGURATIONS
  if (isConfigRoute) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[#54595F] font-bold uppercase tracking-wider">Configurações do Portal</span>
          <h1 className="text-2xl font-headline font-extrabold text-[#1a1c1c] tracking-tight">Preferências de Notificação</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Preferences */}
          <form onSubmit={handleSavePreferences} className="lg:col-span-2 bg-white rounded-xl border border-[#eeeeee] p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-headline font-bold text-sm text-[#1a1c1c] uppercase tracking-wider pb-2 border-b border-[#f3f3f3]">Canais de Alertas de Chamados</h3>

            {configSaved && (
              <div className="bg-green-50 border border-green-200 text-green-800 text-xs p-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-green-600" />
                <span>Preferências de envio de notificações corporativas salvas com sucesso!</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* Whatsapp */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 border rounded-xl hover:border-[#ff6801]/30 transition-all cursor-pointer" onClick={() => setNotifyWhatsapp(!notifyWhatsapp)}>
                <input 
                  type="checkbox" 
                  checked={notifyWhatsapp}
                  onChange={() => {}}
                  className="mt-1 h-4 w-4 text-[#ff6801] border-[#e2bfb1] rounded focus:ring-[#ff6801]"
                />
                <div>
                  <span className="text-xs font-bold text-[#1a1c1c] block">Alertas Instantâneos via WhatsApp</span>
                  <p className="text-[11px] text-[#54595F] mt-0.5 leading-relaxed">
                    Receba atualizações de status diretamente no celular cadastrado quando a equipe comercial emitir ou atualizar propostas de chamados.
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 border rounded-xl hover:border-[#ff6801]/30 transition-all cursor-pointer" onClick={() => setNotifyEmail(!notifyEmail)}>
                <input 
                  type="checkbox" 
                  checked={notifyEmail}
                  onChange={() => {}}
                  className="mt-1 h-4 w-4 text-[#ff6801] border-[#e2bfb1] rounded focus:ring-[#ff6801]"
                />
                <div>
                  <span className="text-xs font-bold text-[#1a1c1c] block">Relatórios e Boletos por E-mail</span>
                  <p className="text-[11px] text-[#54595F] mt-0.5 leading-relaxed">
                    Envio automático de propostas aprovadas, comprovantes de faturamento e históricos mensais em PDF para o e-mail cadastrado.
                  </p>
                </div>
              </div>

              {/* Push Browser */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 border rounded-xl hover:border-[#ff6801]/30 transition-all cursor-pointer" onClick={() => setNotifyPush(!notifyPush)}>
                <input 
                  type="checkbox" 
                  checked={notifyPush}
                  onChange={() => {}}
                  className="mt-1 h-4 w-4 text-[#ff6801] border-[#e2bfb1] rounded focus:ring-[#ff6801]"
                />
                <div>
                  <span className="text-xs font-bold text-[#1a1c1c] block">Notificações Push no Navegador</span>
                  <p className="text-[11px] text-[#54595F] mt-0.5 leading-relaxed">
                    Exibir notificações visuais na área de trabalho quando houver comunicados administrativos ou alertas urgentes de máquinas.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#ff6801] hover:bg-[#ff6801]/95 text-white font-bold text-xs py-3 rounded-lg shadow-sm flex items-center justify-center gap-1.5 self-end px-6"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </form>

          {/* Guidelines info card */}
          <div className="bg-[#f3f3f3] p-5 rounded-xl border border-[#e2bfb1]/30 text-xs self-start">
            <h3 className="font-headline font-bold text-[#1a1c1c] flex items-center gap-1.5 mb-2.5">
              <Bell className="w-4 h-4 text-[#ff6801]" />
              Gerenciamento de Comunicação
            </h3>
            <p className="text-[#54595F] leading-relaxed">
              As configurações acima afetam exclusivamente os disparos corporativos realizados pela plataforma Feramaq. Mensagens críticas de engenharia continuam sendo enviadas por canais padrão.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // RENDER FOR CLIENT PROFILE & TEAM MEMBERS MANAGER
  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-[#54595F] font-bold uppercase tracking-wider">Gestão do Perfil</span>
        <h1 className="text-2xl font-headline font-extrabold text-[#1a1c1c] tracking-tight">Meus Dados e Equipe</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Company Info Left Side (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Company Data Details */}
          <div className="bg-white rounded-xl border border-[#eeeeee] p-6 shadow-sm">
            <h3 className="font-headline font-bold text-sm text-[#1a1c1c] uppercase tracking-wider pb-2 border-b border-[#f3f3f3] flex items-center gap-2 mb-4">
              <Building className="w-4.5 h-4.5 text-[#ff6801]" />
              Dados Cadastrais Corporativos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[#54595F] font-semibold">Razão Social</span>
                <span className="font-bold text-[#1a1c1c] text-sm">{empresa?.razao_social || 'Construtora Prime S/A'}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[#54595F] font-semibold">CNPJ Oficial</span>
                <span className="font-bold text-[#1a1c1c] text-sm">{empresa?.cnpj || '12.345.678/0001-90'}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[#54595F] font-semibold">Inscrição Estadual</span>
                <span className="font-bold text-[#1a1c1c]">149.284.920.110</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[#54595F] font-semibold">Endereço da Matriz</span>
                <span className="font-bold text-[#1a1c1c]">Av. Paulista, 1000, Bela Vista - São Paulo / SP</span>
              </div>
            </div>
          </div>

          {/* Team Members List manager */}
          <div className="bg-white rounded-xl border border-[#eeeeee] p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#f3f3f3] mb-4">
              <h3 className="font-headline font-bold text-sm text-[#1a1c1c] uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-[#ff6801]" />
                Membros da Empresa com Acesso
              </h3>

              {isClientAdmin && (
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-[#f3f3f3] hover:bg-[#ff6801]/10 text-[#ff6801] font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Colaborador</span>
                </button>
              )}
            </div>

            {companyUsers.length > 0 ? (
              <div className="divide-y divide-[#eeeeee]">
                {companyUsers.map((u) => (
                  <div key={u.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#dee3ea] flex items-center justify-center font-bold text-xs text-[#ff6801]">
                        {u.nome.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1a1c1c]">{u.nome}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                            u.role === 'cliente_admin' ? 'bg-[#ff6801]/10 text-[#ff6801]' : 'bg-slate-100 text-[#54595F]'
                          }`}>
                            {u.role === 'cliente_admin' ? 'Gestor' : 'Operador'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#54595F] mt-0.5">
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {u.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {u.telefone}</span>
                        </div>
                      </div>
                    </div>

                    {isClientAdmin && u.id !== currentUser?.id && (
                      <button
                        onClick={() => onRemoveUser(u.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                        title="Remover acesso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-[#54595F] py-4">Nenhum colaborador adicionado.</p>
            )}
          </div>
        </div>

        {/* Change Password Panel Right Side (1 col) */}
        <div className="bg-white rounded-xl border border-[#eeeeee] p-5 shadow-sm">
          <h3 className="font-headline font-bold text-sm text-[#1a1c1c] uppercase tracking-wider pb-2 border-b border-[#f3f3f3] flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-[#ff6801]" />
            Alterar Minha Senha
          </h3>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4 text-xs">
            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Senha redefinida com sucesso!</span>
              </div>
            )}

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                {passwordError}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#1a1c1c]">Senha Atual</label>
              <input 
                type="password" 
                placeholder="Digite a senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-10 px-3 border border-[#e2bfb1] rounded-lg text-xs focus:outline-none focus:border-[#ff6801]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#1a1c1c]">Nova Senha</label>
              <input 
                type="password" 
                placeholder="Pelo menos 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 px-3 border border-[#e2bfb1] rounded-lg text-xs focus:outline-none focus:border-[#ff6801]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#1a1c1c]">Confirmar Nova Senha</label>
              <input 
                type="password" 
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 px-3 border border-[#e2bfb1] rounded-lg text-xs focus:outline-none focus:border-[#ff6801]"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-[#ff6801] hover:bg-[#ff6801]/95 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm transition-all"
            >
              Redefinir Senha
            </button>
          </form>
        </div>
      </div>

      {/* OVERLAY ADD USER DIALOG MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#e2bfb1] animate-scale-up">
            <div className="p-4 bg-[#f9f9f9] border-b border-[#eeeeee] flex justify-between items-center">
              <span className="text-xs font-headline font-bold text-[#54595F] uppercase tracking-wider">Novo Acesso Corporativo</span>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded bg-white border border-[#eeeeee]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-5 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#1a1c1c]">Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Ex.: Márcio Azevedo"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="h-10 px-3 border border-[#e2bfb1] rounded-lg text-xs focus:outline-none focus:border-[#ff6801]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#1a1c1c]">E-mail Corporativo</label>
                <input 
                  type="email" 
                  placeholder="Ex.: marcio@construtoraprime.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="h-10 px-3 border border-[#e2bfb1] rounded-lg text-xs focus:outline-none focus:border-[#ff6801]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#1a1c1c]">Telefone / Celular</label>
                <input 
                  type="text" 
                  placeholder="Ex.: (11) 99999-8888"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="h-10 px-3 border border-[#e2bfb1] rounded-lg text-xs focus:outline-none focus:border-[#ff6801]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#1a1c1c]">Cargo / Função</label>
                <input 
                  type="text" 
                  placeholder="Ex.: Operador de Retroescavadeira"
                  value={newUserCargo}
                  onChange={(e) => setNewUserCargo(e.target.value)}
                  className="h-10 px-3 border border-[#e2bfb1] rounded-lg text-xs focus:outline-none focus:border-[#ff6801]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#1a1c1c]">Perfil de Permissão</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="h-10 px-3 bg-white border border-[#e2bfb1] rounded-lg text-xs focus:outline-none"
                >
                  <option value="cliente_user">Operador (Apenas Visualização / Abrir Chamados)</option>
                  <option value="cliente_admin">Gestor (Aprovar Orçamentos / Gerir Usuários)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#eeeeee]">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-[#54595F] hover:bg-[#f3f3f3] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#ff6801] hover:bg-[#ff6801]/95 text-white font-bold text-xs px-4 py-2 rounded-lg"
                >
                  Adicionar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

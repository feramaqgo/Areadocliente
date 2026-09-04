import React, { useState } from 'react';
import { ShieldCheck, Cpu, Key, HelpCircle, FileText, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Usuario, Maquina } from '../types';

interface AuthProps {
  onLoginSuccess: (user: Usuario) => void;
  maquinas: Maquina[];
  usuarios: Usuario[];
  currentAuthState: 'login' | 'primeiro-acesso' | 'recuperar-senha';
  setAuthState: (state: 'login' | 'primeiro-acesso' | 'recuperar-senha') => void;
}

export default function Auth({ 
  onLoginSuccess, 
  maquinas, 
  usuarios,
  currentAuthState,
  setAuthState
}: AuthProps) {
  // Login input fields
  const [identifier, setIdentifier] = useState(''); // can be serial (e.g. FQ-2024-001) or email
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Primeiro Acesso fields
  const [registerSerial, setRegisterSerial] = useState('');
  const [registerCnpj, setRegisterCnpj] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Recovery Password fields
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // Handle Login flow
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (isLocked) {
      setLoginError('Acesso bloqueado temporariamente devido a excesso de tentativas incorretas.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Clean inputs
      const idTrimmed = identifier.trim();
      const pwdTrimmed = password.trim();

      if (!idTrimmed || !pwdTrimmed) {
        setLoginError('Por favor, digite suas credenciais.');
        return;
      }

      // Check for locked threshold
      if (failedAttempts >= 3) {
        setIsLocked(true);
        setLoginError('Portal bloqueado para sua segurança. Aguarde 30 segundos ou contacte o administrador.');
        setTimeout(() => setIsLocked(false), 30000);
        return;
      }

      // Try matching by either email or serial number bound to a user
      const matchedUser = usuarios.find(
        (u) => 
          u.email.toLowerCase() === idTrimmed.toLowerCase() || 
          u.serie_login?.toLowerCase() === idTrimmed.toLowerCase()
      );

      // Simple mock password validation (allow anything 4+ chars, or 'admin' for demo simplicity)
      if (matchedUser && pwdTrimmed.length >= 4) {
        onLoginSuccess(matchedUser);
      } else {
        setFailedAttempts(prev => prev + 1);
        setLoginError('Credenciais incorretas ou número de série não cadastrado no Stitch. Tente novamente.');
      }
    }, 800);
  };

  // Handle Primeiro Acesso flow (First access)
  const handlePrimeiroAcesso = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (!registerSerial || !registerCnpj || !registerPassword) {
      setRegisterError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('A senha e a confirmação de senha não coincidem.');
      return;
    }

    // Cross-validate that the serial exists and belongs to Construtora Prime (CNPJ matching)
    const matchedMachine = maquinas.find(m => m.serie === registerSerial);
    const cleanedCnpj = registerCnpj.replace(/\D/g, '');

    // Allow validation if series matches any mock machine and CNPJ represents a prime construction company
    if (matchedMachine && (cleanedCnpj === '12345678000190' || cleanedCnpj === '98765432000110')) {
      setRegisterSuccess(true);
      setTimeout(() => {
        setAuthState('login');
        setRegisterSuccess(false);
      }, 3000);
    } else {
      setRegisterError('Número de série do maquinário ou CNPJ de faturamento inválido. Verifique o manual físico.');
    }
  };

  // Handle Password Recovery flow
  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier) return;

    setRecoverySuccess(true);
    setTimeout(() => {
      setAuthState('login');
      setRecoverySuccess(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] industrial-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#e2bfb1] overflow-hidden flex flex-col">
        
        {/* Banner/Header of Card */}
        <div className="bg-[#ff6801] p-6 text-white text-center relative">
          <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-headline font-extrabold text-xl tracking-tight leading-none">ÁREA DO CLIENTE FERAMAQ</h2>
          <p className="text-[10px] text-orange-100 uppercase tracking-widest font-semibold mt-1.5">Portal do Operador e Gestor de Maquinário</p>
        </div>

        {/* LOGIN VIEW STATE */}
        {currentAuthState === 'login' && (
          <form onSubmit={handleLogin} className="p-6 flex flex-col gap-4 text-xs">
            <div className="text-center mb-1">
              <span className="text-sm font-bold text-[#1a1c1c] block">Acesse seu Painel Técnico</span>
              <span className="text-xs text-[#54595F] block mt-0.5">Use o e-mail cadastrado ou o número de série físico da máquina</span>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Identifier input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#1a1c1c]">E-mail Corporativo ou Série da Máquina</label>
              <input 
                type="text" 
                placeholder="Ex.: FQ-2024-001 ou carlos@prime.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-11 px-3 border border-[#e2bfb1] rounded-lg focus:outline-none focus:border-[#ff6801]"
                required
                disabled={isLoading}
              />
              <span className="text-[10px] text-[#54595F]">Série gravada fisicamente na placa metálica do motor</span>
            </div>

            {/* Password input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-[#1a1c1c]">Senha de Acesso</label>
                <button 
                  type="button" 
                  onClick={() => setAuthState('recuperar-senha')}
                  className="text-[10px] text-[#ff6801] hover:underline font-bold"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input 
                type="password" 
                placeholder="Digite sua senha cadastrada"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 px-3 border border-[#e2bfb1] rounded-lg focus:outline-none focus:border-[#ff6801]"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="bg-[#ff6801] hover:bg-[#ff6801]/95 text-white font-bold h-11 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validando Chave de Criptografia...</span>
                </>
              ) : (
                <span>Entrar na Área do Cliente</span>
              )}
            </button>

            {/* Helper tips for demo */}
            <div className="bg-slate-50 p-2.5 rounded border text-[10px] text-[#54595F] leading-tight flex flex-col gap-1 mt-2">
              <span className="font-bold text-[#1a1c1c]">Dica para testes de homologação:</span>
              <span>• Digite a série da máquina <strong className="text-[#ff6801]">FQ-2024-001</strong> e senha <strong className="text-[#1a1c1c]">1234</strong></span>
              <span>• Ou digite seu e-mail <strong className="text-[#ff6801]">carlos.silva@construtoraprime.com.br</strong></span>
            </div>

            <div className="pt-4 border-t border-[#eeeeee] text-center">
              <span className="text-[#54595F]">Novo na Feramaq? </span>
              <button 
                type="button" 
                onClick={() => setAuthState('primeiro-acesso')}
                className="text-[#ff6801] font-bold hover:underline"
              >
                Primeiro Acesso / Cadastrar Máquina
              </button>
            </div>
          </form>
        )}

        {/* PRIMEIRO ACESSO VIEW STATE */}
        {currentAuthState === 'primeiro-acesso' && (
          <form onSubmit={handlePrimeiroAcesso} className="p-6 flex flex-col gap-4 text-xs">
            <div className="text-center mb-1">
              <span className="text-sm font-bold text-[#1a1c1c] block">Ative seu Primeiro Acesso</span>
              <span className="text-xs text-[#54595F] block mt-0.5">Valide sua máquina através da chave de faturamento CNPJ</span>
            </div>

            {registerSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-green-600 shrink-0" />
                <span>Cadastro validado! Redirecionando para login...</span>
              </div>
            )}

            {registerError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg font-medium">
                {registerError}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#1a1c1c]">Número de Série Físico da Máquina</label>
              <input 
                type="text" 
                placeholder="Ex.: FQ-2024-001"
                value={registerSerial}
                onChange={(e) => setRegisterSerial(e.target.value)}
                className="h-10 px-3 border border-[#e2bfb1] rounded-lg focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#1a1c1c]">CNPJ do Comprador (Empresa)</label>
              <input 
                type="text" 
                placeholder="Ex.: 12.345.678/0001-90"
                value={registerCnpj}
                onChange={(e) => setRegisterCnpj(e.target.value)}
                className="h-10 px-3 border border-[#e2bfb1] rounded-lg focus:outline-none"
                required
              />
              <span className="text-[10px] text-[#54595F]">Usado para cruzamento e verificação de contratos</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#1a1c1c]">Definir Senha de Acesso</label>
              <input 
                type="password" 
                placeholder="No mínimo 6 caracteres"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="h-10 px-3 border border-[#e2bfb1] rounded-lg focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#1a1c1c]">Confirmar Senha</label>
              <input 
                type="password" 
                placeholder="Repita a senha definida"
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                className="h-10 px-3 border border-[#e2bfb1] rounded-lg focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-[#ff6801] hover:bg-[#ff6801]/95 text-white font-bold h-10 rounded-lg shadow mt-2"
            >
              Cadastrar Minha Máquina
            </button>

            <div className="pt-4 border-t border-[#eeeeee] text-center">
              <span className="text-[#54595F]">Já possui acesso ativo? </span>
              <button 
                type="button" 
                onClick={() => setAuthState('login')}
                className="text-[#ff6801] font-bold hover:underline"
              >
                Efetuar Login
              </button>
            </div>
          </form>
        )}

        {/* RECUPERAR SENHA VIEW STATE */}
        {currentAuthState === 'recuperar-senha' && (
          <form onSubmit={handleRecovery} className="p-6 flex flex-col gap-4 text-xs">
            <div className="text-center mb-1">
              <span className="text-sm font-bold text-[#1a1c1c] block">Recuperar Senha de Acesso</span>
              <span className="text-xs text-[#54595F] block mt-0.5">Enviaremos instruções de redefinição para o e-mail ou gestor da empresa</span>
            </div>

            {recoverySuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-green-600 shrink-0" />
                  <span className="font-bold">E-mail de Recuperação Enviado!</span>
                </div>
                <p className="text-[11px] text-green-700 leading-normal">
                  Se o endereço estiver registrado, você receberá instruções de redefinição seguras em instantes. Redirecionando...
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#1a1c1c]">E-mail Cadastrado</label>
                  <input 
                    type="email" 
                    placeholder="Ex.: carlos@construtoraprime.com.br"
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    className="h-10 px-3 border border-[#e2bfb1] rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#ff6801] hover:bg-[#ff6801]/95 text-white font-bold h-10 rounded-lg shadow mt-1"
                >
                  Enviar Instruções de Senha
                </button>
              </>
            )}

            <div className="pt-4 border-t border-[#eeeeee] text-center">
              <button 
                type="button" 
                onClick={() => setAuthState('login')}
                className="text-[#ff6801] font-bold hover:underline"
              >
                Voltar para Tela de Login
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

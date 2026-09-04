/**
 * Types definition for Área do Cliente Feramaq
 */

export interface Empresa {
  id: string;
  razao_social: string;
  cnpj: string;
  id_externo?: string;
  origem?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  serie_login?: string;
  telefone: string;
  cargo: string;
  active: boolean;
  role: 'cliente_admin' | 'cliente_user' | 'suporte_tecnico' | 'admin_feramaq';
  empresa_id: string;
}

export interface Maquina {
  id: string;
  serie: string;
  modelo: string;
  linha: string;
  ano_fabricacao: number;
  data_compra: string;
  status: 'Operacional' | 'Em Manutenção' | 'Aguardando Peça' | 'Desativada';
  horimetro: number;
  ultima_manutencao: string;
  localizacao: string;
  garantia_ate: string;
  imagem_url: string;
  fabricante: string;
  potencia_motor: string;
  peso_bruto: string;
  // As specs relevantes mudam por linha de produto (bomba de concreto tem
  // vazão e alcance de lança; perfuratriz tem profundidade e torque), então
  // são um mapa aberto em vez de colunas fixas — mesma abordagem que o CRM
  // usa em products.specs.
  specs: Record<string, string>;
  empresa_id: string;
}

export interface Chamado {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  categoria: string;
  status: 'Aberto' | 'Em Atendimento' | 'Aguardando Peça' | 'Concluído';
  urgencia: 'Normal' | 'Urgente';
  maquina_id: string;
  maquina_serie: string;
  maquina_modelo: string;
  criado_em: string;
  atualizado_em: string;
  id_externo?: string;
  origem?: string;
}

export interface ChamadoMensagem {
  id: string;
  chamado_id: string;
  usuario_nome: string;
  usuario_avatar?: string;
  mensagem: string;
  criado_em: string;
  tipo_usuario: 'cliente' | 'suporte';
}

export interface ChamadoAnexo {
  id: string;
  chamado_id: string;
  nome_arquivo: string;
  tamanho_arquivo: string;
  url_arquivo: string;
  tipo_mime: string;
  criado_em: string;
}

export interface Orcamento {
  id: string;
  codigo: string;
  maquina_id: string;
  maquina_serie: string;
  maquina_modelo: string;
  referencia: string;
  data_emissao: string;
  valor_total: number;
  status: 'Pendente' | 'Aprovado' | 'Recusado';
  id_externo?: string;
  origem?: string;
}

export interface Manual {
  id: string;
  titulo: string;
  descricao: string;
  modelo_compativel: string;
  categoria: 'Elétrica' | 'Mecânica' | 'Hidráulica' | 'Operação';
  tamanho_pdf: string;
  url_pdf: string;
}

export interface Peca {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  modelo_compativel: string;
  categoria: string;
  imagem_url: string;
}

export interface Relatorio {
  id: string;
  titulo: string;
  maquina_id: string;
  maquina_serie: string;
  tipo: 'Operacional' | 'Eficiência' | 'Manutenção' | 'Telemetria';
  data_gerado: string;
  url_documento: string;
}

export interface Atualizacao {
  id: string;
  titulo: string;
  conteudo: string;
  data_publicacao: string;
  lida: boolean;
  id_externo?: string;
  origem?: string;
}

export interface LogAtividade {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  acao: string;
  detalhes: string;
  criado_em: string;
}

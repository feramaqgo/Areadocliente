import { Empresa, Usuario, Maquina, Chamado, ChamadoMensagem, ChamadoAnexo, Orcamento, Peca, Relatorio, LogAtividade } from './types';

// Dados de demonstração. Manuais e Comunicados não aparecem mais aqui: já vêm
// do Supabase (ver src/lib/api/). O restante segue mockado até a autenticação
// de cliente existir — ver docs/INTEGRACAO_CRM.md.

// Initial Mock Empresa
export const mockEmpresas: Empresa[] = [
  {
    id: 'emp-1',
    razao_social: 'Construtora Prime Ltda',
    cnpj: '12.345.678/0001-90',
    id_externo: 'EXT-EMP-001',
    origem: 'CRM_INTERNAL'
  },
  {
    id: 'emp-2',
    razao_social: 'Construtora Apex S/A',
    cnpj: '98.765.432/0001-10',
    id_externo: 'EXT-EMP-002',
    origem: 'CRM_INTERNAL'
  }
];

// Initial Mock Users
export const mockUsuarios: Usuario[] = [
  {
    id: 'usr-1',
    nome: 'Carlos Silva',
    email: 'carlos.silva@construtoraprime.com.br',
    serie_login: 'FQ-2024-001', // Bind serial to user for direct lookup
    telefone: '(11) 98888-7777',
    cargo: 'Gerente de Operações',
    active: true,
    role: 'cliente_admin',
    empresa_id: 'emp-1'
  },
  {
    id: 'usr-2',
    nome: 'Julio Santos',
    email: 'julio.santos@construtoraprime.com.br',
    serie_login: 'FQ-2023-047',
    telefone: '(11) 97777-6666',
    cargo: 'Operador de Campo',
    active: true,
    role: 'cliente_user',
    empresa_id: 'emp-1'
  },
  {
    id: 'usr-3',
    nome: 'Renata Duarte',
    email: 'renata.duarte@construtoraapex.com.br',
    serie_login: 'FQ-2025-003',
    telefone: '(41) 96666-5555',
    cargo: 'Coordenadora de Obras',
    active: true,
    role: 'cliente_admin',
    empresa_id: 'emp-2'
  }
];

// Initial Mock Machines
// As specs variam por linha de produto, então ficam num mapa aberto em vez de
// colunas fixas (mesma abordagem de products.specs no CRM).
export const mockMaquinas: Maquina[] = [
  {
    id: 'maq-1',
    serie: 'FQ-2024-001',
    modelo: 'Bomba de Concreto FMA 1000-62',
    linha: 'FMA',
    ano_fabricacao: 2024,
    data_compra: '2024-01-15',
    status: 'Operacional',
    horimetro: 1240,
    ultima_manutencao: '2026-04-10',
    localizacao: 'Obra Alfa, São Paulo - SP',
    garantia_ate: '2027-01-15',
    imagem_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600',
    fabricante: 'Feramaq Industrial',
    potencia_motor: '150 kW',
    peso_bruto: '5200 kg',
    specs: {
      'Vazão teórica': '62 m³/h',
      'Pressão no concreto': '70 bar',
      'Alcance vertical': '30 m',
      'Alcance horizontal': '26 m',
      'Diâmetro da tubulação': '125 mm',
      'Capacidade do funil': '600 L'
    },
    empresa_id: 'emp-1'
  },
  {
    id: 'maq-2',
    serie: 'FQ-2023-047',
    modelo: 'Bomba de Concreto FME 2000-90',
    linha: 'FME',
    ano_fabricacao: 2023,
    data_compra: '2023-03-15',
    status: 'Operacional',
    horimetro: 3450,
    ultima_manutencao: '2026-05-12',
    localizacao: 'Obra Beta, Curitiba - PR',
    garantia_ate: '2026-03-15',
    imagem_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600',
    fabricante: 'Feramaq Industrial',
    potencia_motor: '186 kW',
    peso_bruto: '7100 kg',
    specs: {
      'Vazão teórica': '90 m³/h',
      'Pressão no concreto': '85 bar',
      'Alcance vertical': '42 m',
      'Alcance horizontal': '38 m',
      'Diâmetro da tubulação': '150 mm',
      'Capacidade do funil': '800 L'
    },
    empresa_id: 'emp-1'
  },
  {
    id: 'maq-3',
    serie: 'FQ-2023-112',
    modelo: 'Perfuratriz Hidráulica FMCT 25-080',
    linha: 'FMCT',
    ano_fabricacao: 2023,
    data_compra: '2023-08-20',
    status: 'Aguardando Peça',
    horimetro: 2150,
    ultima_manutencao: '2026-03-01',
    localizacao: 'Porto Seco, Santos - SP',
    garantia_ate: '2026-08-20',
    imagem_url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=600',
    fabricante: 'Feramaq Industrial',
    potencia_motor: '129 kW',
    peso_bruto: '3200 kg',
    specs: {
      'Profundidade máxima': '80 m',
      'Diâmetro de perfuração': '110 mm',
      'Torque de rotação': '4.200 Nm',
      'Força de avanço': '65 kN',
      'Pressão hidráulica': '210 bar'
    },
    empresa_id: 'emp-1'
  },
  {
    id: 'maq-4',
    serie: 'FQ-2024-088',
    modelo: 'Bomba de Concreto FMCM 3000-85',
    linha: 'FMCM',
    ano_fabricacao: 2024,
    data_compra: '2024-05-10',
    status: 'Em Manutenção',
    horimetro: 980,
    ultima_manutencao: '2026-06-24',
    localizacao: 'Obra Alfa, São Paulo - SP',
    garantia_ate: '2027-05-10',
    imagem_url: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&q=80&w=600',
    fabricante: 'Feramaq Industrial',
    potencia_motor: '164 kW',
    peso_bruto: '6800 kg',
    specs: {
      'Vazão teórica': '85 m³/h',
      'Pressão no concreto': '80 bar',
      'Alcance vertical': '36 m',
      'Alcance horizontal': '32 m',
      'Diâmetro da tubulação': '125 mm',
      'Capacidade do funil': '700 L'
    },
    empresa_id: 'emp-1'
  },
  {
    id: 'maq-5',
    serie: 'FQ-2022-019',
    modelo: 'Perfuratriz Hidráulica FML 30-100',
    linha: 'FML',
    ano_fabricacao: 2022,
    data_compra: '2022-04-12',
    status: 'Desativada',
    horimetro: 4200,
    ultima_manutencao: '2025-11-15',
    localizacao: 'Galpão Central, Curitiba - PR',
    garantia_ate: '2025-04-12',
    imagem_url: 'https://images.unsplash.com/photo-1621922688758-359fc864071e?auto=format&fit=crop&q=80&w=600',
    fabricante: 'Feramaq Industrial',
    potencia_motor: '110 kW',
    peso_bruto: '8900 kg',
    specs: {
      'Profundidade máxima': '100 m',
      'Diâmetro de perfuração': '152 mm',
      'Torque de rotação': '6.800 Nm',
      'Força de avanço': '90 kN',
      'Pressão hidráulica': '250 bar'
    },
    empresa_id: 'emp-1'
  },
  {
    // Equipamento de OUTRA empresa: existe no mock justamente para provar que o
    // Portal não vaza dado entre clientes. Logado como emp-1, isto não pode
    // aparecer em nenhuma tela.
    id: 'maq-6',
    serie: 'FQ-2025-003',
    modelo: 'Bomba de Concreto FMA 1000-62',
    linha: 'FMA',
    ano_fabricacao: 2025,
    data_compra: '2025-02-08',
    status: 'Operacional',
    horimetro: 310,
    ultima_manutencao: '2026-05-30',
    localizacao: 'Obra Apex Norte, Londrina - PR',
    garantia_ate: '2028-02-08',
    imagem_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600',
    fabricante: 'Feramaq Industrial',
    potencia_motor: '150 kW',
    peso_bruto: '5200 kg',
    specs: {
      'Vazão teórica': '62 m³/h',
      'Pressão no concreto': '70 bar',
      'Alcance vertical': '30 m',
      'Alcance horizontal': '26 m',
      'Diâmetro da tubulação': '125 mm',
      'Capacidade do funil': '600 L'
    },
    empresa_id: 'emp-2'
  }
];

// Initial Mock Chamados
export const mockChamados: Chamado[] = [
  {
    id: 'ch-1',
    codigo: '#CH-8921',
    titulo: 'Vazamento de fluido hidráulico no pistão de bombeamento',
    descricao: 'Identificado vazamento constante de fluido hidráulico na junta principal do pistão durante ciclos de alta pressão. Solicitamos verificação e troca do anel raspador.',
    categoria: 'Mecânica',
    status: 'Em Atendimento',
    urgencia: 'Urgente',
    maquina_id: 'maq-1',
    maquina_serie: 'FQ-2024-001',
    maquina_modelo: 'Bomba de Concreto FMA 1000-62',
    criado_em: '2026-06-23T14:30:00Z',
    atualizado_em: '2026-06-24T09:15:00Z',
    id_externo: 'EXT-CH-8921',
    origem: 'PORTAL_CLIENTE'
  },
  {
    id: 'ch-2',
    codigo: '#CH-8919',
    titulo: 'Perda de torque na rotação da perfuratriz',
    descricao: 'Vazamento de óleo no motor hidráulico de rotação. O equipamento perdeu torque e está paralisado para evitar danos maiores ao conjunto.',
    categoria: 'Hidráulica',
    status: 'Aguardando Peça',
    urgencia: 'Normal',
    maquina_id: 'maq-3',
    maquina_serie: 'FQ-2023-112',
    maquina_modelo: 'Perfuratriz Hidráulica FMCT 25-080',
    criado_em: '2026-06-22T09:15:00Z',
    atualizado_em: '2026-06-23T11:20:00Z',
    id_externo: 'EXT-CH-8919',
    origem: 'PORTAL_CLIENTE'
  },
  {
    id: 'ch-3',
    codigo: '#CH-8890',
    titulo: 'Revisão periódica de 1000 horas do motor de bombeamento',
    descricao: 'Procedimento padrão de revisão de 1000 horas de operação. Troca de óleos, filtros e ajuste fino das válvulas de controle de pressão.',
    categoria: 'Manutenção',
    status: 'Concluído',
    urgencia: 'Normal',
    maquina_id: 'maq-1',
    maquina_serie: 'FQ-2024-001',
    maquina_modelo: 'Bomba de Concreto FMA 1000-62',
    criado_em: '2026-06-15T11:20:00Z',
    atualizado_em: '2026-06-16T17:45:00Z',
    id_externo: 'EXT-CH-8890',
    origem: 'CRM_INTERNAL'
  },
  {
    id: 'ch-4',
    codigo: '#CH-2026-1042',
    titulo: 'Vibração anormal no conjunto de bombeamento',
    descricao: 'Durante a concretagem do turno da noite, o equipamento apresentou forte vibração e ruído anormal vindo do conjunto de bombeamento. Paralisamos a operação por segurança.',
    categoria: 'Manutenção',
    status: 'Em Atendimento',
    urgencia: 'Urgente',
    maquina_id: 'maq-4',
    maquina_serie: 'FQ-2024-088',
    maquina_modelo: 'Bomba de Concreto FMCM 3000-85',
    criado_em: '2026-06-23T08:30:00Z',
    atualizado_em: '2026-06-24T14:30:00Z',
    id_externo: 'EXT-CH-1042',
    origem: 'PORTAL_CLIENTE'
  },
  {
    id: 'ch-5',
    codigo: '#CH-2026-894',
    titulo: 'Oscilação de pressão na linha de concreto',
    descricao: 'A pressão na linha oscila acima do esperado após cerca de 2 horas de operação contínua. Solicitamos revisão das válvulas de controle e do sensor de pressão.',
    categoria: 'Hidráulica',
    status: 'Em Atendimento',
    urgencia: 'Urgente',
    maquina_id: 'maq-2',
    maquina_serie: 'FQ-2023-047',
    maquina_modelo: 'Bomba de Concreto FME 2000-90',
    criado_em: '2026-06-24T10:45:00Z',
    atualizado_em: '2026-06-24T10:45:00Z',
    id_externo: 'EXT-CH-894',
    origem: 'PORTAL_CLIENTE'
  },
  {
    // Chamado de outra empresa (emp-2) — não pode aparecer para emp-1.
    id: 'ch-6',
    codigo: '#CH-2026-1103',
    titulo: 'Agendamento de revisão preventiva de 300 horas',
    descricao: 'Solicitamos agendamento da revisão preventiva de 300 horas conforme plano de manutenção do equipamento.',
    categoria: 'Manutenção',
    status: 'Aberto',
    urgencia: 'Normal',
    maquina_id: 'maq-6',
    maquina_serie: 'FQ-2025-003',
    maquina_modelo: 'Bomba de Concreto FMA 1000-62',
    criado_em: '2026-06-25T13:05:00Z',
    atualizado_em: '2026-06-25T13:05:00Z',
    id_externo: 'EXT-CH-1103',
    origem: 'PORTAL_CLIENTE'
  }
];

// Initial Mock Messages
export const mockMensagens: ChamadoMensagem[] = [
  {
    id: 'msg-1',
    chamado_id: 'ch-4',
    usuario_nome: 'Julio Santos',
    usuario_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    mensagem: 'Durante a concretagem do turno da noite, o equipamento apresentou forte vibração e ruído anormal vindo do conjunto de bombeamento. Paralisamos a operação por segurança.',
    criado_em: '2026-06-23T08:30:00Z',
    tipo_usuario: 'cliente'
  },
  {
    id: 'msg-2',
    chamado_id: 'ch-4',
    usuario_nome: 'Suporte Feramaq',
    mensagem: 'Chamado direcionado para a equipe de Manutenção Especializada. Técnico responsável: Vinicius Ferreira.',
    criado_em: '2026-06-23T09:15:00Z',
    tipo_usuario: 'suporte'
  },
  {
    id: 'msg-3',
    chamado_id: 'ch-4',
    usuario_nome: 'Vinicius Ferreira (Assistência Técnica)',
    mensagem: 'Diagnóstico concluído. Os mancais do eixo de acionamento apresentaram desgaste prematuro e superaquecimento. Foi solicitada a substituição imediata. O equipamento deve permanecer inoperante até a troca.',
    criado_em: '2026-06-24T14:30:00Z',
    tipo_usuario: 'suporte'
  }
];

// Initial Mock Attachments
export const mockAnexos: ChamadoAnexo[] = [
  {
    id: 'anx-1',
    chamado_id: 'ch-4',
    nome_arquivo: 'mancal_desgaste_1.jpg',
    tamanho_arquivo: '420 KB',
    url_arquivo: '#',
    tipo_mime: 'image/jpeg',
    criado_em: '2026-06-23T16:45:00Z'
  },
  {
    id: 'anx-2',
    chamado_id: 'ch-4',
    nome_arquivo: 'trinca_pista_rolamento.jpg',
    tamanho_arquivo: '512 KB',
    url_arquivo: '#',
    tipo_mime: 'image/jpeg',
    criado_em: '2026-06-23T16:46:00Z'
  }
];

// Initial Mock Quotes
export const mockOrcamentos: Orcamento[] = [
  {
    id: 'orc-1',
    codigo: '#ORC-2026-0891',
    maquina_id: 'maq-2',
    maquina_serie: 'FQ-2023-047',
    maquina_modelo: 'Bomba de Concreto FME 2000-90',
    referencia: 'Manutenção Preventiva de 3000h',
    data_emissao: '2026-06-15',
    valor_total: 12450.00,
    status: 'Pendente',
    id_externo: 'EXT-ORC-0891',
    origem: 'CRM_SALES'
  },
  {
    id: 'orc-2',
    codigo: '#ORC-2026-0885',
    maquina_id: 'maq-1',
    maquina_serie: 'FQ-2024-001',
    maquina_modelo: 'Bomba de Concreto FMA 1000-62',
    referencia: 'Substituição de Pistões e Vedações',
    data_emissao: '2026-06-10',
    valor_total: 8920.00,
    status: 'Aprovado',
    id_externo: 'EXT-ORC-0885',
    origem: 'CRM_SALES'
  },
  {
    id: 'orc-3',
    codigo: '#ORC-2026-0872',
    maquina_id: 'maq-3',
    maquina_serie: 'FQ-2023-112',
    maquina_modelo: 'Perfuratriz Hidráulica FMCT 25-080',
    referencia: 'Reparo no Motor Hidráulico de Rotação',
    data_emissao: '2026-06-02',
    valor_total: 15300.00,
    status: 'Recusado',
    id_externo: 'EXT-ORC-0872',
    origem: 'CRM_SALES'
  },
  {
    id: 'orc-4',
    codigo: '#ORC-2026-0895',
    maquina_id: 'maq-2',
    maquina_serie: 'FQ-2023-047',
    maquina_modelo: 'Bomba de Concreto FME 2000-90',
    referencia: 'Troca do Sensor de Pressão da Linha',
    data_emissao: '2026-06-18',
    valor_total: 4500.00,
    status: 'Pendente',
    id_externo: 'EXT-ORC-0895',
    origem: 'CRM_SALES'
  },
  {
    // Orçamento de outra empresa (emp-2) — não pode aparecer para emp-1.
    id: 'orc-5',
    codigo: '#ORC-2026-0902',
    maquina_id: 'maq-6',
    maquina_serie: 'FQ-2025-003',
    maquina_modelo: 'Bomba de Concreto FMA 1000-62',
    referencia: 'Kit de Revisão Preventiva 300h',
    data_emissao: '2026-06-25',
    valor_total: 3780.00,
    status: 'Pendente',
    id_externo: 'EXT-ORC-0902',
    origem: 'CRM_SALES'
  }
];

// Initial Mock Parts Catalog
export const mockPecas: Peca[] = [
  {
    id: 'pec-1',
    codigo: 'COD: 994-A2',
    nome: 'Pistão de Bombeamento',
    descricao: 'Pistão de alta liga com tratamento superficial. Projetado para suportar ciclos contínuos de alta pressão no bombeamento de concreto.',
    modelo_compativel: 'Bomba de Concreto FMA 1000-62',
    categoria: 'Mecânica',
    imagem_url: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'pec-2',
    codigo: 'COD: VS-24V-HD',
    nome: 'Válvula Solenoide Direcional',
    descricao: 'Válvula hidráulica direcional de 4 vias, 2 posições. Operação de alta velocidade com acionamento elétrico por solenoide de 24V.',
    modelo_compativel: 'Bomba de Concreto FMA 1000-62',
    categoria: 'Hidráulica',
    imagem_url: 'https://images.unsplash.com/photo-1635348729202-c5e2b9d1b5b5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'pec-3',
    codigo: 'COD: SP-150-Z',
    nome: 'Sensor de Pressão da Linha',
    descricao: 'Transdutor de pressão para linha de concreto, faixa 0-150 bar, com saída 4-20 mA e vedação resistente a abrasão.',
    modelo_compativel: 'Bomba de Concreto FME 2000-90',
    categoria: 'Elétrica',
    imagem_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'pec-4',
    codigo: 'COD: MR-4200-HD',
    nome: 'Motor Hidráulico de Rotação',
    descricao: 'Motor hidráulico de pistões axiais para o conjunto de rotação da perfuratriz. Torque nominal de 4.200 Nm.',
    modelo_compativel: 'Perfuratriz Hidráulica FMCT 25-080',
    categoria: 'Hidráulica',
    imagem_url: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&q=80&w=600'
  }
];

// Initial Mock Reports
export const mockRelatorios: Relatorio[] = [
  {
    id: 'rel-1',
    titulo: 'Relatório Mensal de Eficiência Operacional - Maio 2026',
    maquina_id: 'maq-1',
    maquina_serie: 'FQ-2024-001',
    tipo: 'Eficiência',
    data_gerado: '2026-06-01',
    url_documento: '#'
  },
  {
    id: 'rel-2',
    titulo: 'Histórico Completo de Telemetria e Ciclos de Trabalho',
    maquina_id: 'maq-1',
    maquina_serie: 'FQ-2024-001',
    tipo: 'Telemetria',
    data_gerado: '2026-06-15',
    url_documento: '#'
  },
  {
    id: 'rel-3',
    titulo: 'Relatório Técnico de Diagnóstico e Calibração Anual',
    maquina_id: 'maq-2',
    maquina_serie: 'FQ-2023-047',
    tipo: 'Manutenção',
    data_gerado: '2026-05-13',
    url_documento: '#'
  }
];

// Initial Logs
export const mockLogs: LogAtividade[] = [
  {
    id: 'log-1',
    usuario_id: 'usr-1',
    usuario_nome: 'Carlos Silva',
    acao: 'LOGIN',
    detalhes: 'Login efetuado com sucesso via número de série da máquina FQ-2024-001.',
    criado_em: '2026-06-24T07:45:00Z'
  }
];

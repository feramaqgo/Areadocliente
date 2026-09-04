import { Empresa, Usuario, Maquina, Chamado, ChamadoMensagem, ChamadoAnexo, Orcamento, Manual, Peca, Relatorio, Atualizacao, LogAtividade } from './types';

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
    serie_login: 'SN-9876543210',
    telefone: '(11) 97777-6666',
    cargo: 'Operador de Campo',
    active: true,
    role: 'cliente_user',
    empresa_id: 'emp-1'
  },
  {
    id: 'usr-3',
    nome: 'Vinicius Ferreira',
    email: 'vinicius.ferreira@feramaq.com.br',
    telefone: '(11) 99999-8888',
    cargo: 'Suporte Técnico Feramaq',
    active: true,
    role: 'suporte_tecnico',
    empresa_id: 'emp-2'
  }
];

// Initial Mock Machines
export const mockMaquinas: Maquina[] = [
  {
    id: 'maq-1',
    serie: 'FQ-2024-001',
    modelo: 'Bomba de Concreto B-450',
    linha: 'Série B - Premium',
    ano_fabricacao: 2024,
    data_compra: '2024-01-15',
    status: 'Operacional',
    horimetro: 1240,
    ultima_manutencao: '2026-04-10',
    localizacao: 'Obra Alfa, São Paulo - SP',
    garantia_ate: '2027-01-15',
    imagem_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDup6kxTHQbN0ZHIe8Zjx1QOH19PpjSDm18BVVUnjKle8OKNK3TZaqhimIWD8D-VyaSYkhm1c_5dLvII3KNe83zfnQfUPjIHql7MT9OJk02uC3-2qRgLc5qXDaMp7WQHW2DPyrCKjRne9LRPmfmdv7lBhYswtE6cbZeMKWjxash-e-d3e-SLEFIH9SKYgCk2rekbv9gfo-ANl2qJ3KZFvRJKzcnK-jQGNH-KaPrWeMaoLtUL8h9qM6qdtU9iN4_yOHsnePVoCiTZ53P',
    fabricante: 'Feramaq Industrial',
    potencia_motor: '150 kW',
    rotacao_maxima: '2200 RPM',
    diametro_torneamento: 'N/A',
    comprimento_maximo: 'N/A',
    comando_numerico: 'Smart Control V2',
    peso_bruto: '5200 kg',
    empresa_id: 'emp-1'
  },
  {
    id: 'maq-2',
    serie: 'SN-9876543210',
    modelo: 'Torno CNC X-2000 Pro',
    linha: 'Série X - Metalurgia',
    ano_fabricacao: 2022,
    data_compra: '2022-03-15',
    status: 'Operacional',
    horimetro: 3450,
    ultima_manutencao: '2026-05-12',
    localizacao: 'Galpão Central, Curitiba - PR',
    garantia_ate: '2025-03-15', // Inativa
    imagem_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3CJmJGxYHTj1itil_qVdSVZ0cLYjvx6IxgYHcmqg98EHSwiDioQx1xWUXEU2DwLyVXW0VucWONTFw5Oeh7uW8FnQBoir5-f92x0PEboRgffhur94RqNOyWWoKkkZjbK-dXak4e2mo9lA3qSB6LoNcU-llyXE3NYHBIKJhB11FH_vHcBrqFcNfXJJaoXCPOw1mgrxeAMgdqSGFynai7mpvZVUKoXNZC0rh3PQzZ5WWvVhmvhKghi7gs73jv_AnKdcTrK17PPhrvMli',
    fabricante: 'Feramaq Industrial',
    potencia_motor: '15 kW',
    rotacao_maxima: '4500 RPM',
    diametro_torneamento: '350 mm',
    comprimento_maximo: '1200 mm',
    comando_numerico: 'Siemens Sinumerik',
    peso_bruto: '4500 kg',
    empresa_id: 'emp-1'
  },
  {
    id: 'maq-3',
    serie: 'FRMQ-9982',
    modelo: 'Misturador Industrial M-200',
    linha: 'Série M - Misturadores',
    ano_fabricacao: 2023,
    data_compra: '2023-08-20',
    status: 'Aguardando Peça',
    horimetro: 2150,
    ultima_manutencao: '2026-03-01',
    localizacao: 'Porto Seco, Santos - SP',
    garantia_ate: '2026-08-20',
    imagem_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600',
    fabricante: 'Feramaq Industrial',
    potencia_motor: '45 kW',
    rotacao_maxima: '1500 RPM',
    diametro_torneamento: 'N/A',
    comprimento_maximo: 'N/A',
    comando_numerico: 'Logic Controller',
    peso_bruto: '3200 kg',
    empresa_id: 'emp-1'
  },
  {
    id: 'maq-4',
    serie: 'VMC-1000',
    modelo: 'Centro de Usinagem Vertical VMC-1000 CNC',
    linha: 'Série VMC - Centros de Usinagem',
    ano_fabricacao: 2024,
    data_compra: '2024-05-10',
    status: 'Em Manutenção',
    horimetro: 980,
    ultima_manutencao: '2026-06-24',
    localizacao: 'Obra Alfa, São Paulo - SP',
    garantia_ate: '2027-05-10',
    imagem_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb9K6flu7oteRe5qU8y1x3mJAbh39V6C3VtU8VBB5EhDQt7GxRKhoQbt6BFBPyVOVefnm1VBnomaYFR-MdMo0QkMnxyk2vuJ5d7v8y7eK67O-wMoNcj45YRQquYGKqN3WSM4HGv8kCxmNDOXQ9qk52pFe-ySZcbv0cixLVJrphEdnrK7nd_UZaHcxqXkt1y5P99nj3wafWqIZy0D6jfP8_2bJ7y58E6VEEpYFsUjftFt4gyi8d1zAfjyxqa20PnwN0FjUzZVJ5vDmT',
    fabricante: 'Feramaq Industrial',
    potencia_motor: '22 kW',
    rotacao_maxima: '8000 RPM',
    diametro_torneamento: '500 mm',
    comprimento_maximo: '1000 mm',
    comando_numerico: 'Fanuc Series',
    peso_bruto: '6800 kg',
    empresa_id: 'emp-1'
  },
  {
    id: 'maq-5',
    serie: 'FX-2023-012A',
    modelo: 'Escavadeira X-200',
    linha: 'FX Excavators',
    ano_fabricacao: 2023,
    data_compra: '2023-04-12',
    status: 'Desativada',
    horimetro: 4200,
    ultima_manutencao: '2025-11-15',
    localizacao: 'Galpão Central, Curitiba - PR',
    garantia_ate: '2025-04-12',
    imagem_url: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=600',
    fabricante: 'Feramaq Industrial',
    potencia_motor: '110 kW',
    rotacao_maxima: '1800 RPM',
    diametro_torneamento: 'N/A',
    comprimento_maximo: 'N/A',
    comando_numerico: 'Hydraulic Assist',
    peso_bruto: '8900 kg',
    empresa_id: 'emp-1'
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
    maquina_modelo: 'Bomba de Concreto B-450',
    criado_em: '2026-06-23T14:30:00Z',
    atualizado_em: '2026-06-24T09:15:00Z',
    id_externo: 'EXT-CH-8921',
    origem: 'PORTAL_CLIENTE'
  },
  {
    id: 'ch-2',
    codigo: '#CH-8919',
    titulo: 'Vazamento de fluido hidráulico na base',
    descricao: 'Vazamento de óleo no motor hidráulico de rotação da hélice do misturador. O equipamento perdeu torque e está paralisado para evitar danos.',
    categoria: 'Hidráulica',
    status: 'Aguardando Peça',
    urgencia: 'Normal',
    maquina_id: 'maq-3',
    maquina_serie: 'FRMQ-9982',
    maquina_modelo: 'Misturador Industrial M-200',
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
    maquina_modelo: 'Bomba de Concreto B-450',
    criado_em: '2026-06-15T11:20:00Z',
    atualizado_em: '2026-06-16T17:45:00Z',
    id_externo: 'EXT-CH-8890',
    origem: 'CRM_INTERNAL'
  },
  {
    id: 'ch-4',
    codigo: '#CH-2023-1042',
    titulo: 'Falha no Eixo Árvore durante usinagem pesada',
    descricao: 'Durante a operação do turno da noite, a máquina apresentou forte vibração e ruído anormal vindo do cabeçote principal. Paralisamos a produção por segurança.',
    categoria: 'Manutenção Corretiva',
    status: 'Em Atendimento',
    urgencia: 'Urgente',
    maquina_id: 'maq-4',
    maquina_serie: 'VMC-1000',
    maquina_modelo: 'Centro de Usinagem Vertical VMC-1000 CNC',
    criado_em: '2026-06-23T08:30:00Z',
    atualizado_em: '2026-06-24T14:30:00Z',
    id_externo: 'EXT-CH-1042',
    origem: 'PORTAL_CLIENTE'
  },
  {
    id: 'ch-5',
    codigo: '#CH-2023-894',
    titulo: 'Falha na calibração do eixo Z - Torno CNC Master',
    descricao: 'Eixo Z está apresentando desvio de medida acumulado após 2 horas de operação contínua. Solicitamos ajuste ou revisão dos encoders lineares.',
    categoria: 'Elétrica',
    status: 'Em Atendimento',
    urgencia: 'Urgente',
    maquina_id: 'maq-2',
    maquina_serie: 'SN-9876543210',
    maquina_modelo: 'Torno CNC X-2000 Pro',
    criado_em: '2026-06-24T10:45:00Z',
    atualizado_em: '2026-06-24T10:45:00Z',
    id_externo: 'EXT-CH-894',
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
    mensagem: 'Durante a operação do turno da noite, a máquina apresentou forte vibração e ruído anormal vindo do cabeçote principal. Paralisamos a produção por segurança.',
    criado_em: '2026-06-23T08:30:00Z',
    tipo_usuario: 'cliente'
  },
  {
    id: 'msg-2',
    chamado_id: 'ch-4',
    usuario_nome: 'Carlos Silva',
    usuario_avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBDpL5qfE_sOezoHga_K9iu4CTvOh_xouc57mBm4iT8J80WJpee1TtWLmdm_lhDSH-BoxXyM8eEh0UywvBybxIP29YMXXkOzs845DCYjgfMsFkBRhGt5gdgtomLIQGuo_tk8BZaha93zItAHfWFaXNwfFm-J2tbVVIMGutJXIZtGJkmz2HYFbWQtKqhFxt0Rjm3r1CBBoWnz_HA7KL-FBZjH0_HfQ5y4D3BbDoeH5Sm0UClGAP1W8PtGLs6Sp9N5PSqvMKTCTJtrbi',
    mensagem: 'Chamado direcionado para a equipe de Manutenção Especializada. Técnico responsável: Carlos Silva.',
    criado_em: '2026-06-23T09:15:00Z',
    tipo_usuario: 'suporte'
  },
  {
    id: 'msg-3',
    chamado_id: 'ch-4',
    usuario_nome: 'Carlos Silva (Especialista CNC)',
    usuario_avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByx9Y5xXoobqxayXa4Mq0kkOO4IuA4kpThVmcIJnsCtidcqIVTWK5bTISp2R5tGKlDPTEb0COEcmrnDq1DfTNRATYho7xsC-NlkVDt80LoK76oSlfGJQXuimp76Y7BqKKLA0MiEPbeNcnfMmHUK0uT1NReZLWYStDsaJnIssnmEKJf6OFFeuyXuChIikC-vcQpQIKk3qjVC2heS2KuKr3l1NGPQj6qGdO9ZyhP9bc0tLncH1QR4LQSejBWrE1cKWbQycrZoLAxle_1',
    mensagem: 'Diagnóstico concluído. Os rolamentos principais do eixo árvore apresentaram desgaste prematuro e superaquecimento. Foi solicitada a substituição imediata. O equipamento deve permanecer inoperante até a troca.',
    criado_em: '2026-06-24T14:30:00Z',
    tipo_usuario: 'suporte'
  }
];

// Initial Mock Attachments
export const mockAnexos: ChamadoAnexo[] = [
  {
    id: 'anx-1',
    chamado_id: 'ch-4',
    nome_arquivo: 'spindle_damage_1.jpg',
    tamanho_arquivo: '420 KB',
    url_arquivo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqZ4BKsCp4FPJC-Al5r3ZVZFcrGk1bpGEr19XzupOml94_dqre8H30ahQ-T7linwUdMTY4s8iqUvSfTYiit-nQUFAEYSNalOcUV2ZRePp0NSYYYDPTPPqVZZD809XsJtQDBuZ45ZF-ud-beeMHFeGNXa9Z4W7pvFyk3KoYE4wYncwG9HWXOXCFdJLk4gXrKnYFiSvU1XvotP_DROkCDg5hmyXK1J8K0KOfYOslXxCp8H2OZVxQbB4rjTj7-u7EfKJsjd4AegPvMywy',
    tipo_mime: 'image/jpeg',
    criado_em: '2026-06-23T16:45:00Z'
  },
  {
    id: 'anx-2',
    chamado_id: 'ch-4',
    nome_arquivo: 'bearing_race_crack.jpg',
    tamanho_arquivo: '512 KB',
    url_arquivo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVlS-ZP7VUVGxWkoZrULfQtKyW6NMaBDXowzY4-sBotB4Kxae3MVsN0BDm80xvU5IDQraCDkOXQ2_BcxM2yU3DBQ_B-czUCjvcTi0BHPAUWzv4IBLW6xM296iUHS4WHw7dnM7Ta_SUSJE4tPAyY0J56UVH-7TnRPSbmUjghLnGnUC0VDcpX6BHZ-77-ezlpyBnxvkCZXTSgytIjwigLsi8Abzm4EdedHa6xRXZ3ew-xqsDTpTVkznRE5Obl2xkADTPJkSucnqs30F-',
    tipo_mime: 'image/jpeg',
    criado_em: '2026-06-23T16:46:00Z'
  }
];

// Initial Mock Quotes
export const mockOrcamentos: Orcamento[] = [
  {
    id: 'orc-1',
    codigo: '#ORC-2023-0891',
    maquina_id: 'maq-2',
    maquina_serie: 'SN-9876543210',
    maquina_modelo: 'Torno CNC X-2000 Pro',
    referencia: 'Manutenção Preventiva de 3000h',
    data_emissao: '2026-06-15',
    valor_total: 12450.00,
    status: 'Pendente',
    id_externo: 'EXT-ORC-0891',
    origem: 'CRM_SALES'
  },
  {
    id: 'orc-2',
    codigo: '#ORC-2023-0885',
    maquina_id: 'maq-1',
    maquina_serie: 'FQ-2024-001',
    maquina_modelo: 'Bomba de Concreto B-450',
    referencia: 'Substituição de Fusos e Acoplamentos',
    data_emissao: '2026-06-10',
    valor_total: 8920.00,
    status: 'Aprovado',
    id_externo: 'EXT-ORC-0885',
    origem: 'CRM_SALES'
  },
  {
    id: 'orc-3',
    codigo: '#ORC-2023-0872',
    maquina_id: 'maq-3',
    maquina_serie: 'FRMQ-9982',
    maquina_modelo: 'Misturador Industrial M-200',
    referencia: 'Reparo no Motor Principal de Mistura',
    data_emissao: '2026-06-02',
    valor_total: 15300.00,
    status: 'Recusado',
    id_externo: 'EXT-ORC-0872',
    origem: 'CRM_SALES'
  },
  {
    id: 'orc-4',
    codigo: '#ORC-2023-0895',
    maquina_id: 'maq-2',
    maquina_serie: 'SN-9876543210',
    maquina_modelo: 'Torno CNC X-2000 Pro',
    referencia: 'Atualização de Software e Encoders CNC',
    data_emissao: '2026-06-18',
    valor_total: 4500.00,
    status: 'Pendente',
    id_externo: 'EXT-ORC-0895',
    origem: 'CRM_SALES'
  }
];

// Initial Mock Manuals
export const mockManuais: Manual[] = [
  {
    id: 'man-1',
    titulo: 'Esquema Hidráulico T-500',
    descricao: 'Diagrama hidráulico detalhado do sistema de bombeamento de concreto, arrefecimento e lubrificação por via úmida.',
    modelo_compativel: 'Bomba de Concreto B-450',
    categoria: 'Hidráulica',
    tamanho_pdf: '2.4 MB',
    url_pdf: '#'
  },
  {
    id: 'man-2',
    titulo: 'Painel Elétrico Serie X',
    descricao: 'Esquema de fiação elétrica, parametrização dos servo drives e manual para identificação rápida de falhas eletrônicas no painel de comando.',
    modelo_compativel: 'Torno CNC X-2000 Pro',
    categoria: 'Elétrica',
    tamanho_pdf: '5.1 MB',
    url_pdf: '#'
  },
  {
    id: 'man-3',
    titulo: 'Manual de Operação Geral',
    descricao: 'Guia de referência abrangente contendo instruções passo a passo para setup físico, calibração tridimensional e parametrização dos controladores CNC.',
    modelo_compativel: 'Torno CNC X-2000 Pro',
    categoria: 'Operação',
    tamanho_pdf: '12.0 MB',
    url_pdf: '#'
  }
];

// Initial Mock Parts Catalog
export const mockPecas: Peca[] = [
  {
    id: 'pec-1',
    codigo: 'COD: 994-A2',
    nome: 'Eixo Principal Engrenado',
    descricao: 'Eixo usinado de alta liga com têmpera por indução. Projetado para suportar alto torque e esforços mecânicos extremos.',
    modelo_compativel: 'Torno CNC X-2000 Pro',
    categoria: 'Mecânica',
    imagem_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTLe7-pV80NZCtYNnTHTNUgVhZwE7MweVrux0E4nLrKbl1b_ZBfncVhAMdbrEBOQYnvVjYiyWbGy6_sARteP-5IKDfW1Gb5YeM9SnGMp94LvTLxjLLcoEWrs-rW3YHcGHNOHJV0zHRembDAR28nlwHWYyxGFlYmoIOalkFySeDlC6KxshAaKR07QSXSb-DUW4XUwZtOZJYIluAkOtkdASZoXiUp4LQYaVUAuvbZQb2uY89hhztlJ6i20RdDkrIgw0TvtpDkn084uxu'
  },
  {
    id: 'pec-2',
    codigo: 'COD: VS-24V-HD',
    nome: 'Válvula Solenoide Direcional',
    descricao: 'Válvula hidráulica direcional de 4 vias, 2 posições. Operação de alta velocidade com acionamento elétrico por solenoide de 24V.',
    modelo_compativel: 'Bomba de Concreto B-450',
    categoria: 'Hidráulica',
    imagem_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNK2GCPdBBi7_5l1Jpda4AOgyaM1ZZ8cVg65Zk9aFGM9Vp1OLrxWuwC8x0vsEt3Rxewjo6H9POp1CspRFIuwhd3hC7GUWyE6Xq7TOd9OgGK8B0wuhVuUbrT_XStTQHhpP5bctKuk5ydcldvL2AnGGVGWacDXux25u6Mu9UdRlVNH9EC6FPsPf67EA69HgcpWt4iA0-nRkSetiY6flJQuMg9RBCu9-Upba72BGosxZ8DyBga-ZOvQZfap42ihGRoUAsFw0sQj7h--YY'
  },
  {
    id: 'pec-3',
    codigo: 'COD: SM-5KW-Z',
    nome: 'Servomotor Eixo Z (5kW)',
    descricao: 'Servomotor síncrono AC de alta dinâmica. Equipado com encoder absoluto de altíssima precisão e freio de retenção para controle vertical.',
    modelo_compativel: 'Torno CNC X-2000 Pro',
    categoria: 'Elétrica',
    imagem_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPCHG8wy2nW8zpUhhjCFVkedo8XU-tQUfjNz71tAvAC8vuvx7aqG2s8N8zqMFsTM8JqgFSI6llp7bu-jDNRION7f3NRQIUSLNlI78eKG6VUALhhNum5QQt9vHzUuQ9XrEGCnef4k9b88OnwwJXaIKwzvgDzxVtikzGSW8Efd_1gW8zjHiXtis93px6MGPUo73ROvwt6DvGHxwg6tITQJxoxF7H9p67n4qlqEhFUDNg1UGB5ZKSQjT4bvo4se3VYr-jo3RzCSHFlnSP'
  },
  {
    id: 'pec-4',
    codigo: 'COD: GL-35-BLOCK',
    nome: 'Patim para Guia Linear 35mm',
    descricao: 'Patim de esferas recirculantes tamanho 35. Alta rigidez e capacidade de carga dinâmica em todos os sentidos de força.',
    modelo_compativel: 'Centro de Usinagem Vertical VMC-1000 CNC',
    categoria: 'Mecânica',
    imagem_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArttW9B1VnXWWq1IeDnk1nQZd5u_Bx4WoIMV82m-6YnV0UwaTHAq3wVSiW961YwEORchCmY5b1OT_1Sfj65VPWYJIyQw9SDxNAP_PixEyLIQ-IPdWpanTiT7agFyQCrDRFpmABGjJbrbbOWpL8ZCaxo8qQgpekAVCsJF7Lol3tFnSDrTmVgkFA4FpqUq-FCC9WL5rtnFxixItE0vMQ7uU_k8PvxE_I7UDwJgZorycDJu_qUU9XraP7BfplWrgMimdWrq8nR2Dlqx0N'
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
    maquina_serie: 'SN-9876543210',
    tipo: 'Manutenção',
    data_gerado: '2026-05-13',
    url_documento: '#'
  }
];

// Initial Mock Announcements (Atualizações)
export const mockAtualizacoes: Atualizacao[] = [
  {
    id: 'upd-1',
    titulo: 'Comunicado Importante: Atualização de Software de Segurança',
    conteudo: 'A Feramaq disponibilizou uma nova versão de firmware crítica para todas as bombas de concreto fabricadas em 2024. Esta atualização otimiza a válvula hidráulica de segurança de sobrecarga elétrica para evitar desligamentos inesperados em dias quentes. Agende sua instalação gratuita via aba Chamados.',
    data_publicacao: '2026-06-20',
    lida: false,
    id_externo: 'EXT-UPD-001',
    origem: 'PORTAL_ADMIN_FERAMAQ'
  },
  {
    id: 'upd-2',
    titulo: 'Disponibilidade de Peças Genuínas em Estoque Express',
    conteudo: 'Inauguramos nosso novo Centro de Distribuição em São Paulo, o que garante entrega de rolamentos de fuso, guias lineares e vedações principais em até 12 horas para toda a região metropolitana. Realize suas cotações diretamente no portal na aba Manuais & Peças.',
    data_publicacao: '2026-06-12',
    lida: true,
    id_externo: 'EXT-UPD-002',
    origem: 'PORTAL_ADMIN_FERAMAQ'
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
